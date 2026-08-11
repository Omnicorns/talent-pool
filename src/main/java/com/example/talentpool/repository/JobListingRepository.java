package com.example.talentpool.repository;

import com.example.talentpool.domain.JobListing;
import com.example.talentpool.domain.JobListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface JobListingRepository extends JpaRepository<JobListing, UUID>, JpaSpecificationExecutor<JobListing> {
    long countByStatus(JobListingStatus status);
    Optional<JobListing> findFirstByTitleIgnoreCase(String title);
}
