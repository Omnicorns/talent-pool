package com.example.talentpool.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record TalentProfileDetails(
    @Size(max=30) String gender,
    @Pattern(regexp="[0-9]{5}") String postalCode,
    @Size(max=500) String region,
    @Size(max=500) @Pattern(regexp="^$|https?://.+") String linkedinUrl,
    @Size(max=50) String socialPlatform,
    @Size(max=100) String socialUsername,
    @PositiveOrZero BigDecimal expectedSalaryMax,
    boolean noExperience,
    @Size(max=20) List<@Valid LanguageSkill> languageSkills
) {
    public record LanguageSkill(@NotBlank @Size(max=80) @Pattern(regexp="[a-zA-Z0-9-]{1,80}") String key,
        @NotBlank @Size(max=100) String name, @NotBlank @Size(max=50) String proficiency) {}
}
