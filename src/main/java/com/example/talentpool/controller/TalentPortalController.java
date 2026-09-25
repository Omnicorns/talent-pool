package com.example.talentpool.controller;

import com.example.talentpool.dto.*;
import com.example.talentpool.service.TalentPortalService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/talent")
public class TalentPortalController {

    private final TalentPortalService service;

    public TalentPortalController(TalentPortalService service) {
        this.service = service;
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
            @RequestPart(value = "portfolioFiles", required = false) List<MultipartFile> portfolioFiles
    ) {
        return service.updateProfile(candidateId(jwt), request, cv, profilePicture, portfolioFiles);
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
