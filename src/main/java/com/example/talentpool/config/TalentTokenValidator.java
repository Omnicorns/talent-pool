package com.example.talentpool.config;

import com.example.talentpool.repository.TalentAccountRepository;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Memastikan token kandidat masih berlaku terhadap kondisi akun saat ini: akun harus ada dan aktif,
 * dan versi token harus sama dengan versi di database. Versi dinaikkan saat password diganti/direset,
 * sehingga token lama (mis. milik pihak yang mencuri sesi) langsung tidak berlaku.
 * Token yang diterbitkan sebelum fitur ini tidak punya klaim "ver" dan dianggap versi 0.
 */
@Component
public class TalentTokenValidator implements OAuth2TokenValidator<Jwt> {

    private static final OAuth2Error REVOKED =
            new OAuth2Error("invalid_token", "Sesi sudah tidak berlaku. Silakan login kembali.", null);

    private final TalentAccountRepository accounts;

    public TalentTokenValidator(TalentAccountRepository accounts) {
        this.accounts = accounts;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        if (!"TALENT".equals(jwt.getClaimAsString("role"))) {
            return OAuth2TokenValidatorResult.success();
        }
        try {
            UUID candidateId = UUID.fromString(jwt.getClaimAsString("candidateId"));
            Number claimed = jwt.getClaim("ver");
            int version = claimed == null ? 0 : claimed.intValue();
            boolean current = accounts.findByCandidateId(candidateId)
                    .map(account -> account.isEnabled() && account.getTokenVersion() == version)
                    .orElse(false);
            return current ? OAuth2TokenValidatorResult.success() : OAuth2TokenValidatorResult.failure(REVOKED);
        } catch (RuntimeException ex) {
            return OAuth2TokenValidatorResult.failure(REVOKED);
        }
    }
}
