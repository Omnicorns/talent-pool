package com.example.talentpool.domain;

import jakarta.persistence.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/** Teks landing page (JSON) per kunci, misalnya HERO atau FAQ. */
@Entity
@Table(name = "site_contents")
@EntityListeners(AuditingEntityListener.class)
public class SiteContent {
    @Id
    @Column(name = "content_key", length = 60)
    private String key;

    @Column(name = "content_value", nullable = false, columnDefinition = "text")
    private String value;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected SiteContent() {}
    public SiteContent(String key, String value) { this.key = key; this.value = value; }

    public String getKey() { return key; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
    public Instant getUpdatedAt() { return updatedAt; }
}
