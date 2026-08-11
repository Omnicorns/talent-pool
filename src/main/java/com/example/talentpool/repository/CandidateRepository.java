package com.example.talentpool.repository;

import com.example.talentpool.domain.Candidate;
import com.example.talentpool.domain.CandidateStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateRepository extends JpaRepository<Candidate, UUID>, JpaSpecificationExecutor<Candidate> {
    Optional<Candidate> findByEmailIgnoreCase(String email);
    long countByStatus(CandidateStatus status);
    long countByStatusNotIn(Collection<CandidateStatus> statuses);
    long countByMovedToJobListingTrue();
    List<Candidate> findTop5ByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Query("select c.status, count(c) from Candidate c group by c.status")
    List<Object[]> countGroupedByStatus();

    @org.springframework.data.jpa.repository.Query("select c.source, count(c) from Candidate c group by c.source order by count(c) desc")
    List<Object[]> countGroupedBySource();

    @Query("""
    SELECT ji, COUNT(c)
    FROM Candidate c
    JOIN c.jobInterests ji
    GROUP BY ji
    ORDER BY COUNT(c) DESC
    """)
    List<Object[]> findTopJobInterests(Pageable pageable);

    @Query("""
            SELECT location, COUNT(c)
            FROM Candidate c
            JOIN c.preferredLocations location
            WHERE location IS NOT NULL
            GROUP BY location
            ORDER BY COUNT(c) DESC
            """)
    List<Object[]> findTopPreferredLocations(Pageable pageable);
}
