ALTER TABLE candidates ADD COLUMN IF NOT EXISTS profile_details TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS supporting_documents TEXT;
ALTER TABLE candidate_educations ADD COLUMN IF NOT EXISTS client_key VARCHAR(80);
ALTER TABLE candidate_work_experiences ADD COLUMN IF NOT EXISTS details TEXT;
