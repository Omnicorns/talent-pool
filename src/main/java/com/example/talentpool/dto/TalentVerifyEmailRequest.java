package com.example.talentpool.dto;

import jakarta.validation.constraints.NotBlank;

public record TalentVerifyEmailRequest(@NotBlank String token) {
}
