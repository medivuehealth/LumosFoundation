const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const config = require('./config');

// Get the environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create a new pool
const pool = new Pool({
    user: dbConfig.username,
    host: dbConfig.host,
    database: dbConfig.database,
    password: dbConfig.password,
    port: dbConfig.port,
});

// Sample users data
const users = [
    {
        user_id: 'admin123',
        username: 'admin123',
        email: 'admin@medivue.health',
        password: 'admin123', // This will be hashed
        first_name: 'Admin',
        last_name: 'User',
        display_name: 'Admin',
        date_of_birth: '1990-01-01',
        gender: 'prefer_not_to_say',
        phone_number: '+1-555-0123',
        address: '123 Main St',
        city: 'Charlotte',
        state: 'NC',
        country: 'USA',
        postal_code: '28202',
        emergency_contact_name: 'Emergency Contact',
        emergency_contact_phone: '+1-555-0124'
    },
    {
        user_id: 'demo123',
        username: 'demo123',
        email: 'demo@medivue.health',
        password: 'demo123', // This will be hashed
        first_name: 'Demo',
        last_name: 'User',
        display_name: 'Demo User',
        date_of_birth: '1995-05-15',
        gender: 'prefer_not_to_say',
        phone_number: '+1-555-0125',
        address: '456 Park Ave',
        city: 'Charlotte',
        state: 'NC',
        country: 'USA',
        postal_code: '28203',
        emergency_contact_name: 'Emergency Demo',
        emergency_contact_phone: '+1-555-0126'
    }
];

async function seedDatabase() {
    try {
        // Connect to PostgreSQL
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database.');

        // Insert users
        for (const user of users) {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            // Insert user
            await client.query(`
                INSERT INTO users (
                    user_id, username, email, password_hash, first_name, last_name,
                    display_name, date_of_birth, gender, phone_number, address,
                    city, state, country, postal_code, emergency_contact_name,
                    emergency_contact_phone
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                    $14, $15, $16, $17
                )
                ON CONFLICT (user_id) DO UPDATE SET
                    username = EXCLUDED.username,
                    email = EXCLUDED.email,
                    password_hash = EXCLUDED.password_hash,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    display_name = EXCLUDED.display_name,
                    date_of_birth = EXCLUDED.date_of_birth,
                    gender = EXCLUDED.gender,
                    phone_number = EXCLUDED.phone_number,
                    address = EXCLUDED.address,
                    city = EXCLUDED.city,
                    state = EXCLUDED.state,
                    country = EXCLUDED.country,
                    postal_code = EXCLUDED.postal_code,
                    emergency_contact_name = EXCLUDED.emergency_contact_name,
                    emergency_contact_phone = EXCLUDED.emergency_contact_phone,
                    updated_at = CURRENT_TIMESTAMP
            `, [
                user.user_id, user.username, user.email, hashedPassword,
                user.first_name, user.last_name, user.display_name,
                user.date_of_birth, user.gender, user.phone_number,
                user.address, user.city, user.state, user.country,
                user.postal_code, user.emergency_contact_name,
                user.emergency_contact_phone
            ]);
        }

        console.log('Database seeded successfully.');

        // Release the client
        client.release();
        
        // Close the pool
        await pool.end();
        console.log('Database connection closed.');
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

// Run the seeding
seedDatabase(); 