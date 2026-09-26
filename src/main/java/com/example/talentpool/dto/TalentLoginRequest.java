package com.example.talentpool.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TalentLoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
) {
}
