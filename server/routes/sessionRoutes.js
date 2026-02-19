const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSessions, revokeSession, revokeAllSessions } = require('../controllers/sessionController');

// All routes are protected
router.use(protect);

router.get('/', getSessions);
router.delete('/revoke-all', revokeAllSessions);
router.delete('/:id', revokeSession);

module.exports = router;
