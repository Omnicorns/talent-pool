package com.example.talentpool.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class SiteDtos {
    private SiteDtos() {}

    public record ContentSummary(String key, String name, String category, Instant updatedAt) {}

    public record ContentDetail(String key, String name, String category, JsonNode value, Instant updatedAt) {}

    public record ContentUpdateRequest(JsonNode value) {}

    public record BannerResponse(UUID id, String name, String category, String groupKey, String altText,
                                 int sequence, boolean active, String imageUrl, Instant updatedAt) {}

    public record PublicBanner(String category, String groupKey, String alt, String imageUrl) {}

    public record PublicSite(Map<String, JsonNode> contents, List<PublicBanner> banners, String language) {}

    public record LanguageSetting(String language) {}
}
