package com.example.talentpool.service;

import com.example.talentpool.domain.Candidate;
import com.example.talentpool.domain.CandidateStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public final class CandidateSpecifications {
    private CandidateSpecifications() {}

    public static Specification<Candidate> filter(
            String q, String industry, String position, String source, CandidateStatus status
    ) {
        Specification<Candidate> specification = (root, query, cb) -> cb.conjunction();
        return specification
                .and(textSearch(q))
                .and(hasIndustry(industry))
                .and(hasPosition(position))
                .and(hasSource(source))
                .and(hasStatus(status));
    }

    private static Specification<Candidate> textSearch(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return cb.conjunction();
            String value = "%" + q.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.<String>get("fullName")), value),
                    cb.like(cb.lower(root.<String>get("email")), value),
                    cb.like(cb.lower(root.<String>get("phone")), value)
            );
        };
    }

    private static Specification<Candidate> hasIndustry(String industry) {
        return (root, query, cb) -> {
            if (industry == null || industry.isBlank()) return cb.conjunction();
            query.distinct(true);
            Join<Candidate, String> join = root.join("relatedIndustries", JoinType.LEFT);
            return cb.equal(cb.lower(join), industry.trim().toLowerCase());
        };
    }

    private static Specification<Candidate> hasPosition(String position) {
        return (root, query, cb) -> {
            if (position == null || position.isBlank()) return cb.conjunction();
            query.distinct(true);
            Join<Candidate, String> join = root.join("relatedJobPositions", JoinType.LEFT);
            return cb.equal(cb.lower(join), position.trim().toLowerCase());
        };
    }

    private static Specification<Candidate> hasSource(String source) {
        return (root, query, cb) -> source == null || source.isBlank()
                ? cb.conjunction()
                : cb.equal(cb.lower(root.<String>get("source")), source.trim().toLowerCase());
    }

    private static Specification<Candidate> hasStatus(CandidateStatus status) {
        return (root, query, cb) -> status == null
                ? cb.conjunction()
                : cb.equal(root.<CandidateStatus>get("status"), status);
    }
}
