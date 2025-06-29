const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../database/config');

async function createMedivueDatabase() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        password: 'postgres',
        port: 5432,
        database: 'postgres' // Connect to default postgres database
    });

    try {
        await client.connect();
        
        // Drop existing connections to the database
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'medivue'
            AND pid <> pg_backend_pid();
        `);

        // Drop and recreate database
        await client.query('DROP DATABASE IF EXISTS medivue');
        await client.query('CREATE DATABASE medivue');
        console.log('Database medivue created successfully');
        
        // Connect to the new database and create schema
        const medivueClient = new Client({
            user: 'postgres',
            host: 'localhost',
            password: 'postgres',
            port: 5432,
            database: 'medivue'
        });
        await medivueClient.connect();
        
        // Read and execute schema
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await medivueClient.query(schemaSql);
        console.log('Medivue schema created successfully');

        // Create logs table
        const logsPath = path.join(__dirname, '../database/migrations/create_logs_table.sql');
        const logsSql = fs.readFileSync(logsPath, 'utf8');
        await medivueClient.query(logsSql);
        console.log('Logs table created successfully in medivue database');
        
        await medivueClient.end();
    } catch (err) {
        console.error('Error creating Medivue database:', err);
        throw err;
    } finally {
        await client.end();
    }
}

async function createFlareDatabase() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        password: 'postgres',
        port: 5432,
        database: 'postgres' // Connect to default postgres database
    });

    try {
        await client.connect();
        
        // Drop existing connections to the database
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'ibd_flarepredictor'
            AND pid <> pg_backend_pid();
        `);

        // Drop and recreate database
        await client.query('DROP DATABASE IF EXISTS ibd_flarepredictor');
        await client.query('CREATE DATABASE ibd_flarepredictor');
        console.log('Database ibd_flarepredictor created successfully');
        
        // Connect to the new database and create schema
        const flareClient = new Client({
            user: 'postgres',
            host: 'localhost',
            password: 'postgres',
            port: 5432,
            database: 'ibd_flarepredictor'
        });
        await flareClient.connect();
        
        // Create tables for flare predictor
        await flareClient.query(`
            CREATE TABLE IF NOT EXISTS patient_data (
                id SERIAL PRIMARY KEY,
                anonymous_id VARCHAR(64),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                age_range VARCHAR(10),
                region VARCHAR(20),
                calories FLOAT,
                protein FLOAT,
                carbs FLOAT,
                fiber FLOAT,
                has_allergens BOOLEAN,
                meals_per_day INTEGER,
                hydration_level INTEGER,
                bowel_frequency INTEGER,
                bristol_scale INTEGER,
                urgency_level INTEGER,
                blood_present BOOLEAN,
                pain_location VARCHAR(50),
                pain_severity INTEGER,
                pain_time VARCHAR(20),
                medication_taken BOOLEAN,
                medication_type VARCHAR(50),
                dosage_level FLOAT,
                sleep_hours FLOAT,
                stress_level INTEGER,
                menstruation BOOLEAN,
                fatigue_level INTEGER,
                de_identified_notes TEXT,
                flare_occurred BOOLEAN
            );

            CREATE TABLE IF NOT EXISTS predictions (
                id SERIAL PRIMARY KEY,
                patient_data_id INTEGER REFERENCES patient_data(id),
                anonymous_id VARCHAR(64),
                prediction BOOLEAN,
                probability FLOAT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS model_metrics (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metric_name VARCHAR(50),
                metric_value FLOAT,
                model_version VARCHAR(20)
            );
        `);
        console.log('Flare predictor schema created successfully');

        // Create logs table
        const logsPath = path.join(__dirname, '../database/migrations/create_logs_table.sql');
        const logsSql = fs.readFileSync(logsPath, 'utf8');
        await flareClient.query(logsSql);
        console.log('Logs table created successfully in flare predictor database');
        
        await flareClient.end();
    } catch (err) {
        console.error('Error creating Flare predictor database:', err);
        throw err;
    } finally {
        await client.end();
    }
}

async function initializeDatabases() {
    try {
        console.log('Starting database initialization...');
        await createMedivueDatabase();
        await createFlareDatabase();
        console.log('Database initialization completed successfully!');
    } catch (err) {
        console.error('Error during database initialization:', err);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabases();
}

module.exports = {
    initializeDatabases,
    createMedivueDatabase,
    createFlareDatabase
}; 