package com.example.talentpool.dto;

import com.example.talentpool.domain.JobListingStatus;
import jakarta.validation.constraints.NotNull;

public record JobListingStatusRequest(@NotNull JobListingStatus status) {
}
