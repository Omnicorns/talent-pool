package com.example.talentpool.service;

import com.example.talentpool.exception.MailDeliveryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class TalentPasswordResetMailService {

    private static final Logger log = LoggerFactory.getLogger(TalentPasswordResetMailService.class);

    private static final String SIGNATURE = "Salam hangat,\nHuman Capital\nPT Sarinah (Persero)\n";

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String from;

    public TalentPasswordResetMailService(
            JavaMailSender mailSender,
            @Value("${app.mail.enabled:false}") boolean enabled,
            @Value("${app.mail.from:no-reply@sarinah.com}") String from
    ) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.from = from;
    }

    public boolean sendResetLink(String email, String fullName, String resetUrl, long expirationMinutes) {
        if (!enabled) {
            throw new MailDeliveryException("Pengiriman email reset password sedang dinonaktifkan.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(email);
        message.setSubject("Permintaan Pengaturan Ulang Kata Sandi – Sarinah Talent Pool");
        message.setText(
                greeting(fullName) +
                "Kami menerima permintaan untuk mengatur ulang kata sandi akun Sarinah Talent Pool Anda.\n\n" +
                "Untuk membuat kata sandi baru, silakan klik tautan berikut:\n" +
                "[Atur Ulang Kata Sandi]\n" +
                resetUrl + "\n\n" +
                "Tautan ini berlaku dalam " + expirationMinutes + " menit dan hanya dapat digunakan satu kali.\n\n" +
                "Apabila Anda tidak merasa melakukan permintaan pengaturan ulang kata sandi, silakan abaikan email ini. " +
                "Kata sandi akun Anda tidak akan berubah selama Anda tidak melanjutkan proses pengaturan ulang.\n\n" +
                "Demi keamanan akun, jangan membagikan tautan pengaturan ulang kata sandi ini kepada siapa pun.\n\n" +
                "Terima kasih.\n\n" +
                SIGNATURE
        );
        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.error("Gagal mengirim email reset password melalui SMTP", ex);
            throw new MailDeliveryException(
                    "Email reset password gagal dikirim. Periksa konfigurasi SMTP lalu coba lagi.", ex
            );
        }
        return true;
    }

    public void sendVerificationLink(String email, String fullName, String verifyUrl, long expirationHours) {
        if (!enabled) {
            throw new MailDeliveryException("Pengiriman email verifikasi sedang dinonaktifkan.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(email);
        message.setSubject("Verifikasi Email Anda – Sarinah Talent Pool");
        message.setText(
                greeting(fullName) +
                "Terima kasih telah mendaftar dan tertarik menjadi bagian dari Sarinah Talent Pool.\n\n" +
                "Untuk menyelesaikan proses registrasi, silakan lakukan verifikasi alamat email Anda dengan mengeklik tautan berikut:\n" +
                "[Verifikasi Email Saya]\n" +
                verifyUrl + "\n\n" +
                "Tautan verifikasi ini berlaku hingga " + expirationHours + " jam. " +
                "Apabila tautan telah kedaluwarsa, silakan lakukan permintaan verifikasi ulang melalui halaman Sarinah Talent Pool.\n\n" +
                "Apabila Anda tidak merasa melakukan registrasi ini, silakan abaikan email ini.\n\n" +
                "Terima kasih atas partisipasi Anda.\n\n" +
                SIGNATURE
        );
        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.error("Gagal mengirim email verifikasi melalui SMTP", ex);
            throw new MailDeliveryException(
                    "Email verifikasi gagal dikirim. Periksa konfigurasi SMTP lalu coba lagi.", ex
            );
        }
    }

    /** Salam pembuka + perkenalan; nama dibersihkan dari baris baru. */
    private static String greeting(String fullName) {
        String name = fullName == null ? "" : fullName.replaceAll("[\\r\\n]+", " ").trim();
        return "Halo" + (name.isEmpty() ? "" : " " + name) + ",\n" +
                "Salam hangat dari Human Capital PT Sarinah (Persero).\n\n";
    }
}
