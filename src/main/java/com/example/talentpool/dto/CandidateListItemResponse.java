package com.example.talentpool.dto;

import com.example.talentpool.domain.CandidateStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CandidateListItemResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String relatedPosition,
        String industry,
        long experienceMonths,
        BigDecimal expectedSalary,
        CandidateStatus status,
        String source,
        boolean movedToJobListing,
        List<String> tools,
        Instant updatedAt,
        boolean reviewed,
        boolean hasCv,
        List<String> jobInterests,
        List<String> preferredLocations,
        LastExperience lastExperience
) {
    /** Pengalaman kerja terakhir beserta masa kerjanya. */
    public record LastExperience(String position, String company, java.time.LocalDate startDate,
                                 java.time.LocalDate endDate, boolean currentJob, long months) {
    }
}
