package com.example.talentpool.domain;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "candidates")
@EntityListeners(AuditingEntityListener.class)
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(length = 200)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "identity_number", length = 100)
    private String identityNumber;

    @Column(name ="languanges")
    private String languange;

    @Column(name= "religion",length = 100)
    private  String religion;

    @ElementCollection
    @CollectionTable(
            name = "candidate_job_interests",
            joinColumns = @JoinColumn(name = "candidate_id")
    )

    @Column(name = "job_interest", nullable = false, length = 150)
    private List<String> jobInterests = new ArrayList<>();

    @ElementCollection
    @CollectionTable(
            name = "candidate_preferred_locations",
            joinColumns = @JoinColumn(name = "candidate_id")
    )
    @Column(name = "location", nullable = false, length = 150)
    private List<String> preferredLocations = new ArrayList<>();


    @Column(name = "citizen_id_address", columnDefinition = "text")
    private String citizenIdAddress;

    @Column(name = "residential_address", columnDefinition = "text")
    private String residentialAddress;

    @Column(name = "same_as_citizen_id_address", nullable = false)
    private boolean sameAsCitizenIdAddress;

    @Column(name = "current_salary", precision = 19, scale = 2)
    private BigDecimal currentSalary;

    @Column(name = "expected_salary", precision = 19, scale = 2)
    private BigDecimal expectedSalary;

    @Column(name = "cv_original_name")
    private String cvOriginalName;

    @Column(name = "cv_stored_path")
    private String cvStoredPath;

    @Column(name = "profile_picture_original_name")
    private String profilePictureOriginalName;

    @Column(name = "profile_picture_stored_path")
    private String profilePictureStoredPath;

    @Column(length = 100)
    private String source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CandidateStatus status = CandidateStatus.POTENTIAL;

    @Column(name = "terms_accepted", nullable = false)
    private boolean termsAccepted;

    @Column(name = "moved_to_job_listing", nullable = false)
    private boolean movedToJobListing;

    @Column(name = "job_position", length = 200)
    private String jobPosition;

    @Column(name = "hiring_stage", length = 100)
    private String hiringStage;

    @ElementCollection
    @CollectionTable(name = "candidate_related_industries", joinColumns = @JoinColumn(name = "candidate_id"))
    @Column(name = "industry", nullable = false, length = 150)
    private List<String> relatedIndustries = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "candidate_related_job_positions", joinColumns = @JoinColumn(name = "candidate_id"))
    @Column(name = "job_position", nullable = false, length = 150)
    private List<String> relatedJobPositions = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "candidate_tools", joinColumns = @JoinColumn(name = "candidate_id"))
    @Column(name = "tool", nullable = false, length = 150)
    private List<String> tools = new ArrayList<>();

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("startYear DESC")
    private List<Education> educations = new ArrayList<>();

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("startDate DESC")
    private List<WorkExperience> workExperiences = new ArrayList<>();

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Portfolio> portfolios = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public List<String> getJobInterests() {
        return jobInterests;
    }

    public void setJobInterests(List<String> jobInterests) {
        this.jobInterests.clear();

        if (jobInterests != null) {
            this.jobInterests.addAll(jobInterests);
        }
    }

    public List<String> getPreferredLocations() {
        return preferredLocations;
    }

    public void setPreferredLocations(List<String> preferredLocations) {
        this.preferredLocations.clear();

        if (preferredLocations != null) {
            this.preferredLocations.addAll(preferredLocations);
        }
    }

    public void replaceEducations(List<Education> items) {
        educations.clear();
        items.forEach(this::addEducation);
    }

    public void addEducation(Education education) {
        education.setCandidate(this);
        educations.add(education);
    }

    public void replaceWorkExperiences(List<WorkExperience> items) {
        workExperiences.clear();
        items.forEach(this::addWorkExperience);
    }

    public void addWorkExperience(WorkExperience workExperience) {
        workExperience.setCandidate(this);
        workExperiences.add(workExperience);
    }

    public void replacePortfolioLinks(List<Portfolio> items) {
        portfolios.removeIf(portfolio -> portfolio.getType() == PortfolioType.LINK);
        items.forEach(this::addPortfolio);
    }

    public void addPortfolio(Portfolio portfolio) {
        portfolio.setCandidate(this);
        portfolios.add(portfolio);
    }

    public UUID getId() { return id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
    public String getIdentityNumber() { return identityNumber; }
    public void setIdentityNumber(String identityNumber) { this.identityNumber = identityNumber; }
    public String getCitizenIdAddress() { return citizenIdAddress; }
    public void setCitizenIdAddress(String citizenIdAddress) { this.citizenIdAddress = citizenIdAddress; }
    public String getResidentialAddress() { return residentialAddress; }
    public void setResidentialAddress(String residentialAddress) { this.residentialAddress = residentialAddress; }
    public boolean isSameAsCitizenIdAddress() { return sameAsCitizenIdAddress; }
    public void setSameAsCitizenIdAddress(boolean sameAsCitizenIdAddress) { this.sameAsCitizenIdAddress = sameAsCitizenIdAddress; }
    public BigDecimal getCurrentSalary() { return currentSalary; }
    public void setCurrentSalary(BigDecimal currentSalary) { this.currentSalary = currentSalary; }
    public BigDecimal getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(BigDecimal expectedSalary) { this.expectedSalary = expectedSalary; }
    public String getCvOriginalName() { return cvOriginalName; }
    public void setCvOriginalName(String cvOriginalName) { this.cvOriginalName = cvOriginalName; }
    public String getCvStoredPath() { return cvStoredPath; }
    public void setCvStoredPath(String cvStoredPath) { this.cvStoredPath = cvStoredPath; }
    public String getProfilePictureOriginalName() { return profilePictureOriginalName; }
    public void setProfilePictureOriginalName(String profilePictureOriginalName) { this.profilePictureOriginalName = profilePictureOriginalName; }
    public String getProfilePictureStoredPath() { return profilePictureStoredPath; }
    public void setProfilePictureStoredPath(String profilePictureStoredPath) { this.profilePictureStoredPath = profilePictureStoredPath; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public CandidateStatus getStatus() { return status; }
    public void setStatus(CandidateStatus status) { this.status = status; }
    public boolean isTermsAccepted() { return termsAccepted; }
    public void setTermsAccepted(boolean termsAccepted) { this.termsAccepted = termsAccepted; }
    public boolean isMovedToJobListing() { return movedToJobListing; }
    public void setMovedToJobListing(boolean movedToJobListing) { this.movedToJobListing = movedToJobListing; }
    public String getJobPosition() { return jobPosition; }
    public void setJobPosition(String jobPosition) { this.jobPosition = jobPosition; }
    public String getHiringStage() { return hiringStage; }
    public void setHiringStage(String hiringStage) { this.hiringStage = hiringStage; }
    public List<String> getRelatedIndustries() { return relatedIndustries; }
    public void setRelatedIndustries(List<String> relatedIndustries) {
        this.relatedIndustries.clear();
        if (relatedIndustries != null) this.relatedIndustries.addAll(relatedIndustries);
    }
    public String getReligion() {return religion;}

    public void setReligion(String religion) {this.religion = religion;}

    public List<String> getRelatedJobPositions() { return relatedJobPositions; }
    public void setRelatedJobPositions(List<String> relatedJobPositions) {
        this.relatedJobPositions.clear();
        if (relatedJobPositions != null) this.relatedJobPositions.addAll(relatedJobPositions);
    }
    public List<String> getTools() { return tools; }
    public void setTools(List<String> tools) {
        this.tools.clear();
        if (tools != null) this.tools.addAll(tools);
    }
    public List<Education> getEducations() { return educations; }
    public List<WorkExperience> getWorkExperiences() { return workExperiences; }
    public List<Portfolio> getPortfolios() { return portfolios; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public String getLanguange() {return languange;}

    public void setLanguange(String languange) {this.languange = languange;}

}
