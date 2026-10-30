package com.example.talentpool.service;

import java.util.Locale;
import java.util.Set;

/**
 * Aturan password akun kandidat. Aturan yang sama dipakai di frontend (shared/password-policy.ts);
 * server tetap memeriksa ulang karena frontend bisa dilewati.
 */
public final class PasswordPolicy {
    public static final int MIN_LENGTH = 10;

    private static final Set<String> COMMON = Set.of(
            "password", "password1", "password12", "password123", "password1234", "passw0rd", "p@ssw0rd", "p@ssword", "pa55word",
            "qwerty", "qwerty123", "qwertyuiop", "qwerty12345", "asdfghjkl", "zxcvbnm", "1q2w3e4r", "1qaz2wsx", "abc123", "abcd1234",
            "123456", "1234567", "12345678", "123456789", "1234567890", "0123456789", "111111", "000000", "123123", "123321",
            "iloveyou", "admin", "admin123", "administrator", "welcome", "welcome1", "welcome123", "letmein", "monkey", "dragon",
            "sarinah", "sarinah123", "sarinah1234", "sarinah2024", "sarinah2025", "sarinah2026", "talentpool", "talentpool123",
            "indonesia", "indonesia123", "bismillah", "bismillah123", "rahasia", "rahasia123", "kucing123", "sayangku", "sayang123",
            "jakarta123", "bandung123", "surabaya123", "malang123", "bali123"
    );

    private PasswordPolicy() {
    }

    /** @return pesan kesalahan untuk pengguna, atau null bila password memenuhi syarat. */
    public static String violation(String password, String email, String fullName) {
        if (password == null || password.length() < MIN_LENGTH) {
            return "Password minimal " + MIN_LENGTH + " karakter.";
        }
        boolean upper = false, lower = false, digit = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) upper = true;
            else if (Character.isLowerCase(c)) lower = true;
            else if (Character.isDigit(c)) digit = true;
        }
        if (!upper || !lower || !digit) {
            return "Password harus mengandung huruf besar, huruf kecil, dan angka.";
        }
        String compact = password.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        if (COMMON.contains(compact) || password.chars().distinct().count() < 5) {
            return "Password terlalu umum atau mudah ditebak. Gunakan kombinasi yang unik.";
        }
        if (compact.contains("123456") || compact.contains("qwerty") || compact.contains("abcdef")) {
            return "Password tidak boleh memuat urutan seperti 123456, qwerty, atau abcdef.";
        }
        if (email != null) {
            String local = email.toLowerCase(Locale.ROOT);
            int at = local.indexOf('@');
            if (at > 0) local = local.substring(0, at);
            local = local.replaceAll("[^a-z0-9]", "");
            if (local.length() >= 4 && compact.contains(local)) {
                return "Password tidak boleh memuat bagian dari email Anda.";
            }
        }
        if (fullName != null) {
            for (String part : fullName.toLowerCase(Locale.ROOT).split("\\s+")) {
                String token = part.replaceAll("[^a-z0-9]", "");
                if (token.length() >= 5 && compact.contains(token)) {
                    return "Password tidak boleh memuat nama Anda.";
                }
            }
        }
        return null;
    }

    /** Melempar BadRequestException bila password tidak memenuhi syarat. */
    public static void require(String password, String email, String fullName) {
        String problem = violation(password, email, fullName);
        if (problem != null) throw new com.example.talentpool.exception.BadRequestException(problem);
    }
}
