const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    regenerateSecret,
    deleteApplication
} = require('../controllers/applicationController');

router.use(protect);
router.use(admin);

router.route('/')
    .get(getApplications)
    .post(createApplication);

router.route('/:id')
    .get(getApplicationById)
    .put(updateApplication)
    .delete(deleteApplication);

router.post('/:id/regenerate-secret', regenerateSecret);

module.exports = router;
