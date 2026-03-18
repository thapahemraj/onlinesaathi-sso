const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

const getPartnerTransactionLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            user,
            service,
            status,
            endpoint,
            dateFrom,
            dateTo
        } = req.query;

        const query = { resource: 'PartnerTransaction' };

        if (status) {
            query.status = status;
        }

        if (service) {
            query['details.service'] = String(service).trim().toLowerCase();
        }

        if (endpoint) {
            query['details.endpoint'] = { $regex: endpoint, $options: 'i' };
        }

        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        if (user) {
            const users = await User.find({
                $or: [
                    { username: { $regex: user, $options: 'i' } },
                    { email: { $regex: user, $options: 'i' } },
                    { phoneNumber: { $regex: user, $options: 'i' } }
                ]
            }).select('_id');

            query.user = { $in: users.map((u) => u._id) };
        }

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

        const logs = await AuditLog.find(query)
            .populate('user', 'username email phoneNumber role')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const total = await AuditLog.countDocuments(query);

        res.json({
            logs,
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalLogs: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getPartnerTransactionLogs
};
