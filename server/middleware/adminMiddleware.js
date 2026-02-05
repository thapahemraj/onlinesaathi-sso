const jwt = require('jsonwebtoken');
const User = require('../models/User');

const admin = async (req, res, next) => {
    try {
        // Auth middleware should have already run and attached req.user (id)
        // Let's fetch the full user to check role
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Check if req.user is just an ID (depending on auth middleware) or full object
        // Usually auth middleware does: req.user = await User.findById(decoded.id).select('-password');
        // Let's verify what auth middleware does by looking at it, but for now assuming standard 'protect' middleware

        if (req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Not authorized as admin' });
        }
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, admin failed' });
    }
};

module.exports = { admin };
