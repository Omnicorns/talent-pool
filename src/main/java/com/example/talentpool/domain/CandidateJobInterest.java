package com.example.talentpool.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_job_interests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateJobInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(name = "job_interest", nullable = false, length = 150)
    private String jobInterest;
}
