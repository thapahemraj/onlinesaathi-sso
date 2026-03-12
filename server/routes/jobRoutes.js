const express = require('express');
const router = express.Router();
const { protect, isSubAdmin, isSuperAdmin } = require('../middleware/authMiddleware');
const { createJob, updateJob, deleteJob, getAllJobs, getJobById, getAllJobsAdmin } = require('../controllers/jobController');

router.use(protect);

// Any authenticated user
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// subAdmin and above: manage jobs
router.post('/', isSubAdmin, createJob);
router.put('/:id', isSubAdmin, updateJob);
router.delete('/:id', isSuperAdmin, deleteJob);
router.get('/admin/all', isSubAdmin, getAllJobsAdmin);

module.exports = router;
