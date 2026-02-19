const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDevices, removeDevice } = require('../controllers/deviceController');

// All routes are protected
router.use(protect);

router.get('/', getDevices);
router.delete('/:id', removeDevice);

module.exports = router;
