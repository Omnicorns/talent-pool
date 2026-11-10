package com.example.talentpool.domain;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "talent_accounts")
@EntityListeners(AuditingEntityListener.class)
public class TalentAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false, unique = true)
    private Candidate candidate;

    @Column(nullable = false, unique = true, length = 200)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "email_verified_at")
    private Instant emailVerifiedAt;

    /** Dinaikkan saat password berubah agar token lama otomatis tidak berlaku lagi. */
    @Column(name = "token_version")
    private Integer tokenVersion;

    @Column(name = "onboarding_completed")
    private Boolean onboardingCompleted;

    /** Email pemberitahuan lowongan baru. null dianggap aktif (akun lama). */
    @Column(name = "job_alerts_enabled")
    private Boolean jobAlertsEnabled;

    /** Token acak untuk tautan berhenti berlangganan di email; dibuat saat email pertama dikirim. */
    @Column(name = "job_alert_token", length = 64, unique = true)
    private String jobAlertToken;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UUID getId() { return id; }
    public Candidate getCandidate() { return candidate; }
    public void setCandidate(Candidate candidate) { this.candidate = candidate; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Instant getEmailVerifiedAt() { return emailVerifiedAt; }
    public void setEmailVerifiedAt(Instant emailVerifiedAt) { this.emailVerifiedAt = emailVerifiedAt; }
    public int getTokenVersion() { return tokenVersion == null ? 0 : tokenVersion; }
    public void revokeTokens() { this.tokenVersion = getTokenVersion() + 1; }
    public boolean isEmailVerified() { return emailVerifiedAt != null; }
    public boolean isOnboardingCompleted() { return onboardingCompleted == null || onboardingCompleted; }
    public void setOnboardingCompleted(boolean onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; }
    public boolean isJobAlertsEnabled() { return jobAlertsEnabled == null || jobAlertsEnabled; }
    public void setJobAlertsEnabled(boolean jobAlertsEnabled) { this.jobAlertsEnabled = jobAlertsEnabled; }
    public String getJobAlertToken() { return jobAlertToken; }
    public void setJobAlertToken(String jobAlertToken) { this.jobAlertToken = jobAlertToken; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
