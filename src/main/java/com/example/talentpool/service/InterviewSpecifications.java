package com.example.talentpool.service;

import com.example.talentpool.domain.Interview;
import com.example.talentpool.domain.InterviewStatus;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;

public final class InterviewSpecifications {
    private InterviewSpecifications() {}

    public static Specification<Interview> filter(String q, InterviewStatus status, Instant from, Instant to) {
        return Specification.where(matches(q))
                .and(hasStatus(status))
                .and(scheduledFrom(from))
                .and(scheduledTo(to));
    }

    private static Specification<Interview> matches(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return cb.conjunction();
            String pattern = "%" + q.trim().toLowerCase() + "%";
            var candidate = root.join("candidate", JoinType.INNER);
            var job = root.join("jobListing", JoinType.LEFT);
            return cb.or(
                    cb.like(cb.lower(candidate.<String>get("fullName")), pattern),
                    cb.like(cb.lower(root.<String>get("interviewer")), pattern),
                    cb.like(cb.lower(job.<String>get("title")), pattern)
            );
        };
    }

    private static Specification<Interview> hasStatus(InterviewStatus status) {
        return (root, query, cb) -> status == null
                ? cb.conjunction()
                : cb.equal(root.get("status"), status);
    }

    private static Specification<Interview> scheduledFrom(Instant from) {
        return (root, query, cb) -> from == null
                ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.<Instant>get("scheduledAt"), from);
    }

    private static Specification<Interview> scheduledTo(Instant to) {
        return (root, query, cb) -> to == null
                ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.<Instant>get("scheduledAt"), to);
    }
}
