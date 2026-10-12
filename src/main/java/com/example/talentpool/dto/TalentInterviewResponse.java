package com.example.talentpool.dto;

import com.example.talentpool.domain.InterviewMode;
import com.example.talentpool.domain.InterviewStatus;

import java.time.Instant;
import java.util.UUID;

public record TalentInterviewResponse(
        UUID id,
        String jobTitle,
        Instant scheduledAt,
        int durationMinutes,
        InterviewMode mode,
        String locationOrLink,
        InterviewStatus status
) {
}
