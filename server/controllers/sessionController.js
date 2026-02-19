const Session = require('../models/Session');

// @desc    Get all active sessions for the user
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res) => {
    try {
        const sessions = await Session.find({
            user: req.user._id,
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).sort({ lastActive: -1 });

        // Get current session token from cookie
        const currentToken = req.cookies.token;

        const sessionsData = sessions.map(s => ({
            _id: s._id,
            deviceInfo: s.deviceInfo,
            ipAddress: s.ipAddress,
            location: s.location,
            lastActive: s.lastActive,
            createdAt: s.createdAt,
            isCurrent: s.token === currentToken
        }));

        res.json(sessionsData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Revoke a specific session
// @route   DELETE /api/sessions/:id
// @access  Private
const revokeSession = async (req, res) => {
    try {
        const session = await Session.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        session.isActive = false;
        await session.save();

        res.json({ message: 'Session revoked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Revoke ALL sessions except current
// @route   DELETE /api/sessions/revoke-all
// @access  Private
const revokeAllSessions = async (req, res) => {
    try {
        const currentToken = req.cookies.token;

        await Session.updateMany(
            {
                user: req.user._id,
                token: { $ne: currentToken },
                isActive: true
            },
            { $set: { isActive: false } }
        );

        res.json({ message: 'All other sessions have been signed out.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a session record (called internally after login)
// @param   userId, token, req
const createSession = async (userId, token, req) => {
    try {
        const UAParser = require('ua-parser-js');
        const requestIp = require('request-ip');

        const ua = new UAParser(req.headers['user-agent']);
        const browser = ua.getBrowser();
        const os = ua.getOS();
        const device = ua.getDevice();
        const ip = requestIp.getClientIp(req) || req.ip || '';

        let location = 'Unknown';
        try {
            const geoip = require('geoip-lite');
            const geo = geoip.lookup(ip);
            if (geo) location = `${geo.city || 'Unknown'}, ${geo.country || 'Unknown'}`;
        } catch (e) { /* ignore */ }

        let deviceType = 'desktop';
        if (device.type === 'mobile') deviceType = 'mobile';
        else if (device.type === 'tablet') deviceType = 'tablet';

        await Session.create({
            user: userId,
            token,
            deviceInfo: {
                deviceName: `${browser.name || 'Unknown'} on ${os.name || 'Unknown'}`,
                deviceType,
                os: os.name ? `${os.name} ${os.version || ''}`.trim() : 'Unknown',
                browser: browser.name ? `${browser.name} ${browser.version || ''}`.trim() : 'Unknown'
            },
            ipAddress: ip,
            location,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
    } catch (error) {
        console.error('Session creation error:', error.message);
    }
};

module.exports = { getSessions, revokeSession, revokeAllSessions, createSession };
