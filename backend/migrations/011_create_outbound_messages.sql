-- +up
CREATE TABLE outbound_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
  provider TEXT,
  recipient TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('confirmation', 'decision', 'staff_alert', 'reply')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error TEXT,
  application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
  contact_message_id INTEGER REFERENCES contact_messages(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_outbound_application ON outbound_messages(application_id);
CREATE INDEX idx_outbound_contact ON outbound_messages(contact_message_id);

-- +down
DROP TABLE outbound_messages;
