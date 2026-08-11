package com.example.talentpool.controller;

import com.example.talentpool.dto.JobApplicationResponse;
import com.example.talentpool.dto.JobApplicationStageRequest;
import com.example.talentpool.service.JobApplicationService;
import jakarta.validation.Valid;
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
