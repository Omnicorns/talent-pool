package com.example.talentpool.dto;

import com.example.talentpool.domain.EmploymentType;
import com.example.talentpool.domain.JobListingStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record JobListingResponse(
        UUID id,
        String title,
        String department,
        String location,
        EmploymentType employmentType,
        String description,
        int openings,
        LocalDate applicationDeadline,
        JobListingStatus status,
        long applicationCount,
        Instant createdAt,
        Instant updatedAt
) {
}
