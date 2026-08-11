package com.example.talentpool.dto;

import com.example.talentpool.domain.EducationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EducationRequest(
        @NotNull EducationType type,
        String level,
        @NotBlank String institution,
        String major,
        Integer startYear,
        Integer endYear,
        String description,
        String ipk
) {
}
