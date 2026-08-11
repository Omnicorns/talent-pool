package com.example.talentpool.dto;

import java.util.List;

public record DashboardResponse(
        long totalCandidates,
        long activeCandidates,
        long availableCandidates,
        long hiredCandidates,
        long totalJobListings,
        long openJobListings,
        long totalApplications,
        long upcomingInterviews,
        long interviewsToday,
        List<DashboardInsight> jobInterests,
        List<DashboardInsight> preferredLocations,
        List<CandidateListItemResponse> recentCandidates,
        List<InterviewResponse> upcomingInterviewItems
) {
}
