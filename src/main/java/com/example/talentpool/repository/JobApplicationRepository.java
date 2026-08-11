package com.example.talentpool.repository;

import com.example.talentpool.domain.HiringStage;
import com.example.talentpool.domain.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    Optional<JobApplication> findByCandidateIdAndJobListingId(UUID candidateId, UUID jobListingId);
    Optional<JobApplication> findFirstByCandidateIdOrderByUpdatedAtDesc(UUID candidateId);
    Page<JobApplication> findByJobListingId(UUID jobListingId, Pageable pageable);
    long countByJobListingId(UUID jobListingId);
    long countByStage(HiringStage stage);
    boolean existsByJobListingId(UUID jobListingId);
    void deleteByCandidateId(UUID candidateId);

    @Query("select a.stage, count(a) from JobApplication a group by a.stage")
    List<Object[]> countGroupedByStage();
}
