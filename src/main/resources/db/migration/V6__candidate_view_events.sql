CREATE TABLE IF NOT EXISTS candidate_view_events (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL,
    view_type VARCHAR(30) NOT NULL,
    viewer_username VARCHAR(200),
    viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidate_view_event_candidate
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_candidate_view_events_candidate_viewed
    ON candidate_view_events(candidate_id, viewed_at DESC);
