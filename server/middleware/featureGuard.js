const FeatureFlag = require('../models/FeatureFlag');

const checkFeature = (featureKey) => {
    return async (req, res, next) => {
        try {
            const flag = await FeatureFlag.findOne({ key: featureKey });

            if (!flag || !flag.isEnabled) {
                return res.status(403).json({
                    message: `Feature '${featureKey}' is not enabled for this platform.`
                });
            }

            // Additional logic for organization/plan specific flags can be added here

            next();
        } catch (error) {
            res.status(500).json({ message: 'Feature check failed', error: error.message });
        }
    };
};

module.exports = { checkFeature };
