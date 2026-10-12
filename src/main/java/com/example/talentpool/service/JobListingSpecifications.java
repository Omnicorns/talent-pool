package com.example.talentpool.service;

import com.example.talentpool.domain.JobListing;
import com.example.talentpool.domain.JobListingStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class JobListingSpecifications {
    private JobListingSpecifications() {}

    public static Specification<JobListing> filter(String q, JobListingStatus status) {
        return Specification.where(matches(q)).and(hasStatus(status));
    }

    public static Specification<JobListing> publicOpen(String q) {
        return Specification.where(matches(q))
                .and(hasStatus(JobListingStatus.PUBLISHED))
                .and(deadlineStillOpen());
    }

    private static Specification<JobListing> matches(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) return cb.conjunction();
            String pattern = "%" + q.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.<String>get("title")), pattern),
                    cb.like(cb.lower(root.<String>get("department")), pattern),
                    cb.like(cb.lower(root.<String>get("location")), pattern)
            );
        };
    }

    private static Specification<JobListing> hasStatus(JobListingStatus status) {
        return (root, query, cb) -> status == null
                ? cb.conjunction()
                : cb.equal(root.get("status"), status);
    }

    private static Specification<JobListing> deadlineStillOpen() {
        return (root, query, cb) -> cb.or(
                cb.isNull(root.get("applicationDeadline")),
                cb.greaterThanOrEqualTo(root.get("applicationDeadline"), LocalDate.now())
        );
    }
}
