package com.example.talentpool.controller;

import com.example.talentpool.service.TalentPasswordResetMailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.net.URI;
import java.nio.file.Path;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:talent-verify;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.jwt.secret=talent-api-integration-test-secret-at-least-32-characters",
        "app.email-verification.required=true",
        "app.email-verification.resend-cooldown-seconds=0"
})
@AutoConfigureMockMvc
class TalentEmailVerificationApiTest {
    @TempDir static Path root;

    @DynamicPropertySource
    static void storage(DynamicPropertyRegistry registry) {
        registry.add("app.storage.root", () -> root.toString());
    }

    @Autowired
    com.example.talentpool.repository.CandidateRepository candidates;

    @Autowired
    com.example.talentpool.repository.TalentAccountRepository accounts;

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean TalentPasswordResetMailService mailService;

    private String json(Map<String, Object> body) throws Exception {
        return mapper.writeValueAsString(body);
    }

    private String lastToken(String email) {
        ArgumentCaptor<String> url = ArgumentCaptor.forClass(String.class);
        verify(mailService, atLeastOnce()).sendVerificationLink(eq(email), org.mockito.ArgumentMatchers.anyString(), url.capture(), anyLong());
        String query = URI.create(url.getValue()).getRawQuery();
        assertTrue(query.startsWith("token="));
        return query.substring("token=".length());
    }

    @Test
    void registerRequiresVerificationBeforeLogin() throws Exception {
        String email = "verify-flow@example.com";
        mvc.perform(post("/api/talent/auth/register").contentType("application/json").content(json(Map.of(
                        "fullName", "Uji Verifikasi", "email", email, "phone", "081234567890",
                        "password", "TestSecret123!", "termsAccepted", true))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.verificationRequired").value(true))
                .andExpect(jsonPath("$.emailSent").value(true))
                .andExpect(jsonPath("$.auth").doesNotExist());

        String login = json(Map.of("email", email, "password", "TestSecret123!"));
        mvc.perform(post("/api/talent/auth/login").contentType("application/json").content(login))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("EMAIL_NOT_VERIFIED"));

        String token = lastToken(email);
        mvc.perform(post("/api/talent/auth/verify-email").contentType("application/json").content(json(Map.of("token", token))))
                .andExpect(status().isOk());
        // Klik ganda pada link yang sama tetap aman.
        mvc.perform(post("/api/talent/auth/verify-email").contentType("application/json").content(json(Map.of("token", token))))
                .andExpect(status().isOk());

        mvc.perform(post("/api/talent/auth/login").contentType("application/json").content(login))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    void wrongPasswordDoesNotRevealVerificationState() throws Exception {
        String email = "verify-wrong@example.com";
        mvc.perform(post("/api/talent/auth/register").contentType("application/json").content(json(Map.of(
                        "fullName", "Uji Salah", "email", email, "phone", "081234567890",
                        "password", "TestSecret123!", "termsAccepted", true)))).andExpect(status().isCreated());
        mvc.perform(post("/api/talent/auth/login").contentType("application/json")
                        .content(json(Map.of("email", email, "password", "SalahTotal999!"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void invalidTokenIsRejectedAndResendIsGeneric() throws Exception {
        mvc.perform(post("/api/talent/auth/verify-email").contentType("application/json").content(json(Map.of("token", "tidak-ada"))))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/talent/auth/resend-verification").contentType("application/json")
                        .content(json(Map.of("email", "tidak-terdaftar@example.com"))))
                .andExpect(status().isOk());
    }

    @Test
    void failedVerificationEmailRollsBackRegistration() throws Exception {
        String email = "mail-gagal@example.com";
        String body = json(Map.of("fullName", "Uji Rollback", "email", email, "phone", "081234567890",
                "password", "TestSecret123!", "termsAccepted", true));

        doThrow(new com.example.talentpool.exception.MailDeliveryException("SMTP down"))
                .when(mailService).sendVerificationLink(eq(email), anyString(), anyString(), anyLong());
        mvc.perform(post("/api/talent/auth/register").contentType("application/json").content(body))
                .andExpect(status().isServiceUnavailable());

        // Akun tidak tersimpan: login ditolak sebagai kredensial salah (bukan "belum diverifikasi").
        mvc.perform(post("/api/talent/auth/login").contentType("application/json")
                        .content(json(Map.of("email", email, "password", "TestSecret123!"))))
                .andExpect(status().isBadRequest());

        // Setelah SMTP pulih, email yang sama bisa mendaftar lagi (tidak terblokir "sudah terdaftar").
        doNothing().when(mailService).sendVerificationLink(eq(email), anyString(), anyString(), anyLong());
        mvc.perform(post("/api/talent/auth/register").contentType("application/json").content(body))
                .andExpect(status().isCreated());
    }

    @Test
    void candidateIsHiddenFromBackofficeUntilVerifiedAndOnboardingCompleted() throws Exception {
        String email = "belum-verif@example.com";
        mvc.perform(post("/api/talent/auth/register").contentType("application/json").content(json(Map.of(
                        "fullName", "Belum Verif", "email", email, "phone", "081234567890",
                        "password", "TestSecret123!", "termsAccepted", true)))).andExpect(status().isCreated());

        var spec = com.example.talentpool.service.CandidateSpecifications.filter(email, null, null, null, null);
        org.junit.jupiter.api.Assertions.assertTrue(candidates.findAll(spec).isEmpty());

        mvc.perform(post("/api/talent/auth/verify-email").contentType("application/json")
                .content(json(Map.of("token", lastToken(email))))).andExpect(status().isOk());
        // Sudah verifikasi email, tetapi data Talent Pool belum diisi: masih disembunyikan.
        org.junit.jupiter.api.Assertions.assertTrue(candidates.findAll(spec).isEmpty());

        var account = accounts.findByEmailIgnoreCase(email).orElseThrow();
        account.setOnboardingCompleted(true);
        accounts.saveAndFlush(account);
        org.junit.jupiter.api.Assertions.assertEquals(1, candidates.findAll(spec).size());
    }
}
