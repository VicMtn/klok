-- Consolidate the three special-day tables (holidays, vacations, sick_days)
-- into one. Each date carries exactly one type: holiday | paid | overtime | sick.
CREATE TABLE IF NOT EXISTS special_days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  label TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- Backfill from the legacy tables. On date clashes the first insert wins
-- (INSERT OR IGNORE), so the order below encodes precedence:
-- holiday > vacation (paid/overtime) > sick, matching the on-screen display.
-- The legacy tables are intentionally left in place as a safety net; a later
-- migration can drop them once this schema has proven itself.
INSERT OR IGNORE INTO special_days (date, type, label)
  SELECT date, 'holiday', label FROM holidays;
INSERT OR IGNORE INTO special_days (date, type, label)
  SELECT date, type, NULL FROM vacations;
INSERT OR IGNORE INTO special_days (date, type, label)
  SELECT date, 'sick', NULL FROM sick_days;
