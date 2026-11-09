package com.example.talentpool.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
public class JwtConfig {

    @Bean
    SecretKey talentJwtSecret(@Value("${app.jwt.secret}") String secret) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("app.jwt.secret minimal 32 karakter");
        }
        if (secret.chars().distinct().count() < 12) {
            throw new IllegalStateException("app.jwt.secret terlalu mudah ditebak; gunakan nilai acak, mis. `openssl rand -base64 48`");
        }
        return new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey talentJwtSecret) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(talentJwtSecret));
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey talentJwtSecret, TalentTokenValidator talentTokenValidator) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(talentJwtSecret)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefault(),
                talentTokenValidator
        ));
        return decoder;
    }
}
