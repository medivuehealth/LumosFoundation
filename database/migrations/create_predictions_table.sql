-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    prediction_value BOOLEAN NOT NULL,
    probability REAL NOT NULL CHECK (probability >= 0 AND probability <= 1),
    features_used JSONB NOT NULL,
    recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_predictions_user_date 
ON predictions (user_id, created_at);

-- Create index for JSON querying
CREATE INDEX IF NOT EXISTS idx_predictions_features 
ON predictions USING GIN (features_used);

-- Add comments
COMMENT ON TABLE predictions IS 'Stores predictions from the ML model';
COMMENT ON COLUMN predictions.prediction_value IS 'true for positive prediction, false for negative';
COMMENT ON COLUMN predictions.probability IS 'Probability of prediction (0-1)';
COMMENT ON COLUMN predictions.features_used IS 'JSON containing all input features used for prediction';
COMMENT ON COLUMN predictions.recommendations IS 'JSON array of recommendations based on prediction'; 