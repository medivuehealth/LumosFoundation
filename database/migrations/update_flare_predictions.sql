-- Begin transaction
BEGIN;

-- Backup existing data
CREATE TEMP TABLE flare_predictions_backup AS 
SELECT * FROM flare_predictions;

-- Drop existing table
DROP TABLE flare_predictions;

-- Create updated table
CREATE TABLE flare_predictions (
    prediction_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,  -- Keep as TEXT to match users table
    journal_entry_id INTEGER NOT NULL,  -- Reference to journal_entries table
    prediction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    prediction_value INTEGER NOT NULL CHECK (prediction_value IN (0, 1)),
    probability DECIMAL(5,4) NOT NULL CHECK (probability >= 0 AND probability <= 1),
    confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    model_version VARCHAR(20),
    features_used JSONB NOT NULL,
    recommendations JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_journal_entry
        FOREIGN KEY (journal_entry_id)
        REFERENCES journal_entries(entry_id)
        ON DELETE CASCADE
);

-- Add indexes for faster lookups
CREATE INDEX idx_flare_predictions_user_date 
ON flare_predictions(user_id, prediction_date);

CREATE INDEX idx_flare_predictions_journal_entry
ON flare_predictions(journal_entry_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_flare_predictions_updated_at
    BEFORE UPDATE ON flare_predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing data
-- Note: Since we don't have journal_entry_id in the old data, 
-- we'll try to match based on user_id and date
INSERT INTO flare_predictions (
    prediction_id,
    user_id,
    journal_entry_id,
    prediction_date,
    prediction_value,
    probability,
    model_version,
    features_used,
    recommendations
)
SELECT 
    fp.prediction_id,
    fp.user_id,
    je.entry_id,  -- Get the corresponding journal entry id
    COALESCE(fp.prediction_date, CURRENT_TIMESTAMP),
    COALESCE(fp.prediction_value, 0),  -- Updated column name
    COALESCE(fp.probability, 0),
    fp.model_version,
    '{}'::JSONB as features_used,
    '[]'::JSONB as recommendations
FROM flare_predictions_backup fp
LEFT JOIN journal_entries je ON 
    je.user_id = fp.user_id AND 
    DATE(je.entry_date) = DATE(fp.prediction_date)
WHERE je.entry_id IS NOT NULL;  -- Only migrate entries that have a matching journal entry

-- Drop temporary table
DROP TABLE flare_predictions_backup;

-- Commit transaction
COMMIT; 