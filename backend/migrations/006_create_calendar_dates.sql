-- +up
CREATE TABLE calendar_dates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_calendar_dates_date ON calendar_dates(date);

-- +down
DROP TABLE calendar_dates;
