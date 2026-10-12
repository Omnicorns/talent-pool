package com.example.talentpool.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AppBasePathFilter extends OncePerRequestFilter {

    private final String basePath;

    public AppBasePathFilter(
            @Value("${app.web.base-path:/sarinah-talent-pool}") String basePath
    ) {
        String normalized = basePath == null ? "" : basePath.trim();

        if (normalized.isBlank() || "/".equals(normalized)) {
            this.basePath = "";
        } else {
            if (!normalized.startsWith("/")) {
                normalized = "/" + normalized;
            }
            this.basePath = normalized.replaceAll("/+$", "");
        }
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        if (basePath.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();

        if (uri == null || (!uri.equals(basePath) && !uri.startsWith(basePath + "/"))) {
            filterChain.doFilter(request, response);
            return;
        }

        String stripped = uri.substring(basePath.length());
        if (stripped.isBlank()) {
            stripped = "/";
        }

        boolean apiRequest =
                stripped.equals("/api")
                || stripped.startsWith("/api/")
                || stripped.equals("/actuator")
                || stripped.startsWith("/actuator/");

        if (!apiRequest) {
            filterChain.doFilter(request, response);
            return;
        }

        final String rewrittenUri = stripped;

        HttpServletRequestWrapper wrapped = new HttpServletRequestWrapper(request) {
            @Override
            public String getRequestURI() {
                return rewrittenUri;
            }

            @Override
            public String getServletPath() {
                return rewrittenUri;
            }
        };

        filterChain.doFilter(wrapped, response);
    }
}
