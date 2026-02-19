const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const UAParser = require('ua-parser-js');
const requestIp = require('request-ip');

// Helper to log actions
const logAction = async (req, action, resource, resourceId, details = {}, status = 'Success') => {
    try {
        const ua = new UAParser(req.headers['user-agent']);
        const browser = ua.getBrowser();
        const os = ua.getOS();
        const ip = requestIp.getClientIp(req) || req.ip || '';

        let deviceInfo = `${browser.name || 'Unknown'} on ${os.name || 'Unknown'}`;

        await AuditLog.create({
            user: req.user ? req.user._id : (details.userId || null),
            action,
            resource,
            resourceId,
            details,
            ipAddress: ip,
            userAgent: req.headers['user-agent'],
            deviceInfo,
            status
        });
    } catch (error) {
        console.error('Audit Log Error:', error.message);
    }
};

// @desc    Get current user's activity log
// @route   GET /api/profile/activity
// @access  Private
const getMyActivity = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const logs = await AuditLog.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await AuditLog.countDocuments({ user: req.user._id });

        res.json({
            logs,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalLogs: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all audit logs (Admin)
// @route   GET /api/admin/audit
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, action, user, dateFrom, dateTo } = req.query;
        const query = {};

        if (action) query.action = { $regex: action, $options: 'i' };
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        // Search by username/email requires looking up User IDs first
        if (user) {
            const users = await User.find({
                $or: [
                    { username: { $regex: user, $options: 'i' } },
                    { email: { $regex: user, $options: 'i' } }
                ]
            }).select('_id');
            const userIds = users.map(u => u._id);
            query.user = { $in: userIds };
        }

        const logs = await AuditLog.find(query)
            .populate('user', 'username email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        res.json({
            logs,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalLogs: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    logAction,
    getMyActivity,
    getAuditLogs
};
