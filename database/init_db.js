const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Get the environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env].medivue;  // Use the medivue configuration

// Create a new pool
const pool = new Pool({
    user: dbConfig.username,
    host: dbConfig.host,
    database: 'postgres',  // Connect to default database first
    password: dbConfig.password,
    port: dbConfig.port,
});

// Read and execute the schema SQL
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

async function initDb() {
    try {
        // Connect to PostgreSQL
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database.');

        // Create the database if it doesn't exist
        try {
            await client.query(`CREATE DATABASE ${dbConfig.database}`);
            console.log(`Database ${dbConfig.database} created successfully.`);
        } catch (err) {
            if (err.code === '42P04') {
                console.log(`Database ${dbConfig.database} already exists.`);
            } else {
                throw err;
            }
        }

        // Close connection to postgres database
        await client.end();

        // Create a new pool for the actual database
        const appPool = new Pool({
            user: dbConfig.username,
            host: dbConfig.host,
            database: dbConfig.database,
            password: dbConfig.password,
            port: dbConfig.port,
        });

        // Connect to the new database and create schema
        const appClient = await appPool.connect();
        console.log(`Connected to ${dbConfig.database} database.`);

        // Execute the schema SQL
        await appClient.query(schemaSql);
        console.log('Database schema created successfully.');

        // Release the client
        appClient.release();
        
        // Close the pool
        await appPool.end();
        console.log('Database connection closed.');
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

// Run the initialization
initDb(); 