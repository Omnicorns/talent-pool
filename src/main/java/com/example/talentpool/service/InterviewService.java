package com.example.talentpool.service;

import com.example.talentpool.domain.*;
import com.example.talentpool.dto.InterviewRequest;
import com.example.talentpool.dto.InterviewResponse;
import com.example.talentpool.dto.InterviewUpdateStatusRequest;
import com.example.talentpool.dto.JobApplicationStageRequest;
import com.example.talentpool.dto.JobApplicationUpsertRequest;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.exception.ResourceNotFoundException;
import com.example.talentpool.repository.CandidateRepository;
import com.example.talentpool.repository.InterviewRepository;
import com.example.talentpool.repository.JobApplicationRepository;
import com.example.talentpool.repository.JobListingRepository;
import com.example.talentpool.repository.RecruitmentSettingRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class InterviewService {
    private final InterviewRepository repository;
    private final CandidateRepository candidateRepository;
    private final JobListingRepository jobListingRepository;
    private final JobApplicationRepository applicationRepository;
    private final JobApplicationService applicationService;
    private final RecruitmentSettingRepository settingRepository;

    public InterviewService(
            InterviewRepository repository,
            CandidateRepository candidateRepository,
            JobListingRepository jobListingRepository,
            JobApplicationRepository applicationRepository,
            JobApplicationService applicationService,
            RecruitmentSettingRepository settingRepository
    ) {
        this.repository = repository;
        this.candidateRepository = candidateRepository;
        this.jobListingRepository = jobListingRepository;
        this.applicationRepository = applicationRepository;
        this.applicationService = applicationService;
        this.settingRepository = settingRepository;
    }

    @Transactional
    public InterviewResponse create(InterviewRequest request) {
        Interview interview = new Interview();
        apply(interview, request);
        Interview saved = repository.save(interview);

        if (saved.getJobListing() != null) {
            applicationService.assign(
                    saved.getJobListing().getId(),
                    saved.getCandidate().getId(),
                    new JobApplicationUpsertRequest(HiringStage.INTERVIEW, null)
            );
        } else {
            saved.getCandidate().setStatus(CandidateStatus.AVAILABLE);
            candidateRepository.save(saved.getCandidate());
        }
        return toResponse(saved);
    }

    @Transactional
    public InterviewResponse update(UUID id, InterviewRequest request) {
        Interview interview = getEntity(id);
        apply(interview, request);
        if (interview.getStatus() == InterviewStatus.CANCELLED || interview.getStatus() == InterviewStatus.COMPLETED) {
            interview.setStatus(InterviewStatus.RESCHEDULED);
            interview.setResult(InterviewResult.PENDING);
            interview.setFeedback(null);
        }
        Interview saved = repository.save(interview);
        if (saved.getJobListing() != null) {
            applicationService.assign(
                    saved.getJobListing().getId(),
                    saved.getCandidate().getId(),
                    new JobApplicationUpsertRequest(HiringStage.INTERVIEW, null)
            );
        }
        return toResponse(saved);
    }

    @Transactional
    public InterviewResponse updateStatus(UUID id, InterviewUpdateStatusRequest request) {
        Interview interview = getEntity(id);
        interview.setStatus(request.status());
        InterviewResult result = request.result() == null ? interview.getResult() : request.result();
        if (request.status() == InterviewStatus.COMPLETED && result == InterviewResult.PENDING) {
            throw new BadRequestException("Interview COMPLETED harus memiliki result selain PENDING");
        }
        if (request.status() == InterviewStatus.CANCELLED) result = InterviewResult.PENDING;
        interview.setResult(result);
        interview.setFeedback(trimToNull(request.feedback()));
        Interview saved = repository.save(interview);

        if (request.status() == InterviewStatus.COMPLETED) {
            syncRecruitmentResult(saved, result);
        }
        return toResponse(saved);
    }

    @Transactional
    public InterviewResponse detail(UUID id) {
        return toResponse(getEntity(id));
    }

    @Transactional
    public Page<InterviewResponse> search(
            String q, InterviewStatus status, Instant from, Instant to, Pageable pageable
    ) {
        return repository.findAll(InterviewSpecifications.filter(q, status, from, to), pageable).map(this::toResponse);
    }

    @Transactional
    public List<InterviewResponse> upcoming() {
        return repository.findTop5ByStatusAndScheduledAtAfterOrderByScheduledAtAsc(InterviewStatus.SCHEDULED, Instant.now())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void delete(UUID id) {
        repository.delete(getEntity(id));
    }

    public InterviewResponse toResponse(Interview interview) {
        JobListing job = interview.getJobListing();
        return new InterviewResponse(
                interview.getId(), interview.getCandidate().getId(), interview.getCandidate().getFullName(),
                job == null ? null : job.getId(), job == null ? null : job.getTitle(), interview.getScheduledAt(),
                interview.getDurationMinutes(), interview.getMode(), interview.getLocationOrLink(),
                interview.getInterviewer(), interview.getStatus(), interview.getResult(), interview.getNotes(),
                interview.getFeedback(), interview.getCreatedAt(), interview.getUpdatedAt()
        );
    }

    private void apply(Interview interview, InterviewRequest request) {
        Candidate candidate = candidateRepository.findById(request.candidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Kandidat tidak ditemukan: " + request.candidateId()));
        JobListing job = request.jobListingId() == null ? null : jobListingRepository.findById(request.jobListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Job listing tidak ditemukan: " + request.jobListingId()));
        if (job != null && job.getStatus() == JobListingStatus.CLOSED) {
            throw new BadRequestException("Interview tidak dapat dijadwalkan untuk lowongan CLOSED");
        }
        if (request.scheduledAt().isBefore(Instant.now().minusSeconds(300))) {
            throw new BadRequestException("Jadwal interview tidak boleh berada di masa lalu");
        }
        if ((request.mode() == InterviewMode.ONLINE || request.mode() == InterviewMode.ONSITE)
                && (request.locationOrLink() == null || request.locationOrLink().isBlank())) {
            throw new BadRequestException("Lokasi atau link wajib diisi untuk interview ONLINE/ONSITE");
        }

        int defaultDuration = settingRepository.findById(RecruitmentSetting.SINGLETON_ID)
                .map(RecruitmentSetting::getDefaultInterviewDuration)
                .orElse(60);

        interview.setCandidate(candidate);
        interview.setJobListing(job);
        interview.setScheduledAt(request.scheduledAt());
        interview.setDurationMinutes(request.durationMinutes() == null ? defaultDuration : request.durationMinutes());
        interview.setMode(request.mode());
        interview.setLocationOrLink(trimToNull(request.locationOrLink()));
        interview.setInterviewer(request.interviewer().trim());
        interview.setNotes(trimToNull(request.notes()));
    }

    private void syncRecruitmentResult(Interview interview, InterviewResult result) {
        Candidate candidate = interview.getCandidate();
        JobListing job = interview.getJobListing();

        if (job != null) {
            applicationRepository.findByCandidateIdAndJobListingId(candidate.getId(), job.getId())
                    .ifPresentOrElse(
                            application -> applicationService.updateStage(
                                    application.getId(),
                                    new JobApplicationStageRequest(stageFor(result), null, "Hasil interview: " + result)
                            ),
                            () -> applicationService.assign(
                                    job.getId(), candidate.getId(),
                                    new JobApplicationUpsertRequest(stageFor(result), "Hasil interview: " + result)
                            )
                    );
            return;
        }

        candidate.setStatus(switch (result) {
            case PASSED -> CandidateStatus.AVAILABLE;
            case FAILED -> CandidateStatus.REJECTED;
            case HOLD, PENDING -> CandidateStatus.SCREENED;
        });
        candidateRepository.save(candidate);
    }

    private HiringStage stageFor(InterviewResult result) {
        return switch (result) {
            case PASSED -> HiringStage.OFFER;
            case FAILED -> HiringStage.REJECTED;
            case HOLD, PENDING -> HiringStage.INTERVIEW;
        };
    }

    private Interview getEntity(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview tidak ditemukan: " + id));
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
