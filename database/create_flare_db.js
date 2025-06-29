const { Client } = require('pg');

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

        // Close connection to postgres database
        await client.end();

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
            CREATE TABLE IF NOT EXISTS flare_predictions (
                prediction_id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                journal_entry_id INTEGER NOT NULL,
                prediction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                prediction_value INTEGER NOT NULL CHECK (prediction_value IN (0, 1)),
                probability DECIMAL(5,4) NOT NULL CHECK (probability >= 0 AND probability <= 1),
                confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
                model_version VARCHAR(20),
                features_used JSONB NOT NULL,
                recommendations JSONB,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            -- Add indexes for faster lookups
            CREATE INDEX IF NOT EXISTS idx_flare_predictions_user_date 
            ON flare_predictions(user_id, prediction_date);

            -- Add trigger to update updated_at timestamp
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            DROP TRIGGER IF EXISTS update_flare_predictions_updated_at ON flare_predictions;

            CREATE TRIGGER update_flare_predictions_updated_at
                BEFORE UPDATE ON flare_predictions
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);

        console.log('Flare predictor tables created successfully');
        await flareClient.end();
        
    } catch (err) {
        console.error('Error managing database:', err);
        throw err;
    } finally {
        try {
            await client.end();
        } catch (e) {
            // Ignore error if client is already closed
        }
    }
}

createFlareDatabase().catch(err => {
    console.error('Failed to create database:', err);
    process.exit(1);
}); 