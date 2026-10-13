package com.example.talentpool.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDate;

public record TalentProfileDetails(
    @Size(max=30) String gender,
    @Pattern(regexp="[0-9]{5}") String postalCode,
    @Size(max=500) String region,
    @Size(max=500) @Pattern(regexp="^$|https?://.+") String linkedinUrl,
    @Size(max=50) String socialPlatform,
    @Size(max=100) String socialUsername,
    @PositiveOrZero BigDecimal expectedSalaryMax,
    boolean noExperience,
    @Size(max=20) List<@Valid LanguageSkill> languageSkills,
    @Size(max=50) List<@Valid TrainingCertification> trainingCertifications,
    @Pattern(regexp="^$|[0-9]{5}") String residentialPostalCode,
    @Size(max=500) String residentialRegion,
    /** Media sosial tambahan (opsional, maksimal 2). Media sosial wajib tetap di socialPlatform/socialUsername. */
    @Size(max=2) List<@Valid SocialAccount> socialAccounts
) {
    public TalentProfileDetails {
        socialAccounts = socialAccounts == null ? List.of() : socialAccounts;
    }

    public TalentProfileDetails(String gender, String postalCode, String region, String linkedinUrl,
            String socialPlatform, String socialUsername, BigDecimal expectedSalaryMax, boolean noExperience,
            List<LanguageSkill> languageSkills) {
        this(gender, postalCode, region, linkedinUrl, socialPlatform, socialUsername, expectedSalaryMax,
                noExperience, languageSkills, List.of(), null, null, List.of());
    }

    public TalentProfileDetails(String gender, String postalCode, String region, String linkedinUrl,
            String socialPlatform, String socialUsername, BigDecimal expectedSalaryMax, boolean noExperience,
            List<LanguageSkill> languageSkills, List<TrainingCertification> trainingCertifications) {
        this(gender, postalCode, region, linkedinUrl, socialPlatform, socialUsername, expectedSalaryMax,
                noExperience, languageSkills, trainingCertifications, null, null, List.of());
    }

    public record SocialAccount(@NotBlank @Size(max=50) String platform, @NotBlank @Size(max=100) String username) {}

    public record LanguageSkill(@NotBlank @Size(max=80) @Pattern(regexp="[a-zA-Z0-9-]{1,80}") String key,
        @NotBlank @Size(max=100) String name, @NotBlank @Size(max=50) String proficiency) {}

    public record TrainingCertification(
        @NotBlank @Size(max=200) String name,
        @NotBlank @Size(max=200) String issuingOrganization,
        @NotNull LocalDate issueDate,
        @NotNull LocalDate expiryDate,
        @NotBlank @Size(max=100) String credentialId,
        @Size(max=1000) @Pattern(regexp="^$|https?://.+") String credentialUrl
    ) {}
}
