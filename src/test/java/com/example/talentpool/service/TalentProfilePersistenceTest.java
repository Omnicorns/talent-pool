package com.example.talentpool.service;
import com.example.talentpool.domain.*;
import com.example.talentpool.dto.*;
import com.example.talentpool.repository.CandidateRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;
import static org.assertj.core.api.Assertions.*;
@DataJpaTest(properties={"spring.flyway.enabled=false","spring.jpa.hibernate.ddl-auto=create-drop"},showSql=false)
class TalentProfilePersistenceTest {
    @Autowired CandidateRepository repository;
    @Autowired EntityManager em;
    @Test void newFieldsAndDocumentOwnershipSurviveReload() {
        ProfileJson json=new ProfileJson(new ObjectMapper().findAndRegisterModules());
        CandidateMapper mapper=new CandidateMapper(json);
        Candidate c=new Candidate();c.setFullName("Persistence Test");c.setEmail("persistence@test.example");
        c.setProfileDetails(json.write(new TalentProfileDetails("Perempuan","10350","Gondangdia","","Instagram","@test",new BigDecimal("7000000"),false,List.of(new TalentProfileDetails.LanguageSkill("language-1","Bahasa Indonesia","Mahir")))));
        c.setSupportingDocuments(json.write(List.of(new SupportingDocumentService.StoredDocument("education:edu-1:diploma","ijazah.pdf","private/path.pdf"))));
        Education education=new Education();education.setType(EducationType.FORMAL);education.setInstitution("Test Institution");education.setClientKey("edu-1");c.replaceEducations(List.of(education));
        WorkExperience work=new WorkExperience();work.setCompanyName("Sarinah");work.setPosition("Analyst");work.setStartDate(LocalDate.of(2022,1,1));work.setCurrentJob(true);work.setDetails(json.write(new WorkDetails("Fulltime","Retail & Consumer Goods",List.of("Data Analysis"),List.of("SQL","Power BI"),"")));c.replaceWorkExperiences(List.of(work));
        var id=repository.saveAndFlush(c).getId();em.clear();var result=mapper.toDetail(repository.findById(id).orElseThrow());
        assertThat(result.profileDetails().expectedSalaryMax()).isEqualByComparingTo("7000000");assertThat(result.educations().get(0).clientKey()).isEqualTo("edu-1");assertThat(result.workExperiences().get(0).details().tools()).containsExactly("SQL","Power BI");assertThat(result.supportingDocuments().get(0).originalName()).isEqualTo("ijazah.pdf");assertThat(json.write(result)).doesNotContain("private/path.pdf");
    }
}
