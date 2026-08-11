package com.example.talentpool.dto;

import com.example.talentpool.domain.CandidateStatus;
import com.example.talentpool.domain.HiringStage;
import com.example.talentpool.domain.JobListingStatus;

import java.util.List;
import java.util.Map;

public record RecruitmentReportResponse(
        Map<CandidateStatus, Long> candidatesByStatus,
        List<LabelCount> candidatesBySource,
        Map<JobListingStatus, Long> jobsByStatus,
        Map<HiringStage, Long> applicationsByStage,
        long totalCandidates,
        long totalApplications,
        long totalHired,
        double hireConversionRate
) {
    public record LabelCount(String label, long count) {}
}
