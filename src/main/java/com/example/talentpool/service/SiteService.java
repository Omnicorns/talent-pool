package com.example.talentpool.service;

import com.example.talentpool.domain.SiteBanner;
import com.example.talentpool.domain.SiteContent;
import com.example.talentpool.dto.SiteDtos.*;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.exception.ResourceNotFoundException;
import com.example.talentpool.repository.SiteBannerRepository;
import com.example.talentpool.repository.SiteContentRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;

/** Mengelola konten dan gambar landing page dari back office. */
@Service
public class SiteService {
    /** Kunci konten yang boleh diubah: key -> {nama, kategori}. */
    private static final Map<String, String[]> CONTENT_KEYS = new LinkedHashMap<>();
    static {
        CONTENT_KEYS.put("HERO", new String[]{"Hero (judul utama)", "Beranda"});
        CONTENT_KEYS.put("VALUES", new String[]{"Alasan bergabung", "Beranda"});
        CONTENT_KEYS.put("LIFE_HEADING", new String[]{"Life at Sarinah - judul", "Life at Sarinah"});
        CONTENT_KEYS.put("LIFE_PROGRAMS", new String[]{"Life at Sarinah - program", "Life at Sarinah"});
        CONTENT_KEYS.put("FAQ", new String[]{"Pertanyaan yang sering diajukan", "FAQ"});
        CONTENT_KEYS.put("HEADER", new String[]{"Header (menu navigasi)", "Header & Footer"});
        CONTENT_KEYS.put("FOOTER", new String[]{"Footer (deskripsi, kontak, hak cipta)", "Header & Footer"});
        CONTENT_KEYS.put("LOGIN", new String[]{"Halaman login & daftar (teks)", "Login"});
    }
    private static final Set<String> BANNER_CATEGORIES = Set.of(SiteBanner.HERO, SiteBanner.LIFE, SiteBanner.LOGO_PARTNER, SiteBanner.LOGO_BRAND, SiteBanner.LOGIN_IMAGE);
    private static final int MAX_CONTENT_BYTES = 100_000;
    private static final String LANGUAGE_KEY = "SITE_LANGUAGE";
    private static final Set<String> LANGUAGES = Set.of("id", "en");

    private final SiteContentRepository contents;
    private final SiteBannerRepository banners;
    private final FileStorageService storage;
    private final ObjectMapper mapper;

    public SiteService(SiteContentRepository contents, SiteBannerRepository banners, FileStorageService storage, ObjectMapper mapper) {
        this.contents = contents;
        this.banners = banners;
        this.storage = storage;
        this.mapper = mapper;
    }

    // ---- Konten ----

    @Transactional(readOnly = true)
    public List<ContentSummary> listContents() {
        Map<String, SiteContent> saved = new HashMap<>();
        contents.findAll().forEach(c -> saved.put(c.getKey(), c));
        List<ContentSummary> result = new ArrayList<>();
        CONTENT_KEYS.forEach((key, meta) -> result.add(new ContentSummary(key, meta[0], meta[1],
                saved.containsKey(key) ? saved.get(key).getUpdatedAt() : null)));
        return result;
    }

    @Transactional(readOnly = true)
    public ContentDetail getContent(String key) {
        String[] meta = requireKey(key);
        return contents.findById(key)
                .map(c -> new ContentDetail(key, meta[0], meta[1], parse(c.getValue()), c.getUpdatedAt()))
                .orElseGet(() -> new ContentDetail(key, meta[0], meta[1], null, null));
    }

    @Transactional
    public ContentDetail saveContent(String key, JsonNode value) {
        String[] meta = requireKey(key);
        if (value == null || value.isNull()) throw new BadRequestException("Isi konten wajib diisi");
        String json = write(value);
        if (json.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > MAX_CONTENT_BYTES)
            throw new BadRequestException("Isi konten terlalu besar");
        SiteContent entity = contents.findById(key).orElseGet(() -> new SiteContent(key, json));
        entity.setValue(json);
        entity = contents.saveAndFlush(entity);
        return new ContentDetail(key, meta[0], meta[1], value, entity.getUpdatedAt());
    }

    // ---- Banner ----

    @Transactional(readOnly = true)
    public List<BannerResponse> listBanners() {
        return banners.findAll().stream()
                .sorted(Comparator.comparing(SiteBanner::getCategory)
                        .thenComparing(b -> Objects.toString(b.getGroupKey(), ""))
                        .thenComparingInt(SiteBanner::getSequence))
                .map(b -> toResponse(b, "/api/backoffice/site/banners/")).toList();
    }

    @Transactional(readOnly = true)
    public BannerResponse getBanner(UUID id) {
        return toResponse(find(id), "/api/backoffice/site/banners/");
    }

    @Transactional
    public BannerResponse createBanner(String name, String category, String groupKey, String altText,
                                       int sequence, boolean active, MultipartFile image) {
        if (image == null || image.isEmpty()) throw new BadRequestException("Gambar wajib diunggah");
        SiteBanner banner = new SiteBanner();
        apply(banner, name, category, groupKey, altText, sequence, active);
        var stored = storage.storeSiteBanner(image);
        banner.setImageOriginalName(stored.originalName());
        banner.setImageStoredPath(stored.storedPath());
        return toResponse(banners.saveAndFlush(banner), "/api/backoffice/site/banners/");
    }

