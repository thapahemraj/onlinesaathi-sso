const express = require('express');
const router = express.Router();
const { getAuditLogs, getMyActivity } = require('../controllers/auditController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /profile/activity:
 *   get:
 *     summary: Get current user's activity log
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of activity logs
 */
router.get('/my-activity', protect, getMyActivity);

/**
 * @swagger
 * /admin/audit:
 *   get:
 *     summary: Get all system audit logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of audit logs
 */
router.get('/', protect, admin, getAuditLogs);

module.exports = router;
