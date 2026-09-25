package com.example.talentpool.controller;

import com.example.talentpool.dto.TalentAuthResponse;
import com.example.talentpool.dto.TalentChangePasswordRequest;
import com.example.talentpool.dto.TalentLoginRequest;
import com.example.talentpool.dto.TalentMeResponse;
import com.example.talentpool.dto.TalentRegisterRequest;
import com.example.talentpool.service.TalentAuthService;
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

    public TalentAuthController(TalentAuthService service) {
        this.service = service;
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

    @GetMapping("/me")
    public TalentMeResponse me(@AuthenticationPrincipal Jwt jwt) {
        return service.me(candidateId(jwt));
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
