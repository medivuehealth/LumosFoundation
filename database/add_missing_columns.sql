-- Add missing columns to journal_entries table
-- This migration adds all the columns that are missing from the current table

-- Add pain_location column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS pain_location TEXT CHECK (pain_location IN ('None', 'full_abdomen', 'lower_abdomen', 'upper_abdomen'));

-- Add pain_severity column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS pain_severity INTEGER CHECK (pain_severity BETWEEN 0 AND 10);

-- Add pain_time column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS pain_time TEXT CHECK (pain_time IN ('None', 'morning', 'afternoon', 'evening', 'night', 'variable'));

-- Add medication_taken column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS medication_taken BOOLEAN;

-- Add medication_type column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS medication_type TEXT CHECK (medication_type IN ('None', 'biologic', 'immunosuppressant', 'steroid'));

-- Add dosage_level column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS dosage_level INTEGER CHECK (dosage_level BETWEEN 0 AND 5);

-- Add sleep_hours column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS sleep_hours INTEGER;

-- Add stress_level column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS stress_level INTEGER CHECK (stress_level BETWEEN 0 AND 10);

-- Add menstruation column (this should already be TEXT from the previous migration)
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS menstruation TEXT CHECK (menstruation IN ('yes', 'no', 'not_applicable'));

-- Add fatigue_level column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS fatigue_level INTEGER CHECK (fatigue_level BETWEEN 0 AND 10);

-- Add notes column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing records to have default values for new columns
UPDATE journal_entries 
SET 
    pain_location = COALESCE(pain_location, 'None'),
    pain_severity = COALESCE(pain_severity, 0),
    pain_time = COALESCE(pain_time, 'None'),
    medication_taken = COALESCE(medication_taken, false),
    medication_type = COALESCE(medication_type, 'None'),
    dosage_level = COALESCE(dosage_level, 0),
    sleep_hours = COALESCE(sleep_hours, 8),
    stress_level = COALESCE(stress_level, 0),
    menstruation = COALESCE(menstruation, 'not_applicable'),
    fatigue_level = COALESCE(fatigue_level, 0),
    notes = COALESCE(notes, '')
WHERE pain_location IS NULL 
   OR pain_severity IS NULL 
   OR pain_time IS NULL 
   OR medication_taken IS NULL 
   OR medication_type IS NULL 
   OR dosage_level IS NULL 
   OR sleep_hours IS NULL 
   OR stress_level IS NULL 
   OR menstruation IS NULL 
   OR fatigue_level IS NULL 
   OR notes IS NULL; 