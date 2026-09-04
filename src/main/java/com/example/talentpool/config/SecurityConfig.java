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

                // =====================================================
                // CSRF
                // =====================================================
                .csrf(csrf -> csrf.disable())

                // =====================================================
                // CORS
                // =====================================================
                .cors(Customizer.withDefaults())

                // =====================================================
                // SESSION
                // =====================================================
                // Jangan STATELESS karena kita menggunakan login session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.IF_REQUIRED
                        )
                )

                // =====================================================
                // AUTHORIZATION
                // =====================================================
                .authorizeHttpRequests(auth -> auth

                        // -------------------------------------------------
                        // STATIC SPRING
                        // -------------------------------------------------
                        .requestMatchers(
                                PathRequest
                                        .toStaticResources()
                                        .atCommonLocations()
                        )
                        .permitAll()

                        // -------------------------------------------------
                        // REACT / VITE STATIC
                        // -------------------------------------------------
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
                                "/*.ico",
                                "/*.woff",
                                "/*.woff2",
                                "/*.ttf"
                        )
                        .permitAll()

                        // -------------------------------------------------
                        // LOGIN PAGE REACT
                        // -------------------------------------------------
                        .requestMatchers(
                                "/backoffice/login",
                                "/api/auth/login"
                        )
                        .permitAll()

                        // -------------------------------------------------
                        // REACT BACKOFFICE PAGE
                        //
                        // React route boleh dibuka.
                        // Security sebenarnya ada pada API.
                        // -------------------------------------------------
                        .requestMatchers(
                                "/backoffice",
                                "/backoffice/**"
                        )
                        .permitAll()

                        // -------------------------------------------------
                        // ACTUATOR
                        // -------------------------------------------------
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/info"
                        )
                        .permitAll()

                        // -------------------------------------------------
                        // PUBLIC API
                        // -------------------------------------------------
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

                        // -------------------------------------------------
                        // BACKOFFICE API
                        // -------------------------------------------------
                        .requestMatchers(
                                "/api/backoffice/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "RECRUITER"
                        )

                        // -------------------------------------------------
                        // ENDPOINT LAIN
                        // -------------------------------------------------
                        .anyRequest()
                        .permitAll()
                )

                // =====================================================
                // MATIKAN BASIC AUTH
                // =====================================================
                // Ini yang mencegah popup username/password browser
                .httpBasic(httpBasic ->
                        httpBasic.disable()
                )

                // =====================================================
                // FORM LOGIN
                // =====================================================
                .formLogin(form -> form

                        // React POST username/password ke endpoint ini
                        .loginProcessingUrl("/api/auth/login")

                        // jangan redirect ke halaman Spring default
                        .successHandler((request, response, authentication) -> {

                            response.setStatus(200);
                            response.setContentType("application/json");

                            String role = authentication
                                    .getAuthorities()
                                    .stream()
                                    .findFirst()
                                    .map(Object::toString)
                                    .orElse("");

                            response.getWriter().write(
                                    """
                                    {
                                        "success": true,
                                        "username": "%s",
                                        "role": "%s"
                                    }
                                    """.formatted(
                                            authentication.getName(),
                                            role
                                    )
                            );
                        })

                        .failureHandler((request, response, exception) -> {

                            response.setStatus(401);
                            response.setContentType("application/json");

                            response.getWriter().write(
                                    """
                                    {
                                        "success": false,
                                        "message": "Username atau password salah"
                                    }
                                    """
                            );
                        })

                        .permitAll()
                )

                // =====================================================
                // LOGOUT
                // =====================================================
                .logout(logout -> logout

                        .logoutUrl("/api/auth/logout")

                        .logoutSuccessHandler(
                                (request, response, authentication) -> {

                                    response.setStatus(200);
                                    response.setContentType(
                                            "application/json"
                                    );

                                    response.getWriter().write(
                                            """
                                            {
                                                "success": true,
                                                "message": "Logout berhasil"
                                            }
                                            """
                                    );
                                }
                        )

                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                )

                .build();
    }


    // =============================================================
    // USER BACKOFFICE
    // =============================================================
    @Bean
    UserDetailsService userDetailsService(
            SecurityProperties properties,
            PasswordEncoder encoder
    ) {

        // ADMIN
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


        // RECRUITER
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


    // =============================================================
    // PASSWORD ENCODER
    // =============================================================
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}