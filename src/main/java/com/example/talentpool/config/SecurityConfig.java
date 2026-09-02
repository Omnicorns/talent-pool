package com.example.talentpool.config;

import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
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

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())

                .cors(Customizer.withDefaults())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // ============================================
                        // STATIC RESOURCE SPRING BOOT
                        // ============================================
                        .requestMatchers(
                                PathRequest.toStaticResources().atCommonLocations()
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
                        // PUBLIC API
                        // ============================================
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

                        // ============================================
                        // BACKOFFICE API
                        // ============================================
                        .requestMatchers("/api/backoffice/**")
                        .hasAnyRole("ADMIN", "RECRUITER")

                        // ============================================
                        // LAINNYA
                        // ============================================
                        .anyRequest()
                        .permitAll()
                )

                .httpBasic(httpBasic -> httpBasic.disable())

                .build();
    }

    @Bean
    UserDetailsService userDetailsService(
            SecurityProperties properties,
            PasswordEncoder encoder
    ) {

        var admin = User.withUsername(properties.adminUsername())
                .password(encoder.encode(properties.adminPassword()))
                .roles("ADMIN")
                .build();

        var recruiter = User.withUsername(properties.recruiterUsername())
                .password(encoder.encode(properties.recruiterPassword()))
                .roles("RECRUITER")
                .build();

        return new InMemoryUserDetailsManager(admin, recruiter);
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}