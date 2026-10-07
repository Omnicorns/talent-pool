package com.example.talentpool.service;

import com.example.talentpool.domain.TalentAccount;
import com.example.talentpool.domain.TalentPasswordResetToken;
import com.example.talentpool.dto.TalentForgotPasswordResponse;
import com.example.talentpool.dto.TalentResetPasswordRequest;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.repository.TalentAccountRepository;
import com.example.talentpool.repository.TalentPasswordResetTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class TalentPasswordResetService {

    private static final String SENT_MESSAGE =
            "Server email menerima link reset password. Periksa Inbox atau folder Spam.";

    private final TalentAccountRepository accountRepository;
    private final TalentPasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final TalentPasswordResetMailService mailService;
    private final SecureRandom secureRandom = new SecureRandom();
    private final long expirationMinutes;
    private final String publicUrl;
    private final boolean exposeResetUrl;

    public TalentPasswordResetService(
            TalentAccountRepository accountRepository,
            TalentPasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            TalentPasswordResetMailService mailService,
            @Value("${app.password-reset.expiration-minutes:30}") long expirationMinutes,
            @Value("${app.web.public-url:http://localhost:8004/sarinah-talent-pool}") String publicUrl,
            @Value("${app.password-reset.expose-reset-url:false}") boolean exposeResetUrl
    ) {
        this.accountRepository = accountRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
        this.expirationMinutes = expirationMinutes;
        this.publicUrl = publicUrl;
        this.exposeResetUrl = exposeResetUrl;
    }

    @Transactional
    public TalentForgotPasswordResponse forgotPassword(String emailInput) {
        String email = normalizeEmail(emailInput);

        var accountOptional = accountRepository.findByEmailIgnoreCase(email);
        if (accountOptional.isEmpty() || !accountOptional.get().isEnabled()) {
            throw new BadRequestException("Email tidak terdaftar atau akun tidak aktif. Periksa kembali email yang dimasukkan.");
        }

        TalentAccount account = accountOptional.get();
        Instant now = Instant.now();

        tokenRepository.findAllByAccountIdAndUsedAtIsNull(account.getId())
                .forEach(token -> token.setUsedAt(now));

        String rawToken = generateToken();

        TalentPasswordResetToken token = new TalentPasswordResetToken();
        token.setAccount(account);
        token.setTokenHash(hash(rawToken));
        token.setExpiresAt(now.plus(expirationMinutes, ChronoUnit.MINUTES));
        tokenRepository.save(token);

        String resetUrl = UriComponentsBuilder
                .fromUriString(trimTrailingSlash(publicUrl) + "/reset-password")
                .queryParam("token", rawToken)
                .build()
                .encode()
                .toUriString();

        mailService.sendResetLink(
                account.getEmail(),
                account.getCandidate().getFullName(),
                resetUrl,
                expirationMinutes
        );

        return new TalentForgotPasswordResponse(
                SENT_MESSAGE,
                exposeResetUrl ? resetUrl : null
        );
    }

    @Transactional
    public void resetPassword(TalentResetPasswordRequest request) {
        TalentPasswordResetToken token = tokenRepository.findByTokenHash(hash(request.token()))
                .orElseThrow(() -> new BadRequestException("Link reset password tidak valid atau sudah kedaluwarsa"));

        Instant now = Instant.now();
        if (token.getUsedAt() != null || !token.getExpiresAt().isAfter(now)) {
            throw new BadRequestException("Link reset password tidak valid atau sudah kedaluwarsa");
        }

        TalentAccount account = token.getAccount();
        if (!account.isEnabled()) {
            throw new BadRequestException("Akun kandidat tidak aktif");
        }

        if (passwordEncoder.matches(request.newPassword(), account.getPasswordHash())) {
            throw new BadRequestException("Password baru harus berbeda dari password sebelumnya");
        }

        account.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        accountRepository.save(account);

        tokenRepository.findAllByAccountIdAndUsedAtIsNull(account.getId())
                .forEach(activeToken -> activeToken.setUsedAt(now));
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    digest.digest(token.getBytes(StandardCharsets.UTF_8))
            );
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 tidak tersedia", e);
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:8004/sarinah-talent-pool";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
