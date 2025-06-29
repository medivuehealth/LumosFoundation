-- Begin transaction
BEGIN;

-- Update flare_predictions table probability column
ALTER TABLE flare_predictions
ALTER COLUMN probability TYPE DECIMAL(5,4) USING (probability::DECIMAL(5,4));

-- Add constraint if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE table_name = 'flare_predictions' 
        AND column_name = 'probability' 
        AND constraint_name = 'flare_predictions_probability_check'
    ) THEN
        ALTER TABLE flare_predictions
        ADD CONSTRAINT flare_predictions_probability_check 
        CHECK (probability >= 0 AND probability <= 1);
    END IF;
END $$;

-- Update predictions table probability column
ALTER TABLE predictions
ALTER COLUMN probability TYPE DECIMAL(5,4) USING (probability::DECIMAL(5,4));

-- Add constraint if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE table_name = 'predictions' 
        AND column_name = 'probability' 
        AND constraint_name = 'predictions_probability_check'
    ) THEN
        ALTER TABLE predictions
        ADD CONSTRAINT predictions_probability_check 
        CHECK (probability >= 0 AND probability <= 1);
    END IF;
END $$;

-- Commit transaction
COMMIT; 