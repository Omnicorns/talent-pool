package com.example.talentpool.repository;

import com.example.talentpool.domain.Interview;
import com.example.talentpool.domain.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface InterviewRepository extends JpaRepository<Interview, UUID>, JpaSpecificationExecutor<Interview> {
    long countByStatusAndScheduledAtAfter(InterviewStatus status, Instant after);
    long countByStatusAndScheduledAtBetween(InterviewStatus status, Instant from, Instant to);
    List<Interview> findTop5ByStatusAndScheduledAtAfterOrderByScheduledAtAsc(InterviewStatus status, Instant after);
    boolean existsByJobListingId(UUID jobListingId);
    void deleteByCandidateId(UUID candidateId);
}
