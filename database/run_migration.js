const { Pool } = require('pg');

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
        // Check current schema
        console.log('Checking current schema...');
        const currentSchema = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'journal_entries' AND column_name = 'menstruation';
        `);
        console.log('Current menstruation column:', currentSchema.rows[0]);

        await client.query('BEGIN');
        console.log('Starting migration...');

        // Drop existing check constraint if it exists
        console.log('Dropping existing check constraint...');
        await client.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM information_schema.table_constraints 
                    WHERE constraint_name = 'check_menstruation_values'
                    AND table_name = 'journal_entries'
                ) THEN
                    ALTER TABLE journal_entries DROP CONSTRAINT check_menstruation_values;
                END IF;
            END $$;
        `);

        // Update existing values to ensure they match our expected format
        console.log('Updating existing values...');
        await client.query(`
            UPDATE journal_entries 
            SET menstruation = 
                CASE menstruation
                    WHEN 'true' THEN 'yes'
                    WHEN 'false' THEN 'no'
                    WHEN 'yes' THEN 'yes'
                    WHEN 'no' THEN 'no'
                    ELSE 'not_applicable'
                END;
        `);

        // Add check constraint
        console.log('Adding check constraint...');
        await client.query(`
            ALTER TABLE journal_entries 
            ADD CONSTRAINT check_menstruation_values 
            CHECK (menstruation IN ('yes', 'no', 'not_applicable'));
        `);

        await client.query('COMMIT');

        // Check updated schema
        console.log('Checking updated schema...');
        const updatedSchema = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'journal_entries' AND column_name = 'menstruation';
        `);
        console.log('Updated menstruation column:', updatedSchema.rows[0]);

        // Check constraints
        console.log('Checking constraints...');
        const constraints = await client.query(`
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_name = 'journal_entries';
        `);
        console.log('Current constraints:', constraints.rows);

        console.log('Migration completed successfully');
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