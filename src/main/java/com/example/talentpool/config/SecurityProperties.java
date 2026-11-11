package com.example.talentpool.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public record SecurityProperties(
        String adminUsername,
        String adminPassword,
        String recruiterUsername,
        String recruiterPassword,
        /** Opsional: akun pimpinan yang hanya boleh melihat ringkasan. Kosong = akun tidak dibuat. */
        String viewerUsername,
        String viewerPassword
) {
}
