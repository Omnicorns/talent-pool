package com.example.talentpool.dto;

import com.example.talentpool.domain.InterviewMode;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record InterviewRequest(
        @NotNull UUID candidateId,
        UUID jobListingId,
        @NotNull Instant scheduledAt,
        @Min(15) @Max(480) Integer durationMinutes,
        @NotNull InterviewMode mode,
        @Size(max = 1000) String locationOrLink,
        @NotBlank @Size(max = 200) String interviewer,
        String notes
) {
}
