package com.example.talentpool.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Flyway dimatikan dan skema dikelola Hibernate (ddl-auto=update), yang tidak melonggarkan kolom NOT NULL
 * yang sudah ada. Runner ini idempoten dan menyesuaikan database lama saat aplikasi start.
 */
@Component
public class SchemaCompatibilityRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(SchemaCompatibilityRunner.class);

    private final JdbcTemplate jdbc;

    public SchemaCompatibilityRunner(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Kandidat baru dari portal berstatus kosong.
        execute("ALTER TABLE candidates ALTER COLUMN status DROP NOT NULL");
        // Pengaman bila Hibernate belum sempat menambah kolom pada tabel yang sudah berisi data.
        execute("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS reviewed boolean NOT NULL DEFAULT false");
        execute("ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS potential boolean NOT NULL DEFAULT false");
        execute("ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS added_by_hr boolean NOT NULL DEFAULT false");
    }

    private void execute(String sql) {
        try {
            jdbc.execute(sql);
        } catch (Exception ex) {
            log.warn("Penyesuaian skema dilewati ({}): {}", sql, ex.getMessage());
        }
    }
}
