-- +up
CREATE TABLE schools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);
-- No REFERENCES clause: SQLite can't DROP a column that is part of a foreign key,
-- and the down migration needs to remove it.
ALTER TABLE programmes ADD COLUMN school_id INTEGER;
ALTER TABLE programmes ADD COLUMN study_mode TEXT NOT NULL DEFAULT 'Full time';
CREATE INDEX idx_programmes_school ON programmes(school_id);

-- +down
DROP INDEX idx_programmes_school;
ALTER TABLE programmes DROP COLUMN study_mode;
ALTER TABLE programmes DROP COLUMN school_id;
DROP TABLE schools;
