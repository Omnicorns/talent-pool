package com.example.talentpool.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Path;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:site-language;DB_CLOSE_DELAY=-1", "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=", "spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.jwt.secret=talent-api-integration-test-secret-at-least-32-characters", "app.email-verification.required=false"})
@AutoConfigureMockMvc
class SiteLanguageApiTest {
    @TempDir static Path root;
    @DynamicPropertySource static void storage(DynamicPropertyRegistry registry) { registry.add("app.storage.root", () -> root.toString()); }
    @Autowired MockMvc mvc;

    @Test
    void languageDefaultsToIndonesianAndCanBeChangedByHc() throws Exception {
        var hc = user("recruiter").roles("RECRUITER");
        mvc.perform(get("/api/public/site")).andExpect(status().isOk()).andExpect(jsonPath("$.language").value("id"));

        mvc.perform(put("/api/backoffice/site/language").with(hc).contentType("application/json").content("{\"language\":\"en\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.language").value("en"));
        mvc.perform(get("/api/public/site")).andExpect(status().isOk()).andExpect(jsonPath("$.language").value("en"))
                .andExpect(jsonPath("$.contents.SITE_LANGUAGE").doesNotExist());

        mvc.perform(put("/api/backoffice/site/language").with(hc).contentType("application/json").content("{\"language\":\"fr\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/backoffice/site/language").with(hc)).andExpect(jsonPath("$.language").value("en"));
    }

    @Test
    void candidatesCannotChangeTheLanguage() throws Exception {
        mvc.perform(put("/api/backoffice/site/language").contentType("application/json").content("{\"language\":\"en\"}"))
                .andExpect(status().isUnauthorized());
    }
}
