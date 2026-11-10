package com.example.talentpool.service;

import com.example.talentpool.domain.JobListing;
import com.example.talentpool.domain.JobListingStatus;
import com.example.talentpool.event.JobListingPublishedEvent;
import com.example.talentpool.dto.*;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.exception.ResourceNotFoundException;
import com.example.talentpool.repository.InterviewRepository;
import com.example.talentpool.repository.JobApplicationRepository;
import com.example.talentpool.repository.JobListingRepository;
import jakarta.transaction.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class JobListingService {
    private final JobListingRepository repository;
    private final JobApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final ApplicationEventPublisher eventPublisher;

    public JobListingService(
            JobListingRepository repository,
            JobApplicationRepository applicationRepository,
            InterviewRepository interviewRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.repository = repository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public JobListingResponse create(JobListingRequest request) {
        JobListing job = new JobListing();
        apply(job, request);
        JobListing saved = repository.save(job);
        announceIfNewlyPublished(saved, null);
        return toResponse(saved);
    }

    @Transactional
    public JobListingResponse update(UUID id, JobListingRequest request) {
        JobListing job = getEntity(id);
        JobListingStatus before = job.getStatus();
        apply(job, request);
        JobListing saved = repository.save(job);
        announceIfNewlyPublished(saved, before);
        return toResponse(saved);
    }

    @Transactional
    public JobListingResponse updateStatus(UUID id, JobListingStatusRequest request) {
        JobListing job = getEntity(id);
        if (request.status() == JobListingStatus.PUBLISHED
                && job.getApplicationDeadline() != null
                && job.getApplicationDeadline().isBefore(LocalDate.now())) {
            throw new BadRequestException("Lowongan dengan batas lamaran yang sudah lewat tidak dapat dipublikasikan");
        }
        JobListingStatus before = job.getStatus();
        job.setStatus(request.status());
        JobListing saved = repository.save(job);
        announceIfNewlyPublished(saved, before);
        return toResponse(saved);
    }

    @Transactional
    public JobListingResponse detail(UUID id) {
        return toResponse(getEntity(id));
    }

    @Transactional
    public Page<JobListingResponse> search(String q, JobListingStatus status, Pageable pageable) {
        return repository.findAll(JobListingSpecifications.filter(q, status), pageable).map(this::toResponse);
    }

    @Transactional
    public Page<JobListingResponse> searchPublicOpen(String q, Pageable pageable) {
        return repository.findAll(JobListingSpecifications.publicOpen(q), pageable).map(this::toResponse);
    }

    public JobListingSummaryResponse summary() {
        return new JobListingSummaryResponse(
                repository.count(),
                repository.countByStatus(JobListingStatus.DRAFT),
                repository.countByStatus(JobListingStatus.PUBLISHED),
                repository.countByStatus(JobListingStatus.CLOSED)
        );
    }

    @Transactional
    public void delete(UUID id) {
        JobListing job = getEntity(id);
        if (applicationRepository.existsByJobListingId(id) || interviewRepository.existsByJobListingId(id)) {
            throw new BadRequestException("Lowongan sudah memiliki kandidat atau jadwal interview. Ubah status menjadi CLOSED, jangan dihapus.");
        }
        repository.delete(job);
    }

    public JobListing getEntity(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job listing tidak ditemukan: " + id));
    }

    private void apply(JobListing job, JobListingRequest request) {
        job.setTitle(request.title().trim());
        job.setDepartment(trimToNull(request.department()));
        job.setLocation(trimToNull(request.location()));
        job.setEmploymentType(request.employmentType());
        job.setDescription(trimToNull(request.description()));
        job.setOpenings(request.openings());
        job.setApplicationDeadline(request.applicationDeadline());
        job.setStatus(request.status());
        if (job.getStatus() == JobListingStatus.PUBLISHED
                && job.getApplicationDeadline() != null
                && job.getApplicationDeadline().isBefore(LocalDate.now())) {
            throw new BadRequestException("Batas lamaran tidak boleh sudah lewat untuk lowongan PUBLISHED");
        }
    }

    private JobListingResponse toResponse(JobListing job) {
        return new JobListingResponse(
                job.getId(), job.getTitle(), job.getDepartment(), job.getLocation(), job.getEmploymentType(),
                job.getDescription(), job.getOpenings(), job.getApplicationDeadline(), job.getStatus(),
                applicationRepository.countByJobListingId(job.getId()), job.getCreatedAt(), job.getUpdatedAt()
        );
    }

    /**
     * Email lowongan baru dikirim sekali per lowongan, saat pertama kali berstatus PUBLISHED.
     * Penanda disimpan di transaksi yang sama; pengiriman berjalan async setelah commit.
     */
    private void announceIfNewlyPublished(JobListing job, JobListingStatus before) {
        // Hanya saat berpindah ke PUBLISHED: mengedit lowongan yang sudah PUBLISHED (termasuk data lama
        // yang belum punya penanda) tidak boleh memicu email massal.
        if (before != JobListingStatus.PUBLISHED
                && job.getStatus() == JobListingStatus.PUBLISHED
                && job.getNewJobNotifiedAt() == null) {
            job.setNewJobNotifiedAt(Instant.now());
            repository.save(job);
            eventPublisher.publishEvent(new JobListingPublishedEvent(job.getId()));
        }
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
