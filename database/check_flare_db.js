const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'ibd_flarepredictor',
  password: 'postgres',
  port: 5432,
});

async function checkFlareDB() {
  try {
    await client.connect();
    
    // Check what tables exist
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Tables in ibd_flarepredictor database:');
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
      console.log('\n✅ flare_predictions table exists in ibd_flarepredictor');
    } else {
      console.log('\n❌ flare_predictions table does not exist in ibd_flarepredictor');
    }
    
  } catch (err) {
    console.error('Error checking flare database:', err);
  } finally {
    await client.end();
  }
}

checkFlareDB(); 