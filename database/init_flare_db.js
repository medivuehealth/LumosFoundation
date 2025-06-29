const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Get the environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env].flarePredictor;  // Use the flarePredictor configuration

// Create a new pool
const pool = new Pool({
    user: dbConfig.username,
    host: dbConfig.host,
    database: dbConfig.database,
    password: dbConfig.password,
    port: dbConfig.port,
});

async function initFlareDb() {
    try {
        // Connect to PostgreSQL
        const client = await pool.connect();
        console.log('Connected to ibd_flarepredictor database.');

        // Create the flare predictions table
        await client.query(`
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

        console.log('Flare predictor database schema created successfully.');

        // Release the client
        client.release();
        await pool.end();

    } catch (error) {
        console.error('Error initializing flare predictor database:', error);
        throw error;
    }
}

initFlareDb(); 