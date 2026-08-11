package com.example.talentpool.dto;

import com.example.talentpool.domain.CandidateStatus;
import com.example.talentpool.domain.EducationType;
import com.example.talentpool.domain.PortfolioType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CandidateResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        LocalDate birthDate,
        String identityNumber,
        String citizenIdAddress,
        String residentialAddress,
        boolean sameAsCitizenIdAddress,
        BigDecimal currentSalary,
        BigDecimal expectedSalary,
        String source,
        CandidateStatus status,
        boolean termsAccepted,
        boolean movedToJobListing,
        String jobPosition,
        String hiringStage,
        String cvOriginalName,
        String profilePictureOriginalName,
        List<String> relatedIndustries,
        List<String> relatedJobPositions,
        List<String> tools,
        List<String> jobInterests,
        List<String> preferredLocations,


        List<EducationItem> educations,
        List<WorkExperienceItem> workExperiences,
        List<PortfolioItem> portfolios,
        Instant createdAt,
        Instant updatedAt
) {
    public record EducationItem(
            UUID id, EducationType type, String level, String institution, String major,
            Integer startYear, Integer endYear, String description
    ) {}

    public record WorkExperienceItem(
            UUID id, String companyName, String position, LocalDate startDate,
            LocalDate endDate, boolean currentJob, String description
    ) {}

    public record PortfolioItem(
            UUID id, PortfolioType type, String title, String url, String originalName
    ) {}
}
