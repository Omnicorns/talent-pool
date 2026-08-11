package com.example.talentpool.dto;

import com.example.talentpool.domain.CandidateStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull CandidateStatus status) {
}
