-- Kandidat yang mendaftar lewat portal belum punya status sampai recruiter menentukannya.
ALTER TABLE candidates ALTER COLUMN status DROP NOT NULL;
