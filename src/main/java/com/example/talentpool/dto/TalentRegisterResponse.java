package com.example.talentpool.dto;

/**
 * Hasil pendaftaran. Bila verifikasi email aktif, {@code auth} kosong dan kandidat harus membuka link di emailnya.
 */
public record TalentRegisterResponse(
        String message,
        String email,
        boolean verificationRequired,
        boolean emailSent,
        TalentAuthResponse auth
) {
}
