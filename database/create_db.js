const { Client } = require('pg');

async function createDatabase() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        password: 'postgres',
        port: 5432,
        database: 'postgres' // Connect to default postgres database
    });

    try {
        await client.connect();
        
        // Drop existing connections to the database
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'medivue'
            AND pid <> pg_backend_pid();
        `);

        // Drop and recreate database
        await client.query('DROP DATABASE IF EXISTS medivue');
        await client.query('CREATE DATABASE medivue');
        console.log('Database medivue dropped and recreated successfully');
        
    } catch (err) {
        console.error('Error managing database:', err);
    } finally {
        await client.end();
    }
}

createDatabase(); 