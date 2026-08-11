package com.example.talentpool.domain;

import jakarta.persistence.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "recruitment_settings")
@EntityListeners(AuditingEntityListener.class)
public class RecruitmentSetting {
    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    @Column(name = "company_name", nullable = false, length = 200)
    private String companyName = "Talent Pool";

    @Column(name = "default_interview_duration", nullable = false)
    private int defaultInterviewDuration = 60;

    @Column(nullable = false, length = 100)
    private String timezone = "Asia/Jakarta";

    @Column(name = "email_notifications", nullable = false)
    private boolean emailNotifications = true;

    @Column(name = "candidate_auto_archive_days", nullable = false)
    private int candidateAutoArchiveDays = 180;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Long getId() { return id; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public int getDefaultInterviewDuration() { return defaultInterviewDuration; }
    public void setDefaultInterviewDuration(int defaultInterviewDuration) { this.defaultInterviewDuration = defaultInterviewDuration; }
    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    public boolean isEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(boolean emailNotifications) { this.emailNotifications = emailNotifications; }
    public int getCandidateAutoArchiveDays() { return candidateAutoArchiveDays; }
    public void setCandidateAutoArchiveDays(int candidateAutoArchiveDays) { this.candidateAutoArchiveDays = candidateAutoArchiveDays; }
    public Instant getUpdatedAt() { return updatedAt; }
}
