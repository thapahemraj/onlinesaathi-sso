const mongoose = require('mongoose');

// Cache for tenant connections
const tenantConnections = new Map();

/**
 * Get or create a database connection for a specific tenant
 * @param {string} tenantId - The unique ID of the tenant (Organization)
 * @param {string} dbUri - The MongoDB connection string for this tenant
 */
const getTenantConnection = async (tenantId, dbUri) => {
    if (tenantConnections.has(tenantId)) {
        const conn = tenantConnections.get(tenantId);
        if (conn.readyState === 1) return conn;
        // If connection is closed or broken, remove it and reconnect
        tenantConnections.delete(tenantId);
    }

    try {
        const connection = await mongoose.createConnection(dbUri).asPromise();
        tenantConnections.set(tenantId, connection);

        console.log(`[TenantManager] Multi-tenant connection established for: ${tenantId}`);

        connection.on('error', (err) => {
            console.error(`[TenantManager] Connection error for ${tenantId}:`, err);
            tenantConnections.delete(tenantId);
        });

        connection.on('disconnected', () => {
            console.info(`[TenantManager] Connection disconnected for ${tenantId}`);
            tenantConnections.delete(tenantId);
        });

        return connection;
    } catch (error) {
        console.error(`[TenantManager] Failed to connect to tenant DB ${tenantId}:`, error);
        throw error;
    }
};

module.exports = { getTenantConnection };
