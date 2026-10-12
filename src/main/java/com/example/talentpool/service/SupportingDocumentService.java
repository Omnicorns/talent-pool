package com.example.talentpool.service;

import com.example.talentpool.domain.Candidate;
import com.example.talentpool.dto.TalentProfileDetails;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.exception.ResourceNotFoundException;
import com.example.talentpool.repository.CandidateRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.util.*;

@Service
public class SupportingDocumentService {
    private final CandidateRepository repository;
    private final FileStorageService storage;
    private final ProfileJson json;
    public SupportingDocumentService(CandidateRepository repository, FileStorageService storage, ProfileJson json) {
        this.repository=repository; this.storage=storage; this.json=json;
    }
    // Internal paths are never included in CandidateResponse.
    public record StoredDocument(String key, String originalName, String storedPath) {}
    public static List<StoredDocument> documents(Candidate candidate, ProfileJson json) {
        return candidate.getSupportingDocuments() == null ? List.of()
            : json.read(candidate.getSupportingDocuments(), new TypeReference<List<StoredDocument>>() {});
    }
    public void validateUploads(List<String> keys, List<MultipartFile> files) {
        if (keys == null) keys=List.of();
        if (files == null) files=List.of();
        if (keys.size()!=files.size() || keys.size()>60 || new HashSet<>(keys).size()!=keys.size())
            throw new BadRequestException("Daftar dokumen tidak valid");
        for (int i=0;i<keys.size();i++) {
            if (!keys.get(i).matches("(education:[a-zA-Z0-9-]{1,80}:(diploma|transcript)|language:[a-zA-Z0-9-]{1,80}:certificate)"))
                throw new BadRequestException("Jenis dokumen tidak valid");
            storage.validateSupportingDocument(files.get(i));
        }
    }
    public void validateOwners(com.example.talentpool.dto.CandidateUpsertRequest request,List<String> keys) {
        if (keys==null || keys.isEmpty()) return;
        Set<String> owners=new HashSet<>();
        if(request.educations()!=null) request.educations().forEach(e -> {if(e.clientKey()!=null) owners.add("education:"+e.clientKey());});
        if(request.profileDetails()!=null && request.profileDetails().languageSkills()!=null)
            request.profileDetails().languageSkills().forEach(l -> owners.add("language:"+l.key()));
        for(String key:keys) if(!owners.contains(key.substring(0,key.lastIndexOf(':'))))
            throw new BadRequestException("Pemilik dokumen tidak ditemukan");
    }
    @Transactional
    public void attach(UUID candidateId, List<String> keys, List<MultipartFile> files) {
        Candidate candidate=repository.findById(candidateId).orElseThrow(() -> new ResourceNotFoundException("Kandidat tidak ditemukan"));
        Set<String> owners=new HashSet<>();
        candidate.getEducations().forEach(e -> { if(e.getClientKey()!=null) owners.add("education:"+e.getClientKey()); });
        TalentProfileDetails details=json.read(candidate.getProfileDetails(),TalentProfileDetails.class);
        if(details!=null && details.languageSkills()!=null) details.languageSkills().forEach(l -> owners.add("language:"+l.key()));
        List<StoredDocument> docs=new ArrayList<>(documents(candidate,json));
        List<String> removed=new ArrayList<>(), created=new ArrayList<>();
        // Old editors leave profileDetails intact. Deleted entries no longer keep orphaned attachments.
        docs.removeIf(d -> { boolean stale=!owners.contains(d.key().substring(0,d.key().lastIndexOf(':')));
            if(stale) removed.add(d.storedPath()); return stale; });
        if (keys != null) for(String key:keys) {
            if (!owners.contains(key.substring(0,key.lastIndexOf(':')))) throw new BadRequestException("Pemilik dokumen tidak ditemukan");
        }
        try {
            if(keys!=null) for(int i=0;i<keys.size();i++) {
                String key=keys.get(i);
                var file=storage.storeSupportingDocument(files.get(i),candidateId);
                created.add(file.storedPath());
                docs.removeIf(d -> { if(d.key().equals(key)) { removed.add(d.storedPath()); return true; } return false; });
                docs.add(new StoredDocument(key,file.originalName(),file.storedPath()));
            }
            candidate.setSupportingDocuments(json.write(docs));
            repository.save(candidate);
            if(TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override public void afterCompletion(int status) {
                        (status==STATUS_COMMITTED ? removed : created).forEach(storage::deleteQuietly);
                    }
                });
            }
        } catch(RuntimeException ex) { created.forEach(storage::deleteQuietly); throw ex; }
    }
    @Transactional
    public CandidateService.DownloadedFile load(UUID candidateId, String key) {
        Candidate candidate=repository.findById(candidateId).orElseThrow(() -> new ResourceNotFoundException("Kandidat tidak ditemukan"));
        var doc=documents(candidate,json).stream().filter(d -> d.key().equals(key)).findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Dokumen tidak ditemukan"));
        return new CandidateService.DownloadedFile(storage.load(doc.storedPath()),doc.originalName(),org.springframework.http.MediaType.APPLICATION_PDF);
    }
}
