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

    /** Kandidat yang akunnya belum verifikasi email atau belum menyelesaikan pengisian data Talent Pool tidak ditampilkan di back office. */
    String VISIBLE = "not exists (select 1 from TalentAccount a where a.candidate = c and (a.emailVerifiedAt is null or a.onboardingCompleted = false))";

    @Query("select count(c) from Candidate c where " + VISIBLE)
    long countVisible();

    @Query("select count(c) from Candidate c where c.status = :status and " + VISIBLE)
    long countByStatus(@org.springframework.data.repository.query.Param("status") CandidateStatus status);

    @Query("select count(c) from Candidate c where (c.status is null or c.status not in :statuses) and " + VISIBLE)
    long countByStatusNotIn(@org.springframework.data.repository.query.Param("statuses") Collection<CandidateStatus> statuses);

    @Query("select count(c) from Candidate c where c.movedToJobListing = true and " + VISIBLE)
    long countByMovedToJobListingTrue();

    @Query("select c from Candidate c where " + VISIBLE + " order by c.createdAt desc")
    List<Candidate> findRecentVisible(Pageable pageable);

    @Query("select c.status, count(c) from Candidate c where " + VISIBLE + " group by c.status")
    List<Object[]> countGroupedByStatus();

    @Query("select c.source, count(c) from Candidate c where " + VISIBLE + " group by c.source order by count(c) desc")
    List<Object[]> countGroupedBySource();

    @Query("""
    SELECT ji, COUNT(c)
    FROM Candidate c
    JOIN c.jobInterests ji
    WHERE c.id IN (select v.id from Candidate v where not exists (select 1 from TalentAccount a where a.candidate = v and (a.emailVerifiedAt is null or a.onboardingCompleted = false)))
    GROUP BY ji
    ORDER BY COUNT(c) DESC
    """)
    List<Object[]> findTopJobInterests(Pageable pageable);

    @Query("""
            SELECT location, COUNT(c)
            FROM Candidate c
            JOIN c.preferredLocations location
            WHERE location IS NOT NULL
              AND c.id IN (select v.id from Candidate v where not exists (select 1 from TalentAccount a where a.candidate = v and (a.emailVerifiedAt is null or a.onboardingCompleted = false)))
            GROUP BY location
            ORDER BY COUNT(c) DESC
            """)
    List<Object[]> findTopPreferredLocations(Pageable pageable);
}
