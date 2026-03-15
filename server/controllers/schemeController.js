const Scheme = require('../models/Scheme');
const Document = require('../models/Document');
const User = require('../models/User');
const { logAction } = require('./auditController');

// @desc    Create a government scheme
// @route   POST /api/schemes
// @access  Private (subAdmin, superAdmin)
const createScheme = async (req, res) => {
    try {
        const scheme = await Scheme.create({ ...req.body, createdBy: req.user._id });
        await logAction(req, 'Create Scheme', 'Scheme', scheme._id, { title: scheme.title }, 'Success');
        res.status(201).json(scheme);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a scheme
// @route   PUT /api/schemes/:id
// @access  Private (subAdmin, superAdmin)
const updateScheme = async (req, res) => {
    try {
        const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
        if (!scheme) return res.status(404).json({ message: 'Scheme not found.' });
        res.json(scheme);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a scheme (hard delete)
// @route   DELETE /api/schemes/:id
// @access  Private (superAdmin only)
const deleteScheme = async (req, res) => {
    try {
        const scheme = await Scheme.findByIdAndDelete(req.params.id);
        if (!scheme) return res.status(404).json({ message: 'Scheme not found.' });
        res.json({ message: 'Scheme deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all active schemes (paginated)
// @route   GET /api/schemes
// @access  Private (all authenticated users)
const getAllSchemes = async (req, res) => {
    try {
        const { category, page = 1, limit = 20, search } = req.query;
        const filter = { isActive: true };
        if (category && category !== 'all') filter.category = category;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const schemes = await Scheme.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Scheme.countDocuments(filter);

        res.json({ schemes, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get a single scheme
// @route   GET /api/schemes/:id
// @access  Private (all authenticated users)
const getSchemeById = async (req, res) => {
    try {
        const scheme = await Scheme.findById(req.params.id);
        if (!scheme) return res.status(404).json({ message: 'Scheme not found.' });
        res.json(scheme);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get schemes the current user is eligible for (based on profile + documents)
// @route   GET /api/schemes/eligible
// @access  Private
const getEligibleSchemes = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const userDocs = await Document.find({ user: req.user._id });
        const userDocTypes = userDocs.map(d => d.documentType);

        // Calculate user's age
        let userAge = null;
        if (user.dateOfBirth) {
            const now = new Date();
            const dob = new Date(user.dateOfBirth);
            userAge = now.getFullYear() - dob.getFullYear();
            const m = now.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) userAge--;
        }

        const allSchemes = await Scheme.find({ isActive: true });

        const eligible = allSchemes.filter(scheme => {
            const c = scheme.eligibilityCriteria;

            // Age check
            if (c.minAge && userAge !== null && userAge < c.minAge) return false;
            if (c.maxAge && userAge !== null && userAge > c.maxAge) return false;

            // Country check
            if (c.countries && c.countries.length > 0 && user.country) {
                if (!c.countries.includes(user.country)) return false;
            }

            // Required documents check — user must have uploaded at least one of each required type
            if (c.requiredDocuments && c.requiredDocuments.length > 0) {
                const hasAll = c.requiredDocuments.every(req => userDocTypes.includes(req));
                if (!hasAll) return false;
            }

            return true;
        });

        res.json({ schemes: eligible, total: eligible.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Admin: get all schemes (including inactive)
// @route   GET /api/schemes/admin/all
// @access  Private (subAdmin, superAdmin)
const getAllSchemesAdmin = async (req, res) => {
    try {
        const schemes = await Scheme.find({}).sort({ createdAt: -1 });
        res.json({ schemes, total: schemes.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createScheme,
    updateScheme,
    deleteScheme,
    getAllSchemes,
    getSchemeById,
    getEligibleSchemes,
    getAllSchemesAdmin
};
