const bcrypt = require('bcrypt');
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

async function resetPasswords() {
    try {
        // Hash passwords
        const saltRounds = 10;
        const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);
        const demoPasswordHash = await bcrypt.hash('demo123', saltRounds);

        // Update admin123 user
        await pool.query(
            'UPDATE users SET password_hash = $1 WHERE username = $2',
            [adminPasswordHash, 'admin123']
        );
        console.log('Successfully reset password for admin123');

        // Update demo123 user
        await pool.query(
            'UPDATE users SET password_hash = $1 WHERE username = $2',
            [demoPasswordHash, 'demo123']
        );
        console.log('Successfully reset password for demo123');

        console.log('Password reset complete!');
    } catch (err) {
        console.error('Error resetting passwords:', err);
    } finally {
        await pool.end();
    }
}

resetPasswords(); 