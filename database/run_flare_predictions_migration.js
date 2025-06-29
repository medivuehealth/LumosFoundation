const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Create database pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'medivue',
    password: 'postgres',
    port: 5432,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        // Check if table exists
        console.log('Checking if flare_predictions table exists...');
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'flare_predictions'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.log('Table does not exist. Creating flare_predictions table...');
            
            // Read and execute the migration SQL
            const migrationPath = path.join(__dirname, 'migrations', 'flare_outcomes.sql');
            const migrationSQL = await fs.readFile(migrationPath, 'utf8');
            
            await client.query('BEGIN');
            await client.query(migrationSQL);
            await client.query('COMMIT');
            
            console.log('Migration completed successfully');
        } else {
            console.log('Table already exists. Checking schema...');
            
            // Check current schema
            const schemaCheck = await client.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'flare_predictions'
                ORDER BY ordinal_position;
            `);
            
            console.log('Current schema:', schemaCheck.rows);
            
            // Check constraints
            const constraintCheck = await client.query(`
                SELECT constraint_name, constraint_type
                FROM information_schema.table_constraints
                WHERE table_name = 'flare_predictions';
            `);
            
            console.log('Current constraints:', constraintCheck.rows);
            
            // Check indexes
            const indexCheck = await client.query(`
                SELECT indexname, indexdef
                FROM pg_indexes
                WHERE tablename = 'flare_predictions';
            `);
            
            console.log('Current indexes:', indexCheck.rows);
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error running migration:', error);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration(); 