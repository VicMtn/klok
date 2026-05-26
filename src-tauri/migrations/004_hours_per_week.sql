INSERT INTO settings (key, value)
  SELECT 'expected_hours_per_week', CAST(CAST(value AS REAL) * 5 AS TEXT)
  FROM settings WHERE key = 'expected_hours_per_day';

INSERT OR IGNORE INTO settings (key, value) VALUES ('expected_hours_per_week', '37.5');

DELETE FROM settings WHERE key = 'expected_hours_per_day';
