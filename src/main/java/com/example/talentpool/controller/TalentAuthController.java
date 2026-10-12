package com.example.talentpool.controller;

import com.example.talentpool.dto.TalentAuthResponse;
import com.example.talentpool.dto.TalentRegisterResponse;
import com.example.talentpool.dto.TalentResendVerificationRequest;
import com.example.talentpool.dto.TalentVerifyEmailRequest;
import com.example.talentpool.exception.MailDeliveryException;
import com.example.talentpool.service.TalentEmailVerificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(TalentAuthController.class);

    private final TalentAuthService service;
    private final TalentPasswordResetService passwordResetService;
    private final TalentEmailVerificationService emailVerificationService;

    public TalentAuthController(
            TalentAuthService service,
            TalentPasswordResetService passwordResetService,
            TalentEmailVerificationService emailVerificationService
    ) {
        this.service = service;
        this.passwordResetService = passwordResetService;
        this.emailVerificationService = emailVerificationService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public TalentRegisterResponse register(@Valid @RequestBody TalentRegisterRequest request) {
        var registered = service.register(request);
        if (registered.auth() != null) {
            return new TalentRegisterResponse("Akun berhasil dibuat.", registered.email(), false, false, registered.auth());
        }
        // Akun sudah tersimpan. Email dikirim di luar transaksi pendaftaran supaya gagal kirim tidak membatalkan akun.
        boolean sent = true;
        try {
            emailVerificationService.sendVerification(registered.accountId());
        } catch (MailDeliveryException ex) {
            log.warn("Akun {} dibuat tetapi email verifikasi gagal dikirim", registered.accountId(), ex);
            sent = false;
        }
        String message = sent
                ? "Akun dibuat. Kami mengirim link verifikasi ke " + registered.email() + ". Periksa Inbox atau folder Spam."
                : "Akun dibuat, tetapi email verifikasi belum terkirim. Gunakan tombol kirim ulang.";
        return new TalentRegisterResponse(message, registered.email(), true, sent, null);
    }

    @PostMapping("/verify-email")
    public Map<String, String> verifyEmail(@Valid @RequestBody TalentVerifyEmailRequest request) {
        emailVerificationService.verify(request);
        return Map.of("message", "Email berhasil diverifikasi. Silakan masuk.");
    }

    @PostMapping("/resend-verification")
    public Map<String, String> resendVerification(@Valid @RequestBody TalentResendVerificationRequest request) {
        emailVerificationService.resend(request.email());
        return Map.of("message", "Jika email terdaftar dan belum diverifikasi, link verifikasi baru telah dikirim.");
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
