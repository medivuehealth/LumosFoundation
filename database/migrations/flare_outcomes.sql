CREATE TABLE IF NOT EXISTS flare_outcomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prediction_id INTEGER NOT NULL,
    actual_flare BOOLEAN NOT NULL,
    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    symptoms TEXT, -- JSON array of reported symptoms
    severity INTEGER CHECK (severity BETWEEN 1 AND 10),
    duration_days INTEGER,
    notes TEXT,
    FOREIGN KEY (prediction_id) REFERENCES predictions(id)
);

-- Create flare_predictions table
CREATE TABLE IF NOT EXISTS flare_predictions (
    prediction_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    prediction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    prediction_value INTEGER NOT NULL CHECK (prediction_value IN (0, 1)),
    probability DECIMAL(5,4) NOT NULL CHECK (probability >= 0 AND probability <= 1),
    confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    model_version VARCHAR(20),
    features_used JSONB NOT NULL,
    recommendations JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_flare_predictions_user_date 
ON flare_predictions(user_id, prediction_date);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_flare_predictions_updated_at ON flare_predictions;

CREATE TRIGGER update_flare_predictions_updated_at
    BEFORE UPDATE ON flare_predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 