-- +up
ALTER TABLE applications ADD COLUMN notes TEXT;
ALTER TABLE applications ADD COLUMN reviewed_at TEXT;

-- +down
ALTER TABLE applications DROP COLUMN reviewed_at;
ALTER TABLE applications DROP COLUMN notes;
