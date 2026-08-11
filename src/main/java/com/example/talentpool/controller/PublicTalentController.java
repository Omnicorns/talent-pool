package com.example.talentpool.controller;

import com.example.talentpool.domain.CandidateStatus;
import com.example.talentpool.dto.CandidateUpsertRequest;
import com.example.talentpool.dto.PublicSubmissionResponse;
import com.example.talentpool.service.CandidateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/talents")
public class PublicTalentController {
    private final CandidateService service;

    public PublicTalentController(CandidateService service) {
        this.service = service;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public PublicSubmissionResponse submit(
            @Valid @RequestPart("data") CandidateUpsertRequest request,
            @RequestPart("cv") MultipartFile cv,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture,
            @RequestPart(value = "portfolioFiles", required = false) List<MultipartFile> portfolioFiles
    ) {
        var candidate = service.create(request, cv, profilePicture, portfolioFiles);
        return new PublicSubmissionResponse(
                candidate.id(), "Profil berhasil ditambahkan ke Talent Pool", candidate.status()
        );
    }

    @GetMapping("/{id}/status")
    public Map<String, Object> status(@PathVariable UUID id) {
        CandidateStatus status = service.publicStatus(id);
        return Map.of("candidateId", id, "status", status);
    }
}
