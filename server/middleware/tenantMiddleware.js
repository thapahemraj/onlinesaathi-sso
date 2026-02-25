const Organization = require('../models/Organization');
const { getTenantConnection } = require('../utils/tenantManager');

/**
 * Middleware to resolve the tenant from the request and setup isolation
 */
const tenantMiddleware = async (req, res, next) => {
    try {
        // 1. Resolve Tenant ID (from header, domain, or authenticated user)
        // Check X-Tenant-Id header or X-Organization-Slug
        const orgSlug = req.headers['x-organization-slug'];

        let org;
        if (orgSlug) {
            org = await Organization.findOne({ slug: orgSlug });
        } else if (req.user) {
            // Find organization owned by user or where user is a member
            org = await Organization.findOne({ owner: req.user._id });
        }

        if (!org) {
            // Not every route needs a tenant (e.g., global auth), so we just proceed
            return next();
        }

        // 2. Setup Tenant Context
        req.tenant = {
            id: org._id,
            slug: org.slug,
            dbUri: org.dbUri || process.env.MONGO_URI // Fallback to main DB if not custom
        };

        // 3. (Optional) Database Isolation
        // If org.dbUri is unique, the controller can use getTenantConnection(org._id, org.dbUri)
        // to get the specific dynamic connection for this request.

        next();
    } catch (error) {
        console.error('Tenant middleware error:', error);
        res.status(500).json({ message: 'Internal Server Error during tenant resolution' });
    }
};

module.exports = { tenantMiddleware };
