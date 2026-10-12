package com.example.talentpool.controller;

import com.example.talentpool.dto.JobApplicationResponse;
import com.example.talentpool.dto.JobApplicationStageRequest;
import com.example.talentpool.dto.PageResponse;
import com.example.talentpool.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/backoffice/applications")
public class JobApplicationController {
    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<JobApplicationResponse> list(
            @PageableDefault(size = 20, sort = "updatedAt") Pageable pageable
    ) {
        return PageResponse.from(service.list(pageable));
    }

    @PatchMapping("/{id}/stage")
    public JobApplicationResponse updateStage(
            @PathVariable UUID id,
            @Valid @RequestBody JobApplicationStageRequest request
    ) {
        return service.updateStage(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
