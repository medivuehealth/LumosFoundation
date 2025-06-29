-- Create meal_logs table
CREATE TABLE IF NOT EXISTS meal_logs (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    food_items TEXT NOT NULL,
    portion_sizes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meal_logs_user ON meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_timestamp ON meal_logs(timestamp);

-- Add trigger for updated_at
CREATE TRIGGER update_meal_logs_updated_at
    BEFORE UPDATE ON meal_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 