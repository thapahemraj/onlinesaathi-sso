const RoleServiceConfig = require('../models/RoleServiceConfig');
const { ROLE_LEVELS } = require('../middleware/authMiddleware');

const ROLE_OPTIONS = ['user', 'member', 'saathi', 'agent', 'supportTeam', 'subAdmin', 'superAdmin', 'admin'];

const DEFAULT_SERVICES = [
    { key: 'ime', name: 'IME Transfer' },
    { key: 'prabhu', name: 'Prabhu Transfer' },
    { key: 'remittance', name: 'Remittance' },
    { key: 'wallet', name: 'Wallet' },
    { key: 'account', name: 'Account' },
    { key: 'kyc', name: 'KYC' },
    { key: 'schemes', name: 'Schemes' },
    { key: 'jobs', name: 'Jobs' }
];

const normalizeServices = (services = []) => {
    const map = new Map();

    for (const service of services) {
        const key = String(service?.key || '').trim().toLowerCase();
        if (!key) continue;

        map.set(key, {
            key,
            name: service?.name ? String(service.name).trim() : key,
            enabled: typeof service?.enabled === 'boolean' ? service.enabled : true,
            commission: {
                type: service?.commission?.type === 'flat' ? 'flat' : 'percent',
                value: Number(service?.commission?.value || 0),
                minAmount: Number(service?.commission?.minAmount || 0),
                maxAmount: service?.commission?.maxAmount === null || service?.commission?.maxAmount === undefined || service?.commission?.maxAmount === ''
                    ? null
                    : Number(service.commission.maxAmount)
            }
        });
    }

    return Array.from(map.values());
};

const defaultConfigForRole = (role) => ({
    role,
    services: DEFAULT_SERVICES.map((service) => ({
        ...service,
        enabled: true,
        commission: { type: 'percent', value: 0, minAmount: 0, maxAmount: null }
    }))
});

const getOrCreateRoleConfig = async (role) => {
    let config = await RoleServiceConfig.findOne({ role });
    if (!config) {
        config = await RoleServiceConfig.create(defaultConfigForRole(role));
    }
    return config;
};

const getServiceAccessForRole = async (role, serviceKey) => {
    const normalizedRole = String(role || '').trim();
    const normalizedServiceKey = String(serviceKey || '').trim().toLowerCase();

    if (!normalizedRole || !normalizedServiceKey) {
        return { enabled: true, commission: { type: 'percent', value: 0, minAmount: 0, maxAmount: null } };
    }

    const config = await getOrCreateRoleConfig(normalizedRole);
    const rule = (config.services || []).find((service) => service.key === normalizedServiceKey);

    if (!rule) {
        return { enabled: true, commission: { type: 'percent', value: 0, minAmount: 0, maxAmount: null } };
    }

    return {
        enabled: !!rule.enabled,
        commission: rule.commission || { type: 'percent', value: 0, minAmount: 0, maxAmount: null }
    };
};

const listRoleServiceConfigs = async (req, res) => {
    try {
        const configs = await RoleServiceConfig.find({}).sort({ role: 1 });
        res.json(configs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getRoleServiceConfig = async (req, res) => {
    try {
        const { role } = req.params;
        if (!ROLE_OPTIONS.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const config = await getOrCreateRoleConfig(role);
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const upsertRoleServiceConfig = async (req, res) => {
    try {
        const { role } = req.params;
        const { services = [] } = req.body;

        if (!ROLE_OPTIONS.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const requesterLevel = ROLE_LEVELS[req.user.role] || 0;
        const targetRoleLevel = ROLE_LEVELS[role] || 0;
        if (!['superAdmin', 'admin'].includes(req.user.role) && targetRoleLevel >= requesterLevel) {
            return res.status(403).json({ message: 'Cannot modify same or higher role config' });
        }

        const normalizedServices = normalizeServices(services);
        const updated = await RoleServiceConfig.findOneAndUpdate(
            { role },
            { role, services: normalizedServices, updatedBy: req.user._id },
            { upsert: true, returnDocument: 'after' }
        );

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const toggleRoleService = async (req, res) => {
    try {
        const { role, serviceKey } = req.params;
        const { enabled } = req.body;

        if (!ROLE_OPTIONS.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        if (typeof enabled !== 'boolean') {
            return res.status(400).json({ message: 'enabled must be boolean' });
        }

        const config = await getOrCreateRoleConfig(role);
        const key = String(serviceKey).trim().toLowerCase();
        const existing = config.services.find((service) => service.key === key);

        if (existing) {
            existing.enabled = enabled;
        } else {
            config.services.push({
                key,
                name: key,
                enabled,
                commission: { type: 'percent', value: 0, minAmount: 0, maxAmount: null }
            });
        }

        config.updatedBy = req.user._id;
        await config.save();

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateRoleServiceCommission = async (req, res) => {
    try {
        const { role, serviceKey } = req.params;
        const { type = 'percent', value = 0, minAmount = 0, maxAmount = null } = req.body;

        if (!ROLE_OPTIONS.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        if (!['flat', 'percent'].includes(type)) {
            return res.status(400).json({ message: 'Invalid commission type' });
        }

        const config = await getOrCreateRoleConfig(role);
        const key = String(serviceKey).trim().toLowerCase();
        let existing = config.services.find((service) => service.key === key);

        if (!existing) {
            config.services.push({
                key,
                name: key,
                enabled: true,
                commission: { type: 'percent', value: 0, minAmount: 0, maxAmount: null }
            });
            existing = config.services.find((service) => service.key === key);
        }

        existing.commission = {
            type,
            value: Number(value || 0),
            minAmount: Number(minAmount || 0),
            maxAmount: maxAmount === null || maxAmount === '' || maxAmount === undefined ? null : Number(maxAmount)
        };

        config.updatedBy = req.user._id;
        await config.save();

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMyRoleServiceAccess = async (req, res) => {
    try {
        const role = req.user.role;
        const config = await getOrCreateRoleConfig(role);
        res.json({ role, services: config.services || [] });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getSupportedRoles = async (req, res) => {
    res.json({ roles: ROLE_OPTIONS });
};

module.exports = {
    listRoleServiceConfigs,
    getRoleServiceConfig,
    upsertRoleServiceConfig,
    toggleRoleService,
    updateRoleServiceCommission,
    getMyRoleServiceAccess,
    getSupportedRoles,
    getServiceAccessForRole
};
