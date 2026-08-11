package com.example.talentpool.dto;

import com.example.talentpool.domain.ApplicationStatus;
import com.example.talentpool.domain.HiringStage;
import jakarta.validation.constraints.NotNull;

public record JobApplicationStageRequest(
        @NotNull HiringStage stage,
        ApplicationStatus status,
        String notes
) {
}
