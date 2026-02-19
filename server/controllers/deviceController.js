const Device = require('../models/Device');
const UAParser = require('ua-parser-js');
const requestIp = require('request-ip');
const crypto = require('crypto');

// Try to get location from IP using geoip-lite
const getLocationFromIP = (ip) => {
    try {
        const geoip = require('geoip-lite');
        const geo = geoip.lookup(ip);
        if (geo) {
            return `${geo.city || 'Unknown'}, ${geo.country || 'Unknown'}`;
        }
    } catch (e) { /* geoip not available */ }
    return 'Unknown';
};

// @desc    Get all devices for user
// @route   GET /api/devices
// @access  Private
const getDevices = async (req, res) => {
    try {
        const devices = await Device.find({ user: req.user._id }).sort({ lastActive: -1 });
        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Remove a device
// @route   DELETE /api/devices/:id
// @access  Private
const removeDevice = async (req, res) => {
    try {
        const device = await Device.findOne({ _id: req.params.id, user: req.user._id });
        if (!device) return res.status(404).json({ message: 'Device not found' });

        await device.deleteOne();
        res.json({ message: 'Device removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Track device on login (called internally from loginUser)
// @param   userId - the user's ObjectId
// @param   req - the Express request object
const trackDevice = async (userId, req) => {
    try {
        const ua = new UAParser(req.headers['user-agent']);
        const browser = ua.getBrowser();
        const os = ua.getOS();
        const device = ua.getDevice();

        const ip = requestIp.getClientIp(req) || req.ip || '';
        const location = getLocationFromIP(ip);

        // Determine device type
        let deviceType = 'desktop';
        if (device.type === 'mobile') deviceType = 'mobile';
        else if (device.type === 'tablet') deviceType = 'tablet';

        // Build device name
        const deviceName = `${browser.name || 'Unknown Browser'} on ${os.name || 'Unknown OS'}`;

        // Create fingerprint to detect same device
        const fingerprint = crypto
            .createHash('md5')
            .update(`${req.headers['user-agent']}`)
            .digest('hex');

        // Check if this device already exists (same fingerprint)
        const existingDevice = await Device.findOne({ user: userId, fingerprint });

        if (existingDevice) {
            // Update last active time
            existingDevice.lastActive = new Date();
            existingDevice.ip = ip;
            existingDevice.location = location;
            await existingDevice.save();
        } else {
            // Create new device record
            await Device.create({
                user: userId,
                deviceName,
                deviceType,
                os: os.name ? `${os.name} ${os.version || ''}`.trim() : 'Unknown',
                browser: browser.name ? `${browser.name} ${browser.version || ''}`.trim() : 'Unknown',
                ip,
                location,
                fingerprint,
                lastActive: new Date()
            });
        }
    } catch (error) {
        console.error('Device tracking error:', error.message);
        // Don't throw - device tracking failure shouldn't block login
    }
};

module.exports = { getDevices, removeDevice, trackDevice };
