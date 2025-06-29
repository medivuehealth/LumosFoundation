-- Step 1: Convert menstruation column from boolean to text
-- First, add a temporary column
ALTER TABLE journal_entries 
ADD COLUMN menstruation_new TEXT;

-- Update the temporary column based on the old boolean value
UPDATE journal_entries 
SET menstruation_new = 
  CASE 
    WHEN menstruation IS TRUE THEN 'yes'::TEXT
    WHEN menstruation IS FALSE THEN 'no'::TEXT
    ELSE 'not_applicable'::TEXT
  END;

-- Drop the old column
ALTER TABLE journal_entries 
DROP COLUMN menstruation;

-- Rename the new column
ALTER TABLE journal_entries 
RENAME COLUMN menstruation_new TO menstruation;

-- Add the check constraint
ALTER TABLE journal_entries 
ADD CONSTRAINT check_menstruation_values 
CHECK (menstruation IN ('yes', 'no', 'not_applicable'));

-- Step 2: Add missing columns that don't exist yet
-- Add dosage_level column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS dosage_level INTEGER CHECK (dosage_level BETWEEN 0 AND 5);

-- Add sleep_hours column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS sleep_hours INTEGER;

-- Add stress_level column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS stress_level INTEGER CHECK (stress_level BETWEEN 0 AND 10);

-- Add fatigue_level column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS fatigue_level INTEGER CHECK (fatigue_level BETWEEN 0 AND 10);

-- Step 3: Update existing records to have default values for new columns
UPDATE journal_entries 
SET 
    dosage_level = COALESCE(dosage_level, 0),
    sleep_hours = COALESCE(sleep_hours, 8),
    stress_level = COALESCE(stress_level, 0),
    fatigue_level = COALESCE(fatigue_level, 0)
WHERE dosage_level IS NULL 
   OR sleep_hours IS NULL 
   OR stress_level IS NULL 
   OR fatigue_level IS NULL; 