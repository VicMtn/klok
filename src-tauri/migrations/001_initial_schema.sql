CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    arrival TEXT,
    break_start TEXT,
    break_end TEXT,
    departure TEXT,
    comment TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS update_time_entries_updated_at
AFTER UPDATE ON time_entries
FOR EACH ROW
BEGIN
    UPDATE time_entries SET updated_at = datetime('now') WHERE id = OLD.id;
END;
