-- +up
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('news', 'event')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT,
  event_date TEXT,
  location TEXT,
  published_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_posts_type ON posts(type, published_at);

-- +down
DROP TABLE posts;
