package com.example.talentpool.controller;

import com.example.talentpool.dto.RecruitmentSettingsRequest;
import com.example.talentpool.dto.RecruitmentSettingsResponse;
import com.example.talentpool.service.RecruitmentSettingsService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/backoffice/settings")
public class SettingsController {
    private final RecruitmentSettingsService service;

    public SettingsController(RecruitmentSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public RecruitmentSettingsResponse get() {
        return service.get();
    }

    @PutMapping
   // @PreAuthorize("hasRole('ADMIN')")
    public RecruitmentSettingsResponse update(@Valid @RequestBody RecruitmentSettingsRequest request) {
        return service.update(request);
    }
}
