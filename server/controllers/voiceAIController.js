const { deductCredits } = require('../utils/billingService');
const Organization = require('../models/Organization');

// @desc    Mock Voice AI processing
// @route   POST /api/apps/voice-ai/process
// @access  Private
const processVoiceAI = async (req, res) => {
    try {
        const { text } = req.body;
        const orgId = req.tenant ? req.tenant.id : null;

        if (!orgId) {
            return res.status(400).json({ message: 'No organization context found' });
        }

        // 1. Calculate cost (e.g., 0.5 credits per request)
        const cost = 0.5;

        // 2. Attempt to deduct credits
        try {
            await deductCredits(orgId, cost, `Voice AI Processing: "${text.substring(0, 20)}..."`, 'voice-ai');
        } catch (error) {
            return res.status(402).json({
                message: 'Insufficient credits or billing error',
                error: error.message
            });
        }

        // 3. Perform the "AI work" (Mock)
        const mockResult = `AI processed: ${text.split('').reverse().join('')}`;

        res.json({
            success: true,
            cost,
            result: mockResult,
            message: 'AI processing completed and credits deducted.'
        });
    } catch (error) {
        res.status(500).json({ message: 'AI Processing failed', error: error.message });
    }
};

module.exports = { processVoiceAI };
