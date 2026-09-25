package com.example.talentpool.service;

import com.example.talentpool.domain.Candidate;
import com.example.talentpool.domain.CandidateStatus;
import com.example.talentpool.domain.TalentAccount;
import com.example.talentpool.dto.TalentAuthResponse;
import com.example.talentpool.dto.TalentChangePasswordRequest;
import com.example.talentpool.dto.TalentLoginRequest;
import com.example.talentpool.dto.TalentMeResponse;
import com.example.talentpool.dto.TalentRegisterRequest;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.repository.CandidateRepository;
import com.example.talentpool.repository.TalentAccountRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.UUID;

@Service
public class TalentAuthService {

    private final TalentAccountRepository accountRepository;
    private final CandidateRepository candidateRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final long expirationMinutes;

    public TalentAuthService(
            TalentAccountRepository accountRepository,
            CandidateRepository candidateRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            @Value("${app.jwt.expiration-minutes:480}") long expirationMinutes
    ) {
        this.accountRepository = accountRepository;
        this.candidateRepository = candidateRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.expirationMinutes = expirationMinutes;
    }

    @Transactional
    public TalentAuthResponse register(TalentRegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (accountRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Email sudah memiliki akun Talent Portal");
        }
        if (candidateRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new BadRequestException(
                    "Email sudah terdaftar sebagai kandidat. Hubungi recruiter untuk aktivasi akun portal."
            );
        }

        Candidate candidate = new Candidate();
        candidate.setFullName(request.fullName().trim());
        candidate.setEmail(email);
        candidate.setPhone(trimToNull(request.phone()));
        candidate.setSource("Talent Portal");
        candidate.setStatus(CandidateStatus.POTENTIAL);
        candidate.setTermsAccepted(request.termsAccepted());
        candidate = candidateRepository.saveAndFlush(candidate);

        TalentAccount account = new TalentAccount();
        account.setCandidate(candidate);
        account.setEmail(email);
        account.setPasswordHash(passwordEncoder.encode(request.password()));
        account.setEnabled(true);
        accountRepository.save(account);

        return issueToken(account);
    }

    @Transactional
    public TalentAuthResponse login(TalentLoginRequest request) {
        TalentAccount account = accountRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(() -> new BadRequestException("Email atau password tidak valid"));

        if (!account.isEnabled() || !passwordEncoder.matches(request.password(), account.getPasswordHash())) {
            throw new BadRequestException("Email atau password tidak valid");
        }

        return issueToken(account);
    }

    @Transactional
    public TalentMeResponse me(UUID candidateId) {
        TalentAccount account = accountRepository.findByCandidateId(candidateId)
                .orElseThrow(() -> new BadRequestException("Akun kandidat tidak ditemukan"));

        return new TalentMeResponse(
                account.getCandidate().getId(),
                account.getEmail(),
                account.getCandidate().getFullName()
        );
    }

    @Transactional
    public void changePassword(UUID candidateId, TalentChangePasswordRequest request) {
        TalentAccount account = accountRepository.findByCandidateId(candidateId)
                .orElseThrow(() -> new BadRequestException("Akun kandidat tidak ditemukan"));

        if (!passwordEncoder.matches(request.currentPassword(), account.getPasswordHash())) {
            throw new BadRequestException("Password saat ini tidak valid");
        }
        if (passwordEncoder.matches(request.newPassword(), account.getPasswordHash())) {
            throw new BadRequestException("Password baru harus berbeda dari password saat ini");
        }

        account.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        accountRepository.save(account);
    }

    private TalentAuthResponse issueToken(TalentAccount account) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(expirationMinutes, ChronoUnit.MINUTES);
        UUID candidateId = account.getCandidate().getId();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("sarinah-talent-pool")
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(account.getEmail())
                .claim("candidateId", candidateId.toString())
                .claim("role", "TALENT")
                .build();

        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(
                        JwsHeader.with(MacAlgorithm.HS256).build(),
                        claims
                )
        ).getTokenValue();

        return new TalentAuthResponse(
                token,
                "Bearer",
                expirationMinutes * 60,
                candidateId,
                account.getEmail(),
                account.getCandidate().getFullName()
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
