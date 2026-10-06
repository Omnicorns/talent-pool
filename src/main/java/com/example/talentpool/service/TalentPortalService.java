package com.example.talentpool.service;

import com.example.talentpool.domain.ApplicationStatus;
import com.example.talentpool.domain.JobApplication;
import com.example.talentpool.domain.JobListing;
import com.example.talentpool.domain.JobListingStatus;
import com.example.talentpool.dto.*;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.exception.ResourceNotFoundException;
import com.example.talentpool.repository.JobApplicationRepository;
import com.example.talentpool.repository.JobApplicationHistoryRepository;
import com.example.talentpool.repository.JobListingRepository;
import com.example.talentpool.repository.InterviewRepository;
import com.example.talentpool.repository.TalentAccountRepository;
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
    private final SupportingDocumentService documents;
    private final TalentProfileValidator profileValidator;
    private final com.example.talentpool.repository.CandidateRepository candidates;
    private final JobListingService jobListingService;
    private final JobListingRepository jobListingRepository;
    private final JobApplicationRepository applicationRepository;
    private final JobApplicationHistoryRepository applicationHistoryRepository;
    private final JobApplicationService applicationService;
    private final CandidateViewService candidateViewService;
    private final InterviewRepository interviewRepository;
    private final TalentAccountRepository talentAccounts;

    public TalentPortalService(
            CandidateService candidateService,
            JobListingService jobListingService,
            JobListingRepository jobListingRepository,
            JobApplicationRepository applicationRepository,
            JobApplicationHistoryRepository applicationHistoryRepository,
            JobApplicationService applicationService,
            CandidateViewService candidateViewService,
            InterviewRepository interviewRepository,
            SupportingDocumentService documents,
            TalentProfileValidator profileValidator,
            com.example.talentpool.repository.CandidateRepository candidates,
            TalentAccountRepository talentAccounts
    ) {
        this.candidateService = candidateService;
        this.documents = documents;
        this.profileValidator=profileValidator;
        this.candidates=candidates;
        this.talentAccounts=talentAccounts;
        this.jobListingService = jobListingService;
        this.jobListingRepository = jobListingRepository;
        this.applicationRepository = applicationRepository;
        this.applicationHistoryRepository = applicationHistoryRepository;
        this.applicationService = applicationService;
        this.candidateViewService = candidateViewService;
        this.interviewRepository = interviewRepository;
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
            List<MultipartFile> portfolioFiles,
            List<String> supportingKeys, List<MultipartFile> supportingFiles
    ) {
        CandidateResponse current = candidateService.detail(candidateId);
        if (current.email() == null || !current.email().equalsIgnoreCase(request.email())) {
            throw new BadRequestException("Email login tidak dapat diubah dari profil");
        }
        documents.validateUploads(supportingKeys,supportingFiles);
        documents.validateOwners(request,supportingKeys);
        if (cv != null && ((cv.getOriginalFilename()==null || !cv.getOriginalFilename().toLowerCase(java.util.Locale.ROOT).matches(".*\\.(pdf|doc|docx)$")) || cv.getSize()>10L*1024*1024 || cv.isEmpty()))
            throw new BadRequestException("CV wajib berupa PDF, DOC, atau DOCX maksimal 10 MB");
        if (profilePicture != null && profilePicture.getSize()>10L*1024*1024)
            throw new BadRequestException("Foto profil maksimal 10 MB");
        if (portfolioFiles != null && (portfolioFiles.size()>10 || portfolioFiles.stream().anyMatch(file -> file.getSize()>10L*1024*1024)))
            throw new BadRequestException("Maksimal 10 portofolio, masing-masing maksimal 10 MB");
        candidateService.update(candidateId, request, cv, profilePicture, portfolioFiles);
        documents.attach(candidateId,supportingKeys,supportingFiles);
        boolean onboardingComplete=talentAccounts.findByCandidateId(candidateId)
                .map(com.example.talentpool.domain.TalentAccount::isOnboardingCompleted)
                .orElse(false);
        if(!onboardingComplete && request.profileDetails()!=null)
            profileValidator.validate(candidates.findById(candidateId).orElseThrow());
        return candidateService.detail(candidateId);
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
        CandidateResponse profile = candidateService.detail(candidateId);
        if (profile.fullName() == null || profile.fullName().isBlank()
                || profile.phone() == null || profile.phone().isBlank()
                || profile.cvOriginalName() == null || profile.cvOriginalName().isBlank()
                || !profile.termsAccepted()) {
            throw new BadRequestException("Lengkapi profil dan CV sebelum melamar lowongan");
        }

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
        JobApplication saved = applicationRepository.save(application);
        applicationService.recordHistory(saved, "WITHDRAWN", "Lamaran ditarik oleh kandidat");
        return applicationService.toResponse(saved);
    }

    @Transactional
    public List<TalentApplicationHistoryResponse> applicationHistory(UUID candidateId, UUID applicationId) {
        JobApplication application = applicationRepository.findByIdAndCandidateId(applicationId, candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Lamaran tidak ditemukan"));

        List<TalentApplicationHistoryResponse> history = applicationHistoryRepository
                .findByApplicationIdOrderByChangedAtAsc(applicationId)
                .stream()
                .map(item -> new TalentApplicationHistoryResponse(
                        item.getId(),
                        item.getStage(),
                        item.getStatus(),
                        item.getEventType(),
                        item.getNotes(),
                        item.getChangedAt()
                ))
                .toList();

        if (!history.isEmpty()) {
            return history;
        }

        if (application.getAppliedAt().equals(application.getUpdatedAt())) {
            return List.of(new TalentApplicationHistoryResponse(
                    null,
                    application.getStage(),
                    application.getStatus(),
                    "APPLIED",
                    null,
                    application.getAppliedAt()
            ));
        }

        return List.of(
                new TalentApplicationHistoryResponse(
                        null,
                        com.example.talentpool.domain.HiringStage.NEW_CANDIDATE,
                        ApplicationStatus.ACTIVE,
                        "APPLIED",
                        null,
                        application.getAppliedAt()
                ),
                new TalentApplicationHistoryResponse(
                        null,
                        application.getStage(),
                        application.getStatus(),
                        "CURRENT_STATUS",
                        null,
                        application.getUpdatedAt()
                )
        );
    }

    @Transactional
    public List<TalentActivityResponse> activities(UUID candidateId) {
        return candidateViewService.recent(candidateId);
    }

    @Transactional
    public List<TalentInterviewResponse> interviews(UUID candidateId) {
        return interviewRepository.findTop10ByCandidateIdOrderByScheduledAtDesc(candidateId)
                .stream()
                .map(interview -> new TalentInterviewResponse(
                        interview.getId(),
                        interview.getJobListing() == null ? null : interview.getJobListing().getTitle(),
                        interview.getScheduledAt(),
                        interview.getDurationMinutes(),
                        interview.getMode(),
                        interview.getLocationOrLink(),
                        interview.getStatus()
                ))
                .toList();
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
