const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    updateUser
} = require('../controllers/adminController');

// All routes are protected and admin-only
router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.route('/users/:id')
    .delete(deleteUser)
    .put(updateUser);

module.exports = router;
