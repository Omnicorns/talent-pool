package com.example.talentpool.repository;

import com.example.talentpool.domain.TalentAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TalentAccountRepository extends JpaRepository<TalentAccount, UUID> {
    Optional<TalentAccount> findByEmailIgnoreCase(String email);
    Optional<TalentAccount> findByCandidateId(UUID candidateId);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByCandidateId(UUID candidateId);
}
