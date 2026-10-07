ALTER TABLE talent_accounts ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN;
UPDATE talent_accounts SET onboarding_completed = TRUE WHERE onboarding_completed IS NULL;
