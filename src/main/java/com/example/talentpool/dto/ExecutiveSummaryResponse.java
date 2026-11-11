package com.example.talentpool.dto;

import java.util.List;

/** Ringkasan untuk pimpinan (akun VIEWER): angka utama, pertumbuhan, interview, dan kandidat potensial. */
public record ExecutiveSummaryResponse(
        long totalCandidates,
        long candidatesInRecruitment,
        long candidatesInInterview,
        long candidatesHired,
        List<MonthlyCount> monthlyGrowth,
        List<InterviewResponse> upcomingInterviews,
        List<PotentialCandidate> potentialCandidates
) {
    public record MonthlyCount(String month, long count) {
    }

    public record PotentialCandidate(String fullName, String position, boolean inProcess) {
    }
}
