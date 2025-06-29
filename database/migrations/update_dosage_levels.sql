-- Begin transaction
BEGIN;

-- First, temporarily remove any constraints on the dosage_level column
ALTER TABLE journal_entries
DROP CONSTRAINT IF EXISTS journal_entries_dosage_level_check;
DROP CONSTRAINT IF EXISTS check_dosage_level_values;

-- Update the dosage_level column to be text type
ALTER TABLE journal_entries 
ALTER COLUMN dosage_level TYPE TEXT;

-- Add check constraint to ensure valid values based on medication type
ALTER TABLE journal_entries
ADD CONSTRAINT check_dosage_level_values
CHECK (
    (medication_type = 'None' AND dosage_level = '0') OR
    (medication_type = 'biologic' AND dosage_level IN ('every_2_weeks', 'every_4_weeks', 'every_8_weeks')) OR
    (medication_type = 'immunosuppressant' AND dosage_level IN ('daily', 'twice_daily', 'weekly')) OR
    (medication_type = 'steroid' AND dosage_level IN ('5', '10', '20'))
);

-- Commit transaction
COMMIT; 