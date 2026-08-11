package com.example.talentpool.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CandidateUpsertRequest(
        @NotBlank @Size(max = 200) String fullName,
        @NotBlank @Email @Size(max = 200) String email,
        @NotBlank @Size(max = 50) String phone,
        LocalDate birthDate,
        @Size(max = 100) String identityNumber,
        String citizenIdAddress,
        String residentialAddress,

        // existing
        String languanges,
        String religion,

        boolean sameAsCitizenIdAddress,
        @PositiveOrZero BigDecimal currentSalary,
        @PositiveOrZero BigDecimal expectedSalary,
        @Size(max = 100) String source,
        @AssertTrue(message = "Syarat dan ketentuan harus disetujui")
        boolean termsAccepted,

        @Size(max = 3)
        List<@NotBlank String> relatedIndustries,

        @Size(max = 3)
        List<@NotBlank String> relatedJobPositions,

        @Size(max = 3)
        List<@NotBlank String> tools,

        // BARU
        @Size(max = 3)
        List<@NotBlank String> jobInterests,

        // BARU
        @Size(max = 3)
        List<@NotBlank String> preferredLocations,

        List<@Valid EducationRequest> educations,
        List<@Valid WorkExperienceRequest> workExperiences,
        List<@Valid PortfolioLinkRequest> portfolioLinks
) {
}
