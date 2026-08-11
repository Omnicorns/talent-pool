package com.example.talentpool.controller;

import com.example.talentpool.dto.RecruitmentReportResponse;
import com.example.talentpool.service.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backoffice/reports")
public class ReportController {
    private final ReportService service;

    public ReportController(ReportService service) {
        this.service = service;
    }

    @GetMapping("/overview")
    public RecruitmentReportResponse overview() {
        return service.overview();
    }
}
