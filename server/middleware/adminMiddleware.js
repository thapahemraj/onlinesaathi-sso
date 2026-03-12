const { ROLE_LEVELS } = require('./authMiddleware');

const admin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        // Accept any admin-level role (supportTeam and above)
        const level = ROLE_LEVELS[req.user.role] || 0;
        if (level >= ROLE_LEVELS['supportTeam']) {
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
