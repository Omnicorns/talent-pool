package com.example.talentpool.domain;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "candidate_view_events")
@EntityListeners(AuditingEntityListener.class)
public class CandidateViewEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    @Column(name = "view_type", nullable = false, length = 30)
    private CandidateViewType viewType;

    @Column(name = "viewer_username", length = 200)
    private String viewerUsername;

    @CreatedDate
    @Column(name = "viewed_at", nullable = false, updatable = false)
    private Instant viewedAt;

    public UUID getId() { return id; }
    public Candidate getCandidate() { return candidate; }
    public void setCandidate(Candidate candidate) { this.candidate = candidate; }
    public CandidateViewType getViewType() { return viewType; }
    public void setViewType(CandidateViewType viewType) { this.viewType = viewType; }
    public String getViewerUsername() { return viewerUsername; }
    public void setViewerUsername(String viewerUsername) { this.viewerUsername = viewerUsername; }
    public Instant getViewedAt() { return viewedAt; }
}
