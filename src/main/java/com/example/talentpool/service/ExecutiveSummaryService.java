package com.example.talentpool.service;

import com.example.talentpool.domain.HiringStage;
import com.example.talentpool.domain.RecruitmentSetting;
import com.example.talentpool.dto.ExecutiveSummaryResponse;
import com.example.talentpool.dto.ExecutiveSummaryResponse.MonthlyCount;
import com.example.talentpool.dto.ExecutiveSummaryResponse.PotentialCandidate;
import com.example.talentpool.repository.CandidateRepository;
import com.example.talentpool.repository.JobApplicationRepository;
import com.example.talentpool.repository.RecruitmentSettingRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.DateTimeException;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExecutiveSummaryService {
    private static final int GROWTH_MONTHS = 6;
    private static final int POTENTIAL_LIMIT = 5;

    private final CandidateRepository candidates;
    private final JobApplicationRepository applications;
    private final RecruitmentSettingRepository settings;
    private final InterviewService interviews;

    public ExecutiveSummaryService(
            CandidateRepository candidates,
            JobApplicationRepository applications,
            RecruitmentSettingRepository settings,
            InterviewService interviews
    ) {
        this.candidates = candidates;
        this.applications = applications;
        this.settings = settings;
        this.interviews = interviews;
    }

    @Transactional
    public ExecutiveSummaryResponse summary() {
        List<PotentialCandidate> potential = candidates
                .findPotentialVisible(PageRequest.of(0, POTENTIAL_LIMIT))
                .stream()
                .map(c -> new PotentialCandidate(c.getFullName(), c.getJobPosition(), c.isMovedToJobListing()))
                .toList();

        long total = candidates.countVisible();
        long reviewed = Math.min(candidates.countReviewed(), total);

        return new ExecutiveSummaryResponse(
                total,
                applications.countDistinctCandidates(),
                applications.countDistinctCandidatesByStage(HiringStage.INTERVIEW),
                applications.countDistinctCandidatesByStage(HiringStage.HIRED),
                reviewed,
                total - reviewed,
                monthlyGrowth(),
                interviews.upcoming(),
                potential
        );
    }

    /** Jumlah kandidat baru per bulan untuk 6 bulan terakhir (bulan berjalan di akhir). */
    private List<MonthlyCount> monthlyGrowth() {
        ZoneId zone = configuredZone();
        YearMonth current = YearMonth.now(zone);
        YearMonth first = current.minusMonths(GROWTH_MONTHS - 1L);

        Map<YearMonth, Long> counts = new LinkedHashMap<>();
        for (YearMonth m = first; !m.isAfter(current); m = m.plusMonths(1)) {
            counts.put(m, 0L);
        }
        Instant since = first.atDay(1).atStartOfDay(zone).toInstant();
        for (Instant createdAt : candidates.findCreatedAtSince(since)) {
            if (createdAt == null) continue;
            YearMonth m = YearMonth.from(createdAt.atZone(zone));
            counts.computeIfPresent(m, (k, v) -> v + 1);
        }
        List<MonthlyCount> result = new ArrayList<>();
        counts.forEach((m, n) -> result.add(new MonthlyCount(m.toString(), n)));
        return result;
    }

    private ZoneId configuredZone() {
        String timezone = settings.findById(RecruitmentSetting.SINGLETON_ID)
                .map(RecruitmentSetting::getTimezone)
                .orElse("Asia/Jakarta");
        try {
            return ZoneId.of(timezone);
        } catch (DateTimeException ignored) {
            return ZoneId.of("Asia/Jakarta");
        }
    }
}
