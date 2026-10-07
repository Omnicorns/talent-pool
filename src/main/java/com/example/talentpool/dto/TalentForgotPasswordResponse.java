package com.example.talentpool.dto;

public record TalentForgotPasswordResponse(
        String message,
        String resetUrl
) {
}
