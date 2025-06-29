const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../database/config');

// Get the environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env].medivue;  // Use the medivue database configuration

// Create a new pool
const pool = new Pool({
    user: dbConfig.username,
    host: dbConfig.host,
    database: dbConfig.database,
    password: dbConfig.password,
    port: dbConfig.port,
});

async function runMigration(client, filePath, description) {
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        await client.query(sql);
        console.log(`${description} completed successfully.`);
    } catch (err) {
        // Log error but continue with other migrations
        console.error(`Error in ${description}:`, err.message);
    }
}

async function runMigrations() {
    let client;
    try {
        // Connect to PostgreSQL
        client = await pool.connect();
        console.log('Connected to PostgreSQL database.');

        // Define migrations to run
        const migrations = [
            {
                path: path.join(__dirname, '../database/schema.sql'),
                description: 'Database schema update'
            },
            {
                path: path.join(__dirname, '../database/migrations/insert_default_roles.sql'),
                description: 'Default roles insertion'
            },
            {
                path: path.join(__dirname, '../database/migrations/create_admin_user.sql'),
                description: 'Default admin user creation'
            },
            {
                path: path.join(__dirname, '../database/migrations/add_failed_login_attempts.sql'),
                description: 'Adding failed_login_attempts column'
            },
            {
                path: path.join(__dirname, '../database/migrations/meal_logs.sql'),
                description: 'Creating meal_logs table'
            }
        ];

        // Run each migration
        for (const migration of migrations) {
            await runMigration(client, migration.path, migration.description);
        }

        console.log('All migrations completed.');
    } catch (err) {
        console.error('Error in migration process:', err.message);
        process.exit(1);
    } finally {
        if (client) {
            client.release();
            await pool.end();
            console.log('Database connection closed.');
        }
    }
}

runMigrations(); 