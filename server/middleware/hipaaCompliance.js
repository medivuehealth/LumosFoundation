const { Pool } = require('pg');
const config = require('../../database/config');
const crypto = require('crypto');

const pool = new Pool(config[process.env.NODE_ENV || 'development']);

// Session timeout in milliseconds (15 minutes)
const SESSION_TIMEOUT = 15 * 60 * 1000;

// Password requirements
const PASSWORD_REQUIREMENTS = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expirationDays: 90
};

// Audit logging middleware
const auditLog = async (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        const logEntry = {
            user_id: req.user?.user_id || 'anonymous',
            action_type: req.method,
            table_name: req.path.split('/')[2], // Extracts resource name from URL
            record_id: req.params.id || 'N/A',
            old_values: req.method === 'PUT' || req.method === 'DELETE' ? req.originalBody : null,
            new_values: req.method === 'POST' || req.method === 'PUT' ? req.body : null,
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        };

        pool.query(
            'INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_values, new_values, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [logEntry.user_id, logEntry.action_type, logEntry.table_name, logEntry.record_id, logEntry.old_values, logEntry.new_values, logEntry.ip_address, logEntry.user_agent]
        );

        originalSend.apply(res, arguments);
    };
    next();
};

// Session management middleware
const sessionManager = async (req, res, next) => {
    const sessionToken = req.headers.authorization?.split(' ')[1];
    
    if (!sessionToken) {
        return res.status(401).json({ error: 'No session token provided' });
    }

    try {
        // Check if session exists and is valid
        const session = await pool.query(
            'SELECT * FROM user_sessions WHERE token = $1 AND expires_at > NOW()',
            [sessionToken]
        );

        if (session.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        const currentSession = session.rows[0];

        // Check session timeout
        const lastActivity = new Date(currentSession.last_activity).getTime();
        if (Date.now() - lastActivity > SESSION_TIMEOUT) {
            await pool.query(
                'UPDATE user_sessions SET expires_at = NOW() WHERE session_id = $1',
                [currentSession.session_id]
            );
            return res.status(401).json({ error: 'Session timeout' });
        }

        // Update last activity
        await pool.query(
            'UPDATE user_sessions SET last_activity = NOW() WHERE session_id = $1',
            [currentSession.session_id]
        );

        // Attach user to request
        req.user = { user_id: currentSession.user_id };
        next();
    } catch (error) {
        console.error('Session management error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Password validation middleware
const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
        errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
    }
    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// MFA validation middleware
const validateMFA = async (req, res, next) => {
    const { mfaToken } = req.body;
    const user = req.user;

    if (!user.mfa_secret) {
        return res.status(400).json({ error: 'MFA not set up for this user' });
    }

    try {
        // Verify MFA token
        const isValid = verifyMFAToken(mfaToken, user.mfa_secret);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid MFA token' });
        }
        next();
    } catch (error) {
        console.error('MFA validation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Helper function to verify MFA token
function verifyMFAToken(token, secret) {
    // Implementation would use a library like 'speakeasy' for TOTP validation
    // This is a placeholder for the actual implementation
    return true;
}

module.exports = {
    auditLog,
    sessionManager,
    validatePassword,
    validateMFA,
    PASSWORD_REQUIREMENTS
}; 