package com.example.talentpool.controller;

import com.example.talentpool.dto.SiteDtos.*;
import com.example.talentpool.service.SiteService;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/backoffice/site")
public class BackofficeSiteController {
    private final SiteService service;

    public BackofficeSiteController(SiteService service) {
        this.service = service;
    }

    @GetMapping("/language")
    public LanguageSetting language() { return new LanguageSetting(service.language()); }

    @PutMapping("/language")
    public LanguageSetting saveLanguage(@RequestBody LanguageSetting request) { return new LanguageSetting(service.saveLanguage(request.language())); }

    @GetMapping("/contents")
    public List<ContentSummary> contents() { return service.listContents(); }

    @GetMapping("/contents/{key}")
    public ContentDetail content(@PathVariable String key) { return service.getContent(key); }

    @PutMapping("/contents/{key}")
    public ContentDetail saveContent(@PathVariable String key, @RequestBody ContentUpdateRequest request) {
        return service.saveContent(key, request.value());
    }

    @GetMapping("/banners")
    public List<BannerResponse> banners() { return service.listBanners(); }

    @GetMapping("/banners/{id}")
    public BannerResponse banner(@PathVariable UUID id) { return service.getBanner(id); }

    @PostMapping(value = "/banners", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public BannerResponse create(@RequestParam String name, @RequestParam String category,
                                 @RequestParam(required = false) String groupKey,
                                 @RequestParam(required = false) String altText,
                                 @RequestParam(defaultValue = "1") int sequence,
                                 @RequestParam(defaultValue = "true") boolean active,
                                 @RequestPart("image") MultipartFile image) {
        return service.createBanner(name, category, groupKey, altText, sequence, active, image);
    }

    @PutMapping(value = "/banners/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BannerResponse update(@PathVariable UUID id, @RequestParam String name, @RequestParam String category,
                                 @RequestParam(required = false) String groupKey,
                                 @RequestParam(required = false) String altText,
                                 @RequestParam(defaultValue = "1") int sequence,
                                 @RequestParam(defaultValue = "true") boolean active,
                                 @RequestPart(value = "image", required = false) MultipartFile image) {
        return service.updateBanner(id, name, category, groupKey, altText, sequence, active, image);
    }

    @DeleteMapping("/banners/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) { service.deleteBanner(id); }

    @GetMapping("/banners/{id}/image")
    public ResponseEntity<Resource> image(@PathVariable UUID id) {
        return PublicSiteController.imageResponse(service.bannerImage(id, false), CacheControl.noStore());
    }
}
