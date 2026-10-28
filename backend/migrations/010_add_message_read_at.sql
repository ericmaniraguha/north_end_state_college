-- +up
ALTER TABLE contact_messages ADD COLUMN read_at TEXT;

-- +down
ALTER TABLE contact_messages DROP COLUMN read_at;
