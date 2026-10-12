package com.example.talentpool.repository;

import com.example.talentpool.domain.JobApplicationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JobApplicationHistoryRepository extends JpaRepository<JobApplicationHistory, UUID> {
    List<JobApplicationHistory> findByApplicationIdOrderByChangedAtAsc(UUID applicationId);
    void deleteByApplicationId(UUID applicationId);
}
