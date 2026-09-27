package com.example.talentpool.controller;

import com.example.talentpool.dto.TalentAuthResponse;
import com.example.talentpool.dto.TalentChangePasswordRequest;
import com.example.talentpool.dto.TalentLoginRequest;
import com.example.talentpool.dto.TalentMeResponse;
import com.example.talentpool.dto.TalentRegisterRequest;
import com.example.talentpool.dto.TalentResetPasswordRequest;
import com.example.talentpool.dto.TalentForgotPasswordResponse;
import com.example.talentpool.dto.TalentForgotPasswordRequest;
import com.example.talentpool.service.TalentAuthService;
import com.example.talentpool.service.TalentPasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/talent/auth")
public class TalentAuthController {

    private final TalentAuthService service;
    private final TalentPasswordResetService passwordResetService;

    public TalentAuthController(TalentAuthService service, TalentPasswordResetService passwordResetService) {
        this.service = service;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public TalentAuthResponse register(@Valid @RequestBody TalentRegisterRequest request) {
        return service.register(request);
    }

    @PostMapping("/login")
    public TalentAuthResponse login(@Valid @RequestBody TalentLoginRequest request) {
        return service.login(request);
    }

    @PostMapping("/forgot-password")
    public TalentForgotPasswordResponse forgotPassword(@Valid @RequestBody TalentForgotPasswordRequest request) {
        return passwordResetService.forgotPassword(request.email());
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody TalentResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return Map.of("message", "Password berhasil direset");
    }

    @GetMapping("/me")
    public TalentMeResponse me(@AuthenticationPrincipal Jwt jwt) {
        return service.me(candidateId(jwt));
    }

    @PatchMapping("/onboarding-complete")
    public TalentMeResponse completeOnboarding(@AuthenticationPrincipal Jwt jwt) {
        return service.completeOnboarding(candidateId(jwt));
    }

    @PatchMapping("/change-password")
    public Map<String, String> changePassword(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody TalentChangePasswordRequest request
    ) {
        service.changePassword(candidateId(jwt), request);
        return Map.of("message", "Password berhasil diubah");
    }

    private UUID candidateId(Jwt jwt) {
        return UUID.fromString(jwt.getClaimAsString("candidateId"));
    }
}
