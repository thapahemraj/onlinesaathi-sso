const Organization = require('../models/Organization');

// @desc    Get all organizations
// @route   GET /api/admin/orgs
// @access  Private/Admin
const getOrganizations = async (req, res) => {
    try {
        const orgs = await Organization.find().populate('owner', 'username email');
        res.status(200).json(orgs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single organization
// @route   GET /api/admin/orgs/:id
// @access  Private/Admin
const getOrganization = async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id);
        if (!org) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.status(200).json(org);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create organization
// @route   POST /api/admin/orgs
// @access  Private/Admin
const createOrganization = async (req, res) => {
    try {
        const { name, slug, domain, branding, settings } = req.body;

        // Check if slug exists
        const existingOrg = await Organization.findOne({ slug });
        if (existingOrg) {
            return res.status(400).json({ message: 'Organization slug already exists' });
        }

        const org = await Organization.create({
            name,
            slug,
            domain,
            owner: req.user._id, // Current admin is the owner by default
            branding,
            settings
        });

        res.status(201).json(org);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update organization
// @route   PUT /api/admin/orgs/:id
// @access  Private/Admin
const updateOrganization = async (req, res) => {
    try {
        const org = await Organization.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!org) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        res.status(200).json(org);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete organization
// @route   DELETE /api/admin/orgs/:id
// @access  Private/Admin
const deleteOrganization = async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id);

        if (!org) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        await org.deleteOne();

        res.status(200).json({ message: 'Organization removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization
};
