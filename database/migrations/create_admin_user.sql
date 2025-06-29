-- Enable encryption for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Create default admin user if not exists
DO $$
BEGIN
    -- First ensure the admin role exists
    INSERT INTO roles (role_name, description)
    VALUES ('admin', 'Administrator with full system access')
    ON CONFLICT (role_name) DO NOTHING;

    -- Create admin user if not exists
    INSERT INTO users (
        user_id,
        username,
        email,
        password_hash,
        first_name,
        last_name,
        display_name,
        date_of_birth,
        gender,
        phone_number,
        address,
        city,
        state,
        country,
        postal_code,
        emergency_contact_name,
        emergency_contact_phone
    )
    VALUES (
        'admin',
        'admin',
        'admin@medivue.health',
        crypt('admin', gen_salt('bf')), -- Using admin as password
        'System',
        'Administrator',
        'System Admin',
        '2000-01-01',
        'prefer_not_to_say',
        '000-000-0000',
        'System Address',
        'System City',
        'System State',
        'System Country',
        '00000',
        'System Emergency',
        '000-000-0000'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        password_hash = crypt('admin', gen_salt('bf')),
        updated_at = CURRENT_TIMESTAMP;

    -- Assign admin role to admin user
    INSERT INTO user_roles (user_id, role_id)
    SELECT 'admin', role_id
    FROM roles
    WHERE role_name = 'admin'
    ON CONFLICT (user_id, role_id) DO NOTHING;
END $$; 