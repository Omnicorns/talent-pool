package com.example.talentpool.service;

import com.example.talentpool.domain.*;
import com.example.talentpool.dto.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Component
public class CandidateMapper {
    public void apply(Candidate candidate, CandidateUpsertRequest request) {
            candidate.setFullName(request.fullName().trim());
            candidate.setEmail(request.email().trim().toLowerCase());
            candidate.setPhone(request.phone().trim());
            candidate.setBirthDate(request.birthDate());
            candidate.setIdentityNumber(trimToNull(request.identityNumber()));

            // =========================
            // TAMBAHAN
            // =========================
            candidate.setLanguange(trimToNull(request.languanges()));
            candidate.setReligion(trimToNull(request.religion()));
            candidate.setJobInterests(cleanList(request.jobInterests()));
            candidate.setPreferredLocations(cleanList(request.preferredLocations()));

            // =========================
            // EXISTING
            // =========================
            candidate.setCitizenIdAddress(trimToNull(request.citizenIdAddress()));

            candidate.setSameAsCitizenIdAddress(
                    request.sameAsCitizenIdAddress()
            );

            candidate.setResidentialAddress(
                    request.sameAsCitizenIdAddress()
                            ? trimToNull(request.citizenIdAddress())
                            : trimToNull(request.residentialAddress())
            );

            candidate.setCurrentSalary(request.currentSalary());
            candidate.setExpectedSalary(request.expectedSalary());

            candidate.setSource(
                    trimToNull(request.source()) == null
                            ? "Website"
                            : request.source().trim()
            );

            candidate.setTermsAccepted(request.termsAccepted());

            candidate.setRelatedIndustries(
                    cleanList(request.relatedIndustries())
            );

            candidate.setRelatedJobPositions(
                    cleanList(request.relatedJobPositions())
            );

            candidate.setTools(
                    cleanList(request.tools())
            );


            // =====================================================
            // EDUCATION
            // =====================================================

            List<Education> educations = safe(request.educations())
                    .stream()
                    .map(item -> {

                        Education education = new Education();

                        education.setType(item.type());
                        education.setLevel(trimToNull(item.level()));
                        education.setInstitution(item.institution().trim());
                        education.setMajor(trimToNull(item.major()));
                        education.setStartYear(item.startYear());
                        education.setEndYear(item.endYear());
                        education.setDescription(
                                trimToNull(item.description())
                        );
                        education.setIpk(item.ipk());

                        return education;
                    })
                    .toList();

            candidate.replaceEducations(educations);


            // =====================================================
            // WORK EXPERIENCE
            // =====================================================

            List<WorkExperience> experiences =
                    safe(request.workExperiences())
                            .stream()
                            .map(item -> {

                                WorkExperience experience =
                                        new WorkExperience();

                                experience.setCompanyName(
                                        item.companyName().trim()
                                );

                                experience.setPosition(
                                        item.position().trim()
                                );

                                experience.setStartDate(
                                        item.startDate()
                                );

                                experience.setEndDate(
                                        item.currentJob()
                                                ? null
                                                : item.endDate()
                                );

                                experience.setCurrentJob(
                                        item.currentJob()
                                );

                                experience.setDescription(
                                        trimToNull(item.description())
                                );

                                return experience;
                            })
                            .toList();

            candidate.replaceWorkExperiences(experiences);


            // =====================================================
            // PORTFOLIO
            // =====================================================

            List<Portfolio> links =
                    safe(request.portfolioLinks())
                            .stream()
                            .map(item -> {

                                Portfolio portfolio =
                                        new Portfolio();

                                portfolio.setType(
                                        PortfolioType.LINK
                                );

                                portfolio.setTitle(
                                        item.title().trim()
                                );

                                portfolio.setUrl(
                                        item.url().trim()
                                );

                                return portfolio;
                            })
                            .toList();

            candidate.replacePortfolioLinks(links);
        }


        // =========================================================
        // DETAIL
        // EXISTING - TIDAK DIUBAH
        // =========================================================

