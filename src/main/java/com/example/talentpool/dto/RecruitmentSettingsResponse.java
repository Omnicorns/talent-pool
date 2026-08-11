package com.example.talentpool.dto;

import java.time.Instant;

public record RecruitmentSettingsResponse(
        String companyName,
        int defaultInterviewDuration,
        String timezone,
        boolean emailNotifications,
        int candidateAutoArchiveDays,
        Instant updatedAt
) {
}
