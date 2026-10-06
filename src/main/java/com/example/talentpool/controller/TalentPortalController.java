package com.example.talentpool.controller;

import com.example.talentpool.dto.*;
import com.example.talentpool.service.CandidateService;
import com.example.talentpool.service.TalentPortalService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/talent")
public class TalentPortalController {

    private final TalentPortalService service;
    private final CandidateService candidateService;
    private final com.example.talentpool.service.SupportingDocumentService documents;

    public TalentPortalController(TalentPortalService service, CandidateService candidateService, com.example.talentpool.service.SupportingDocumentService documents) {
        this.documents=documents;
        this.service = service;
        this.candidateService = candidateService;
    }

    @GetMapping("/profile")
    public CandidateResponse profile(@AuthenticationPrincipal Jwt jwt) {
        return service.profile(candidateId(jwt));
    }

    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CandidateResponse updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestPart("data") CandidateUpsertRequest request,
            @RequestPart(value = "cv", required = false) MultipartFile cv,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture,
            @RequestPart(value = "portfolioFiles", required = false) List<MultipartFile> portfolioFiles,
            @RequestPart(value = "supportingKeys", required = false) List<String> supportingKeys,
            @RequestPart(value = "supportingFiles", required = false) List<MultipartFile> supportingFiles
    ) {
        return service.updateProfile(candidateId(jwt), request, cv, profilePicture, portfolioFiles, supportingKeys, supportingFiles);
    }

    @GetMapping("/profile/picture")
    public ResponseEntity<?> ownProfilePicture(@AuthenticationPrincipal Jwt jwt) {
        var file = candidateService.loadProfilePicture(candidateId(jwt));

        ContentDisposition disposition = ContentDisposition.inline()
                .filename(file.filename(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(file.mediaType())
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(file.resource());
    }

    @GetMapping("/profile/cv")
    public ResponseEntity<?> downloadOwnCv(@AuthenticationPrincipal Jwt jwt) {
        var file = candidateService.loadCv(candidateId(jwt));
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(file.filename(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(file.mediaType())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(file.resource());
    }

    @GetMapping("/profile/documents/{key}")
    public ResponseEntity<?> downloadDocument(@AuthenticationPrincipal Jwt jwt, @PathVariable String key) {
        var file=documents.load(candidateId(jwt),key);
        return ResponseEntity.ok().contentType(file.mediaType()).cacheControl(CacheControl.noStore())
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(file.filename(),StandardCharsets.UTF_8).build().toString())
            .body(file.resource());
    }
    @GetMapping("/activities")
    public List<TalentActivityResponse> activities(@AuthenticationPrincipal Jwt jwt) {
        return service.activities(candidateId(jwt));
    }

    @GetMapping("/interviews")
    public List<TalentInterviewResponse> interviews(@AuthenticationPrincipal Jwt jwt) {
        return service.interviews(candidateId(jwt));
    }

    @GetMapping("/jobs")
    public PageResponse<JobListingResponse> jobs(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "updatedAt") Pageable pageable
    ) {
        return PageResponse.from(service.jobs(q, pageable));
    }

    @GetMapping("/jobs/{id}")
    public JobListingResponse job(@PathVariable UUID id) {
        return service.job(id);
    }

    @PostMapping("/jobs/{id}/apply")
    public JobApplicationResponse apply(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String notes = body == null ? null : body.get("notes");
        return service.apply(candidateId(jwt), id, notes);
    }

    @GetMapping("/applications")
    public PageResponse<JobApplicationResponse> applications(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20, sort = "updatedAt") Pageable pageable
    ) {
        return PageResponse.from(service.applications(candidateId(jwt), pageable));
    }

    @GetMapping("/applications/{id}/history")
    public List<TalentApplicationHistoryResponse> applicationHistory(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id
    ) {
        return service.applicationHistory(candidateId(jwt), id);
    }

    @PatchMapping("/applications/{id}/withdraw")
    public JobApplicationResponse withdraw(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id
    ) {
        return service.withdraw(candidateId(jwt), id);
    }

    private UUID candidateId(Jwt jwt) {
        return UUID.fromString(jwt.getClaimAsString("candidateId"));
    }
}
