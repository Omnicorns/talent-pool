package com.example.talentpool.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Path;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:talent-review;DB_CLOSE_DELAY=-1", "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=", "spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.jwt.secret=talent-api-integration-test-secret-at-least-32-characters", "app.email-verification.required=false"})
@AutoConfigureMockMvc
class BackofficeReviewTagApiTest {
    @TempDir static Path root;
    @DynamicPropertySource static void storage(DynamicPropertyRegistry registry) { registry.add("app.storage.root", () -> root.toString()); }
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    @Test
    void reviewStatusAndPotentialTagPerApplicant() throws Exception {
        var hc = user("recruiter").roles("RECRUITER");
        String candidate = mapper.readTree(mvc.perform(post("/api/talent/auth/register").contentType("application/json").content(mapper.writeValueAsString(
                Map.of("fullName", "Pelamar Uji", "email", "pelamar-uji@example.com", "phone", "081234567890", "password", "TestSecret123!", "termsAccepted", true))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("auth").get("accessToken").asText();
        String candidateId = mapper.readTree(mvc.perform(get("/api/talent/auth/me").header("Authorization", "Bearer " + candidate))
                .andReturn().getResponse().getContentAsString()).get("candidateId").asText();

        String jobId = mapper.readTree(mvc.perform(post("/api/backoffice/job-listings").with(hc).contentType("application/json").content(mapper.writeValueAsString(
                Map.of("title", "HC Strategy", "employmentType", "FULL_TIME", "openings", 1, "status", "PUBLISHED"))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).get("id").asText();

        String applicationId = mapper.readTree(mvc.perform(post("/api/backoffice/job-listings/" + jobId + "/candidates/" + candidateId).with(hc))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.potential").value(false)).andReturn().getResponse().getContentAsString()).get("id").asText();

        mvc.perform(get("/api/backoffice/job-listings/" + jobId + "/applications").with(hc))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].candidate.fullName").value("Pelamar Uji"))
                .andExpect(jsonPath("$.content[0].candidate.reviewed").value(false))
                .andExpect(jsonPath("$.content[0].potential").value(false));

        mvc.perform(patch("/api/backoffice/applications/" + applicationId + "/potential").with(hc).contentType("application/json").content("{\"potential\":true}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.potential").value(true));
        mvc.perform(patch("/api/backoffice/candidates/" + candidateId + "/review").with(hc).contentType("application/json").content("{\"reviewed\":true}"))
                .andExpect(status().isOk());

        mvc.perform(get("/api/backoffice/job-listings/" + jobId + "/applications").with(hc))
                .andExpect(jsonPath("$.content[0].potential").value(true))
                .andExpect(jsonPath("$.content[0].candidate.reviewed").value(true));
        mvc.perform(get("/api/backoffice/candidates").with(hc))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].reviewed").value(true));
    }
}
