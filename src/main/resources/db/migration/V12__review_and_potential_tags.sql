-- Status review kandidat (Belum review / Sudah direview) dan tag potensial per lamaran.
ALTER TABLE candidates ADD COLUMN reviewed boolean NOT NULL DEFAULT false;
ALTER TABLE job_applications ADD COLUMN potential boolean NOT NULL DEFAULT false;
