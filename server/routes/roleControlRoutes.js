const express = require('express');
const router = express.Router();
const { protect, isSubAdmin } = require('../middleware/authMiddleware');
const {
    listRoleServiceConfigs,
    getRoleServiceConfig,
    upsertRoleServiceConfig,
    toggleRoleService,
    updateRoleServiceCommission,
    getMyRoleServiceAccess,
    getSupportedRoles
} = require('../controllers/roleServiceController');

router.use(protect);

router.get('/me', getMyRoleServiceAccess);

router.use(isSubAdmin);
router.get('/roles', getSupportedRoles);
router.get('/', listRoleServiceConfigs);
router.get('/:role', getRoleServiceConfig);
router.put('/:role', upsertRoleServiceConfig);
router.patch('/:role/services/:serviceKey/toggle', toggleRoleService);
router.patch('/:role/services/:serviceKey/commission', updateRoleServiceCommission);

module.exports = router;
