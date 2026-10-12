package com.example.talentpool.controller;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import java.nio.file.Path;
import java.util.Map;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:talent-api;DB_CLOSE_DELAY=-1","spring.datasource.driver-class-name=org.h2.Driver","spring.datasource.username=sa","spring.datasource.password=","spring.flyway.enabled=false","spring.jpa.hibernate.ddl-auto=create-drop","app.jwt.secret=talent-api-integration-test-secret-at-least-32-characters"})
@AutoConfigureMockMvc
class TalentProfileApiTest {
    @TempDir static Path root;
    @DynamicPropertySource static void storage(DynamicPropertyRegistry registry){registry.add("app.storage.root",()->root.toString());}
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    String register(String email) throws Exception {
        var response=mvc.perform(post("/api/talent/auth/register").contentType("application/json").content(mapper.writeValueAsString(Map.of("fullName","Test Kandidat","email",email,"phone","081234567890","password","TestSecret123!","termsAccepted",true)))).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return mapper.readTree(response).get("accessToken").asText();
    }
    @Test void multipartProfileDocumentsCompletionAndOwnership() throws Exception {
        String token=register("api-test@example.com");
        mvc.perform(patch("/api/talent/auth/onboarding-complete").header("Authorization","Bearer "+token)).andExpect(status().isBadRequest());
        String region=mapper.readTree(mvc.perform(get("/api/public/postal-codes").param("code","10350")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get(0).asText();
        String payload="""
            {"fullName":"Test Kandidat","email":"api-test@example.com","phone":"081234567890","birthDate":"2000-01-01","identityNumber":"0012345678901234","citizenIdAddress":"Jl. Test 1","sameAsCitizenIdAddress":true,"religion":"Islam","expectedSalary":5000000,"source":"LinkedIn","termsAccepted":true,"relatedIndustries":[],"relatedJobPositions":["Technology"],"tools":[],"jobInterests":["Technology"],"preferredLocations":["Jakarta"],"educations":[{"type":"FORMAL","clientKey":"edu-api","level":"S1","institution":"Test University","major":"Manajemen","startYear":2018,"endYear":2022,"ipk":"3.75"}],"workExperiences":[],"portfolioLinks":[],"profileDetails":{"gender":"Perempuan","postalCode":"10350","region":"REGION_PLACEHOLDER","linkedinUrl":"","socialPlatform":"Instagram","socialUsername":"@test","expectedSalaryMax":7000000,"noExperience":true,"languageSkills":[{"key":"lang-api","name":"Bahasa Indonesia","proficiency":"Mahir"}]}}
            """.replace("REGION_PLACEHOLDER",region);
        MockMultipartFile data=new MockMultipartFile("data","","application/json",payload.getBytes());
        MockMultipartFile keys=new MockMultipartFile("supportingKeys","","application/json","[\"education:edu-api:diploma\",\"education:edu-api:transcript\"]".getBytes());
        var result=mvc.perform(multipart("/api/talent/profile").file(data).file(keys).file(new MockMultipartFile("cv","cv.pdf","application/pdf","%PDF-1.7\nCV".getBytes())).file(new MockMultipartFile("supportingFiles","ijazah.pdf","application/pdf","%PDF-1.7\nDiploma".getBytes())).file(new MockMultipartFile("supportingFiles","transkrip.pdf","application/pdf","%PDF-1.7\nTranscript".getBytes())).with(req->{req.setMethod("PUT");return req;}).header("Authorization","Bearer "+token))
            .andExpect(status().isOk()).andExpect(jsonPath("$.profileDetails.expectedSalaryMax").value(7000000)).andExpect(jsonPath("$.identityNumber").value("0012345678901234")).andExpect(jsonPath("$.supportingDocuments.length()").value(2)).andReturn();
        String id=mapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
        mvc.perform(patch("/api/talent/auth/onboarding-complete").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.onboardingCompleted").value(true));
        mvc.perform(get("/api/talent/profile/documents/education:edu-api:diploma").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(content().contentType("application/pdf"));
        String other=register("other-api-test@example.com");
        mvc.perform(get("/api/talent/profile/documents/education:edu-api:diploma").header("Authorization","Bearer "+other)).andExpect(status().isNotFound());
        mvc.perform(get("/api/backoffice/candidates/"+id+"/documents/education:edu-api:transcript").with(user("recruiter").roles("RECRUITER"))).andExpect(status().isOk());
        mvc.perform(multipart("/api/talent/profile").file(data).file(new MockMultipartFile("supportingKeys","","application/json","[\"education:edu-api:diploma\"]".getBytes())).file(new MockMultipartFile("supportingFiles","fake.pdf","application/pdf","not a PDF".getBytes())).file(new MockMultipartFile("cv","replacement.pdf","application/pdf","%PDF-1.7\nNew CV".getBytes())).with(req->{req.setMethod("PUT");return req;}).header("Authorization","Bearer "+token)).andExpect(status().isBadRequest());
        mvc.perform(multipart("/api/talent/profile").file(new MockMultipartFile("data","","application/json",payload.replace("7000000","4000000").getBytes())).file(new MockMultipartFile("supportingKeys","","application/json","[\"education:edu-api:diploma\"]".getBytes())).file(new MockMultipartFile("supportingFiles","replacement.pdf","application/pdf","%PDF-1.7\nReplacement Diploma".getBytes())).file(new MockMultipartFile("cv","replacement.pdf","application/pdf","%PDF-1.7\nReplacement CV".getBytes())).with(req->{req.setMethod("PUT");return req;}).header("Authorization","Bearer "+token)).andExpect(status().isBadRequest());
        mvc.perform(get("/api/talent/profile/documents/education:edu-api:diploma").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(content().bytes("%PDF-1.7\nDiploma".getBytes()));
        mvc.perform(get("/api/talent/profile/cv").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(content().bytes("%PDF-1.7\nCV".getBytes()));
        mvc.perform(get("/api/talent/profile").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.cvOriginalName").value("cv.pdf")).andExpect(jsonPath("$.supportingDocuments[0].originalName").value("ijazah.pdf"));
    }
}
