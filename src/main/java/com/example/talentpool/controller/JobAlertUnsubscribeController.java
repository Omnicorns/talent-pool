package com.example.talentpool.controller;

import com.example.talentpool.domain.TalentAccount;
import com.example.talentpool.repository.TalentAccountRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;

/**
 * Berhenti berlangganan email lowongan tanpa login (token acak di tautan email).
 * GET hanya menampilkan konfirmasi agar pemindai tautan email tidak berhenti-berlangganan-kan orang;
 * perubahan terjadi lewat POST (tombol di halaman atau One-Click dari klien email).
 */
@RestController
@RequestMapping("/api/public/job-alerts/unsubscribe")
public class JobAlertUnsubscribeController {

    private static final String TOKEN_PATTERN = "^[A-Za-z0-9_-]{20,64}$";

    private final TalentAccountRepository accounts;

    public JobAlertUnsubscribeController(TalentAccountRepository accounts) {
        this.accounts = accounts;
    }

    @GetMapping(produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> confirm(@RequestParam("token") String token) {
        if (!valid(token) || accounts.findByJobAlertToken(token).isEmpty()) {
            return page("Tautan tidak valid", "<p>Tautan berhenti berlangganan tidak valid atau sudah tidak berlaku.</p>");
        }
        String form = "<p>Anda tidak akan lagi menerima email pemberitahuan lowongan baru dari Sarinah Talent Pool.</p>"
                + "<form method=\"post\" action=\"?token=" + HtmlUtils.htmlEscape(token) + "\">"
                + "<button type=\"submit\">Ya, berhenti berlangganan</button></form>";
        return page("Berhenti berlangganan", form);
    }

    @PostMapping(produces = MediaType.TEXT_HTML_VALUE)
    @Transactional
    public ResponseEntity<String> unsubscribe(@RequestParam("token") String token) {
        if (valid(token)) {
            accounts.findByJobAlertToken(token).ifPresent((TalentAccount account) -> {
                account.setJobAlertsEnabled(false);
                accounts.save(account);
            });
        }
        // Respons sama baik token ada maupun tidak.
        return page("Berhasil", "<p>Anda tidak akan lagi menerima email pemberitahuan lowongan baru.</p>");
    }

    private static boolean valid(String token) {
        return token != null && token.matches(TOKEN_PATTERN);
    }

    private static ResponseEntity<String> page(String title, String body) {
        String html = "<!doctype html><html lang=\"id\"><head><meta charset=\"utf-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
                + "<meta name=\"robots\" content=\"noindex\"><title>" + title + "</title>"
                + "<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:15vh auto;padding:0 20px;color:#1a1a1a}"
                + "button{background:#b91c1c;color:#fff;border:0;padding:10px 18px;border-radius:8px;font-size:15px;cursor:pointer}"
                + "</style></head><body><h2>" + title + "</h2>" + body + "</body></html>";
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).header("Cache-Control", "no-store").body(html);
    }
}
