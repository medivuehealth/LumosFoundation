const { Pool } = require('pg');
const config = require('../database/config');

// Get the environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create a new pool
const pool = new Pool({
    user: dbConfig.username,
    host: dbConfig.host,
    database: dbConfig.database,
    password: dbConfig.password,
    port: dbConfig.port,
});

async function createLoginHistoryTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS login_history (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) REFERENCES users(user_id),
                login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                logout_time TIMESTAMP WITH TIME ZONE,
                ip_address VARCHAR(45),
                user_agent TEXT,
                logout_type VARCHAR(20) CHECK (logout_type IN ('manual', 'timeout', 'session_expired')),
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);
        console.log('Successfully created login_history table');
    } catch (err) {
        console.error('Error creating login_history table:', err);
    } finally {
        await pool.end();
    }
}

createLoginHistoryTable(); 