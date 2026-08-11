package com.example.talentpool.dto;

public record JobListingSummaryResponse(
        long total,
        long draft,
        long published,
        long closed
) {
}
