-- MediVue Health Database Schema

-- Enable encryption for future use
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_medical_history_updated_at ON medical_history;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL CHECK (length(username) <= 12 AND username !~ '.*\s.*' AND username ~ '^[a-zA-Z0-9]+$'),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    display_name TEXT,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    phone_number TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    mfa_secret TEXT,
    password_last_changed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_locked BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Roles table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Medical History table
CREATE TABLE IF NOT EXISTS medical_history (
    history_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    diagnosis TEXT,
    diagnosis_date DATE,
    current_medications TEXT,
    allergies TEXT,
    previous_surgeries TEXT,
    family_history TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Journal Entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    entry_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    entry_date DATE NOT NULL,
    calories INTEGER,
    protein REAL,
    carbs REAL,
    fiber REAL,
    has_allergens BOOLEAN,
    meals_per_day INTEGER,
    hydration_level INTEGER CHECK (hydration_level BETWEEN 0 AND 10),
    bowel_frequency INTEGER,
    bristol_scale INTEGER CHECK (bristol_scale BETWEEN 1 AND 7),
    urgency_level INTEGER CHECK (urgency_level BETWEEN 0 AND 10),
    blood_present BOOLEAN,
    pain_location TEXT CHECK (pain_location IN ('None', 'full_abdomen', 'lower_abdomen', 'upper_abdomen')),
    pain_severity INTEGER CHECK (pain_severity BETWEEN 0 AND 10),
    pain_time TEXT CHECK (pain_time IN ('None', 'morning', 'afternoon', 'evening', 'night', 'variable')),
    medication_taken BOOLEAN,
    medication_type TEXT CHECK (medication_type IN ('None', 'biologic', 'immunosuppressant', 'steroid')),
    dosage_level INTEGER CHECK (dosage_level BETWEEN 0 AND 5),
    sleep_hours INTEGER,
    stress_level INTEGER CHECK (stress_level BETWEEN 0 AND 10),
    menstruation TEXT CHECK (menstruation IN ('yes', 'no', 'not_applicable')),
    fatigue_level INTEGER CHECK (fatigue_level BETWEEN 0 AND 10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Flare Predictions table
CREATE TABLE IF NOT EXISTS flare_predictions (
    prediction_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    entry_id INTEGER NOT NULL,
    prediction INTEGER CHECK (prediction IN (0, 1)),
    probability REAL CHECK (probability BETWEEN 0 AND 1),
    prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model_version TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (entry_id) REFERENCES journal_entries(entry_id) ON DELETE CASCADE
);

-- Chat History table
CREATE TABLE IF NOT EXISTS chat_history (
    chat_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    is_user_message BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
    reminder_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reminder_type TEXT CHECK (reminder_type IN ('medication', 'appointment', 'general')),
    due_date TIMESTAMP NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Healthcare Providers table
CREATE TABLE IF NOT EXISTS healthcare_providers (
    provider_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    specialty TEXT,
    phone_number TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider_id INTEGER NOT NULL,
    appointment_date TIMESTAMP NOT NULL,
    purpose TEXT,
    notes TEXT,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES healthcare_providers(provider_id) ON DELETE CASCADE
);

-- Search History table
CREATE TABLE IF NOT EXISTS search_history (
    search_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Logs table for application monitoring
CREATE TABLE IF NOT EXISTS logs (
    log_id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    level TEXT CHECK (level IN ('error', 'warn', 'info', 'debug')),
    message TEXT NOT NULL,
    details TEXT,
    user_agent TEXT,
    url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Login History table
CREATE TABLE IF NOT EXISTS login_history (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    logout_type TEXT CHECK (logout_type IN ('manual', 'timeout', 'system')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User Sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create necessary indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id, login_time);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_flare_predictions_user ON flare_predictions(user_id, prediction_date);
CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reminders_user_due ON reminders(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON appointments(user_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id, created_at);

-- Create index for faster log queries
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update timestamp triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_history_updated_at
    BEFORE UPDATE ON medical_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
    BEFORE UPDATE ON reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_providers_updated_at
    BEFORE UPDATE ON healthcare_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 