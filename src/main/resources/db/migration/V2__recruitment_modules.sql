CREATE TABLE IF NOT EXISTS job_listings (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    department VARCHAR(150),
    location VARCHAR(150),
    employment_type VARCHAR(30) NOT NULL,
    description TEXT,
    openings INTEGER NOT NULL DEFAULT 1,
    application_deadline DATE,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_job_listings_status ON job_listings(status);
CREATE INDEX IF NOT EXISTS idx_job_listings_updated_at ON job_listings(updated_at DESC);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_listing_id UUID NOT NULL REFERENCES job_listings(id) ON DELETE RESTRICT,
    stage VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    notes TEXT,
    applied_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_job_application_candidate_job UNIQUE(candidate_id, job_listing_id)
);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_listing_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate ON job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_stage ON job_applications(stage);

CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_listing_id UUID REFERENCES job_listings(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    mode VARCHAR(20) NOT NULL,
    location_or_link VARCHAR(1000),
    interviewer VARCHAR(200) NOT NULL,
    status VARCHAR(30) NOT NULL,
    result VARCHAR(30) NOT NULL,
    notes TEXT,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON interviews(candidate_id);

CREATE TABLE IF NOT EXISTS recruitment_settings (
    id BIGINT PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    default_interview_duration INTEGER NOT NULL DEFAULT 60,
    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Jakarta',
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    candidate_auto_archive_days INTEGER NOT NULL DEFAULT 180,
    updated_at TIMESTAMPTZ NOT NULL
);

INSERT INTO recruitment_settings (
    id, company_name, default_interview_duration, timezone,
    email_notifications, candidate_auto_archive_days, updated_at
)
VALUES (1, 'Talent Pool', 60, 'Asia/Jakarta', TRUE, 180, NOW())
ON CONFLICT (id) DO NOTHING;
