const FeatureFlag = require('../models/FeatureFlag');

// @desc    Get all active feature flags for an organization
// @route   GET /api/features
// @access  Private
const getFeatureFlags = async (req, res) => {
    try {
        const flags = await FeatureFlag.find({ isEnabled: true });

        // In a real system, you'd filter flags based on the requesting organization's plan
        // For now, return all enabled flags
        res.json(flags);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create/Update feature flag (Admin only)
// @route   POST /api/admin/features
// @access  Private/Admin
const upsertFeatureFlag = async (req, res) => {
    try {
        const { key, name, description, isEnabled, scope, conditions } = req.body;

        const flag = await FeatureFlag.findOneAndUpdate(
            { key },
            { name, description, isEnabled, scope, conditions },
            { new: true, upsert: true }
        );

        res.json(flag);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getFeatureFlags,
    upsertFeatureFlag
};
