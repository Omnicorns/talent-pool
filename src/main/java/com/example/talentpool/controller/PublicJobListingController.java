package com.example.talentpool.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.PropertyAccessorFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.talentpool.repository.JobListingRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;



@RestController
@RequestMapping("/api/public/job-listings")
@RequiredArgsConstructor
public class PublicJobListingController {

    private final JobListingRepository jobListingRepository;

    /**
     * =========================================================
     * PUBLIC JOB LISTING
     * =========================================================
     *
     * Contoh:
     *
     * GET /api/public/job-listings
     *
     * GET /api/public/job-listings
     *      ?page=0
     *      &size=100
     *      &sort=updatedAt,desc
     *
     * GET /api/public/job-listings
     *      ?page=0
     *      &size=20
     *      &q=engineer
     *      &sort=updatedAt,desc
     *
     * Hanya menampilkan:
     * - status PUBLISHED
     * - deadline belum lewat
     *
     */
    @GetMapping
    public Map<String, Object> getPublicJobListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "updatedAt,desc") String sort,
            @RequestParam(required = false) String q
    ) {

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        /*
         * Ambil seluruh Job Listing yang sudah ada.
         *
         * Kita filter PUBLISHED di sini supaya tidak tergantung
         * tipe enum/status pada repository.
         *
         * Nanti kalau ingin lebih optimal bisa dibuat query khusus:
         * findByStatus(...)
         */
        List<?> allJobs = jobListingRepository.findAll();

        List<Map<String, Object>> result = new ArrayList<>();

        for (Object job : allJobs) {

            Map<String, Object> item = toPublicResponse(job);

            // =====================================================
            // FILTER STATUS
            // =====================================================

            String status = stringValue(item.get("status"));

            if (!"PUBLISHED".equalsIgnoreCase(status)) {
                continue;
            }

            // =====================================================
            // FILTER DEADLINE
            // =====================================================

            if (!isApplicationStillOpen(
                    item.get("applicationDeadline")
            )) {
                continue;
            }

            // =====================================================
            // SEARCH
            // =====================================================

            if (q != null && !q.isBlank()) {

                String keyword =
                        q.trim().toLowerCase(Locale.ROOT);

                String searchable = String.join(
                        " ",
                        stringValue(item.get("title")),
                        stringValue(item.get("department")),
                        stringValue(item.get("location")),
                        stringValue(item.get("employmentType")),
                        stringValue(item.get("description"))
                ).toLowerCase(Locale.ROOT);

                if (!searchable.contains(keyword)) {
                    continue;
                }
            }

            result.add(item);
        }

        // =========================================================
        // SORT
        // =========================================================

        applySorting(result, sort);

        // =========================================================
        // PAGINATION
        // =========================================================

        long totalElements = result.size();

        int totalPages =
                totalElements == 0
                        ? 0
                        : (int) Math.ceil(
                        (double) totalElements / safeSize
                );

        int fromIndex = safePage * safeSize;

        List<Map<String, Object>> content;

        if (fromIndex >= result.size()) {

            content = List.of();

        } else {

            int toIndex = Math.min(
                    fromIndex + safeSize,
                    result.size()
            );

            content = new ArrayList<>(
                    result.subList(
                            fromIndex,
                            toIndex
                    )
            );
        }

        // =========================================================
        // SPRING PAGE STYLE RESPONSE
        // =========================================================

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("content", content);
        response.put("page", safePage);
        response.put("size", safeSize);
        response.put("totalElements", totalElements);
        response.put("totalPages", totalPages);

        response.put(
                "first",
                safePage == 0
        );

        response.put(
                "last",
                totalPages == 0
                        || safePage >= totalPages - 1
        );

        response.put(
                "numberOfElements",
                content.size()
        );

        response.put(
                "empty",
                content.isEmpty()
        );

        return response;
    }


    /**
     * =========================================================
     * ENTITY -> PUBLIC RESPONSE
     * =========================================================
     *
     * Menggunakan BeanWrapper supaya controller tidak terlalu
     * bergantung pada tipe property entity.
     *
     * Kalau property tidak ada pada entity, otomatis null.
     */
    private Map<String, Object> toPublicResponse(
            Object job
    ) {

        BeanWrapper bean =
                PropertyAccessorFactory
                        .forBeanPropertyAccess(job);

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                read(bean, "id")
        );

        response.put(
                "title",
                simplify(
                        read(bean, "title")
                )
        );

        response.put(
                "department",
                simplify(
                        read(bean, "department")
                )
        );

        response.put(
                "location",
                simplify(
                        read(bean, "location")
                )
        );

        response.put(
                "employmentType",
                simplify(
                        read(bean, "employmentType")
                )
        );

        response.put(
                "description",
                read(bean, "description")
        );

        response.put(
                "requirements",
                read(bean, "requirements")
        );

        response.put(
                "responsibilities",
                read(bean, "responsibilities")
        );

        response.put(
                "openings",
                read(bean, "openings")
        );

        response.put(
                "applicationDeadline",
                read(bean, "applicationDeadline")
        );

        response.put(
                "status",
                simplify(
                        read(bean, "status")
                )
        );

        response.put(
                "createdAt",
                read(bean, "createdAt")
        );

        response.put(
                "updatedAt",
                read(bean, "updatedAt")
        );

        return response;
    }


    /**
     * Baca property entity secara aman.
     */
    private Object read(
            BeanWrapper bean,
            String property
    ) {

        try {

            if (!bean.isReadableProperty(property)) {
                return null;
            }

            return bean.getPropertyValue(property);

        } catch (Exception e) {

            return null;
        }
    }


    /**
     * =========================================================
     * SIMPLIFY RELATION / ENUM
     * =========================================================
     *
     * Contoh:
     *
     * department Entity:
     *
     * {
     *     id: 1,
     *     name: "Information Technology"
     * }
     *
     * Akan dikembalikan menjadi:
     *
     * "Information Technology"
     *
     */
    private Object simplify(Object value) {

        if (value == null) {
            return null;
        }

        // Enum
        if (value instanceof Enum<?>) {
            return ((Enum<?>) value).name();
        }

        // Primitive/string/number
        if (value instanceof String
                || value instanceof Number
                || value instanceof Boolean) {

            return value;
        }

        // Date
        if (value instanceof LocalDate
                || value instanceof LocalDateTime
                || value instanceof OffsetDateTime
                || value instanceof ZonedDateTime) {

            return value;
        }

        try {

            BeanWrapper wrapper =
                    PropertyAccessorFactory
                            .forBeanPropertyAccess(value);

            String[] properties = {
                    "name",
                    "title",
                    "label",
                    "code"
            };

            for (String property : properties) {

                if (wrapper.isReadableProperty(property)) {

                    Object result =
                            wrapper.getPropertyValue(
                                    property
                            );

                    if (result != null) {
                        return result;
                    }
                }
            }

        } catch (Exception ignored) {
        }

        return String.valueOf(value);
    }


    /**
     * =========================================================
     * CEK DEADLINE
     * =========================================================
     */
    private boolean isApplicationStillOpen(
            Object deadline
    ) {

        if (deadline == null) {
            return true;
        }

        LocalDate today =
                LocalDate.now();

        try {

            if (deadline instanceof LocalDate) {

                return !((LocalDate) deadline)
                        .isBefore(today);
            }

            if (deadline instanceof LocalDateTime) {

                return !((LocalDateTime) deadline)
                        .toLocalDate()
                        .isBefore(today);
            }

            if (deadline instanceof OffsetDateTime) {

                return !((OffsetDateTime) deadline)
                        .toLocalDate()
                        .isBefore(today);
            }

            if (deadline instanceof ZonedDateTime) {

                return !((ZonedDateTime) deadline)
                        .toLocalDate()
                        .isBefore(today);
            }

            String value =
                    String.valueOf(deadline);

            if (value.length() >= 10) {

                LocalDate parsed =
                        LocalDate.parse(
                                value.substring(0, 10)
                        );

                return !parsed.isBefore(today);
            }

        } catch (Exception ignored) {

            // Kalau format deadline tidak dikenali,
            // jangan langsung menyembunyikan job.
            return true;
        }

        return true;
    }


    /**
     * =========================================================
     * SORT
     * =========================================================
     *
     * Mendukung:
     *
     * updatedAt,desc
     * updatedAt,asc
     * title,asc
     * title,desc
     */
    private void applySorting(
            List<Map<String, Object>> data,
            String sort
    ) {

        String sortField = "updatedAt";
        String direction = "desc";

        if (sort != null && !sort.isBlank()) {

            String[] parts =
                    sort.split(",");

            if (parts.length >= 1
                    && !parts[0].isBlank()) {

                sortField =
                        parts[0].trim();
            }

            if (parts.length >= 2
                    && !parts[1].isBlank()) {

                direction =
                        parts[1].trim();
            }
        }

        final String field =
                sortField;

        Comparator<Map<String, Object>> comparator =
                Comparator.comparing(
                        item -> sortableValue(
                                item.get(field)
                        ),
                        Comparator.nullsLast(
                                Comparator.naturalOrder()
                        )
                );

        if ("desc".equalsIgnoreCase(direction)) {

            comparator =
                    comparator.reversed();
        }

        data.sort(comparator);
    }


    /**
     * Ubah nilai menjadi String sortable.
     *
     * LocalDate / LocalDateTime menghasilkan format ISO sehingga
     * tetap aman untuk sorting asc/desc.
     */
    private String sortableValue(
            Object value
    ) {

        if (value == null) {
            return null;
        }

        return String.valueOf(value)
                .toLowerCase(Locale.ROOT);
    }


    private String stringValue(
            Object value
    ) {

        return value == null
                ? ""
                : String.valueOf(value);
    }
}
