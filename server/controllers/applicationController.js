const Application = require('../models/Application');
const crypto = require('crypto');

// Generate random credentials
const generateCredentials = () => {
    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomBytes(32).toString('hex');
    return { clientId, clientSecret };
};

// @desc    Get all applications
// @route   GET /api/admin/applications
// @access  Private/Admin
const getApplications = async (req, res) => {
    try {
        const apps = await Application.find({}).sort({ createdAt: -1 });
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get single application
// @route   GET /api/admin/applications/:id
// @access  Private/Admin
const getApplicationById = async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);
        if (app) {
            res.json(app);
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create new application
// @route   POST /api/admin/applications
// @access  Private/Admin
const createApplication = async (req, res) => {
    try {
        const { name, redirectUris, homepageUrl, description } = req.body;
        const { clientId, clientSecret } = generateCredentials();

        const app = await Application.create({
            name,
            clientId,
            clientSecret,
            redirectUris: redirectUris || [],
            homepageUrl,
            description,
            createdBy: req.user._id
        });

        res.status(201).json(app);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update application
// @route   PUT /api/admin/applications/:id
// @access  Private/Admin
const updateApplication = async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);

        if (app) {
            app.name = req.body.name || app.name;
            app.redirectUris = req.body.redirectUris || app.redirectUris;
            app.homepageUrl = req.body.homepageUrl || app.homepageUrl;
            app.description = req.body.description || app.description;
            app.logoUrl = req.body.logoUrl || app.logoUrl;
            if (req.body.isEnabled !== undefined) app.isEnabled = req.body.isEnabled;

            const updatedApp = await app.save();
            res.json(updatedApp);
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Regenerate client secret
// @route   POST /api/admin/applications/:id/regenerate-secret
// @access  Private/Admin
const regenerateSecret = async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);
        if (app) {
            const { clientSecret } = generateCredentials();
            app.clientSecret = clientSecret;
            await app.save();
            res.json({ clientSecret });
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete application
// @route   DELETE /api/admin/applications/:id
// @access  Private/Admin
const deleteApplication = async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);
        if (app) {
            await app.deleteOne();
            res.json({ message: 'Application removed' });
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    regenerateSecret,
    deleteApplication
};
