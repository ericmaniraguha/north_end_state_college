-- +up
CREATE TABLE applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  programme_id INTEGER NOT NULL REFERENCES programmes(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  nrc TEXT NOT NULL,
  intake TEXT NOT NULL DEFAULT 'January 2027',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_applications_programme ON applications(programme_id);
CREATE INDEX idx_applications_status ON applications(status);

-- +down
DROP TABLE applications;
