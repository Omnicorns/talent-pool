package com.example.talentpool.controller;

import com.example.talentpool.domain.CandidateStatus;
import com.example.talentpool.dto.*;
import com.example.talentpool.service.CandidateService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/backoffice/talents", "/api/backoffice/candidates"})
public class BackofficeTalentController {
    private final CandidateService service;

    public BackofficeTalentController(CandidateService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<CandidateListItemResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String position,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) CandidateStatus status,
            @PageableDefault(size = 10, sort = "updatedAt") Pageable pageable
    ) {
        return PageResponse.from(service.search(q, industry, position, source, status, pageable));
    }

    @GetMapping("/summary")
    public CandidateSummaryResponse summary() {
        return service.summary();
    }

    @GetMapping("/{id}")
    public CandidateResponse detail(@PathVariable UUID id) {
        return service.detail(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CandidateResponse create(
            @Valid @RequestPart("data") CandidateUpsertRequest request,
            @RequestPart("cv") MultipartFile cv,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture,
            @RequestPart(value = "portfolioFiles", required = false) List<MultipartFile> portfolioFiles
    ) {
        return service.create(request, cv, profilePicture, portfolioFiles);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CandidateResponse update(
            @PathVariable UUID id,
            @Valid @RequestPart("data") CandidateUpsertRequest request,
            @RequestPart(value = "cv", required = false) MultipartFile cv,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture,
            @RequestPart(value = "portfolioFiles", required = false) List<MultipartFile> portfolioFiles
    ) {
        return service.update(id, request, cv, profilePicture, portfolioFiles);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public List<CandidateResponse> importCv(@RequestPart("files") List<MultipartFile> files) {
        return service.bulkImport(files);
    }

    @PatchMapping("/{id}/status")
    public CandidateResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        return service.updateStatus(id, request);
    }

    @PostMapping("/{id}/move-to-job-listing")
    public CandidateResponse moveToJobListing(
            @PathVariable UUID id,
            @Valid @RequestBody MoveToJobListingRequest request
    ) {
        return service.moveToJobListing(id, request);
    }

    @GetMapping("/{id}/cv")
    public ResponseEntity<?> downloadCv(@PathVariable UUID id) {
        var file = service.loadCv(id);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(file.filename(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .contentType(file.mediaType())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(file.resource());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
