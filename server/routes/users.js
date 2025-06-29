const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const config = require('../../database/config');
const { validateField } = require('../../src/utils/validation');

const router = express.Router();

// Get the environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env].medivue;

// Create a new pool
const pool = new Pool({
    user: String(dbConfig.username),
    host: String(dbConfig.host),
    database: String(dbConfig.database),
    password: String(dbConfig.password),
    port: Number(dbConfig.port),
});

// Update user endpoint
router.put('/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const {
        username,
        email,
        password,
        first_name,
        last_name,
        display_name,
        date_of_birth,
        gender,
        phone_number,
        emergency_contact_name,
        emergency_contact_phone,
        address,
        city,
        state,
        country,
        postal_code
    } = req.body;

    // Debug log for incoming data
    console.log('DEBUG: Update user request body:', req.body);
    console.log('DEBUG: Incoming date_of_birth:', date_of_birth);

    try {
        // Start building the query
        let updateFields = [];
        let queryParams = [];
        let paramCount = 1;

        // Add each field to the query if it exists
        if (username) {
            updateFields.push(`username = $${paramCount}`);
            queryParams.push(username);
            paramCount++;
        }
        if (email) {
            updateFields.push(`email = $${paramCount}`);
            queryParams.push(email);
            paramCount++;
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.push(`password_hash = $${paramCount}`);
            queryParams.push(hashedPassword);
            paramCount++;
        }
        if (first_name) {
            updateFields.push(`first_name = $${paramCount}`);
            queryParams.push(first_name);
            paramCount++;
        }
        if (last_name) {
            updateFields.push(`last_name = $${paramCount}`);
            queryParams.push(last_name);
            paramCount++;
        }
        if (display_name !== undefined) {
            updateFields.push(`display_name = $${paramCount}`);
            queryParams.push(display_name);
            paramCount++;
        }
        if (date_of_birth) {
            // Convert timestamp to date string if needed
            let formattedDate = date_of_birth;
            if (date_of_birth.includes('T')) {
                // It's a timestamp, extract just the date part
                formattedDate = date_of_birth.split('T')[0];
            }
            updateFields.push(`date_of_birth = $${paramCount}`);
            queryParams.push(formattedDate);
            paramCount++;
        }
        if (gender) {
            updateFields.push(`gender = $${paramCount}`);
            queryParams.push(gender);
            paramCount++;
        }
        if (phone_number) {
            updateFields.push(`phone_number = $${paramCount}`);
            queryParams.push(phone_number);
            paramCount++;
        }
        if (emergency_contact_name) {
            updateFields.push(`emergency_contact_name = $${paramCount}`);
            queryParams.push(emergency_contact_name);
            paramCount++;
        }
        if (emergency_contact_phone) {
            updateFields.push(`emergency_contact_phone = $${paramCount}`);
            queryParams.push(emergency_contact_phone);
            paramCount++;
        }
        if (address !== undefined) {
            updateFields.push(`address = $${paramCount}`);
            queryParams.push(address);
            paramCount++;
        }
        if (city !== undefined) {
            updateFields.push(`city = $${paramCount}`);
            queryParams.push(city);
            paramCount++;
        }
        if (state !== undefined) {
            updateFields.push(`state = $${paramCount}`);
            queryParams.push(state);
            paramCount++;
        }
        if (country !== undefined) {
            updateFields.push(`country = $${paramCount}`);
            queryParams.push(country);
            paramCount++;
        }
        if (postal_code !== undefined) {
            updateFields.push(`postal_code = $${paramCount}`);
            queryParams.push(postal_code);
            paramCount++;
        }

        // Add user_id to params
        queryParams.push(user_id);

        // If there are no fields to update
        if (updateFields.length === 0) {
            return res.status(400).json({
                error: 'No fields to update'
            });
        }

        // Construct and execute the query
        const query = `
            UPDATE users 
            SET ${updateFields.join(', ')}
            WHERE user_id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Remove sensitive data before sending
        const { password_hash, ...userData } = result.rows[0];

        res.json(userData);
    } catch (err) {
        console.error('Error updating user:', err);
        
        // Check for unique constraint violations
        if (err.code === '23505') {
            if (err.constraint === 'users_username_key') {
                return res.status(400).json({
                    error: 'Username already taken'
                });
            }
            if (err.constraint === 'users_email_key') {
                return res.status(400).json({
                    error: 'Email already registered'
                });
            }
        }
        
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get user endpoint
router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE user_id = $1',
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Remove sensitive data before sending
        const { password_hash, ...userData } = result.rows[0];

        res.json({
            user: userData
        });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

module.exports = router; 