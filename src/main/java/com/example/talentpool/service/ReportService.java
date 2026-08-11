package com.example.talentpool.service;

import com.example.talentpool.domain.CandidateStatus;
import com.example.talentpool.domain.HiringStage;
import com.example.talentpool.domain.JobListingStatus;
import com.example.talentpool.dto.RecruitmentReportResponse;
import com.example.talentpool.repository.CandidateRepository;
import com.example.talentpool.repository.JobApplicationRepository;
import com.example.talentpool.repository.JobListingRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReportService {
    private final CandidateRepository candidateRepository;
    private final JobListingRepository jobListingRepository;
    private final JobApplicationRepository applicationRepository;

    public ReportService(
            CandidateRepository candidateRepository,
            JobListingRepository jobListingRepository,
            JobApplicationRepository applicationRepository
    ) {
        this.candidateRepository = candidateRepository;
        this.jobListingRepository = jobListingRepository;
        this.applicationRepository = applicationRepository;
    }

    public RecruitmentReportResponse overview() {
        Map<CandidateStatus, Long> candidateStatus = new EnumMap<>(CandidateStatus.class);
        Arrays.stream(CandidateStatus.values()).forEach(status -> candidateStatus.put(status, 0L));
        candidateRepository.countGroupedByStatus().forEach(row ->
                candidateStatus.put((CandidateStatus) row[0], (Long) row[1]));

        List<RecruitmentReportResponse.LabelCount> sources = candidateRepository.countGroupedBySource().stream()
                .map(row -> new RecruitmentReportResponse.LabelCount(
                        row[0] == null || row[0].toString().isBlank() ? "Tidak diketahui" : row[0].toString(),
                        (Long) row[1]))
                .toList();

        Map<JobListingStatus, Long> jobs = new EnumMap<>(JobListingStatus.class);
        Arrays.stream(JobListingStatus.values()).forEach(status -> jobs.put(status, jobListingRepository.countByStatus(status)));

        Map<HiringStage, Long> stages = new EnumMap<>(HiringStage.class);
        Arrays.stream(HiringStage.values()).forEach(stage -> stages.put(stage, 0L));
        applicationRepository.countGroupedByStage().forEach(row -> stages.put((HiringStage) row[0], (Long) row[1]));

        long candidates = candidateRepository.count();
        long applications = applicationRepository.count();
        long hired = candidateRepository.countByStatus(CandidateStatus.HIRED);
        double conversion = applications == 0 ? 0.0 : Math.round((hired * 10000.0) / applications) / 100.0;

        return new RecruitmentReportResponse(candidateStatus, sources, jobs, stages, candidates, applications, hired, conversion);
    }
}
