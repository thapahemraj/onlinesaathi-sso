const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect, admin } = require('../middleware/authMiddleware');

// Validates token and checks for admin role
router.get('/', protect, admin, getAuditLogs);

module.exports = router;
