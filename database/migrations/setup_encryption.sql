-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create function to set encryption key
CREATE OR REPLACE FUNCTION set_encryption_key(key text)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.encryption_key', key, false);
END;
$$ LANGUAGE plpgsql; 