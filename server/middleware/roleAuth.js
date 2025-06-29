const { Pool } = require('pg');
const config = require('../../database/config');

const pool = new Pool(config[process.env.NODE_ENV || 'development']);

// Cache for permissions to reduce database queries
const permissionsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getUserPermissions(userId) {
    // Check cache first
    const cachedPermissions = permissionsCache.get(userId);
    if (cachedPermissions && cachedPermissions.timestamp > Date.now() - CACHE_DURATION) {
        return cachedPermissions.permissions;
    }

    // Get user's permissions from database
    const result = await pool.query(`
        SELECT DISTINCT p.permission_name
        FROM users u
        JOIN user_roles ur ON u.user_id = ur.user_id
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.permission_id
        WHERE u.user_id = $1
    `, [userId]);

    const permissions = result.rows.map(row => row.permission_name);
    
    // Update cache
    permissionsCache.set(userId, {
        permissions,
        timestamp: Date.now()
    });

    return permissions;
}

async function getUserRoles(userId) {
    const result = await pool.query(`
        SELECT r.role_name
        FROM users u
        JOIN user_roles ur ON u.user_id = ur.user_id
        JOIN roles r ON ur.role_id = r.role_id
        WHERE u.user_id = $1
    `, [userId]);

    return result.rows.map(row => row.role_name);
}

async function getUserOrganizations(userId) {
    const result = await pool.query(`
        SELECT o.*, r.role_name
        FROM users u
        JOIN user_organizations uo ON u.user_id = uo.user_id
        JOIN organizations o ON uo.org_id = o.org_id
        JOIN roles r ON uo.role_id = r.role_id
        WHERE u.user_id = $1 AND uo.is_active = true
    `, [userId]);

    return result.rows;
}

// Middleware to check if user has required permissions
const requirePermissions = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.user_id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const userPermissions = await getUserPermissions(userId);
            
            // Check if user has all required permissions
            const hasAllPermissions = requiredPermissions.every(
                permission => userPermissions.includes(permission)
            );

            if (!hasAllPermissions) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

// Middleware to check if user has required roles
const requireRoles = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.user_id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const userRoles = await getUserRoles(userId);
            
            // Check if user has any of the required roles
            const hasRequiredRole = requiredRoles.some(
                role => userRoles.includes(role)
            );

            if (!hasRequiredRole) {
                return res.status(403).json({ error: 'Insufficient role permissions' });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

// Middleware to check if user belongs to the same organization
const requireSameOrganization = () => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.user_id;
            const targetUserId = req.params.userId || req.body.userId;

            if (!userId || !targetUserId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            // Get organizations for both users
            const [userOrgs, targetOrgs] = await Promise.all([
                getUserOrganizations(userId),
                getUserOrganizations(targetUserId)
            ]);

            // Check if users share any organization
            const sharedOrg = userOrgs.some(userOrg => 
                targetOrgs.some(targetOrg => targetOrg.org_id === userOrg.org_id)
            );

            if (!sharedOrg) {
                return res.status(403).json({ error: 'Access restricted to same organization' });
            }

            next();
        } catch (error) {
            console.error('Organization check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

// Helper function to clear permissions cache
const clearPermissionsCache = (userId) => {
    if (userId) {
        permissionsCache.delete(userId);
    } else {
        permissionsCache.clear();
    }
};

module.exports = {
    requirePermissions,
    requireRoles,
    requireSameOrganization,
    getUserPermissions,
    getUserRoles,
    getUserOrganizations,
    clearPermissionsCache
}; 