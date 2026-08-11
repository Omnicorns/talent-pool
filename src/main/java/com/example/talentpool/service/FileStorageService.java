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

    public StoredFile storePortfolio(MultipartFile file, UUID candidateId) {
        return store(file, Path.of("candidates", candidateId.toString(), "portfolio"), PORTFOLIO_EXTENSIONS);
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

        try {
            Path targetFolder = root.resolve(folder).normalize();
            if (!targetFolder.startsWith(root)) throw new BadRequestException("Lokasi upload tidak valid");
            Files.createDirectories(targetFolder);
            String storedName = UUID.randomUUID() + "." + extension;
            Path target = targetFolder.resolve(storedName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            String relativePath = root.relativize(target).toString().replace('\\', '/');
            return new StoredFile(originalName, relativePath);
        } catch (IOException ex) {
            throw new IllegalStateException("Gagal menyimpan file", ex);
        }
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
