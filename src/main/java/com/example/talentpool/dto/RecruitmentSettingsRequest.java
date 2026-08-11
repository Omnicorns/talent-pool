package com.example.talentpool.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RecruitmentSettingsRequest(
        @NotBlank @Size(max = 200) String companyName,
        @Min(15) @Max(480) int defaultInterviewDuration,
        @NotBlank @Size(max = 100) String timezone,
        boolean emailNotifications,
        @Min(0) @Max(3650) int candidateAutoArchiveDays
) {
}
