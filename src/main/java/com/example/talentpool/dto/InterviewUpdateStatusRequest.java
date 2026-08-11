package com.example.talentpool.dto;

import com.example.talentpool.domain.InterviewResult;
import com.example.talentpool.domain.InterviewStatus;
import jakarta.validation.constraints.NotNull;

public record InterviewUpdateStatusRequest(
        @NotNull InterviewStatus status,
        InterviewResult result,
        String feedback
) {
}
