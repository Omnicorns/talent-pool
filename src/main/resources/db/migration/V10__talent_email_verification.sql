ALTER TABLE talent_accounts
    ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;

-- Akun yang sudah ada sebelum fitur ini dianggap terverifikasi agar kandidat lama tidak terkunci.
UPDATE talent_accounts
   SET email_verified_at = COALESCE(created_at, CURRENT_TIMESTAMP)
 WHERE email_verified_at IS NULL;

CREATE TABLE IF NOT EXISTS talent_email_verification_tokens (
    id UUID PRIMARY KEY,
    talent_account_id UUID NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_talent_email_verification_account
        FOREIGN KEY (talent_account_id) REFERENCES talent_accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_talent_email_verification_account
    ON talent_email_verification_tokens(talent_account_id);

CREATE INDEX IF NOT EXISTS idx_talent_email_verification_expiry
    ON talent_email_verification_tokens(expires_at);
