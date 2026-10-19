package com.example.talentpool.service;

import com.example.talentpool.dto.TalentRegisterRequest;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

/**
 * Pendaftaran akun + pengiriman email verifikasi dalam satu transaksi.
 * Jika email gagal dikirim ({@code MailDeliveryException}, unchecked), seluruh transaksi dibatalkan
 * sehingga kandidat dan akun tidak tersimpan dan pengguna bisa mendaftar ulang dengan email yang sama.
 */
@Service
public class TalentRegistrationService {

    private final TalentAuthService authService;
    private final TalentEmailVerificationService emailVerificationService;

    public TalentRegistrationService(TalentAuthService authService, TalentEmailVerificationService emailVerificationService) {
        this.authService = authService;
        this.emailVerificationService = emailVerificationService;
    }

    @Transactional
    public TalentAuthService.RegisteredAccount register(TalentRegisterRequest request) {
        TalentAuthService.RegisteredAccount registered = authService.register(request);
        if (registered.auth() == null) {
            emailVerificationService.sendVerification(registered.accountId());
        }
        return registered;
    }
}
