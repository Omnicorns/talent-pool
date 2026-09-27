package com.example.talentpool.service;

import com.example.talentpool.domain.Candidate;
import com.example.talentpool.domain.CandidateViewEvent;
import com.example.talentpool.domain.CandidateViewType;
import com.example.talentpool.dto.TalentActivityResponse;
import com.example.talentpool.exception.ResourceNotFoundException;
import com.example.talentpool.repository.CandidateRepository;
import com.example.talentpool.repository.CandidateViewEventRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class CandidateViewService {
    private final CandidateViewEventRepository repository;
    private final CandidateRepository candidateRepository;

    public CandidateViewService(CandidateViewEventRepository repository, CandidateRepository candidateRepository) {
        this.repository = repository;
        this.candidateRepository = candidateRepository;
    }

    @Transactional
    public void record(UUID candidateId, CandidateViewType type, String viewerUsername) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Kandidat tidak ditemukan: " + candidateId));
        CandidateViewEvent event = new CandidateViewEvent();
        event.setCandidate(candidate);
        event.setViewType(type);
        event.setViewerUsername(viewerUsername);
        repository.save(event);
    }

    @Transactional
    public List<TalentActivityResponse> recent(UUID candidateId) {
        return repository.findTop20ByCandidateIdOrderByViewedAtDesc(candidateId).stream()
                .map(event -> new TalentActivityResponse(
                        event.getId(),
                        event.getViewType(),
                        event.getViewType() == CandidateViewType.CV_VIEW
                                ? "CV Anda dilihat oleh tim rekrutmen."
                                : "Profil Anda dilihat oleh tim rekrutmen.",
                        event.getViewedAt()))
                .toList();
    }
}
