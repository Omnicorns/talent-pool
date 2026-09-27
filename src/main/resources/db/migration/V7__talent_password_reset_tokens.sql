CREATE TABLE IF NOT EXISTS talent_password_reset_tokens (
    id UUID PRIMARY KEY,
    talent_account_id UUID NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_talent_password_reset_account
        FOREIGN KEY (talent_account_id) REFERENCES talent_accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_talent_password_reset_account
    ON talent_password_reset_tokens(talent_account_id);

CREATE INDEX IF NOT EXISTS idx_talent_password_reset_expiry
    ON talent_password_reset_tokens(expires_at);
