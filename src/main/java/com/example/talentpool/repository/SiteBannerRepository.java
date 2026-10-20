package com.example.talentpool.repository;

import com.example.talentpool.domain.SiteBanner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SiteBannerRepository extends JpaRepository<SiteBanner, UUID> {
    List<SiteBanner> findByActiveTrueOrderByCategoryAscSequenceAscCreatedAtAsc();
}