    @Transactional
    public BannerResponse updateBanner(UUID id, String name, String category, String groupKey, String altText,
                                       int sequence, boolean active, MultipartFile image) {
        SiteBanner banner = find(id);
        apply(banner, name, category, groupKey, altText, sequence, active);
        String oldPath = null;
        if (image != null && !image.isEmpty()) {
            var stored = storage.storeSiteBanner(image);
            oldPath = banner.getImageStoredPath();
            banner.setImageOriginalName(stored.originalName());
            banner.setImageStoredPath(stored.storedPath());
        }
        BannerResponse response = toResponse(banners.saveAndFlush(banner), "/api/backoffice/site/banners/");
        storage.deleteQuietly(oldPath);
        return response;
    }

    @Transactional
    public void deleteBanner(UUID id) {
        SiteBanner banner = find(id);
        banners.delete(banner);
        storage.deleteQuietly(banner.getImageStoredPath());
    }

    @Transactional(readOnly = true)
    public ImageFile bannerImage(UUID id, boolean onlyActive) {
        SiteBanner banner = find(id);
        if (onlyActive && !banner.isActive()) throw new ResourceNotFoundException("Gambar tidak ditemukan");
        return new ImageFile(storage.load(banner.getImageStoredPath()), banner.getImageOriginalName());
    }

    // ---- Publik ----

    @Transactional(readOnly = true)
    public PublicSite publicSite() {
        Map<String, JsonNode> values = new LinkedHashMap<>();
        contents.findAll().stream().filter(c -> !LANGUAGE_KEY.equals(c.getKey())).forEach(c -> values.put(c.getKey(), parse(c.getValue())));
        List<PublicBanner> list = banners.findByActiveTrueOrderByCategoryAscSequenceAscCreatedAtAsc().stream()
                .map(b -> new PublicBanner(b.getCategory(), b.getGroupKey(),
                        b.getAltText() == null || b.getAltText().isBlank() ? b.getName() : b.getAltText(),
                        "/api/public/site/banners/" + b.getId() + "/image?v=" + b.getUpdatedAt().toEpochMilli()))
                .toList();
        return new PublicSite(values, list, language());
    }

    /** Bahasa tampilan situs kandidat: "id" (bawaan) atau "en". */
    @Transactional(readOnly = true)
    public String language() {
        return contents.findById(LANGUAGE_KEY).map(c -> c.getValue().replace("\"", "").trim())
                .filter(LANGUAGES::contains).orElse("id");
    }

    @Transactional
    public String saveLanguage(String language) {
        String value = language == null ? "" : language.trim().toLowerCase(Locale.ROOT);
        if (!LANGUAGES.contains(value)) throw new BadRequestException("Bahasa harus id atau en");
        SiteContent entity = contents.findById(LANGUAGE_KEY).orElseGet(() -> new SiteContent(LANGUAGE_KEY, "\"" + value + "\""));
        entity.setValue("\"" + value + "\"");
        contents.saveAndFlush(entity);
        return value;
    }

    public record ImageFile(Resource resource, String filename) {}

    // ---- util ----

    private void apply(SiteBanner banner, String name, String category, String groupKey, String altText, int sequence, boolean active) {
        if (name == null || name.isBlank()) throw new BadRequestException("Nama wajib diisi");
        String cat = category == null ? "" : category.trim().toUpperCase(Locale.ROOT);
        if (!BANNER_CATEGORIES.contains(cat)) throw new BadRequestException("Kategori tidak valid");
        if (SiteBanner.LIFE.equals(cat) && (groupKey == null || groupKey.isBlank()))
            throw new BadRequestException("Pilih program Life at Sarinah untuk gambar ini");
        if (sequence < 1 || sequence > 999) throw new BadRequestException("Urutan harus antara 1 dan 999");
        banner.setName(name.trim());
        banner.setCategory(cat);
        banner.setGroupKey(SiteBanner.LIFE.equals(cat) ? groupKey.trim() : null);
        banner.setAltText(altText == null || altText.isBlank() ? null : altText.trim());
        banner.setSequence(sequence);
        banner.setActive(active);
    }

    private BannerResponse toResponse(SiteBanner b, String prefix) {
        return new BannerResponse(b.getId(), b.getName(), b.getCategory(), b.getGroupKey(), b.getAltText(),
                b.getSequence(), b.isActive(), prefix + b.getId() + "/image", b.getUpdatedAt());
    }

    private SiteBanner find(UUID id) {
        return banners.findById(id).orElseThrow(() -> new ResourceNotFoundException("Banner tidak ditemukan"));
    }

    private String[] requireKey(String key) {
        String[] meta = CONTENT_KEYS.get(key);
        if (meta == null) throw new ResourceNotFoundException("Konten tidak ditemukan");
        return meta;
    }

    private JsonNode parse(String json) {
        try { return mapper.readTree(json); } catch (JsonProcessingException ex) { return null; }
    }

    private String write(JsonNode node) {
        try { return mapper.writeValueAsString(node); } catch (JsonProcessingException ex) { throw new BadRequestException("Isi konten tidak valid"); }
    }
}
