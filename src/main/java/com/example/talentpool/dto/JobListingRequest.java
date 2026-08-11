package com.example.talentpool.dto;

import com.example.talentpool.domain.EmploymentType;
import com.example.talentpool.domain.JobListingStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record JobListingRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 150) String department,
        @Size(max = 150) String location,
        @NotNull EmploymentType employmentType,
        String description,
        @Min(1) int openings,
        LocalDate applicationDeadline,
        @NotNull JobListingStatus status
) {
}
