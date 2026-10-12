package com.example.talentpool.service;
import com.example.talentpool.config.StorageProperties;
import com.example.talentpool.domain.*;
import com.example.talentpool.dto.*;
import com.example.talentpool.exception.*;
import com.example.talentpool.repository.CandidateRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import java.nio.file.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
class TalentProfileReferenceTest {
    @TempDir Path root;
    final ProfileJson json=new ProfileJson(new ObjectMapper().findAndRegisterModules());
    FileStorageService storage;
    @BeforeEach void setup(){storage=new FileStorageService(new StorageProperties(root));}
    MockMultipartFile pdf(String name){return new MockMultipartFile("supportingFiles",name,"application/pdf","%PDF-1.7\nTest".getBytes());}
    Candidate candidate(){
        Candidate c=new Candidate();ReflectionTestUtils.setField(c,"id",UUID.randomUUID());
        c.setFullName("Test Kandidat");c.setEmail("test@example.com");c.setPhone("081234567890");c.setBirthDate(LocalDate.of(2000,1,1));c.setCitizenIdAddress("Jl. Test 1");c.setSameAsCitizenIdAddress(true);c.setReligion("Islam");c.setExpectedSalary(new BigDecimal("5000000"));c.setSource("LinkedIn");c.setTermsAccepted(true);c.setCvOriginalName("cv.pdf");c.setJobInterests(List.of("Technology"));c.setPreferredLocations(List.of("Jakarta"));
        String region=new PostalCodeService().search("10350").get(0);
        c.setProfileDetails(json.write(new TalentProfileDetails("Perempuan","10350",region,"","Instagram","@test",new BigDecimal("7000000"),true,List.of(new TalentProfileDetails.LanguageSkill("lang-1","Bahasa Indonesia","Fasih / Native")))));
        Education e=new Education();e.setClientKey("edu-1");e.setType(EducationType.FORMAL);e.setLevel("S1");e.setInstitution("Universitas Indonesia");e.setMajor("Manajemen");e.setStartYear(2018);e.setEndYear(2022);e.setIpk("3.7");c.replaceEducations(List.of(e));
        c.setSupportingDocuments(json.write(List.of(new SupportingDocumentService.StoredDocument("education:edu-1:diploma","ijazah.pdf","a.pdf"),new SupportingDocumentService.StoredDocument("education:edu-1:transcript","transkrip.pdf","b.pdf"))));return c;
    }
    @Test void pdfStoredAndDownloadable(){var file=storage.storeSupportingDocument(pdf("ijazah.PDF"),UUID.randomUUID());assertThat(storage.load(file.storedPath()).exists()).isTrue();assertThat(file.originalName()).isEqualTo("ijazah.PDF");}
    @Test void rejectsPdfNamedFileWithNonPdfBytes(){assertThatThrownBy(()->storage.validateSupportingDocument(new MockMultipartFile("f","ijazah.pdf","application/pdf","invalid".getBytes()))).isInstanceOf(BadRequestException.class);}
    @Test void rejectsOversizedPdfAndWrongExtension(){assertThatThrownBy(()->storage.validateSupportingDocument(new MockMultipartFile("f","a.pdf","application/pdf",new byte[2*1024*1024+1]))).isInstanceOf(BadRequestException.class);assertThatThrownBy(()->storage.validateSupportingDocument(pdf("a.doc"))).isInstanceOf(BadRequestException.class);}
    @Test void acceptsExactlyTwoMegabytes(){byte[] bytes=new byte[2*1024*1024];System.arraycopy("%PDF-".getBytes(),0,bytes,0,5);assertThatCode(()->storage.validateSupportingDocument(new MockMultipartFile("f","a.pdf","application/pdf",bytes))).doesNotThrowAnyException();}
    @Test void completeProfileSupportsNoExperience(){assertThatCode(()->new TalentProfileValidator(json,new PostalCodeService()).validate(candidate())).doesNotThrowAnyException();}
    @Test void missingTranscriptBlocksCompletion(){Candidate c=candidate();c.setSupportingDocuments("[]");assertThatThrownBy(()->new TalentProfileValidator(json,new PostalCodeService()).validate(c)).hasMessageContaining("Ijazah dan transkrip");}
    @Test void backwardsSalaryRangeBlocksCompletion(){Candidate c=candidate();var d=json.read(c.getProfileDetails(),TalentProfileDetails.class);c.setProfileDetails(json.write(new TalentProfileDetails(d.gender(),d.postalCode(),d.region(),"",d.socialPlatform(),d.socialUsername(),new BigDecimal("4000000"),true,d.languageSkills())));assertThatThrownBy(()->new TalentProfileValidator(json,new PostalCodeService()).validate(c)).hasMessageContaining("rentang");}
    @Test void nonexistentPostalCodeIsRejected(){Candidate c=candidate();var d=json.read(c.getProfileDetails(),TalentProfileDetails.class);c.setProfileDetails(json.write(new TalentProfileDetails(d.gender(),"00000","Unknown","",d.socialPlatform(),d.socialUsername(),d.expectedSalaryMax(),true,d.languageSkills())));assertThatThrownBy(()->new TalentProfileValidator(json,new PostalCodeService()).validate(c)).hasMessageContaining("kode pos");}
    @Test void mapperRoundTripAndOldEditorPreserveNewDetails() throws Exception {
        Candidate c=candidate();c.setIdentityNumber("0012345678901234");CandidateMapper mapper=new CandidateMapper(json);
        var request=new ObjectMapper().findAndRegisterModules().readValue("""
            {"fullName":"Test Kandidat","email":"test@example.com","phone":"081234567890","identityNumber":"0012345678901234","termsAccepted":true,"educations":[{"type":"FORMAL","level":"S1","institution":"Universitas Indonesia","major":"Manajemen","startYear":2018,"endYear":2022,"ipk":"3.7"}],"workExperiences":[],"portfolioLinks":[]}
            """,CandidateUpsertRequest.class);
        mapper.apply(c,request);var response=mapper.toDetail(c);assertThat(response.identityNumber()).startsWith("00");assertThat(response.profileDetails().socialUsername()).isEqualTo("@test");assertThat(response.educations().get(0).clientKey()).isEqualTo("edu-1");assertThat(json.write(response)).doesNotContain("storedPath");
    }
    @Test void documentsOwnedByJwtCandidateCannotBeReadByAnotherCandidate(){Candidate c=candidate(),other=new Candidate();CandidateRepository repo=mock(CandidateRepository.class);UUID otherId=UUID.randomUUID();when(repo.findById(otherId)).thenReturn(Optional.of(other));var service=new SupportingDocumentService(repo,storage,json);assertThatThrownBy(()->service.load(otherId,"education:edu-1:diploma")).isInstanceOf(ResourceNotFoundException.class);}
    @Test void rejectsUnknownDocumentOwnerBeforeWritingFiles(){Candidate c=candidate();CandidateRepository repo=mock(CandidateRepository.class);when(repo.findById(c.getId())).thenReturn(Optional.of(c));var service=new SupportingDocumentService(repo,storage,json);assertThatThrownBy(()->service.attach(c.getId(),List.of("education:unknown:diploma"),List.of(pdf("a.pdf")))).isInstanceOf(BadRequestException.class);}
    @Test void metadataAndFileCountMustMatch(){var service=new SupportingDocumentService(mock(CandidateRepository.class),storage,json);assertThatThrownBy(()->service.validateUploads(List.of("education:edu-1:diploma"),List.of())).isInstanceOf(BadRequestException.class);}
}
