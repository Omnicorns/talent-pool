package com.example.talentpool.dto;

import com.example.talentpool.domain.InterviewMode;
import com.example.talentpool.domain.InterviewResult;
import com.example.talentpool.domain.InterviewStatus;

import java.time.Instant;
import java.util.UUID;

public record InterviewResponse(
        UUID id,
        UUID candidateId,
        String candidateName,
        UUID jobListingId,
        String jobTitle,
        Instant scheduledAt,
        int durationMinutes,
        InterviewMode mode,
        String locationOrLink,
        String interviewer,
        InterviewStatus status,
        InterviewResult result,
        String notes,
        String feedback,
        Instant createdAt,
        Instant updatedAt
) {
}
