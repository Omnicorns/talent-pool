package com.example.talentpool.dto;

import com.example.talentpool.domain.HiringStage;

public record JobApplicationUpsertRequest(
        HiringStage stage,
        String notes
) {
}
