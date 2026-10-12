package com.example.talentpool.dto;

import com.example.talentpool.domain.ApplicationStatus;
import com.example.talentpool.domain.HiringStage;

import java.time.Instant;
import java.util.UUID;

public record TalentApplicationHistoryResponse(
        UUID id,
        HiringStage stage,
        ApplicationStatus status,
        String eventType,
        String notes,
        Instant changedAt
) {
}
