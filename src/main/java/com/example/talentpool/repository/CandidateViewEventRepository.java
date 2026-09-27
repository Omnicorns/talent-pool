package com.example.talentpool.repository;

import com.example.talentpool.domain.CandidateViewEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CandidateViewEventRepository extends JpaRepository<CandidateViewEvent, UUID> {
    List<CandidateViewEvent> findTop20ByCandidateIdOrderByViewedAtDesc(UUID candidateId);
}
