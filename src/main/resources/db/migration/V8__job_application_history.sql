CREATE TABLE IF NOT EXISTS job_application_histories (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL,
    stage VARCHAR(30),
    status VARCHAR(30),
    event_type VARCHAR(40) NOT NULL,
    notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_application_history_application
        FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_job_application_history_application
    ON job_application_histories(application_id, changed_at);
