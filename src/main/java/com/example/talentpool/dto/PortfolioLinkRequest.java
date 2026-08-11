package com.example.talentpool.dto;

import jakarta.validation.constraints.NotBlank;

public record PortfolioLinkRequest(
        @NotBlank String title,
        @NotBlank String url
) {
}
