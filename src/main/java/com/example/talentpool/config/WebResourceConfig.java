package com.example.talentpool.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebResourceConfig implements WebMvcConfigurer {

    private final String basePath;

    public WebResourceConfig(
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
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        if (basePath.isBlank()) {
            return;
        }

        registry.addResourceHandler(basePath + "/assets/**")
                .addResourceLocations("classpath:/static/assets/");

        registry.addResourceHandler(basePath + "/images/**")
                .addResourceLocations("classpath:/static/images/");
    }
}