    public CandidateResponse toDetail(Candidate c) {

        return new CandidateResponse(
                c.getId(),
                c.getFullName(),
                c.getEmail(),
                c.getPhone(),
                c.getBirthDate(),

                c.getIdentityNumber(),

                c.getCitizenIdAddress(),
                c.getResidentialAddress(),

                c.isSameAsCitizenIdAddress(),

                c.getCurrentSalary(),
                c.getExpectedSalary(),

                c.getSource(),

                c.getStatus(),

                c.isTermsAccepted(),

                c.isMovedToJobListing(),

                c.getJobPosition(),

                c.getHiringStage(),

                c.getCvOriginalName(),

                c.getProfilePictureOriginalName(),

                // ==============================
                // RELATED INDUSTRIES
                // ==============================
                List.copyOf(
                        c.getRelatedIndustries()
                ),

                // ==============================
                // JOB INTEREST
                // ==============================


                // ==============================
                // RELATED / PREFERRED POSITION
                // ==============================
                List.copyOf(
                        c.getRelatedJobPositions()
                ),

                // ==============================
                // TOOLS
                // ==============================
                List.copyOf(
                        c.getTools()
                ),

                List.copyOf(
                        c.getJobInterests()
                ),

                // ==============================
                // PREFERRED LOCATION
                // ==============================
                List.copyOf(
                        c.getPreferredLocations()
                ),

                // ==============================
                // EDUCATION
                // ==============================
                c.getEducations()
                        .stream()
                        .map(e ->
                                new CandidateResponse.EducationItem(
                                        e.getId(),
                                        e.getType(),
                                        e.getLevel(),
                                        e.getInstitution(),
                                        e.getMajor(),
                                        e.getStartYear(),
                                        e.getEndYear(),
                                        e.getDescription()
                                )
                        )
                        .toList(),

                // ==============================
                // WORK EXPERIENCE
                // ==============================
                c.getWorkExperiences()
                        .stream()
                        .map(w ->
                                new CandidateResponse.WorkExperienceItem(
                                        w.getId(),
                                        w.getCompanyName(),
                                        w.getPosition(),
                                        w.getStartDate(),
                                        w.getEndDate(),
                                        w.isCurrentJob(),
                                        w.getDescription()
                                )
                        )
                        .toList(),

                // ==============================
                // PORTFOLIO
                // ==============================
                c.getPortfolios()
                        .stream()
                        .map(p ->
                                new CandidateResponse.PortfolioItem(
                                        p.getId(),
                                        p.getType(),
                                        p.getTitle(),
                                        p.getUrl(),
                                        p.getOriginalName()
                                )
                        )
                        .toList(),

                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }


        // =========================================================
        // LIST
        // EXISTING - TIDAK DIUBAH
        // =========================================================

        public CandidateListItemResponse toListItem(Candidate c) {

            String relatedPosition =
                    c.getRelatedJobPositions()
                            .stream()
                            .findFirst()
                            .orElse(
                                    c.getJobPosition()
                            );

            String industry =
                    c.getRelatedIndustries()
                            .stream()
                            .findFirst()
                            .orElse(null);

            long months =
                    c.getWorkExperiences()
                            .stream()
                            .mapToLong(w ->
                                    ChronoUnit.MONTHS.between(
                                            w.getStartDate()
                                                    .withDayOfMonth(1),

                                            (
                                                    w.isCurrentJob()
                                                            || w.getEndDate() == null
                                                            ? LocalDate.now()
                                                            : w.getEndDate()
                                            ).withDayOfMonth(1)
                                    )
                            )
                            .filter(value -> value > 0)
                            .sum();

            return new CandidateListItemResponse(
                    c.getId(),
                    c.getFullName(),
                    c.getEmail(),
                    c.getPhone(),
                    relatedPosition,
                    industry,
                    months,
                    c.getExpectedSalary(),
                    c.getStatus(),
                    c.getSource(),
                    c.isMovedToJobListing(),

                    List.copyOf(
                            c.getTools()
                    ),

                    c.getUpdatedAt()
            );
        }


        // =========================================================
        // CLEAN LIST
        // =========================================================

        private List<String> cleanList(List<String> values) {

            if (values == null) {
                return new ArrayList<>();
            }

            return values
                    .stream()
                    .map(String::trim)
                    .filter(value -> !value.isBlank())
                    .distinct()
                    .toList();
        }


        // =========================================================
        // SAFE LIST
        // =========================================================

        private <T> List<T> safe(List<T> values) {

            return values == null
                    ? List.of()
                    : values;
        }


        // =========================================================
        // TRIM TO NULL
        // =========================================================

        private String trimToNull(String value) {

            if (value == null || value.isBlank()) {
                return null;
            }

            return value.trim();
        }
    }


