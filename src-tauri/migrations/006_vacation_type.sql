-- Distinguish paid annual leave ('paid') from time off drawn on accumulated
-- overtime hours ('overtime'). Existing rows default to paid annual leave.
ALTER TABLE vacations ADD COLUMN type TEXT NOT NULL DEFAULT 'paid';
