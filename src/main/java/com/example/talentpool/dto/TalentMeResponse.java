package com.example.talentpool.dto;

import java.util.UUID;

public record TalentMeResponse(
        UUID candidateId,
        String email,
        String fullName
) {
}
