package com.example.talentpool.service;

import com.example.talentpool.config.StorageProperties;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.exception.ResourceNotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final Set<String> CV_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png", "doc", "docx");
    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png");
    private static final Set<String> PORTFOLIO_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png", "doc", "docx", "zip");

    private final Path root;

    public FileStorageService(StorageProperties properties) {
        this.root = properties.root().toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException ex) {
            throw new IllegalStateException("Tidak dapat membuat folder upload", ex);
        }
    }

    public StoredFile storeCv(MultipartFile file, UUID candidateId) {
        return store(file, Path.of("candidates", candidateId.toString(), "cv"), CV_EXTENSIONS);
    }

    public StoredFile storeProfilePicture(MultipartFile file, UUID candidateId) {
        return store(file, Path.of("candidates", candidateId.toString(), "profile"), IMAGE_EXTENSIONS);
    }

    public StoredFile storeSiteBanner(MultipartFile file) {
        if (file != null && file.getSize() > 5L * 1024 * 1024)
            throw new BadRequestException("Ukuran gambar maksimal 5 MB");
        return store(file, Path.of("site", "banners"), Set.of("jpg", "jpeg", "png", "webp"));
    }

    public StoredFile storePortfolio(MultipartFile file, UUID candidateId) {
        return store(file, Path.of("candidates", candidateId.toString(), "portfolio"), PORTFOLIO_EXTENSIONS);
    }

    public void validateSupportingDocument(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > 2L * 1024 * 1024)
            throw new BadRequestException("Dokumen wajib berupa PDF, maksimal 2 MB");
        String name = file.getOriginalFilename();
        if (name == null || !name.toLowerCase(Locale.ROOT).endsWith(".pdf") || name.contains(".."))
            throw new BadRequestException("Dokumen wajib berupa PDF");
        try (var stream = file.getInputStream()) {
            if (!java.util.Arrays.equals(stream.readNBytes(5), "%PDF-".getBytes(java.nio.charset.StandardCharsets.US_ASCII)))
                throw new BadRequestException("Isi dokumen bukan PDF yang valid");
        } catch (IOException ex) { throw new BadRequestException("Dokumen tidak dapat dibaca"); }
    }
    public StoredFile storeSupportingDocument(MultipartFile file, UUID candidateId) {
        validateSupportingDocument(file);
        return store(file, Path.of("candidates",candidateId.toString(),"documents"),Set.of("pdf"));
    }

    public Resource load(String storedPath) {
        try {
            Path path = root.resolve(storedPath).normalize();
            if (!path.startsWith(root)) {
                throw new BadRequestException("Lokasi file tidak valid");
            }
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("File tidak ditemukan");
            }
            return resource;
        } catch (IOException ex) {
            throw new ResourceNotFoundException("File tidak dapat dibaca");
        }
    }

    public void deleteQuietly(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) return;
        try {
            Path path = root.resolve(storedPath).normalize();
            if (path.startsWith(root)) Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
    }

    private StoredFile store(MultipartFile file, Path folder, Set<String> allowedExtensions) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File wajib diisi");
        }
        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        String extension = extensionOf(originalName);
        if (!allowedExtensions.contains(extension)) {
            throw new BadRequestException("Format file tidak didukung: " + extension);
        }
        if (originalName.contains("..")) {
            throw new BadRequestException("Nama file tidak valid");
        }
        verifyContent(file, extension);

        try {
            Path targetFolder = root.resolve(folder).normalize();
            if (!targetFolder.startsWith(root)) throw new BadRequestException("Lokasi upload tidak valid");
            Files.createDirectories(targetFolder);
            String storedName = UUID.randomUUID() + "." + extension;
            Path target = targetFolder.resolve(storedName);
            try (var stream = file.getInputStream()) {
                Files.copy(stream, target, StandardCopyOption.REPLACE_EXISTING);
            }
            String relativePath = root.relativize(target).toString().replace('\\', '/');
            return new StoredFile(originalName, relativePath);
        } catch (IOException ex) {
            throw new IllegalStateException("Gagal menyimpan file", ex);
        }
    }

    /** Isi file harus cocok dengan ekstensinya (magic bytes), bukan sekadar namanya. */
    private void verifyContent(MultipartFile file, String extension) {
        byte[] head;
        try (var stream = file.getInputStream()) {
            head = stream.readNBytes(12);
        } catch (IOException ex) {
            throw new BadRequestException("File tidak dapat dibaca");
        }
        boolean valid = switch (extension) {
            case "pdf" -> startsWith(head, 0, 0x25, 0x50, 0x44, 0x46, 0x2D);
            case "jpg", "jpeg" -> startsWith(head, 0, 0xFF, 0xD8, 0xFF);
            case "png" -> startsWith(head, 0, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
            case "webp" -> startsWith(head, 0, 0x52, 0x49, 0x46, 0x46) && startsWith(head, 8, 0x57, 0x45, 0x42, 0x50);
            case "docx", "zip" -> startsWith(head, 0, 0x50, 0x4B, 0x03, 0x04);
            case "doc" -> startsWith(head, 0, 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1);
            default -> false;
        };
        if (!valid) {
            throw new BadRequestException("Isi file tidak sesuai dengan format ." + extension);
        }
        if (extension.equals("docx") || extension.equals("zip")) {
            inspectArchive(file, extension.equals("docx"));
        }
    }

    private static final int MAX_ARCHIVE_ENTRIES = 2_000;
    private static final long MAX_ARCHIVE_UNCOMPRESSED_BYTES = 200L * 1024 * 1024;
    private static final Set<String> BLOCKED_ARCHIVE_EXTENSIONS = Set.of(
            "exe", "dll", "bat", "cmd", "com", "scr", "msi", "ps1", "vbs", "vbe", "js", "jse", "wsf",
            "jar", "sh", "lnk", "php", "jsp", "asp", "aspx", "hta", "reg");

    /**
     * Memeriksa struktur arsip: jumlah entri dan ukuran setelah diekstrak dibatasi (anti zip bomb), nama
     * entri tidak boleh keluar dari folder (zip slip), dan file yang dapat dieksekusi ditolak. Untuk .docx,
     * arsip harus berstruktur dokumen Word dan tidak boleh berisi makro VBA.
     */
    private void inspectArchive(MultipartFile file, boolean wordDocument) {
        int entries = 0;
        long uncompressed = 0;
        boolean hasContentTypes = false;
        boolean hasWordPart = false;
        byte[] buffer = new byte[8192];
        try (var zip = new java.util.zip.ZipInputStream(file.getInputStream())) {
            java.util.zip.ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if (++entries > MAX_ARCHIVE_ENTRIES) {
                    throw new BadRequestException("Arsip berisi terlalu banyak file");
                }
                String name = entry.getName().replace('\\', '/');
                String lower = name.toLowerCase(Locale.ROOT);
                if (name.startsWith("/") || name.contains("../") || name.equals("..") || name.contains(":")) {
                    throw new BadRequestException("Arsip berisi nama file yang tidak valid");
                }
                if (!entry.isDirectory()) {
                    int dot = lower.lastIndexOf('.');
                    String ext = dot >= 0 ? lower.substring(dot + 1) : "";
                    if (BLOCKED_ARCHIVE_EXTENSIONS.contains(ext) || lower.contains("vbaproject")) {
                        throw new BadRequestException("Arsip berisi file yang tidak diizinkan");
                    }
                }
                if (lower.equals("[content_types].xml")) hasContentTypes = true;
                if (lower.startsWith("word/")) hasWordPart = true;
                int read;
                while ((read = zip.read(buffer)) != -1) {
                    uncompressed += read;
                    if (uncompressed > MAX_ARCHIVE_UNCOMPRESSED_BYTES) {
                        throw new BadRequestException("Ukuran isi arsip terlalu besar");
                    }
                }
            }
        } catch (IOException | IllegalArgumentException ex) {
            throw new BadRequestException("Arsip tidak dapat dibaca atau rusak");
        }
        if (wordDocument && !(hasContentTypes && hasWordPart)) {
            throw new BadRequestException("Isi file tidak sesuai dengan dokumen Word (.docx)");
        }
        if (entries == 0) {
            throw new BadRequestException("Arsip kosong");
        }
    }

    private static boolean startsWith(byte[] data, int offset, int... expected) {
        if (data.length < offset + expected.length) return false;
        for (int i = 0; i < expected.length; i++) {
            if ((data[offset + i] & 0xFF) != expected[i]) return false;
        }
        return true;
    }

    private String extensionOf(String name) {
        int dot = name.lastIndexOf('.');
        if (dot < 0 || dot == name.length() - 1) {
            throw new BadRequestException("File harus memiliki ekstensi");
        }
        return name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    public record StoredFile(String originalName, String storedPath) {}
}
