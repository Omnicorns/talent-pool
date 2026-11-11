package com.example.talentpool.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Path;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:talent-exec;DB_CLOSE_DELAY=-1", "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=", "spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.jwt.secret=talent-api-integration-test-secret-at-least-32-characters", "app.email-verification.required=false"})
@AutoConfigureMockMvc
class ExecutiveSummaryApiTest {
    @TempDir static Path root;
    @DynamicPropertySource static void storage(DynamicPropertyRegistry registry) { registry.add("app.storage.root", () -> root.toString()); }
    @Autowired MockMvc mvc;

    @Test
    void viewerHanyaBisaMelihatRingkasan() throws Exception {
        var viewer = user("pimpinan").roles("VIEWER");

        mvc.perform(get("/api/backoffice/executive-summary").with(viewer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCandidates").value(0))
                .andExpect(jsonPath("$.reviewedCandidates").value(0))
                .andExpect(jsonPath("$.unreviewedCandidates").value(0))
                .andExpect(jsonPath("$.monthlyGrowth.length()").value(6));

        mvc.perform(get("/api/backoffice/dashboard").with(viewer)).andExpect(status().isForbidden());
        mvc.perform(get("/api/backoffice/candidates").with(viewer)).andExpect(status().isForbidden());
        mvc.perform(get("/api/backoffice/interviews").with(viewer)).andExpect(status().isForbidden());
    }

    @Test
    void recruiterTetapBisaDanTanpaLoginDitolak() throws Exception {
        mvc.perform(get("/api/backoffice/executive-summary").with(user("recruiter").roles("RECRUITER")))
                .andExpect(status().isOk());
        mvc.perform(get("/api/backoffice/executive-summary")).andExpect(status().isUnauthorized());
    }
}
