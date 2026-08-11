package com.example.talentpool.domain;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "candidate_portfolios")
public class Portfolio {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PortfolioType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String url;

    @Column(name = "original_name")
    private String originalName;

    @Column(name = "stored_path")
    private String storedPath;

    public UUID getId() { return id; }
    public Candidate getCandidate() { return candidate; }
    public void setCandidate(Candidate candidate) { this.candidate = candidate; }
    public PortfolioType getType() { return type; }
    public void setType(PortfolioType type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getOriginalName() { return originalName; }
    public void setOriginalName(String originalName) { this.originalName = originalName; }
    public String getStoredPath() { return storedPath; }
    public void setStoredPath(String storedPath) { this.storedPath = storedPath; }
}
