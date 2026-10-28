-- +up
-- Applications waiting for the applicant to enter the code emailed to them
CREATE TABLE email_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL COLLATE NOCASE,
  code_hash TEXT NOT NULL,
  payload TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  sends INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT NOT NULL,
  last_sent_at TEXT NOT NULL DEFAULT (datetime('now')),
  verified_at TEXT,
  application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_email_verifications_email ON email_verifications(email);

-- Addresses confirmed once; later applications with them skip the code step
CREATE TABLE verified_emails (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  verified_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE applications ADD COLUMN email_verified_at TEXT;

-- +down
ALTER TABLE applications DROP COLUMN email_verified_at;
DROP TABLE verified_emails;
DROP TABLE email_verifications;
