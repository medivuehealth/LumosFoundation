const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'medivue',
  password: 'postgres', // Using the default password from config
  port: 5432,
});

async function checkSchema() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'journal_entries';
    `);
    console.log('journal_entries table columns:');
    res.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    await client.end();
  }
}

checkSchema(); 