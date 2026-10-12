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
        message.setSubject("Reset Password Sarinah Talent Pool");
        message.setText(
                "Halo " + fullName + ",\n\n" +
                "Kami menerima permintaan reset password untuk akun Sarinah Talent Pool Anda.\n\n" +
                "Gunakan link berikut untuk membuat password baru:\n" +
                resetUrl + "\n\n" +
                "Link ini berlaku selama " + expirationMinutes + " menit dan hanya dapat digunakan satu kali.\n\n" +
                "Jika Anda tidak meminta reset password, abaikan email ini.\n\n" +
                "Sarinah Talent Management"
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
}
