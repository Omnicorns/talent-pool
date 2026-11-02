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
    @Size(max=2) List<@Valid SocialAccount> socialAccounts,
    /** Kandidat menyatakan tidak memiliki pelatihan, sertifikasi, atau keahlian bahasa. */
    boolean noTraining,
    boolean noCertification,
    boolean noLanguage,
    /** My Achievements: proyek dan penghargaan (opsional). Lampiran diunggah sebagai dokumen pendukung. */
    @Size(max=20) List<@Valid Project> projects,
    @Size(max=20) List<@Valid Award> awards,
    /** Pengalaman organisasi (opsional). */
    @Size(max=20) List<@Valid Organization> organizations
) {
    public TalentProfileDetails {
        socialAccounts = socialAccounts == null ? List.of() : socialAccounts;
        projects = projects == null ? List.of() : projects;
        awards = awards == null ? List.of() : awards;
        organizations = organizations == null ? List.of() : organizations;
    }

    /** Konstruktor tanpa pengalaman organisasi. */
    public TalentProfileDetails(String gender, String postalCode, String region, String linkedinUrl,
            String socialPlatform, String socialUsername, BigDecimal expectedSalaryMax, boolean noExperience,
            List<LanguageSkill> languageSkills, List<TrainingCertification> trainingCertifications,
            String residentialPostalCode, String residentialRegion, List<SocialAccount> socialAccounts,
            boolean noTraining, boolean noCertification, boolean noLanguage, List<Project> projects, List<Award> awards) {
        this(gender, postalCode, region, linkedinUrl, socialPlatform, socialUsername, expectedSalaryMax,
                noExperience, languageSkills, trainingCertifications, residentialPostalCode, residentialRegion,
                socialAccounts, noTraining, noCertification, noLanguage, projects, awards, List.of());
    }

    /** Konstruktor tanpa My Achievements. */
    public TalentProfileDetails(String gender, String postalCode, String region, String linkedinUrl,
            String socialPlatform, String socialUsername, BigDecimal expectedSalaryMax, boolean noExperience,
            List<LanguageSkill> languageSkills, List<TrainingCertification> trainingCertifications,
            String residentialPostalCode, String residentialRegion, List<SocialAccount> socialAccounts,
            boolean noTraining, boolean noCertification, boolean noLanguage) {
        this(gender, postalCode, region, linkedinUrl, socialPlatform, socialUsername, expectedSalaryMax,
                noExperience, languageSkills, trainingCertifications, residentialPostalCode, residentialRegion,
                socialAccounts, noTraining, noCertification, noLanguage, List.of(), List.of());
    }

    /** Konstruktor lama (tanpa penanda "tidak memiliki"); pelatihan dan sertifikasi dianggap tidak ada. */
    public TalentProfileDetails(String gender, String postalCode, String region, String linkedinUrl,
            String socialPlatform, String socialUsername, BigDecimal expectedSalaryMax, boolean noExperience,
            List<LanguageSkill> languageSkills, List<TrainingCertification> trainingCertifications,
            String residentialPostalCode, String residentialRegion, List<SocialAccount> socialAccounts) {
        this(gender, postalCode, region, linkedinUrl, socialPlatform, socialUsername, expectedSalaryMax,
                noExperience, languageSkills, trainingCertifications, residentialPostalCode, residentialRegion,
                socialAccounts, true, true, false);
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
        /** Kunci tetap sertifikasi; dipakai untuk mengaitkan file sertifikat yang diunggah. */
        @Size(max=80) @Pattern(regexp="^$|[a-zA-Z0-9-]{1,80}") String key,
        @NotBlank @Size(max=200) String name,
        @NotBlank @Size(max=200) String issuingOrganization,
        @NotNull LocalDate issueDate,
        @NotNull LocalDate expiryDate,
        @NotBlank @Size(max=100) String credentialId,
        @Size(max=1000) @Pattern(regexp="^$|https?://.+") String credentialUrl
    ) {}

    public static final List<String> ORG_ROLES = List.of("Ketua", "Sekretaris", "Bendahara", "Anggota");
    public static final List<String> ORG_LEVELS = List.of("Internasional", "Nasional", "Daerah", "Universitas/sekolah", "Komunitas");
    public static final List<String> ORG_TYPES = List.of("Seni/Olahraga", "Kemahasiswaan", "Sosial Kemasyarakatan", "Keagamaan", "Komunitas");
    public static final List<String> PROJECT_CATEGORIES = List.of("Academic Project", "Research Project", "Business Project",
        "Social Project", "Technology / Innovation Project", "Entrepreneurship Project");
    public static final List<String> AWARD_CATEGORIES = List.of("Academic Achievement", "Competition", "Scholarship",
        "Leadership", "Research & Innovation", "Organizational Achievement");
    public static final List<String> AWARD_LEVELS = List.of("University", "Regional", "National", "International");

    public record Project(
        /** Kunci tetap; dipakai untuk mengaitkan lampiran (project:KEY:attachment). */
        @Size(max=80) @Pattern(regexp="^$|[a-zA-Z0-9-]{1,80}") String key,
        @NotBlank @Size(max=200) String name,
        @Size(max=2000) String description,
        @NotBlank @Size(max=80) String category,
        @Size(max=200) String role,
        @Size(max=200) String organization,
        LocalDate startDate,
        LocalDate endDate
    ) {}

    public record Award(
        @Size(max=80) @Pattern(regexp="^$|[a-zA-Z0-9-]{1,80}") String key,
        @NotBlank @Size(max=200) String name,
        @Size(max=2000) String description,
        @NotBlank @Size(max=80) String category,
        @NotBlank @Size(max=40) String level,
        @Size(max=200) String institution,
        LocalDate achievementDate
    ) {}

    public record Organization(
        @Size(max=80) @Pattern(regexp="^$|[a-zA-Z0-9-]{1,80}") String key,
        @NotBlank @Size(max=40) String role,
        @NotBlank @Size(max=200) String name,
        @Size(max=60) String level,
        @Size(max=60) String type,
        boolean currentlyActive,
        LocalDate startDate,
        LocalDate endDate,
        @Size(max=2000) String description
    ) {}
}
