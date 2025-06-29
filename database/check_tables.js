const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'medivue',
  password: 'postgres',
  port: 5432,
});

async function checkTables() {
  try {
    await client.connect();
    
    // Check what tables exist
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Tables in medivue database:');
    res.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Check if flare_predictions table exists
    const flareCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'flare_predictions';
    `);
    
    if (flareCheck.rows.length > 0) {
      console.log('\n✅ flare_predictions table exists');
    } else {
      console.log('\n❌ flare_predictions table does not exist');
    }
    
    // Check journal_entries table structure again
    const journalCheck = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'journal_entries' AND column_name = 'menstruation';
    `);
    
    if (journalCheck.rows.length > 0) {
      console.log('\nMenstruation column type:', journalCheck.rows[0]);
    } else {
      console.log('\n❌ Menstruation column does not exist');
    }
    
  } catch (err) {
    console.error('Error checking tables:', err);
  } finally {
    await client.end();
  }
}

checkTables(); 