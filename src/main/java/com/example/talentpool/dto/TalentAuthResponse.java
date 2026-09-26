package com.example.talentpool.dto;

import java.util.UUID;

public record TalentAuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UUID candidateId,
        String email,
        String fullName
) {
}
