const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config for profile picture upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads', 'avatars');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.user._id}-${Date.now()}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
}).single('profilePicture');

// @desc    Get full user profile
// @route   GET /api/profile
// @access  Private
const getFullProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpire');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile info
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { firstName, lastName, dateOfBirth, country, language, phoneNumber } = req.body;

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (country !== undefined) user.country = country;
        if (language !== undefined) user.language = language;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

        const updated = await user.save();
        res.json({
            _id: updated._id,
            username: updated.username,
            email: updated.email,
            firstName: updated.firstName,
            lastName: updated.lastName,
            dateOfBirth: updated.dateOfBirth,
            country: updated.country,
            language: updated.language,
            phoneNumber: updated.phoneNumber,
            profilePicture: updated.profilePicture,
            role: updated.role,
            privacySettings: updated.privacySettings
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Upload / update profile picture
// @route   PUT /api/profile/picture
// @access  Private
const updateProfilePicture = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'Upload error' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        try {
            const user = await User.findById(req.user._id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Build URL path to the uploaded file
            const fileUrl = `/uploads/avatars/${req.file.filename}`;
            user.profilePicture = fileUrl;
            await user.save();

            res.json({ profilePicture: fileUrl });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
};

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update privacy settings
// @route   PUT /api/profile/privacy
// @access  Private
const updatePrivacySettings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { locationActivity, browsingHistory, searchHistory, appActivity } = req.body;

        if (locationActivity !== undefined) user.privacySettings.locationActivity = locationActivity;
        if (browsingHistory !== undefined) user.privacySettings.browsingHistory = browsingHistory;
        if (searchHistory !== undefined) user.privacySettings.searchHistory = searchHistory;
        if (appActivity !== undefined) user.privacySettings.appActivity = appActivity;

        await user.save();
        res.json({ privacySettings: user.privacySettings });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getFullProfile,
    updateProfile,
    updateProfilePicture,
    changePassword,
    updatePrivacySettings
};
