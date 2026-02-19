const Address = require('../models/Address');

// @desc    Get all addresses for user
// @route   GET /api/profile/addresses
// @access  Private
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add a new address
// @route   POST /api/profile/addresses
// @access  Private
const addAddress = async (req, res) => {
    try {
        const { label, fullName, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault } = req.body;

        // If this is set as default, unset other defaults
        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        const address = await Address.create({
            user: req.user._id,
            label, fullName, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault
        });

        res.status(201).json(address);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update an address
// @route   PUT /api/profile/addresses/:id
// @access  Private
const updateAddress = async (req, res) => {
    try {
        const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
        if (!address) return res.status(404).json({ message: 'Address not found' });

        const { label, fullName, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault } = req.body;

        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        if (label !== undefined) address.label = label;
        if (fullName !== undefined) address.fullName = fullName;
        if (addressLine1 !== undefined) address.addressLine1 = addressLine1;
        if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
        if (city !== undefined) address.city = city;
        if (state !== undefined) address.state = state;
        if (postalCode !== undefined) address.postalCode = postalCode;
        if (country !== undefined) address.country = country;
        if (phone !== undefined) address.phone = phone;
        if (isDefault !== undefined) address.isDefault = isDefault;

        const updated = await address.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete an address
// @route   DELETE /api/profile/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
        if (!address) return res.status(404).json({ message: 'Address not found' });

        await address.deleteOne();
        res.json({ message: 'Address removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
