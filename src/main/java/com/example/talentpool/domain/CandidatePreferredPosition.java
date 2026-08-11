package com.example.talentpool.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_preferred_positions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidatePreferredPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(name = "position_name", nullable = false, length = 200)
    private String positionName;
}
