package com.example.talentpool.domain;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_preferred_locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidatePreferredLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(name = "location", nullable = false, length = 150)
    private String location;
}
