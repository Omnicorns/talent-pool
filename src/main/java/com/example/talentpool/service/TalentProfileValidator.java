package com.example.talentpool.service;
import com.example.talentpool.domain.*;
import com.example.talentpool.dto.*;
import com.example.talentpool.exception.BadRequestException;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.*;
@Component
public class TalentProfileValidator {
    private final ProfileJson json;
    private final PostalCodeService postalCodes;
    public TalentProfileValidator(ProfileJson json,PostalCodeService postalCodes) { this.json=json; this.postalCodes=postalCodes; }
    public void validate(Candidate c) {
        require(!blank(c.getCvOriginalName()),"Upload CV terlebih dahulu.");
        TalentProfileDetails d=json.read(c.getProfileDetails(),TalentProfileDetails.class);
        require(d!=null,"Lengkapi informasi pribadi dan tambahan.");
        require(!blank(c.getFullName()) && !blank(c.getEmail()) && !blank(c.getPhone()) && c.getPhone().matches("[0-9]{8,15}"),"Nama, email, dan WhatsApp wajib diisi dengan benar.");
        require(blank(c.getIdentityNumber()) || c.getIdentityNumber().matches("[0-9]+"),"Nomor KTP hanya berisi angka.");
        require(c.getBirthDate()!=null && !c.getBirthDate().isAfter(LocalDate.now()) && c.getBirthDate().isAfter(LocalDate.now().minusYears(120)),"Tanggal lahir tidak valid.");
        require(Set.of("Laki-laki","Perempuan").contains(Objects.toString(d.gender(),"")) && !blank(c.getReligion()),"Jenis kelamin dan agama wajib diisi.");
        require(!blank(c.getCitizenIdAddress()) && d.postalCode()!=null && d.postalCode().matches("[0-9]{5}") && postalCodes.search(d.postalCode()).contains(d.region()),"Alamat KTP, kode pos, dan wilayah wajib diisi.");
        require(c.isSameAsCitizenIdAddress() || !blank(c.getResidentialAddress()),"Alamat domisili wajib diisi.");
        require(!blank(d.socialPlatform()) && !blank(d.socialUsername()),"Media sosial dan username wajib diisi.");
        List<Education> education=c.getEducations().stream().filter(e -> e.getType()==EducationType.FORMAL).toList();
        require(!education.isEmpty(),"Tambahkan pendidikan terakhir.");
        Set<String> keys=new HashSet<>();
        Set<String> documents=new HashSet<>();
        SupportingDocumentService.documents(c,json).forEach(doc -> documents.add(doc.key()));
        for(Education e:education) {
            require(!blank(e.getLevel()) && !blank(e.getInstitution()) && !blank(e.getMajor()),"Jenjang, institusi, dan jurusan wajib diisi.");
            require(e.getStartYear()!=null && e.getEndYear()!=null && e.getStartYear()>=1900 && e.getEndYear()>=e.getStartYear() && e.getEndYear()<=LocalDate.now().getYear(),"Tahun pendidikan tidak valid.");
            try { require(new BigDecimal(e.getIpk()).signum()>=0,"IPK / nilai tidak valid."); }
            catch(Exception ex) { throw new BadRequestException("IPK / nilai wajib berupa angka."); }
            require(!blank(e.getClientKey()) && keys.add(e.getClientKey()),"Identitas pendidikan tidak valid.");
            require(documents.contains("education:"+e.getClientKey()+":diploma") && documents.contains("education:"+e.getClientKey()+":transcript"),"Ijazah dan transkrip wajib diunggah untuk setiap pendidikan.");
        }
        require(d.noExperience() ? c.getWorkExperiences().isEmpty() : !c.getWorkExperiences().isEmpty(),"Isi pengalaman kerja atau pilih belum memiliki pengalaman.");
        for(WorkExperience w:c.getWorkExperiences()) {
            WorkDetails wd=json.read(w.getDetails(),WorkDetails.class);
            require(wd!=null && !blank(w.getCompanyName()) && !blank(w.getPosition()) && !blank(w.getDescription()),"Lengkapi perusahaan, posisi, dan deskripsi pengalaman.");
            require(Set.of("Fulltime","Part-time","Contract","Freelance","Internship").contains(Objects.toString(wd.employmentType(),"")) && !blank(wd.industry()) && !empty(wd.skills()) && !empty(wd.tools()),"Status, industri, skill, dan tools pengalaman wajib diisi.");
            require(w.getStartDate()!=null && !w.getStartDate().isAfter(LocalDate.now()) && (w.isCurrentJob() || (w.getEndDate()!=null && !w.getEndDate().isBefore(w.getStartDate()) && !w.getEndDate().isAfter(LocalDate.now()) && !blank(wd.resignReason()))),"Periksa periode kerja dan alasan resign.");
        }
        require(c.getExpectedSalary()!=null && c.getExpectedSalary().signum()>=0 && d.expectedSalaryMax()!=null && d.expectedSalaryMax().compareTo(c.getExpectedSalary())>=0,"Isi rentang ekspektasi gaji yang valid.");
        require(!empty(c.getJobInterests()) && !empty(c.getPreferredLocations()) && !blank(c.getSource()),"Fungsi, lokasi, dan sumber informasi wajib diisi.");
        require(d.languageSkills()!=null && !d.languageSkills().isEmpty(),"Tambahkan bahasa dan tingkat penguasaan.");
        keys.clear();
        for(var l:d.languageSkills()) require(!blank(l.name()) && !blank(l.proficiency()) && !blank(l.key()) && keys.add(l.key()),"Bahasa dan tingkat penguasaan wajib diisi.");
        if(d.trainingCertifications()!=null) for(var cert:d.trainingCertifications()) {
            require(!blank(cert.name()) && !blank(cert.issuingOrganization()) && cert.issueDate()!=null && cert.expiryDate()!=null
                && !cert.expiryDate().isBefore(cert.issueDate()) && !blank(cert.credentialId())
                && (blank(cert.credentialUrl()) || cert.credentialUrl().matches("https?://.+")),
                "Data sertifikat pelatihan tidak valid.");
        }
        require(c.isTermsAccepted(),"Syarat dan ketentuan harus disetujui.");
    }
    private boolean empty(List<String> items) { return items==null || items.isEmpty() || items.stream().anyMatch(this::blank); }
    private boolean blank(String value) { return value==null || value.isBlank(); }
    private void require(boolean condition,String message) { if(!condition) throw new BadRequestException(message); }
}
