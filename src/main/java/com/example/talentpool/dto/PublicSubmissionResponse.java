package com.example.talentpool.dto;

import com.example.talentpool.domain.CandidateStatus;

import java.util.UUID;

public record PublicSubmissionResponse(
        UUID candidateId,
        String message,
        CandidateStatus status
) {
}
