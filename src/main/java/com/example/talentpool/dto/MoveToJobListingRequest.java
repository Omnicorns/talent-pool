package com.example.talentpool.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MoveToJobListingRequest(
        @NotNull(message = "Job listing wajib dipilih") UUID jobListingId,
        String jobPosition,
        String hiringStage
) {
}
