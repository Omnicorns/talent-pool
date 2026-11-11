package com.example.talentpool.controller;

import com.example.talentpool.dto.ExecutiveSummaryResponse;
import com.example.talentpool.service.ExecutiveSummaryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backoffice/executive-summary")
public class ExecutiveSummaryController {
    private final ExecutiveSummaryService service;

    public ExecutiveSummaryController(ExecutiveSummaryService service) {
        this.service = service;
    }

    @GetMapping
    public ExecutiveSummaryResponse summary() {
        return service.summary();
    }
}
