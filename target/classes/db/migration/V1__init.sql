CREATE TABLE candidates (
    id UUID PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(50),
    birth_date DATE,
    identity_number VARCHAR(100),
    citizen_id_address TEXT,
    residential_address TEXT,
    same_as_citizen_id_address BOOLEAN NOT NULL DEFAULT FALSE,
    current_salary NUMERIC(19,2),
    expected_salary NUMERIC(19,2),
    cv_original_name VARCHAR(255),
    cv_stored_path VARCHAR(255),
    profile_picture_original_name VARCHAR(255),
    profile_picture_stored_path VARCHAR(255),
    source VARCHAR(100),
    status VARCHAR(30) NOT NULL,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    moved_to_job_listing BOOLEAN NOT NULL DEFAULT FALSE,
    job_position VARCHAR(200),
    hiring_stage VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX uk_candidates_email_lower
    ON candidates (LOWER(email))
    WHERE email IS NOT NULL;
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_source ON candidates(source);
CREATE INDEX idx_candidates_updated_at ON candidates(updated_at DESC);

CREATE TABLE candidate_related_industries (
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    industry VARCHAR(150) NOT NULL
);
CREATE INDEX idx_candidate_industry ON candidate_related_industries(LOWER(industry));

CREATE TABLE candidate_related_job_positions (
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_position VARCHAR(150) NOT NULL
);
CREATE INDEX idx_candidate_job_position ON candidate_related_job_positions(LOWER(job_position));

CREATE TABLE candidate_tools (
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    tool VARCHAR(150) NOT NULL
);

CREATE TABLE candidate_educations (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    level VARCHAR(100),
    institution VARCHAR(200) NOT NULL,
    major VARCHAR(200),
    start_year INTEGER,
    end_year INTEGER,
    description TEXT
);
CREATE INDEX idx_candidate_educations_candidate ON candidate_educations(candidate_id);

CREATE TABLE candidate_work_experiences (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    position VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    current_job BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT
);
CREATE INDEX idx_candidate_work_candidate ON candidate_work_experiences(candidate_id);

CREATE TABLE candidate_portfolios (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    url VARCHAR(1000),
    original_name VARCHAR(255),
    stored_path VARCHAR(255)
);
CREATE INDEX idx_candidate_portfolios_candidate ON candidate_portfolios(candidate_id);
