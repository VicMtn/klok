-- Versioned activity rate + worked-days schedule. The daily/weekly target is now
-- computed as reference_hours_per_week × activity_rate (/ worked_days_per_week),
-- resolved per date so a rate change mid-year applies from its effective date on.
CREATE TABLE IF NOT EXISTS activity_periods (
    effective_from       TEXT PRIMARY KEY,   -- 'YYYY-MM-DD', inclusive
    activity_rate        REAL NOT NULL,      -- fraction 0..1
    worked_days_per_week REAL NOT NULL       -- 1..7
);

-- The 100% reference stays a single global setting (not versioned). Carry over the
-- previous expected_hours_per_week value so behaviour is unchanged after upgrade.
INSERT OR IGNORE INTO settings (key, value)
  SELECT 'reference_hours_per_week', value FROM settings WHERE key = 'expected_hours_per_week';
INSERT OR IGNORE INTO settings (key, value) VALUES ('reference_hours_per_week', '37.5');
DELETE FROM settings WHERE key = 'expected_hours_per_week';

-- Default period covering all history = 100% on 5 days, matching the old model.
INSERT OR IGNORE INTO activity_periods (effective_from, activity_rate, worked_days_per_week)
  VALUES ('1970-01-01', 1.0, 5);
