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
        console.log('Reading migration file...');
        const migrationPath = path.join(__dirname, 'migrations', 'update_flare_predictions.sql');
        const migrationSQL = await fs.readFile(migrationPath, 'utf8');
        
        console.log('Running migration...');
        await client.query(migrationSQL);
        
        // Verify the update
        console.log('Verifying schema update...');
        const schemaCheck = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'flare_predictions'
            ORDER BY ordinal_position;
        `);
        console.log('Updated schema:', schemaCheck.rows);
        
        // Check constraints
        const constraintCheck = await client.query(`
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_name = 'flare_predictions';
        `);
        console.log('Updated constraints:', constraintCheck.rows);
        
        // Check indexes
        const indexCheck = await client.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'flare_predictions';
        `);
        console.log('Updated indexes:', indexCheck.rows);
        
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Error running migration:', error);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration(); 