package com.example.talentpool.exception;

/** Login ditolak karena email akun belum diverifikasi. */
public class EmailNotVerifiedException extends RuntimeException {
    public EmailNotVerifiedException(String message) {
        super(message);
    }
}
