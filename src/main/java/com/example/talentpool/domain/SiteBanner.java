package com.example.talentpool.domain;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/** Gambar yang tampil di landing page (hero atau foto Life at Sarinah), diatur dari back office. */
@Entity
@Table(name = "site_banners")
@EntityListeners(AuditingEntityListener.class)
public class SiteBanner {
    public static final String HERO = "HERO";
    public static final String LIFE = "LIFE";

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    /** HERO atau LIFE. */
    @Column(nullable = false, length = 30)
    private String category;

    /** Untuk kategori LIFE: kunci program (kartu) tempat foto ini tampil. */
    @Column(name = "group_key", length = 100)
    private String groupKey;

    @Column(name = "alt_text", length = 300)
    private String altText;

    @Column(nullable = false)
    private int sequence = 1;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "image_original_name", nullable = false, length = 255)
    private String imageOriginalName;

    @Column(name = "image_stored_path", nullable = false, length = 500)
    private String imageStoredPath;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UUID getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getGroupKey() { return groupKey; }
    public void setGroupKey(String groupKey) { this.groupKey = groupKey; }
    public String getAltText() { return altText; }
    public void setAltText(String altText) { this.altText = altText; }
    public int getSequence() { return sequence; }
    public void setSequence(int sequence) { this.sequence = sequence; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getImageOriginalName() { return imageOriginalName; }
    public void setImageOriginalName(String v) { this.imageOriginalName = v; }
    public String getImageStoredPath() { return imageStoredPath; }
    public void setImageStoredPath(String v) { this.imageStoredPath = v; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
