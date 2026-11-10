package com.example.talentpool.service;

import com.example.talentpool.domain.JobListing;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

/** Email pemberitahuan lowongan baru untuk anggota talent pool. */
@Service
public class JobAlertMailService {

    private static final Logger log = LoggerFactory.getLogger(JobAlertMailService.class);
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("d MMMM yyyy", new Locale("id", "ID"));

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String from;

    public JobAlertMailService(
            JavaMailSender mailSender,
            @Value("${app.mail.enabled:false}") boolean enabled,
            @Value("${app.mail.from:no-reply@sarinah.com}") String from
    ) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.from = from;
    }

    public boolean isEnabled() {
        return enabled;
    }

    /** @return true bila email diterima SMTP; false bila gagal (sudah di-log, tidak melempar). */
    public boolean send(String email, String fullName, JobListing job, String jobUrl, String unsubscribeUrl) {
        if (!enabled) return false;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(from);
            helper.setTo(email);
            helper.setSubject("Lowongan baru di Sarinah: " + oneLine(job.getTitle()));
            helper.setText(body(fullName, job, jobUrl, unsubscribeUrl), false);
            // Mendukung tombol "Berhenti berlangganan" bawaan klien email (RFC 8058).
            message.addHeader("List-Unsubscribe", "<" + unsubscribeUrl + ">");
            message.addHeader("List-Unsubscribe-Post", "List-Unsubscribe=One-Click");
            message.addHeader("Auto-Submitted", "auto-generated");
            mailSender.send(message);
            return true;
        } catch (MailException | MessagingException ex) {
            log.warn("Gagal mengirim email lowongan baru ke satu penerima: {}", ex.getMessage());
            return false;
        }
    }

    private String body(String fullName, JobListing job, String jobUrl, String unsubscribeUrl) {
        StringBuilder sb = new StringBuilder();
        sb.append("Halo ").append(fullName == null || fullName.isBlank() ? "" : oneLine(fullName)).append(",\n\n");
        sb.append("Ada lowongan baru di Sarinah yang bisa Anda lihat:\n\n");
        sb.append(oneLine(job.getTitle())).append('\n');
        if (job.getDepartment() != null) sb.append("Departemen : ").append(oneLine(job.getDepartment())).append('\n');
        if (job.getLocation() != null) sb.append("Lokasi     : ").append(oneLine(job.getLocation())).append('\n');
        if (job.getEmploymentType() != null) {
            sb.append("Tipe       : ").append(job.getEmploymentType().name().replace('_', ' ').toLowerCase(Locale.ROOT)).append('\n');
        }
        if (job.getApplicationDeadline() != null) {
            sb.append("Batas lamaran: ").append(DATE.format(job.getApplicationDeadline())).append('\n');
        }
        sb.append("\nLihat detail dan lamar di:\n").append(jobUrl).append("\n\n");
        sb.append("Sarinah Talent Management\n\n");
        sb.append("--\n");
        sb.append("Anda menerima email ini karena terdaftar di Sarinah Talent Pool.\n");
        sb.append("Tidak ingin menerima pemberitahuan lowongan lagi? Berhenti berlangganan:\n");
        sb.append(unsubscribeUrl).append('\n');
        return sb.toString();
    }

    /** Mencegah injeksi header/baris baru dari data yang diinput admin. */
    private static String oneLine(String value) {
        return value == null ? "" : value.replaceAll("[\\r\\n]+", " ").trim();
    }
}
