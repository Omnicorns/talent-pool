package com.example.talentpool.dto;

import com.example.talentpool.domain.CandidateViewType;
import java.time.Instant;
import java.util.UUID;

public record TalentActivityResponse(UUID id, CandidateViewType type, String message, Instant viewedAt) {}
