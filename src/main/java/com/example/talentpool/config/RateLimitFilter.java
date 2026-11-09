package com.example.talentpool.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Pembatas laju sederhana (sliding window, per alamat IP, di memory) untuk endpoint publik yang
 * rawan disalahgunakan: upload pendaftaran tanpa login dan endpoint autentikasi kandidat.
 * Cukup untuk satu instance; bila aplikasi dijalankan lebih dari satu instance, batasi juga di Nginx.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private record Rule(String name, int maxRequests, long windowMillis) {}

    private static final Rule UPLOAD = new Rule("upload", 10, 60 * 60_000L);
    private static final Rule AUTH = new Rule("auth", 30, 10 * 60_000L);
    /** Login backoffice lebih ketat: akun admin/recruiter adalah target utama tebak password. */
    private static final Rule BACKOFFICE_LOGIN = new Rule("backoffice-login", 10, 10 * 60_000L);

    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();
    private final boolean enabled;

    public RateLimitFilter(@Value("${app.rate-limit.enabled:true}") boolean enabled) {
        this.enabled = enabled;
    }

    private Rule ruleFor(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) return null;
        String path = request.getRequestURI();
        if (path.endsWith("/api/public/talents")) return UPLOAD;
        if (path.endsWith("/api/backoffice/auth/login")) return BACKOFFICE_LOGIN;
        if (path.contains("/api/talent/auth/")) return AUTH;
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !enabled || ruleFor(request) == null;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Rule rule = ruleFor(request);
        if (rule != null && !allow(rule, clientIp(request))) {
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(rule.windowMillis() / 1000));
            response.setContentType("application/json;charset=UTF-8");
            response.getOutputStream().write(
                    "{\"message\":\"Terlalu banyak permintaan. Coba lagi beberapa saat lagi.\"}"
                            .getBytes(StandardCharsets.UTF_8));
            return;
        }
        chain.doFilter(request, response);
    }

    private boolean allow(Rule rule, String ip) {
        long now = System.currentTimeMillis();
        if (hits.size() > 20_000) {
            hits.values().removeIf(queue -> {
                synchronized (queue) {
                    return queue.isEmpty() || now - queue.peekLast() > 3_600_000L;
                }
            });
        }
        Deque<Long> queue = hits.computeIfAbsent(rule.name() + '|' + ip, key -> new ArrayDeque<>());
        synchronized (queue) {
            while (!queue.isEmpty() && now - queue.peekFirst() > rule.windowMillis()) queue.pollFirst();
            if (queue.size() >= rule.maxRequests()) return false;
            queue.addLast(now);
            return true;
        }
    }

    /**
     * Di belakang reverse proxy (Nginx) alamat asli ada di entri TERAKHIR X-Forwarded-For, yaitu yang
     * ditambahkan proxy tepercaya. Header hanya dipercaya bila koneksi datang dari proxy lokal/privat,
     * agar klien tidak bisa memalsukannya.
     */
    private String clientIp(HttpServletRequest request) {
        String remote = request.getRemoteAddr();
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank() && isTrustedProxy(remote)) {
            String[] parts = forwarded.split(",");
            String last = parts[parts.length - 1].trim();
            if (!last.isEmpty()) return last;
        }
        return remote;
    }

    private boolean isTrustedProxy(String address) {
        return address != null && (address.equals("127.0.0.1") || address.equals("::1") || address.equals("0:0:0:0:0:0:0:1")
                || address.startsWith("10.") || address.startsWith("192.168.") || address.matches("^172\\.(1[6-9]|2\\d|3[01])\\..*"));
    }
}
