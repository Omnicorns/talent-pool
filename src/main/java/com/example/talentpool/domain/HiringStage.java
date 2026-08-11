package com.example.talentpool.domain;

import com.example.talentpool.exception.BadRequestException;

import java.util.Locale;

public enum HiringStage {
    NEW_CANDIDATE,
    SCREENING,
    INTERVIEW,
    OFFER,
    HIRED,
    REJECTED;

    public static HiringStage fromValue(String value) {
        if (value == null || value.isBlank()) return NEW_CANDIDATE;
        String normalized = value.trim()
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", "_")
                .replaceAll("^_|_$", "");
        if (normalized.equals("NEW_CANDIDATES") || normalized.equals("NEW")) {
            normalized = "NEW_CANDIDATE";
        }
        try {
            return valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Tahapan rekrutmen tidak valid: " + value);
        }
    }
}
