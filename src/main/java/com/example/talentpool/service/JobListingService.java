package com.example.talentpool.service;

import com.example.talentpool.domain.JobListing;
import com.example.talentpool.domain.JobListingStatus;
import com.example.talentpool.dto.*;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.exception.ResourceNotFoundException;
import com.example.talentpool.repository.InterviewRepository;
import com.example.talentpool.repository.JobApplicationRepository;
import com.example.talentpool.repository.JobListingRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class JobListingService {
    private final JobListingRepository repository;
    private final JobApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;

    public JobListingService(
            JobListingRepository repository,
            JobApplicationRepository applicationRepository,
            InterviewRepository interviewRepository
    ) {
        this.repository = repository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
    }

    @Transactional
    public JobListingResponse create(JobListingRequest request) {
        JobListing job = new JobListing();
        apply(job, request);
        return toResponse(repository.save(job));
    }

    @Transactional
    public JobListingResponse update(UUID id, JobListingRequest request) {
        JobListing job = getEntity(id);
        apply(job, request);
        return toResponse(repository.save(job));
    }

    @Transactional
    public JobListingResponse updateStatus(UUID id, JobListingStatusRequest request) {
        JobListing job = getEntity(id);
        if (request.status() == JobListingStatus.PUBLISHED
                && job.getApplicationDeadline() != null
                && job.getApplicationDeadline().isBefore(LocalDate.now())) {
            throw new BadRequestException("Lowongan dengan batas lamaran yang sudah lewat tidak dapat dipublikasikan");
        }
        job.setStatus(request.status());
        return toResponse(repository.save(job));
    }

    @Transactional
    public JobListingResponse detail(UUID id) {
        return toResponse(getEntity(id));
    }

    @Transactional
    public Page<JobListingResponse> search(String q, JobListingStatus status, Pageable pageable) {
        return repository.findAll(JobListingSpecifications.filter(q, status), pageable).map(this::toResponse);
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

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
