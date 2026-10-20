package com.example.talentpool.controller;

import com.example.talentpool.dto.SiteDtos.PublicSite;
import com.example.talentpool.service.SiteService;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;
import java.util.UUID;

/** Konten dan gambar landing page untuk pengunjung (tanpa login). */
@RestController
@RequestMapping("/api/public/site")
public class PublicSiteController {
    private final SiteService service;

    public PublicSiteController(SiteService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<PublicSite> site() {
        return ResponseEntity.ok().cacheControl(CacheControl.noCache()).body(service.publicSite());
    }

    @GetMapping("/banners/{id}/image")
    public ResponseEntity<Resource> image(@PathVariable UUID id) {
        return imageResponse(service.bannerImage(id, true), CacheControl.maxAge(Duration.ofDays(30)).cachePublic());
    }

    static ResponseEntity<Resource> imageResponse(SiteService.ImageFile file, CacheControl cache) {
        String name = file.filename() == null ? "" : file.filename().toLowerCase(Locale.ROOT);
        MediaType type = name.endsWith(".png") ? MediaType.IMAGE_PNG
                : name.endsWith(".webp") ? MediaType.parseMediaType("image/webp") : MediaType.IMAGE_JPEG;
        return ResponseEntity.ok().contentType(type).cacheControl(cache)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(file.filename(), StandardCharsets.UTF_8).build().toString())
                .body(file.resource());
    }
}
