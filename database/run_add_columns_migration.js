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

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'add_missing_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration to add missing columns...');
    
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
    
  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    await client.end();
  }
}

runMigration(); 