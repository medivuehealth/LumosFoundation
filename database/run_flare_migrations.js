const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config');

// Get the environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env].flarePredictor;

// Create a new pool
const pool = new Pool({
    user: dbConfig.username,
    host: dbConfig.host,
    database: dbConfig.database,
    password: dbConfig.password,
    port: dbConfig.port,
});

async function runMigrations() {
    let client;
    try {
        // Connect to PostgreSQL
        client = await pool.connect();
        console.log('Connected to database.');

        // Read and run the users table migration
        console.log('Creating users table...');
        const usersPath = path.join(__dirname, 'migrations', 'create_users_table.sql');
        const usersSQL = await fs.readFile(usersPath, 'utf8');
        await client.query(usersSQL);
        console.log('Successfully created users table.');

        // Read and run the predictions table migration
        console.log('Creating predictions table...');
        const predictionsPath = path.join(__dirname, 'migrations', 'create_predictions_table.sql');
        const predictionsSQL = await fs.readFile(predictionsPath, 'utf8');
        await client.query(predictionsSQL);
        console.log('Successfully created predictions table.');

        client.release();
        await pool.end();
    } catch (error) {
        console.error('Error running migrations:', error);
        if (client) {
            client.release();
        }
        process.exit(1);
    }
}

runMigrations(); 