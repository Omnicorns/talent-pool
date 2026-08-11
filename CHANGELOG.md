# Changelog

## 1.1.0

- Menambahkan Dashboard API.
- Menambahkan CRUD Job Listing dan summary.
- Menambahkan relasi kandidat ke lowongan melalui Job Application.
- Menambahkan hiring stage dan application status.
- Menambahkan CRUD Interview, reschedule, cancel, result, serta sinkronisasi hiring stage.
- Menambahkan Reports overview.
- Menambahkan Settings yang tersimpan di database.
- Menambahkan alias `/api/backoffice/candidates` untuk endpoint Talent Pool.
- Menambahkan migration `V2__recruitment_modules.sql`.
- Menyesuaikan konfigurasi database agar dapat dioverride melalui environment variable.

## Pipeline connection fix
- Move Talent Pool to Job Listing now requires `jobListingId`.
- Every move creates or updates a `JobApplication`, so application count and Candidates pipeline stay synchronized.
- Removed the false-success fallback that only changed candidate flags without creating an application.
