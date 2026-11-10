package com.example.talentpool.service;

import com.example.talentpool.domain.JobListing;
import com.example.talentpool.domain.JobListingStatus;
import com.example.talentpool.domain.TalentAccount;
import com.example.talentpool.event.JobListingPublishedEvent;
import com.example.talentpool.repository.JobListingRepository;
import com.example.talentpool.repository.TalentAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.UriComponentsBuilder;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.Base64;

/**
 * Mengirim email ke anggota talent pool saat lowongan baru dipublikasikan.
 * Berjalan async setelah transaksi publish commit, satu email per penerima (tanpa saling melihat alamat).
 */
@Service
public class JobAlertService {

    private static final Logger log = LoggerFactory.getLogger(JobAlertService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final JobListingRepository jobs;
    private final TalentAccountRepository accounts;
    private final JobAlertMailService mail;
    private final boolean enabled;
    private final int batchSize;
    private final long delayMillis;
    private final boolean verificationRequired;
    private final String publicUrl;

    public JobAlertService(
            JobListingRepository jobs,
            TalentAccountRepository accounts,
            JobAlertMailService mail,
            @Value("${app.job-alerts.enabled:true}") boolean enabled,
            @Value("${app.job-alerts.batch-size:100}") int batchSize,
            @Value("${app.job-alerts.delay-ms:200}") long delayMillis,
            @Value("${app.email-verification.required:true}") boolean verificationRequired,
            @Value("${app.web.public-url:http://localhost:8004/sarinah-talent-pool}") String publicUrl
    ) {
        this.jobs = jobs;
        this.accounts = accounts;
        this.mail = mail;
        this.enabled = enabled;
        this.batchSize = Math.max(1, batchSize);
        this.delayMillis = Math.max(0, delayMillis);
        this.verificationRequired = verificationRequired;
        this.publicUrl = trimTrailingSlash(publicUrl);
    }

    @Async("jobAlertExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPublished(JobListingPublishedEvent event) {
        try {
            notifyMembers(event.jobListingId());
        } catch (RuntimeException ex) {
            log.error("Pengiriman email lowongan baru gagal untuk lowongan {}", event.jobListingId(), ex);
        }
    }

    void notifyMembers(java.util.UUID jobListingId) {
        if (!enabled || !mail.isEnabled()) {
            log.info("Email lowongan baru dilewati (app.job-alerts.enabled={}, app.mail.enabled={})", enabled, mail.isEnabled());
            return;
        }
        JobListing job = jobs.findById(jobListingId).orElse(null);
        if (job == null || job.getStatus() != JobListingStatus.PUBLISHED
                || (job.getApplicationDeadline() != null && job.getApplicationDeadline().isBefore(LocalDate.now()))) {
            log.info("Lowongan {} tidak lagi terbuka, email lowongan baru dibatalkan", jobListingId);
            return;
        }

        String jobUrl = publicUrl + "/jobs/" + job.getId();
        int sent = 0, failed = 0, skipped = 0;
        Pageable page = PageRequest.of(0, batchSize);
        Slice<TalentAccount> slice;
        do {
            slice = accounts.findJobAlertRecipients(page);
            for (TalentAccount account : slice) {
                if (verificationRequired && !account.isEmailVerified()) {
                    skipped++;
                    continue;
                }
                String token = ensureToken(account);
                String unsubscribeUrl = UriComponentsBuilder
                        .fromUriString(publicUrl + "/api/public/job-alerts/unsubscribe")
                        .queryParam("token", token)
                        .build().encode().toUriString();
                boolean ok = mail.send(account.getEmail(), account.getCandidate().getFullName(), job, jobUrl, unsubscribeUrl);
                if (ok) sent++; else failed++;
                pause();
            }
            page = slice.nextPageable();
        } while (slice.hasNext());

        log.info("Email lowongan baru '{}' selesai: terkirim={}, gagal={}, dilewati={}", job.getId(), sent, failed, skipped);
    }

    private String ensureToken(TalentAccount account) {
        if (account.getJobAlertToken() == null) {
            byte[] bytes = new byte[32];
            RANDOM.nextBytes(bytes);
            account.setJobAlertToken(Base64.getUrlEncoder().withoutPadding().encodeToString(bytes));
            accounts.save(account);
        }
        return account.getJobAlertToken();
    }

    private void pause() {
        if (delayMillis <= 0) return;
        try {
            Thread.sleep(delayMillis);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    private static String trimTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
