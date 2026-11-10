package com.example.talentpool.repository;

import com.example.talentpool.domain.TalentAccount;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface TalentAccountRepository extends JpaRepository<TalentAccount, UUID> {
    Optional<TalentAccount> findByEmailIgnoreCase(String email);
    Optional<TalentAccount> findByCandidateId(UUID candidateId);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByCandidateId(UUID candidateId);
    Optional<TalentAccount> findByJobAlertToken(String jobAlertToken);

    /** Penerima email lowongan baru: akun aktif yang belum berhenti berlangganan. Dibaca per halaman. */
    @Query("""
            select a from TalentAccount a join fetch a.candidate
            where a.enabled = true and (a.jobAlertsEnabled is null or a.jobAlertsEnabled = true)
            order by a.createdAt, a.id
            """)
    Slice<TalentAccount> findJobAlertRecipients(Pageable pageable);
}
