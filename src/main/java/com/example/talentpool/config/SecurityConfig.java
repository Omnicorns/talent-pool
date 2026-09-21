package com.example.talentpool.config;

import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http
                // ============================================
                // CSRF
                // ============================================
                .csrf(csrf -> csrf.disable())

                // ============================================
                // CORS
                // ============================================
                .cors(withDefaults())

                // ============================================
                // STATELESS
                // ============================================
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // ============================================
                // AUTHORIZATION
                // ============================================
                .authorizeHttpRequests(auth -> auth

                        // ============================================
                        // STATIC RESOURCE SPRING BOOT
                        // ============================================
                        .requestMatchers(
                                PathRequest.toStaticResources()
                                        .atCommonLocations()
                        )
                        .permitAll()


                        // ============================================
                        // REACT / VITE STATIC
                        // ============================================
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/assets/**",
                                "/favicon.ico",
                                "/*.js",
                                "/*.css",
                                "/*.png",
                                "/*.jpg",
                                "/*.jpeg",
                                "/*.svg",
                                "/*.ico"
                        )
                        .permitAll()


                        // ============================================
                        // REACT ROUTES
                        // ============================================
                        .requestMatchers(
                                "/backoffice",
                                "/backoffice/**"
                        )
                        .permitAll()


                        // ============================================
                        // ACTUATOR
                        // ============================================
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/info"
                        )
                        .permitAll()


                        // ============================================
                        // PUBLIC API - TALENT
                        // ============================================

                        // Submit kandidat / Talent Pool
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/public/talents"
                        )
                        .permitAll()

                        // Cek status kandidat
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/public/talents/*/status"
                        )
                        .permitAll()


                        // ============================================
                        // PUBLIC API - JOB LISTING
                        // ============================================

                        // List Job Listing
                        //
                        // GET:
                        // /api/public/job-listings
                        //
                        // Bisa dengan query:
                        // ?page=0&size=100&sort=updatedAt,desc
                        //
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/public/job-listings"
                        )
                        .permitAll()

                        // Detail Job Listing
                        //
                        // GET:
                        // /api/public/job-listings/{id}
                        //
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/public/job-listings/**"
                        )
                        .permitAll()


                        // ============================================
                        // BACKOFFICE API
                        // ============================================
                        .requestMatchers(
                                "/api/backoffice/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "RECRUITER"
                        )


                        // ============================================
                        // LAINNYA
                        // ============================================
                        .anyRequest()
                        .permitAll()
                )


                // ============================================
                // HTTP BASIC
                // ============================================
                .httpBasic(withDefaults())

                .build();
    }


    // ============================================================
    // USER BACKOFFICE
    // ============================================================
    @Bean
    UserDetailsService userDetailsService(
            SecurityProperties properties,
            PasswordEncoder encoder
    ) {

        var admin = User
                .withUsername(
                        properties.adminUsername()
                )
                .password(
                        encoder.encode(
                                properties.adminPassword()
                        )
                )
                .roles("ADMIN")
                .build();


        var recruiter = User
                .withUsername(
                        properties.recruiterUsername()
                )
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


    // ============================================================
    // PASSWORD ENCODER
    // ============================================================
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}