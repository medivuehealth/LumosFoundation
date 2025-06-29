const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'medivue',
  password: 'postgres',
  port: 5432,
});

async function checkMenstruationColumn() {
  try {
    await client.connect();
    
    // Check if menstruation column exists and its type
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'journal_entries' AND column_name = 'menstruation';
    `);
    
    if (res.rows.length > 0) {
      console.log('Menstruation column found:', res.rows[0]);
    } else {
      console.log('Menstruation column does not exist');
    }
    
    // Check all columns to see the current state
    const allColumns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'journal_entries'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nAll columns in journal_entries table:');
    allColumns.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });
    
  } catch (err) {
    console.error('Error checking menstruation column:', err);
  } finally {
    await client.end();
  }
}

checkMenstruationColumn(); 