const express = require('express');
const router = express.Router();
const { protect, isSubAdmin, isSuperAdmin } = require('../middleware/authMiddleware');
const {
    createScheme,
    updateScheme,
    deleteScheme,
    getAllSchemes,
    getSchemeById,
    getEligibleSchemes,
    getAllSchemesAdmin
} = require('../controllers/schemeController');

router.use(protect);

// Any authenticated user
router.get('/', getAllSchemes);
router.get('/eligible', getEligibleSchemes);
router.get('/:id', getSchemeById);

// subAdmin and above: manage schemes
router.post('/', isSubAdmin, createScheme);
router.put('/:id', isSubAdmin, updateScheme);
router.delete('/:id', isSuperAdmin, deleteScheme);
router.get('/admin/all', isSubAdmin, getAllSchemesAdmin);

module.exports = router;
