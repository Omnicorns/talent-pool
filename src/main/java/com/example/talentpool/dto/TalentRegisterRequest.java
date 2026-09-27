package com.example.talentpool.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TalentRegisterRequest(
        @NotBlank @Size(max = 200) String fullName,
        @NotBlank @Email @Size(max = 200) String email,
        @Size(max = 50) String phone,
        @NotBlank @Size(min = 8, max = 72) String password,
        @AssertTrue(message = "Syarat dan ketentuan harus disetujui") boolean termsAccepted
) {
}
