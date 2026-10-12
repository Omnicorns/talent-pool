package com.example.talentpool.service;

import com.example.talentpool.domain.TalentAccount;
import com.example.talentpool.domain.TalentEmailVerificationToken;
import com.example.talentpool.dto.TalentVerifyEmailRequest;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.repository.TalentAccountRepository;
import com.example.talentpool.repository.TalentEmailVerificationTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

/** Pembuatan, pengiriman, dan konfirmasi token verifikasi email akun Talent Portal. */
@Service
public class TalentEmailVerificationService {

    private static final String INVALID_LINK = "Link verifikasi tidak valid atau sudah kedaluwarsa";

    private final TalentAccountRepository accountRepository;
    private final TalentEmailVerificationTokenRepository tokenRepository;
    private final TalentPasswordResetMailService mailService;
    private final SecureRandom secureRandom = new SecureRandom();
    private final boolean required;
    private final long expirationHours;
    private final long resendCooldownSeconds;
    private final String publicUrl;

    public TalentEmailVerificationService(
            TalentAccountRepository accountRepository,
            TalentEmailVerificationTokenRepository tokenRepository,
            TalentPasswordResetMailService mailService,
            @Value("${app.email-verification.required:true}") boolean required,
            @Value("${app.email-verification.expiration-hours:24}") long expirationHours,
            @Value("${app.email-verification.resend-cooldown-seconds:60}") long resendCooldownSeconds,
            @Value("${app.web.public-url:http://localhost:8004/sarinah-talent-pool}") String publicUrl
    ) {
        this.accountRepository = accountRepository;
        this.tokenRepository = tokenRepository;
        this.mailService = mailService;
        this.required = required;
        this.expirationHours = expirationHours;
        this.resendCooldownSeconds = resendCooldownSeconds;
        this.publicUrl = publicUrl;
    }

    public boolean isRequired() {
        return required;
    }

    /** Membuat token baru, membatalkan token lama, lalu mengirim email. Gagal kirim akan membatalkan token. */
    @Transactional
    public void sendVerification(UUID accountId) {
        TalentAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new BadRequestException("Akun kandidat tidak ditemukan"));
        if (account.isEmailVerified()) return;

        Instant now = Instant.now();
        tokenRepository.findAllByAccountIdAndUsedAtIsNull(account.getId())
                .forEach(token -> token.setUsedAt(now));

        String rawToken = generateToken();
        TalentEmailVerificationToken token = new TalentEmailVerificationToken();
        token.setAccount(account);
        token.setTokenHash(hash(rawToken));
        token.setExpiresAt(now.plus(expirationHours, ChronoUnit.HOURS));
        tokenRepository.save(token);

        String verifyUrl = UriComponentsBuilder
                .fromUriString(trimTrailingSlash(publicUrl) + "/verify-email")
                .queryParam("token", rawToken)
                .build()
                .encode()
                .toUriString();

        mailService.sendVerificationLink(
                account.getEmail(), account.getCandidate().getFullName(), verifyUrl, expirationHours
        );
    }

    /**
     * Kirim ulang atas permintaan pengguna. Tidak membocorkan apakah email terdaftar; hanya akun yang belum
     * terverifikasi dan sudah melewati masa tunggu yang benar-benar dikirimi email.
     */
    @Transactional
    public void resend(String emailInput) {
        String email = emailInput == null ? "" : emailInput.trim().toLowerCase(Locale.ROOT);
        var found = accountRepository.findByEmailIgnoreCase(email);
        if (found.isEmpty() || !found.get().isEnabled() || found.get().isEmailVerified()) return;

        TalentAccount account = found.get();
        var latest = tokenRepository.findFirstByAccountIdOrderByCreatedAtDesc(account.getId());
        if (latest.isPresent() && latest.get().getCreatedAt() != null
                && Duration.between(latest.get().getCreatedAt(), Instant.now()).getSeconds() < resendCooldownSeconds) {
            throw new BadRequestException(
                    "Email verifikasi baru saja dikirim. Tunggu " + resendCooldownSeconds + " detik sebelum mengirim ulang.");
        }
        sendVerification(account.getId());
    }

    @Transactional
    public void verify(TalentVerifyEmailRequest request) {
        TalentEmailVerificationToken token = tokenRepository.findByTokenHash(hash(request.token().trim()))
                .orElseThrow(() -> new BadRequestException(INVALID_LINK));

        TalentAccount account = token.getAccount();
        Instant now = Instant.now();
        // Link yang sudah dipakai tetap dianggap berhasil bila akunnya memang sudah terverifikasi (klik ganda).
        if (account.isEmailVerified()) return;
        if (token.getUsedAt() != null || !token.getExpiresAt().isAfter(now)) {
            throw new BadRequestException(INVALID_LINK);
        }

        account.setEmailVerifiedAt(now);
        accountRepository.save(account);
        tokenRepository.findAllByAccountIdAndUsedAtIsNull(account.getId())
                .forEach(active -> active.setUsedAt(now));
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 tidak tersedia", e);
        }
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) return "http://localhost:8004/sarinah-talent-pool";
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
