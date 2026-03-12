const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Numeric hierarchy: higher = more authority
const ROLE_LEVELS = {
    user: 10,
    member: 15,
    saathi: 20,
    agent: 30,
    supportTeam: 40,
    subAdmin: 70,
    superAdmin: 100,
    admin: 100  // legacy alias for superAdmin
};

const protect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        try {
            token = req.cookies.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Allow only specific roles (exact match)
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

// Allow roles AT OR ABOVE a minimum level in the hierarchy
const requireMinRole = (minRole) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const userLevel = ROLE_LEVELS[req.user.role] || 0;
    const minLevel = ROLE_LEVELS[minRole] || 0;
    if (userLevel < minLevel) {
        return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
};

// Convenience aliases
const isSuperAdmin   = requireRole('superAdmin', 'admin');
const isSubAdmin     = requireMinRole('subAdmin');   // subAdmin + superAdmin
const isSupportPlus  = requireMinRole('supportTeam'); // supportTeam + subAdmin + superAdmin
const isAgent        = requireRole('agent');
const isSaathi       = requireRole('saathi');
const isAgentOrAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const level = ROLE_LEVELS[req.user.role] || 0;
    if (level >= ROLE_LEVELS['agent'] && ['agent', 'subAdmin', 'superAdmin', 'admin'].includes(req.user.role)) {
        return next();
    }
    if (req.user.role === 'agent') return next();
    // Allow admins too
    if (ROLE_LEVELS[req.user.role] >= ROLE_LEVELS['subAdmin']) return next();
    return res.status(403).json({ message: 'Access denied. Agent or admin required.' });
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superAdmin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = {
    protect,
    admin,
    requireRole,
    requireMinRole,
    ROLE_LEVELS,
    isSuperAdmin,
    isSubAdmin,
    isSupportPlus,
    isAgent,
    isSaathi,
    isAgentOrAdmin
};

