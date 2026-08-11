# Talent Pool API — Spring Boot

Backend Talent Pool untuk landing page kandidat dan back office Admin/Recruiter.

## Modul yang tersedia

- Dashboard ringkasan kandidat, lowongan, aplikasi, dan interview.
- Job Listing CRUD, publish/close, daftar pelamar, dan assign kandidat.
- Candidates/Talent Pool: pencarian, filter, detail, update status, upload CV, import CV, dan pindah ke lowongan.
- Interview: jadwal, reschedule, cancel, hasil interview, dan sinkronisasi tahapan kandidat.
- Reports: distribusi status kandidat, sumber kandidat, status lowongan, hiring funnel, dan conversion rate.
- Settings: nama perusahaan, timezone, durasi interview default, notifikasi, dan hari auto archive.

## Teknologi

- Java 17
- Spring Boot 3.5.16
- Spring Web, Validation, Data JPA, Security
- PostgreSQL
- Local file storage `./uploads`
- HTTP Basic untuk back office demo

## Menjalankan

```bash
docker compose up -d
mvn spring-boot:run
```

API berjalan di `http://localhost:8080`.

Akun demo:

- Admin: `admin` / `Admin123!`
- Recruiter: `recruiter` / `Recruiter123!`

Konfigurasi database dapat diubah dengan environment variable:

```bash
DB_URL=jdbc:postgresql://localhost:5432/talent_pool
DB_USERNAME=postgres
DB_PASSWORD=secret
```

Secara default Hibernate memakai `ddl-auto=update`, sehingga tabel modul baru dibuat otomatis. Migration tambahan juga tersedia pada `V2__recruitment_modules.sql` bila Flyway akan digunakan.

## Endpoint Dashboard

```text
GET /api/backoffice/dashboard
```

## Endpoint Job Listing

```text
GET    /api/backoffice/job-listings
GET    /api/backoffice/job-listings/summary
GET    /api/backoffice/job-listings/{id}
POST   /api/backoffice/job-listings
PUT    /api/backoffice/job-listings/{id}
PATCH  /api/backoffice/job-listings/{id}/status
DELETE /api/backoffice/job-listings/{id}

GET  /api/backoffice/job-listings/{id}/applications
POST /api/backoffice/job-listings/{jobId}/candidates/{candidateId}
```

Contoh membuat lowongan:

```json
{
  "title": "Backend Engineer",
  "department": "Technology",
  "location": "Jakarta",
  "employmentType": "FULL_TIME",
  "description": "Mengembangkan API dan integrasi internal",
  "openings": 2,
  "applicationDeadline": "2026-09-30",
  "status": "PUBLISHED"
}
```

Assign kandidat ke lowongan:

```json
{
  "stage": "NEW_CANDIDATE",
  "notes": "Kandidat dari talent pool"
}
```

Update tahapan aplikasi:

```text
PATCH /api/backoffice/applications/{applicationId}/stage
```

```json
{
  "stage": "SCREENING",
  "status": "ACTIVE",
  "notes": "Lolos screening awal"
}
```

Tahapan yang tersedia:

```text
NEW_CANDIDATE, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED
```

## Endpoint Candidates / Talent Pool

Kedua prefix berikut dapat dipakai:

```text
/api/backoffice/candidates
/api/backoffice/talents
```

Endpoint utama:

```text
GET    /api/backoffice/candidates
GET    /api/backoffice/candidates/summary
GET    /api/backoffice/candidates/{id}
POST   /api/backoffice/candidates
PUT    /api/backoffice/candidates/{id}
PATCH  /api/backoffice/candidates/{id}/status
POST   /api/backoffice/candidates/{id}/move-to-job-listing
POST   /api/backoffice/candidates/import
GET    /api/backoffice/candidates/{id}/cv
DELETE /api/backoffice/candidates/{id}
```

Pindah kandidat menggunakan ID lowongan:

```json
{
  "jobListingId": "JOB_LISTING_UUID",
  "hiringStage": "NEW_CANDIDATE"
}
```

Format lama tetap didukung:

```json
{
  "jobPosition": "Backend Engineer",
  "hiringStage": "New Candidates"
}
```

## Endpoint Interview

```text
GET    /api/backoffice/interviews
GET    /api/backoffice/interviews/upcoming
GET    /api/backoffice/interviews/{id}
POST   /api/backoffice/interviews
PUT    /api/backoffice/interviews/{id}
PATCH  /api/backoffice/interviews/{id}/status
DELETE /api/backoffice/interviews/{id}
```

Contoh membuat interview:

```json
{
  "candidateId": "CANDIDATE_UUID",
  "jobListingId": "JOB_LISTING_UUID",
  "scheduledAt": "2026-08-10T03:00:00Z",
  "durationMinutes": 60,
  "mode": "ONLINE",
  "locationOrLink": "https://meet.example.com/interview",
  "interviewer": "Recruiter Sarinah",
  "notes": "Interview teknis"
}
```

`durationMinutes` dapat dikosongkan dan akan memakai nilai default dari Settings.

Update hasil interview:

```json
{
  "status": "COMPLETED",
  "result": "PASSED",
  "feedback": "Lolos ke tahap offering"
}
```

Hasil `PASSED` otomatis memindahkan aplikasi ke `OFFER`, sedangkan `FAILED` memindahkan ke `REJECTED`.

## Endpoint Reports

```text
GET /api/backoffice/reports/overview
```

## Endpoint Settings

```text
GET /api/backoffice/settings
PUT /api/backoffice/settings
```

Update Settings hanya dapat dilakukan role `ADMIN`.

```json
{
  "companyName": "PT Sarinah",
  "defaultInterviewDuration": 60,
  "timezone": "Asia/Jakarta",
  "emailNotifications": true,
  "candidateAutoArchiveDays": 180
}
```

## Endpoint Publik

```text
POST /api/public/talents
GET  /api/public/talents/{id}/status
```

## Catatan production

- Ganti HTTP Basic dengan Keycloak/OIDC atau JWT.
- Gunakan MinIO/S3 bila aplikasi dijalankan lebih dari satu instance.
- Tambahkan antivirus scanning untuk file upload.
- Jangan menggunakan password demo pada environment production.
