const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
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

async function createAdminUser() {
    try {
        // Connect to PostgreSQL
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database.');

        // Read and execute the admin user migration
        const adminUserPath = path.join(__dirname, '../database/migrations/create_admin_user.sql');
        const adminUserSql = fs.readFileSync(adminUserPath, 'utf8');
        await client.query(adminUserSql);
        console.log('Default admin user created successfully.');

        // Release the client
        client.release();
        
        // Close the pool
        await pool.end();
        console.log('Database connection closed.');
    } catch (err) {
        console.error('Error creating admin user:', err);
        process.exit(1);
    }
}

createAdminUser(); 