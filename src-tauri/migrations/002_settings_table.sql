CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('expected_hours_per_day', '7.5');
INSERT OR IGNORE INTO settings (key, value) VALUES ('week_starts_on', '1');
