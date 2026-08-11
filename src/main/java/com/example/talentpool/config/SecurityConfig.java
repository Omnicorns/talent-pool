package com.example.talentpool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())

                .cors(Customizer.withDefaults())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // ==========================================
                        // CORS PREFLIGHT
                        // ==========================================
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        // ==========================================
                        // FRONTEND REACT / STATIC FILES
                        // Jangan kena HTTP Basic Auth
                        // ==========================================
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/assets/**",
                                "/favicon.ico",
                                "/backoffice",
                                "/backoffice/**",
                                "/error"
                        )
                        .permitAll()

                        // ==========================================
                        // ACTUATOR
                        // ==========================================
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/info"
                        )
                        .permitAll()

                        // ==========================================
                        // PUBLIC API
                        // ==========================================
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/public/talents"
                        )
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/public/talents/*/status"
                        )
                        .permitAll()

                        // ==========================================
                        // BACKOFFICE API
                        // Tetap wajib ADMIN / RECRUITER
                        // ==========================================
                        .requestMatchers("/api/backoffice/**")
                        .hasAnyRole("ADMIN", "RECRUITER")

                        // ==========================================
                        // SISANYA
                        // ==========================================
                        .anyRequest()
                        .permitAll()
                )

                .httpBasic(Customizer.withDefaults())

                .build();
    }


    @Bean
    UserDetailsService userDetailsService(
            SecurityProperties properties,
            PasswordEncoder encoder
    ) {

        var admin = User
                .withUsername(properties.adminUsername())
                .password(
                        encoder.encode(
                                properties.adminPassword()
                        )
                )
                .roles("ADMIN")
                .build();

        var recruiter = User
                .withUsername(properties.recruiterUsername())
                .password(
                        encoder.encode(
                                properties.recruiterPassword()
                        )
                )
                .roles("RECRUITER")
                .build();

        return new InMemoryUserDetailsManager(
                admin,
                recruiter
        );
    }


    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    CorsConfigurationSource corsConfigurationSource(
            CorsProperties properties
    ) {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                properties.allowedOrigins()
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );

        configuration.setExposedHeaders(
                List.of(
                        "Content-Disposition"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}