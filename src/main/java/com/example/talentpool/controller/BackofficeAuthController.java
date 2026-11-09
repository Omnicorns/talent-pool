package com.example.talentpool.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Login backoffice. Menukar username dan password dengan token berumur pendek, sehingga password
 * tidak perlu disimpan di browser dan dikirim pada setiap request (menggantikan HTTP Basic).
 */
@RestController
@RequestMapping("/api/backoffice/auth")
public class BackofficeAuthController {

    private static final Logger log = LoggerFactory.getLogger(BackofficeAuthController.class);

    public record LoginRequest(@NotBlank @Size(max = 100) String username,
                               @NotBlank @Size(max = 200) String password) {}

    public record LoginResponse(String accessToken, String tokenType, long expiresIn, String username, String role) {}

    private final UserDetailsService users;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final long expirationMinutes;

    public BackofficeAuthController(
            UserDetailsService users,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            @Value("${app.jwt.backoffice-expiration-minutes:480}") long expirationMinutes
    ) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.expirationMinutes = expirationMinutes;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        UserDetails user = null;
        try {
            user = users.loadUserByUsername(request.username());
        } catch (UsernameNotFoundException ignored) {
            // diperlakukan sama dengan password salah
        }
        if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            log.warn("Login backoffice GAGAL: username='{}' ip={}", safe(request.username()), http.getRemoteAddr());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Username atau password tidak valid");
        }

        String role = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Akun tidak memiliki peran"));

        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("sarinah-talent-pool")
                .issuedAt(now)
                .expiresAt(now.plus(expirationMinutes, ChronoUnit.MINUTES))
                .subject(user.getUsername())
                .claim("role", role)
                .build();
        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)
        ).getTokenValue();

        log.info("Login backoffice berhasil: username='{}' role={} ip={}", safe(user.getUsername()), role, http.getRemoteAddr());
        return new LoginResponse(token, "Bearer", expirationMinutes * 60, user.getUsername(), role);
    }

    /** Mencegah pemalsuan baris log lewat karakter kontrol pada username. */
    private static String safe(String value) {
        String clean = value == null ? "" : value.replaceAll("[\\r\\n\\t]", "_");
        return clean.length() > 60 ? clean.substring(0, 60) : clean;
    }
}
