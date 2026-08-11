package com.example.talentpool.controller;

import com.example.talentpool.domain.InterviewStatus;
import com.example.talentpool.dto.*;
import com.example.talentpool.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/backoffice/interviews")
public class InterviewController {
    private final InterviewService service;

    public InterviewController(InterviewService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<InterviewResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) InterviewStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @PageableDefault(size = 10, sort = "scheduledAt") Pageable pageable
    ) {
        return PageResponse.from(service.search(q, status, from, to, pageable));
    }

    @GetMapping("/upcoming")
    public List<InterviewResponse> upcoming() {
        return service.upcoming();
    }

    @GetMapping("/{id}")
    public InterviewResponse detail(@PathVariable UUID id) {
        return service.detail(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InterviewResponse create(@Valid @RequestBody InterviewRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public InterviewResponse update(@PathVariable UUID id, @Valid @RequestBody InterviewRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public InterviewResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody InterviewUpdateStatusRequest request
    ) {
        return service.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
