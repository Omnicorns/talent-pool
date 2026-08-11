package com.example.talentpool.dto;

public record CandidateSummaryResponse(
        long totalTalent,
        long activeCandidates,
        long readyToHire,
        long movedToJobListing
) {
}
