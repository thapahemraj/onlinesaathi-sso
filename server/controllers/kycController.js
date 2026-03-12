const KYCRecord = require('../models/KYCRecord');
const User = require('../models/User');
const Document = require('../models/Document');
const { ROLE_LEVELS } = require('../middleware/authMiddleware');
const { logAction } = require('./auditController');

// @desc    User submits their KYC request (with previously uploaded documents)
// @route   POST /api/kyc/submit
// @access  Private (any authenticated user)
const submitKYCRequest = async (req, res) => {
    try {
        const { documentIds, personalInfo } = req.body;

        // Prevent duplicate pending/under_review requests
        const existing = await KYCRecord.findOne({
            user: req.user._id,
            status: { $in: ['pending', 'under_review'] }
        });
        if (existing) {
            return res.status(400).json({ message: 'You already have a KYC request in progress.' });
        }

        // Fetch the documents belonging to this user
        let documents = [];
        if (documentIds && documentIds.length > 0) {
            const docs = await Document.find({ _id: { $in: documentIds }, user: req.user._id });
            documents = docs.map(d => ({
                documentType: d.documentType,
                documentName: d.documentName,
                fileUrl: d.fileUrl,
            }));
        }

        if (documents.length === 0) {
            return res.status(400).json({ message: 'Please upload at least one document before submitting KYC.' });
        }

        const kycRecord = await KYCRecord.create({
            user: req.user._id,
            documents,
            personalInfo: personalInfo || {},
            status: 'pending'
        });

        // Update user KYC status
        await User.findByIdAndUpdate(req.user._id, { kycStatus: 'pending' });

        await logAction(req, 'Submit KYC', 'KYCRecord', kycRecord._id, {}, 'Success');

        res.status(201).json({ message: 'KYC request submitted successfully.', kycRecord });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get current user's KYC status
// @route   GET /api/kyc/my-status
// @access  Private
const getMyKYCStatus = async (req, res) => {
    try {
        const record = await KYCRecord.findOne({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('agent', 'username firstName lastName');
        res.json({
            kycStatus: req.user.kycStatus,
            kycRecord: record || null
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Agent gets list of KYC requests they can review
// @route   GET /api/kyc/queue
// @access  Private (agent, subAdmin, superAdmin)
const getKYCQueue = async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 20 } = req.query;
        const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'all'];
        const filter = {};
        if (status !== 'all' && validStatuses.includes(status)) {
            filter.status = status;
        }

        const records = await KYCRecord.find(filter)
            .populate('user', 'username email firstName lastName phoneNumber kycStatus country')
            .populate('agent', 'username firstName lastName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await KYCRecord.countDocuments(filter);

        res.json({ records, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get a single KYC record (agent/admin)
// @route   GET /api/kyc/:id
// @access  Private (agent, subAdmin, superAdmin)
const getKYCDetails = async (req, res) => {
    try {
        const record = await KYCRecord.findById(req.params.id)
            .populate('user', 'username email firstName lastName phoneNumber country dateOfBirth kycStatus profilePicture')
            .populate('agent', 'username firstName lastName');

        if (!record) return res.status(404).json({ message: 'KYC record not found' });

        res.json(record);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Agent starts reviewing a KYC (sets status to under_review)
// @route   PUT /api/kyc/:id/claim
// @access  Private (agent, subAdmin, superAdmin)
const claimKYCReview = async (req, res) => {
    try {
        const record = await KYCRecord.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'KYC record not found' });
        if (record.status !== 'pending') {
            return res.status(400).json({ message: 'This KYC request is no longer pending.' });
        }

        record.status = 'under_review';
        record.agent = req.user._id;
        await record.save();

        await User.findByIdAndUpdate(record.user, { kycStatus: 'under_review' });

        await logAction(req, 'Claim KYC Review', 'KYCRecord', record._id, {}, 'Success');
        res.json({ message: 'KYC review claimed.', record });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Agent approves or rejects a KYC
// @route   PUT /api/kyc/:id/review
// @access  Private (agent, subAdmin, superAdmin)
const reviewKYC = async (req, res) => {
    try {
        const { decision, rejectionReason, notes } = req.body;

        if (!['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({ message: 'Decision must be "approved" or "rejected".' });
        }
        if (decision === 'rejected' && !rejectionReason) {
            return res.status(400).json({ message: 'Rejection reason is required.' });
        }

        const record = await KYCRecord.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'KYC record not found' });
        if (!['pending', 'under_review'].includes(record.status)) {
            return res.status(400).json({ message: 'This KYC has already been finalised.' });
        }

        record.status = decision;
        record.agent = req.user._id;
        record.notes = notes || record.notes;
        record.rejectionReason = decision === 'rejected' ? rejectionReason : '';
        record.reviewedAt = new Date();
        await record.save();

        // Mark documents as verified if approved
        if (decision === 'approved') {
            await Document.updateMany(
                { user: record.user, kycRecord: record._id },
                { isVerified: true, verifiedBy: req.user._id, verifiedAt: new Date() }
            );
        }

        // Update user KYC status field
        const userUpdate = {
            kycStatus: decision,
            kycReviewedBy: req.user._id,
        };
        if (decision === 'approved') userUpdate.kycVerifiedAt = new Date();
        if (decision === 'rejected') userUpdate.kycRejectionReason = rejectionReason;

        await User.findByIdAndUpdate(record.user, userUpdate);

        await logAction(req, `KYC ${decision}`, 'KYCRecord', record._id, { decision }, 'Success');
        res.json({ message: `KYC ${decision}.`, record });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Admin gets all KYC records with full stats
// @route   GET /api/kyc/all
// @access  Private (subAdmin, superAdmin)
const getAllKYCRecords = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status && status !== 'all') filter.status = status;

        const records = await KYCRecord.find(filter)
            .populate('user', 'username email firstName lastName')
            .populate('agent', 'username firstName lastName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await KYCRecord.countDocuments(filter);
        const stats = {
            pending: await KYCRecord.countDocuments({ status: 'pending' }),
            under_review: await KYCRecord.countDocuments({ status: 'under_review' }),
            approved: await KYCRecord.countDocuments({ status: 'approved' }),
            rejected: await KYCRecord.countDocuments({ status: 'rejected' }),
        };

        res.json({ records, total, stats, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    submitKYCRequest,
    getMyKYCStatus,
    getKYCQueue,
    getKYCDetails,
    claimKYCReview,
    reviewKYC,
    getAllKYCRecords
};
