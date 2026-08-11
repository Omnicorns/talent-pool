package com.example.talentpool.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record WorkExperienceRequest(
        @NotBlank String companyName,
        @NotBlank String position,
        @NotNull LocalDate startDate,
        LocalDate endDate,
        boolean currentJob,
        String description
) {
}
