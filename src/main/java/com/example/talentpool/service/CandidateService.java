package com.example.talentpool.service;

import com.example.talentpool.domain.Candidate;
import com.example.talentpool.domain.CandidateStatus;
import com.example.talentpool.domain.Portfolio;
import com.example.talentpool.domain.PortfolioType;
import com.example.talentpool.domain.HiringStage;
import com.example.talentpool.domain.JobListing;
import com.example.talentpool.dto.*;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.exception.ResourceNotFoundException;
import com.example.talentpool.repository.CandidateRepository;
import com.example.talentpool.repository.JobListingRepository;
import com.example.talentpool.repository.JobApplicationRepository;
import com.example.talentpool.repository.InterviewRepository;
import jakarta.transaction.Transactional;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class CandidateService {
    private final CandidateRepository repository;
    private final CandidateMapper mapper;
    private final FileStorageService storage;
    private final JobListingRepository jobListingRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRepository interviewRepository;
    private final JobApplicationService jobApplicationService;

    public CandidateService(
            CandidateRepository repository,
            CandidateMapper mapper,
            FileStorageService storage,
            JobListingRepository jobListingRepository,
            JobApplicationRepository jobApplicationRepository,
            InterviewRepository interviewRepository,
            JobApplicationService jobApplicationService
    ) {
        this.repository = repository;
        this.mapper = mapper;
        this.storage = storage;
        this.jobListingRepository = jobListingRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.interviewRepository = interviewRepository;
        this.jobApplicationService = jobApplicationService;
    }

    @Transactional
    public CandidateResponse create(
            CandidateUpsertRequest request,
            MultipartFile cv,
            MultipartFile profilePicture,
            List<MultipartFile> portfolioFiles
    ) {
        ensureEmailAvailable(request.email(), null);
        if (cv == null || cv.isEmpty()) throw new BadRequestException("CV wajib diunggah");

        Candidate candidate = new Candidate();
        mapper.apply(candidate, request);
        candidate.setStatus(CandidateStatus.POTENTIAL);
        candidate = repository.saveAndFlush(candidate);

        try {
            attachFiles(candidate, cv, profilePicture, portfolioFiles);
            return mapper.toDetail(repository.save(candidate));
        } catch (RuntimeException ex) {
            repository.delete(candidate);
            throw ex;
        }
    }

    @Transactional
    public CandidateResponse update(
            UUID id,
            CandidateUpsertRequest request,
            MultipartFile cv,
            MultipartFile profilePicture,
            List<MultipartFile> portfolioFiles
    ) {
        Candidate candidate = getEntity(id);
        ensureEmailAvailable(request.email(), id);
        mapper.apply(candidate, request);
        attachFiles(candidate, cv, profilePicture, portfolioFiles);
        return mapper.toDetail(repository.save(candidate));
    }

    @Transactional
    public List<CandidateResponse> bulkImport(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) throw new BadRequestException("Minimal satu CV harus diunggah");
        if (files.size() > 10) throw new BadRequestException("Maksimal 10 CV dalam satu kali import");

        return files.stream().map(file -> {
            Candidate candidate = new Candidate();
            candidate.setFullName(filenameWithoutExtension(file.getOriginalFilename()));
            candidate.setSource("Bulk CV Import");
            candidate.setStatus(CandidateStatus.POTENTIAL);
            candidate.setTermsAccepted(true);
            candidate = repository.saveAndFlush(candidate);
            FileStorageService.StoredFile stored = storage.storeCv(file, candidate.getId());
            candidate.setCvOriginalName(stored.originalName());
            candidate.setCvStoredPath(stored.storedPath());
            return mapper.toDetail(repository.save(candidate));
        }).toList();
    }

    @Transactional
    public CandidateResponse updateStatus(UUID id, StatusUpdateRequest request) {
        Candidate candidate = getEntity(id);
        candidate.setStatus(request.status());
        return mapper.toDetail(repository.save(candidate));
    }

    @Transactional
    public CandidateResponse moveToJobListing(UUID id, MoveToJobListingRequest request) {
        Candidate candidate = getEntity(id);
        if (candidate.getStatus() == CandidateStatus.HIRED) {
            throw new BadRequestException("Kandidat berstatus HIRED tidak dapat dipindahkan kembali ke job listing");
        }

        JobListing job = jobListingRepository.findById(request.jobListingId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job listing tidak ditemukan: " + request.jobListingId()
                ));

        HiringStage stage = HiringStage.fromValue(request.hiringStage());
        jobApplicationService.assign(
                job.getId(),
                candidate.getId(),
                new JobApplicationUpsertRequest(stage, null)
        );

        // Ambil ulang entity setelah JobApplicationService menyinkronkan status,
        // posisi, hiring stage, dan flag movedToJobListing pada kandidat.
        return mapper.toDetail(getEntity(id));
    }

    @Transactional
    public void delete(UUID id) {
        Candidate candidate = getEntity(id);
        storage.deleteQuietly(candidate.getCvStoredPath());
        storage.deleteQuietly(candidate.getProfilePictureStoredPath());
        candidate.getPortfolios().forEach(p -> storage.deleteQuietly(p.getStoredPath()));
        interviewRepository.deleteByCandidateId(id);
        jobApplicationRepository.deleteByCandidateId(id);
        repository.delete(candidate);
    }

    @Transactional
    public CandidateResponse detail(UUID id) {
        return mapper.toDetail(getEntity(id));
    }

    @Transactional
    public Page<CandidateListItemResponse> search(
            String q, String industry, String position, String source, CandidateStatus status, Pageable pageable
    ) {
        return repository.findAll(CandidateSpecifications.filter(q, industry, position, source, status), pageable)
                .map(mapper::toListItem);
    }

    public CandidateSummaryResponse summary() {
        long total = repository.count();
        long active = repository.countByStatusNotIn(EnumSet.of(CandidateStatus.ARCHIVED, CandidateStatus.HIRED));
        long ready = repository.countByStatus(CandidateStatus.AVAILABLE);
        long moved = repository.countByMovedToJobListingTrue();
        return new CandidateSummaryResponse(total, active, ready, moved);
    }

    @Transactional
    public CandidateStatus publicStatus(UUID id) {
        return getEntity(id).getStatus();
    }

    @Transactional
    public DownloadedFile loadCv(UUID id) {
        Candidate candidate = getEntity(id);
        if (candidate.getCvStoredPath() == null) throw new ResourceNotFoundException("CV belum tersedia");
        return new DownloadedFile(
                storage.load(candidate.getCvStoredPath()),
                candidate.getCvOriginalName(),
                mediaType(candidate.getCvOriginalName())
        );
    }

    private Candidate getEntity(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kandidat tidak ditemukan: " + id));
    }

    private void ensureEmailAvailable(String email, UUID currentId) {
        repository.findByEmailIgnoreCase(email).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new BadRequestException("Email kandidat sudah terdaftar");
            }
        });
    }

    private void attachFiles(
            Candidate candidate,
            MultipartFile cv,
            MultipartFile profilePicture,
            List<MultipartFile> portfolioFiles
    ) {
        if (cv != null && !cv.isEmpty()) {
            storage.deleteQuietly(candidate.getCvStoredPath());
            FileStorageService.StoredFile stored = storage.storeCv(cv, candidate.getId());
            candidate.setCvOriginalName(stored.originalName());
            candidate.setCvStoredPath(stored.storedPath());
        }
        if (profilePicture != null && !profilePicture.isEmpty()) {
            storage.deleteQuietly(candidate.getProfilePictureStoredPath());
            FileStorageService.StoredFile stored = storage.storeProfilePicture(profilePicture, candidate.getId());
            candidate.setProfilePictureOriginalName(stored.originalName());
            candidate.setProfilePictureStoredPath(stored.storedPath());
        }
        if (portfolioFiles != null) {
            portfolioFiles.stream().filter(file -> file != null && !file.isEmpty()).forEach(file -> {
                FileStorageService.StoredFile stored = storage.storePortfolio(file, candidate.getId());
                Portfolio portfolio = new Portfolio();
                portfolio.setType(PortfolioType.FILE);
                portfolio.setTitle(stored.originalName());
                portfolio.setOriginalName(stored.originalName());
                portfolio.setStoredPath(stored.storedPath());
                candidate.addPortfolio(portfolio);
            });
        }
    }

    private String filenameWithoutExtension(String filename) {
        if (filename == null || filename.isBlank()) return "Kandidat Baru";
        String clean = filename.replace('_', ' ').replace('-', ' ').trim();
        int dot = clean.lastIndexOf('.');
        return dot > 0 ? clean.substring(0, dot) : clean;
    }

    private MediaType mediaType(String filename) {
        if (filename == null) return MediaType.APPLICATION_OCTET_STREAM;
        String lower = filename.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".pdf")) return MediaType.APPLICATION_PDF;
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    public record DownloadedFile(Resource resource, String filename, MediaType mediaType) {}
}
