const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'medivue',
  password: 'postgres',
  port: 5432,
});

async function runFixMigration() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'fix_menstruation_and_add_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration to fix menstruation column and add missing columns...');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('Migration completed successfully!');
    
    // Verify the changes by checking the schema again
    const res = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'journal_entries'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nUpdated journal_entries table columns:');
    res.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });
    
    // Specifically check the menstruation column
    const menstruationCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'journal_entries' AND column_name = 'menstruation';
    `);
    
    if (menstruationCheck.rows.length > 0) {
      console.log('\nMenstruation column status:', menstruationCheck.rows[0]);
    }
    
  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    await client.end();
  }
}

runFixMigration(); 