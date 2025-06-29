-- First, drop any existing foreign key constraints that might reference the column
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_name = 'journal_entries'
    ) THEN
        EXECUTE (
            SELECT 'ALTER TABLE journal_entries DROP CONSTRAINT ' || constraint_name
            FROM information_schema.table_constraints
            WHERE constraint_type = 'FOREIGN KEY'
            AND table_name = 'journal_entries'
            LIMIT 1
        );
    END IF;
END $$;

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