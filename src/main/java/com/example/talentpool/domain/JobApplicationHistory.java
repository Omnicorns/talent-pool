package com.example.talentpool.domain;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "job_application_histories")
@EntityListeners(AuditingEntityListener.class)
public class JobApplicationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", length = 30)
    private HiringStage stage;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private ApplicationStatus status;

    @Column(name = "event_type", nullable = false, length = 40)
    private String eventType;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @CreatedDate
    @Column(name = "changed_at", nullable = false, updatable = false)
    private Instant changedAt;

    public UUID getId() { return id; }
    public JobApplication getApplication() { return application; }
    public void setApplication(JobApplication application) { this.application = application; }
    public HiringStage getStage() { return stage; }
    public void setStage(HiringStage stage) { this.stage = stage; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Instant getChangedAt() { return changedAt; }
}
