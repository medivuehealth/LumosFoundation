const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const config = require('../../database/config');
const { validateField } = require('../../src/utils/validation');
const { validatePassword, PASSWORD_REQUIREMENTS } = require('../middleware/hipaaCompliance');
const crypto = require('crypto');
const speakeasy = require('speakeasy');

const router = express.Router();

// Get the environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env].medivue;  // Use the medivue configuration

// Create a new pool
const pool = new Pool({
    user: String(dbConfig.username),
    host: String(dbConfig.host),
    database: String(dbConfig.database),
    password: String(dbConfig.password),
    port: Number(dbConfig.port),
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { identifier, password, mfaToken } = req.body;
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.connection.remoteAddress;

    try {
        // Check if identifier is email or username
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $1',
            [identifier]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        const userData = user.rows[0];

        // Check if account is locked
        if (userData.account_locked) {
            return res.status(401).json({
                error: 'Account is locked. Please contact support.'
            });
        }

        // Compare password
        const validPassword = await bcrypt.compare(password, userData.password_hash);
        if (!validPassword) {
            // Increment failed login attempts
            await pool.query(
                'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE user_id = $1',
                [userData.user_id]
            );

            // Check if we should lock the account (after 5 failed attempts)
            if (userData.failed_login_attempts >= 4) {
                await pool.query(
                    'UPDATE users SET account_locked = true WHERE user_id = $1',
                    [userData.user_id]
                );
            }

            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Verify MFA if enabled
        if (userData.mfa_secret) {
            if (!mfaToken) {
                return res.status(401).json({
                    error: 'MFA token required'
                });
            }

            const verified = speakeasy.totp.verify({
                secret: userData.mfa_secret,
                encoding: 'base32',
                token: mfaToken
            });

            if (!verified) {
                return res.status(401).json({
                    error: 'Invalid MFA token'
                });
            }
        }

        // Check password expiration
        const passwordAge = Date.now() - new Date(userData.password_last_changed).getTime();
        const passwordExpired = passwordAge > (PASSWORD_REQUIREMENTS.expirationDays * 24 * 60 * 60 * 1000);

        // Reset failed login attempts
        await pool.query(
            'UPDATE users SET failed_login_attempts = 0 WHERE user_id = $1',
            [userData.user_id]
        );

        // Create session
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + (15 * 60 * 1000)); // 15 minutes

        await pool.query(`
            INSERT INTO user_sessions (
                session_id, user_id, token, expires_at, ip_address, user_agent
            ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            crypto.randomBytes(16).toString('hex'),
            userData.user_id,
            sessionToken,
            expiresAt,
            ip,
            userAgent
        ]);

        // Record login history
        await pool.query(
            'INSERT INTO login_history (user_id, ip_address, user_agent) VALUES ($1, $2, $3)',
            [userData.user_id, ip, userAgent]
        );

        // Remove sensitive data before sending
        const { password_hash, mfa_secret, ...safeUserData } = userData;

        res.json({
            user: safeUserData,
            session: {
                token: sessionToken,
                expires_at: expiresAt
            },
            passwordExpired
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    const sessionToken = req.headers.authorization?.split(' ')[1];
    
    if (!sessionToken) {
        return res.status(400).json({ error: 'No session token provided' });
    }

    try {
        // Invalidate session
        await pool.query(
            'UPDATE user_sessions SET expires_at = NOW() WHERE token = $1',
            [sessionToken]
        );

        // Record logout in login history
        await pool.query(
            'UPDATE login_history SET logout_time = NOW(), logout_type = $1 WHERE id = (SELECT id FROM login_history WHERE user_id = $2 ORDER BY login_time DESC LIMIT 1)',
            ['manual', req.user.user_id]
        );

        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get login history for a user
router.get('/login-history/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const history = await pool.query(
            'SELECT * FROM login_history WHERE user_id = $1 ORDER BY login_time DESC LIMIT 50',
            [user_id]
        );

        res.json(history.rows);
    } catch (err) {
        console.error('Error fetching login history:', err);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Signup endpoint
router.post('/signup', async (req, res) => {
    const {
        username,
        email,
        password,
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone_number,
        emergency_contact_name,
        emergency_contact_phone
    } = req.body;

    try {
        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                error: 'Password validation failed',
                details: passwordValidation.errors
            });
        }

        // Validate all required fields
        const requiredFields = {
            username,
            email,
            password,
            first_name,
            last_name,
            date_of_birth,
            gender,
            phone_number,
            emergency_contact_name,
            emergency_contact_phone
        };

        const errors = {};
        Object.entries(requiredFields).forEach(([field, value]) => {
            const validation = validateField(field, value);
            if (!validation.isValid) {
                errors[field] = validation.message;
            }
        });

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        // Check if username or email already exists
        const existingUser = await pool.query(
            'SELECT username, email FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            const errors = {};
            if (existingUser.rows[0].username === username) {
                errors.username = 'Username already taken';
            }
            if (existingUser.rows[0].email === email) {
                errors.email = 'Email already registered';
            }
            return res.status(400).json({
                error: 'User already exists',
                details: errors
            });
        }

        // Generate MFA secret
        const mfaSecret = speakeasy.generateSecret().base32;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate user_id
        const user_id = `user_${Date.now()}`;

        // Insert new user with encrypted fields
        const newUser = await pool.query(`
            INSERT INTO users (
                user_id, username, email, password_hash, first_name, last_name,
                date_of_birth, gender, phone_number, emergency_contact_name,
                emergency_contact_phone, mfa_secret, password_last_changed
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
            RETURNING *
        `, [
            user_id, username, email, hashedPassword, first_name, last_name,
            date_of_birth, gender, phone_number, emergency_contact_name,
            emergency_contact_phone, mfaSecret
        ]);

        // Assign default 'user' role
        await pool.query(`
            INSERT INTO user_roles (user_id, role_id)
            SELECT $1, role_id FROM roles WHERE role_name = 'user'
        `, [user_id]);

        // Remove sensitive data before sending
        const { password_hash, mfa_secret, ...userData } = newUser.rows[0];

        res.status(201).json({
            user: userData,
            mfaSecret: mfaSecret // Send this only once during signup for setup
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

module.exports = router; 