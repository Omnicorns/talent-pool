package com.example.talentpool.service;

import com.example.talentpool.domain.ApplicationStatus;
import com.example.talentpool.domain.JobApplication;
import com.example.talentpool.domain.JobListing;
import com.example.talentpool.domain.JobListingStatus;
import com.example.talentpool.dto.*;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.exception.ResourceNotFoundException;
import com.example.talentpool.repository.JobApplicationRepository;
import com.example.talentpool.repository.JobListingRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class TalentPortalService {

    private final CandidateService candidateService;
    private final JobListingService jobListingService;
    private final JobListingRepository jobListingRepository;
    private final JobApplicationRepository applicationRepository;
    private final JobApplicationService applicationService;

    public TalentPortalService(
            CandidateService candidateService,
            JobListingService jobListingService,
            JobListingRepository jobListingRepository,
            JobApplicationRepository applicationRepository,
            JobApplicationService applicationService
    ) {
        this.candidateService = candidateService;
        this.jobListingService = jobListingService;
        this.jobListingRepository = jobListingRepository;
        this.applicationRepository = applicationRepository;
        this.applicationService = applicationService;
    }

    @Transactional
    public CandidateResponse profile(UUID candidateId) {
        return candidateService.detail(candidateId);
    }

    @Transactional
    public CandidateResponse updateProfile(
            UUID candidateId,
            CandidateUpsertRequest request,
            MultipartFile cv,
            MultipartFile profilePicture,
            List<MultipartFile> portfolioFiles
    ) {
        CandidateResponse current = candidateService.detail(candidateId);
        if (current.email() == null || !current.email().equalsIgnoreCase(request.email())) {
            throw new BadRequestException("Email login tidak dapat diubah dari profil");
        }
        return candidateService.update(candidateId, request, cv, profilePicture, portfolioFiles);
    }

    @Transactional
    public Page<JobListingResponse> jobs(String q, Pageable pageable) {
        return jobListingService.searchPublicOpen(q, pageable);
    }

    @Transactional
    public JobListingResponse job(UUID id) {
        JobListing job = jobListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lowongan tidak ditemukan: " + id));
        ensureJobOpen(job);
        return jobListingService.detail(id);
    }

    @Transactional
    public JobApplicationResponse apply(UUID candidateId, UUID jobId, String notes) {
        JobListing job = jobListingRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Lowongan tidak ditemukan: " + jobId));
        ensureJobOpen(job);

        if (applicationRepository.findByCandidateIdAndJobListingId(candidateId, jobId).isPresent()) {
            throw new BadRequestException("Anda sudah pernah melamar lowongan ini");
        }

        return applicationService.assign(
                jobId,
                candidateId,
                new JobApplicationUpsertRequest(null, notes)
        );
    }

    @Transactional
    public Page<JobApplicationResponse> applications(UUID candidateId, Pageable pageable) {
        return applicationRepository.findByCandidateId(candidateId, pageable)
                .map(applicationService::toResponse);
    }

    @Transactional
    public JobApplicationResponse withdraw(UUID candidateId, UUID applicationId) {
        JobApplication application = applicationRepository.findByIdAndCandidateId(applicationId, candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Lamaran tidak ditemukan"));

        if (application.getStatus() == ApplicationStatus.HIRED
                || application.getStatus() == ApplicationStatus.REJECTED
                || application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Lamaran dengan status " + application.getStatus() + " tidak dapat ditarik");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        return applicationService.toResponse(applicationRepository.save(application));
    }

    private void ensureJobOpen(JobListing job) {
        if (job.getStatus() != JobListingStatus.PUBLISHED) {
            throw new BadRequestException("Lowongan belum tersedia untuk kandidat");
        }
        if (!isOpen(job.getApplicationDeadline())) {
            throw new BadRequestException("Batas waktu lamaran sudah berakhir");
        }
    }

    private boolean isOpen(LocalDate deadline) {
        return deadline == null || !deadline.isBefore(LocalDate.now());
    }
}
