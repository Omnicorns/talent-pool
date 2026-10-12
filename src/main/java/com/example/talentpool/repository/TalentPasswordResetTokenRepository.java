package com.example.talentpool.repository;

import com.example.talentpool.domain.TalentPasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TalentPasswordResetTokenRepository extends JpaRepository<TalentPasswordResetToken, UUID> {
    Optional<TalentPasswordResetToken> findByTokenHash(String tokenHash);
    List<TalentPasswordResetToken> findAllByAccountIdAndUsedAtIsNull(UUID accountId);
}
