const { Pool } = require('pg');
const config = require('../database/config');

// Get database configuration
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create database pool
const pool = new Pool({
    user: dbConfig.username,
    host: dbConfig.host,
    database: dbConfig.database,
    password: dbConfig.password,
    port: dbConfig.port,
});

async function verifyMealLogsTable() {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database.');

        // Check if meal_logs table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'meal_logs'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.log('meal_logs table does not exist. Creating it...');
            
            // Create the meal_logs table
            await client.query(`
                CREATE TABLE IF NOT EXISTS meal_logs (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
                    food_items TEXT NOT NULL,
                    portion_sizes TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    notes TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                );

                -- Create indexes for better query performance
                CREATE INDEX IF NOT EXISTS idx_meal_logs_user ON meal_logs(user_id);
                CREATE INDEX IF NOT EXISTS idx_meal_logs_timestamp ON meal_logs(timestamp);
            `);

            console.log('meal_logs table created successfully.');
        } else {
            console.log('meal_logs table already exists.');
            
            // Verify the table structure
            const columns = await client.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'meal_logs';
            `);
            
            console.log('Current table structure:', columns.rows);
        }

        client.release();
        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifyMealLogsTable(); 