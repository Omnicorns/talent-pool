package com.example.talentpool.domain;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "candidate_educations")
public class Education {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EducationType type;

    @Column(length = 100)
    private String level;

    @Column(nullable = false, length = 200)
    private String institution;

    @Column(length = 200)
    private String major;

    @Column(name = "start_year")
    private Integer startYear;

    @Column(name = "end_year")
    private Integer endYear;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name ="ipk")
    private String ipk;




    public UUID getId() { return id; }
    public Candidate getCandidate() { return candidate; }
    public void setCandidate(Candidate candidate) { this.candidate = candidate; }
    public EducationType getType() { return type; }
    public void setType(EducationType type) { this.type = type; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }
    public String getMajor() { return major; }
    public void setMajor(String major) { this.major = major; }
    public Integer getStartYear() { return startYear; }
    public void setStartYear(Integer startYear) { this.startYear = startYear; }
    public Integer getEndYear() { return endYear; }
    public void setEndYear(Integer endYear) { this.endYear = endYear; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIpk() {
        return ipk;
    }

    public void setIpk(String ipk) {
        this.ipk = ipk;
    }
}
