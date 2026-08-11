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
        Instant updatedAt
) {
}
