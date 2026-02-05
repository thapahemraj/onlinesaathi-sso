const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs
// @route   GET /api/admin/audit
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const startIndex = (page - 1) * limit;

        const count = await AuditLog.countDocuments();
        const logs = await AuditLog.find()
            .populate('user', 'username email')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            logs,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalLogs: count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create audit log (Internal Use)
// @access  Internal
const createAuditLog = async (userId, action, resource, resourceId, details, req) => {
    try {
        await AuditLog.create({
            user: userId,
            action,
            resource,
            resourceId,
            details,
            ipAddress: req?.ip || 'Unknown',
            userAgent: req?.headers['user-agent'] || 'Unknown'
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
};

module.exports = {
    getAuditLogs,
    createAuditLog
};
