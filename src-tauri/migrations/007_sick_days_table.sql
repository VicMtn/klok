-- Sick leave days ("jours de maladie"): paid days off, credited like holidays
-- and neutral to the overtime balance, tracked as their own category.
CREATE TABLE IF NOT EXISTS sick_days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
