-- Insert default roles if they don't exist
INSERT INTO roles (role_name, description)
VALUES 
    ('admin', 'Administrator with full system access'),
    ('user', 'Regular user with standard permissions')
ON CONFLICT (role_name) DO NOTHING; 