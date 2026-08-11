package com.example.talentpool.controller;

import com.example.talentpool.domain.JobListingStatus;
import com.example.talentpool.dto.*;
import com.example.talentpool.service.JobApplicationService;
import com.example.talentpool.service.JobListingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/backoffice/job-listings")
public class JobListingController {
    private final JobListingService service;
    private final JobApplicationService applicationService;

    public JobListingController(JobListingService service, JobApplicationService applicationService) {
        this.service = service;
        this.applicationService = applicationService;
    }

    @GetMapping
    public PageResponse<JobListingResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) JobListingStatus status,
            @PageableDefault(size = 10, sort = "updatedAt") Pageable pageable
    ) {
        return PageResponse.from(service.search(q, status, pageable));
    }

    @GetMapping("/summary")
    public JobListingSummaryResponse summary() {
        return service.summary();
    }

    @GetMapping("/{id}")
    public JobListingResponse detail(@PathVariable UUID id) {
        return service.detail(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobListingResponse create(@Valid @RequestBody JobListingRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public JobListingResponse update(@PathVariable UUID id, @Valid @RequestBody JobListingRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public JobListingResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody JobListingStatusRequest request
    ) {
        return service.updateStatus(id, request);
    }

    @GetMapping("/{id}/applications")
    public PageResponse<JobApplicationResponse> applications(
            @PathVariable UUID id,
            @PageableDefault(size = 10, sort = "updatedAt") Pageable pageable
    ) {
        return PageResponse.from(applicationService.listByJob(id, pageable));
    }

    @PostMapping("/{jobId}/candidates/{candidateId}")
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplicationResponse assignCandidate(
            @PathVariable UUID jobId,
            @PathVariable UUID candidateId,
            @RequestBody(required = false) JobApplicationUpsertRequest request
    ) {
        JobApplicationUpsertRequest payload = request == null
                ? new JobApplicationUpsertRequest(null, null)
                : request;
        return applicationService.assign(jobId, candidateId, payload);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
