package com.example.talentpool.dto;

import com.example.talentpool.domain.ApplicationStatus;
import com.example.talentpool.domain.HiringStage;

import java.time.Instant;
import java.util.UUID;

public record JobApplicationResponse(
        UUID id,
        UUID candidateId,
        String candidateName,
        UUID jobListingId,
        String jobTitle,
        HiringStage stage,
        ApplicationStatus status,
        String notes,
        Instant appliedAt,
        Instant updatedAt
) {
}
