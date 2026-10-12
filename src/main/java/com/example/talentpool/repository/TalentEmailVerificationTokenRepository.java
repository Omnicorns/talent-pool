package com.example.talentpool.repository;

import com.example.talentpool.domain.TalentEmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TalentEmailVerificationTokenRepository extends JpaRepository<TalentEmailVerificationToken, UUID> {
    Optional<TalentEmailVerificationToken> findByTokenHash(String tokenHash);
    List<TalentEmailVerificationToken> findAllByAccountIdAndUsedAtIsNull(UUID accountId);
    Optional<TalentEmailVerificationToken> findFirstByAccountIdOrderByCreatedAtDesc(UUID accountId);
}
