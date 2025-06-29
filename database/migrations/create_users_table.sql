-- Enable encryption for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    phone_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_roles (
    user_id TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Create default admin user
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