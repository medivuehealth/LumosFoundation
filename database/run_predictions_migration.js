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

async function runMigration() {
    try {
        // Connect to PostgreSQL
        const client = await pool.connect();
        console.log('Connected to database.');

        // Read the migration file
        const migrationPath = path.join(__dirname, 'migrations', 'create_predictions_table.sql');
        const migrationSQL = await fs.readFile(migrationPath, 'utf8');

        // Run the migration
        await client.query(migrationSQL);
        console.log('Successfully created predictions table.');

        client.release();
        await pool.end();
    } catch (error) {
        console.error('Error running migration:', error);
        process.exit(1);
    }
}

runMigration(); 