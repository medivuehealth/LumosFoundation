-- Create flare predictions table
CREATE TABLE IF NOT EXISTS flare_predictions (
    prediction_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    prediction_value INTEGER NOT NULL CHECK (prediction_value IN (0, 1)),
    probability FLOAT NOT NULL CHECK (probability >= 0 AND probability <= 1),
    features_used JSONB NOT NULL,
    recommendations JSONB,
    prediction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_flare_predictions_user_date 
ON flare_predictions (user_id, prediction_date);

-- Create index for JSON querying
CREATE INDEX IF NOT EXISTS idx_flare_predictions_features 
ON flare_predictions USING GIN (features_used);

-- Add comments
COMMENT ON TABLE flare_predictions IS 'Stores IBD flare predictions from the ML model';
COMMENT ON COLUMN flare_predictions.prediction_value IS '0 for no flare, 1 for flare prediction';
COMMENT ON COLUMN flare_predictions.probability IS 'Probability of flare occurrence (0-1)';
COMMENT ON COLUMN flare_predictions.features_used IS 'JSON containing all input features used for prediction';
COMMENT ON COLUMN flare_predictions.recommendations IS 'JSON array of recommendations based on prediction';

CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prediction_value BOOLEAN NOT NULL,
    probability REAL NOT NULL,
    features_used TEXT NOT NULL, -- JSON object containing all input features
    recommendations TEXT, -- JSON array of recommendation strings
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
); 