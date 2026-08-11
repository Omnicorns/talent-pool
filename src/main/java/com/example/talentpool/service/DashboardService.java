package com.example.talentpool.service;

import com.example.talentpool.domain.CandidateStatus;
import com.example.talentpool.domain.InterviewStatus;
import com.example.talentpool.domain.JobListingStatus;
import com.example.talentpool.domain.RecruitmentSetting;
import com.example.talentpool.dto.DashboardInsight;
import com.example.talentpool.dto.DashboardResponse;
import com.example.talentpool.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.EnumSet;
import java.util.List;

@Service
public class DashboardService {
    private final CandidateRepository candidateRepository;
    private final JobListingRepository jobListingRepository;
    private final JobApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final RecruitmentSettingRepository settingRepository;
    private final CandidateMapper candidateMapper;
    private final InterviewService interviewService;

    public DashboardService(
            CandidateRepository candidateRepository,
            JobListingRepository jobListingRepository,
            JobApplicationRepository applicationRepository,
            InterviewRepository interviewRepository,
            RecruitmentSettingRepository settingRepository,
            CandidateMapper candidateMapper,
            InterviewService interviewService
    ) {
        this.candidateRepository = candidateRepository;
        this.jobListingRepository = jobListingRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.settingRepository = settingRepository;
        this.candidateMapper = candidateMapper;
        this.interviewService = interviewService;
    }

    @Transactional
    public DashboardResponse summary() {
        Instant now = Instant.now();
        ZoneId zone = configuredZone();
        Instant startOfDay = LocalDate.now(zone).atStartOfDay(zone).toInstant();
        Instant endOfDay = LocalDate.now(zone).plusDays(1).atStartOfDay(zone).toInstant();

        return new DashboardResponse(
                candidateRepository.count(),
                candidateRepository.countByStatusNotIn(EnumSet.of(CandidateStatus.ARCHIVED, CandidateStatus.HIRED)),
                candidateRepository.countByStatus(CandidateStatus.AVAILABLE),
                candidateRepository.countByStatus(CandidateStatus.HIRED),
                jobListingRepository.count(),
                jobListingRepository.countByStatus(JobListingStatus.PUBLISHED),
                applicationRepository.count(),
                interviewRepository.countByStatusAndScheduledAtAfter(InterviewStatus.SCHEDULED, now),
                interviewRepository.countByStatusAndScheduledAtBetween(InterviewStatus.SCHEDULED, startOfDay, endOfDay),
                getJobInterests(),
                getPreferredLocations(),
                candidateRepository.findTop5ByOrderByCreatedAtDesc().stream().map(candidateMapper::toListItem).toList(),
                interviewService.upcoming()
        );
    }

    private ZoneId configuredZone() {
        String timezone = settingRepository.findById(RecruitmentSetting.SINGLETON_ID)
                .map(RecruitmentSetting::getTimezone)
                .orElse("Asia/Jakarta");
        try {
            return ZoneId.of(timezone);
        } catch (DateTimeException ignored) {
            return ZoneId.of("Asia/Jakarta");
        }
    }

    private List<DashboardInsight> getJobInterests() {

        return candidateRepository
                .findTopJobInterests(PageRequest.of(0, 5))
                .stream()
                .map(row -> new DashboardInsight(
                        String.valueOf(row[0]),
                        ((Number) row[1]).longValue()
                ))
                .toList();
    }

    private List<DashboardInsight> getPreferredLocations() {

        return candidateRepository
                .findTopPreferredLocations(PageRequest.of(0, 5))
                .stream()
                .map(row -> new DashboardInsight(
                        String.valueOf(row[0]),
                        ((Number) row[1]).longValue()
                ))
                .toList();
    }

}
