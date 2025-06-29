CREATE TABLE IF NOT EXISTS login_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    logout_type VARCHAR(20) CHECK (logout_type IN ('manual', 'timeout', 'session_expired')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;

-- Create trigger
CREATE TRIGGER update_reminders_updated_at
    BEFORE UPDATE ON reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add failed_login_attempts column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'failed_login_attempts'
    ) THEN
        ALTER TABLE users
        ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
    END IF;
END $$; 