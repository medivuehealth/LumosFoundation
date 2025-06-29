-- Add failed_login_attempts column to users table
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