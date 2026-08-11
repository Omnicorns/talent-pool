package com.example.talentpool.service;

import com.example.talentpool.domain.*;
import com.example.talentpool.dto.JobApplicationResponse;
import com.example.talentpool.dto.JobApplicationStageRequest;
import com.example.talentpool.dto.JobApplicationUpsertRequest;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.exception.ResourceNotFoundException;
import com.example.talentpool.repository.CandidateRepository;
import com.example.talentpool.repository.JobApplicationRepository;
import com.example.talentpool.repository.JobListingRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class JobApplicationService {
    private final JobApplicationRepository repository;
    private final CandidateRepository candidateRepository;
    private final JobListingRepository jobListingRepository;

    public JobApplicationService(
            JobApplicationRepository repository,
            CandidateRepository candidateRepository,
            JobListingRepository jobListingRepository
    ) {
        this.repository = repository;
        this.candidateRepository = candidateRepository;
        this.jobListingRepository = jobListingRepository;
    }

    @Transactional
    public JobApplicationResponse assign(UUID jobListingId, UUID candidateId, JobApplicationUpsertRequest request) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Kandidat tidak ditemukan: " + candidateId));
        JobListing job = jobListingRepository.findById(jobListingId)
                .orElseThrow(() -> new ResourceNotFoundException("Job listing tidak ditemukan: " + jobListingId));
        if (job.getStatus() == JobListingStatus.CLOSED) {
            throw new BadRequestException("Kandidat tidak dapat dimasukkan ke lowongan yang sudah CLOSED");
        }

        JobApplication application = repository.findByCandidateIdAndJobListingId(candidateId, jobListingId)
                .orElseGet(JobApplication::new);
        boolean newApplication = application.getId() == null;
        HiringStage stage = request != null && request.stage() != null
                ? request.stage()
                : newApplication ? HiringStage.NEW_CANDIDATE : application.getStage();

        application.setCandidate(candidate);
        application.setJobListing(job);
        application.setStage(stage);
        application.setStatus(statusFor(stage, null));
        if (request != null && request.notes() != null) {
            application.setNotes(trimToNull(request.notes()));
        }

        syncCandidate(candidate, job, stage);
        candidateRepository.save(candidate);
        return toResponse(repository.save(application));
    }

    @Transactional
    public JobApplicationResponse updateStage(UUID id, JobApplicationStageRequest request) {
        JobApplication application = getEntity(id);
        application.setStage(request.stage());
        application.setStatus(statusFor(request.stage(), request.status()));
        if (request.notes() != null) {
            application.setNotes(trimToNull(request.notes()));
        }
        syncCandidate(application.getCandidate(), application.getJobListing(), request.stage());
        candidateRepository.save(application.getCandidate());
        return toResponse(repository.save(application));
    }

    @Transactional
    public Page<JobApplicationResponse> listByJob(UUID jobListingId, Pageable pageable) {
        if (!jobListingRepository.existsById(jobListingId)) {
            throw new ResourceNotFoundException("Job listing tidak ditemukan: " + jobListingId);
        }
        return repository.findByJobListingId(jobListingId, pageable).map(this::toResponse);
    }

    @Transactional
    public void delete(UUID id) {
        JobApplication application = getEntity(id);
        Candidate candidate = application.getCandidate();
        repository.delete(application);
        repository.flush();

        repository.findFirstByCandidateIdOrderByUpdatedAtDesc(candidate.getId()).ifPresentOrElse(
                remaining -> syncCandidate(candidate, remaining.getJobListing(), remaining.getStage()),
                () -> {
                    candidate.setMovedToJobListing(false);
                    candidate.setJobPosition(null);
                    candidate.setHiringStage(null);
                    if (candidate.getStatus() == CandidateStatus.HIRED || candidate.getStatus() == CandidateStatus.REJECTED) {
                        candidate.setStatus(CandidateStatus.POTENTIAL);
                    }
                }
        );
        candidateRepository.save(candidate);
    }

    public JobApplicationResponse toResponse(JobApplication application) {
        return new JobApplicationResponse(
                application.getId(), application.getCandidate().getId(), application.getCandidate().getFullName(),
                application.getJobListing().getId(), application.getJobListing().getTitle(), application.getStage(),
                application.getStatus(), application.getNotes(), application.getAppliedAt(), application.getUpdatedAt()
        );
    }

    private JobApplication getEntity(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aplikasi kandidat tidak ditemukan: " + id));
    }

    private void syncCandidate(Candidate candidate, JobListing job, HiringStage stage) {
        candidate.setMovedToJobListing(true);
        candidate.setJobPosition(job.getTitle());
        candidate.setHiringStage(stage.name());
        candidate.setStatus(switch (stage) {
            case NEW_CANDIDATE -> CandidateStatus.POTENTIAL;
            case SCREENING -> CandidateStatus.SCREENED;
            case INTERVIEW, OFFER -> CandidateStatus.AVAILABLE;
            case HIRED -> CandidateStatus.HIRED;
            case REJECTED -> CandidateStatus.REJECTED;
        });
    }

    private ApplicationStatus statusFor(HiringStage stage, ApplicationStatus requested) {
        if (stage == HiringStage.HIRED) return ApplicationStatus.HIRED;
        if (stage == HiringStage.REJECTED) return ApplicationStatus.REJECTED;
        return requested == ApplicationStatus.WITHDRAWN ? ApplicationStatus.WITHDRAWN : ApplicationStatus.ACTIVE;
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
