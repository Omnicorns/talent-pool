package com.example.talentpool.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TalentForgotPasswordRequest(
        @NotBlank
        @Email
        @Size(max = 200)
        String email
) {
}
