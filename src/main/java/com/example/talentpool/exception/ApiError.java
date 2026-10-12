package com.example.talentpool.exception;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> validationErrors,
        String code
) {
    public ApiError(Instant timestamp, int status, String error, String message, String path,
                    Map<String, String> validationErrors) {
        this(timestamp, status, error, message, path, validationErrors, null);
    }
}
