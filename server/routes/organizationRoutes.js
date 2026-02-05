const express = require('express');
const router = express.Router();
const {
    getOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization
} = require('../controllers/organizationController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are protected and need admin privileges
router.use(protect);
router.use(admin);

router.route('/')
    .get(getOrganizations)
    .post(createOrganization);

router.route('/:id')
    .get(getOrganization)
    .put(updateOrganization)
    .delete(deleteOrganization);

module.exports = router;
