const axios = require('axios');
const { getServiceAccessForRole } = require('./roleServiceController');
const { logAction } = require('./auditController');

const PRABHU_API_BASE_URL = process.env.PRABHU_API_BASE_URL || '';
const REMITTANCE_API_BASE_URL = process.env.REMITTANCE_API_BASE_URL || PRABHU_API_BASE_URL || '';
const IME_PARTNER_API_BASE_URL = process.env.IME_PARTNER_API_BASE_URL || process.env.IME_SOAP_BASE_URL || '';
const PRABHU_TIMEOUT_MS = Number(process.env.PRABHU_TIMEOUT_MS || 30000);
const IME_TIMEOUT_MS = Number(process.env.IME_TIMEOUT_MS || 30000);

// IME SOAP credentials (doc v1.2) — injected per-request
const IME_SOAP_CREDS = {
    AccessCode:      process.env.IME_ACCESS_CODE || '',
    UserName:        process.env.IME_USERNAME || '',
    Password:        process.env.IME_PASSWORD || '',
    PartnerBranchId: process.env.IME_PARTNER_BRANCH_ID || '',
};

const hopByHopHeaders = new Set([
    'host',
    'connection',
    'content-length',
    'accept-encoding',
]);

const buildForwardHeaders = (req) => {
    const headers = {};

    Object.entries(req.headers || {}).forEach(([key, value]) => {
        const lower = key.toLowerCase();
        if (hopByHopHeaders.has(lower)) return;
        headers[key] = value;
    });

    return headers;
};

const deriveServiceKey = (originalUrl = '') => {
    if (originalUrl.startsWith('/api/IME/')) return 'ime';
    if (originalUrl.startsWith('/api/Prabhu/')) return 'prabhu';
    if (originalUrl.startsWith('/api/Remittance/')) return 'remittance';
    if (originalUrl.startsWith('/api/wallet/')) return 'wallet';
    if (originalUrl.startsWith('/api/account/')) return 'account';
    return null;
};

const safeSerialize = (value, maxLen = 4000) => {
    try {
        const raw = typeof value === 'string' ? value : JSON.stringify(value || {});
        if (!raw) return '';
        return raw.length > maxLen ? `${raw.slice(0, maxLen)}...` : raw;
    } catch {
        return '';
    }
};

const extractReference = (payload = {}) => (
    payload?.ReferenceNo ||
    payload?.referenceNo ||
    payload?.referenceId ||
    payload?.txnRef ||
    payload?.transactionId ||
    payload?.data?.ReferenceNo ||
    payload?.data?.referenceId ||
    null
);

const resolveBaseUrlForService = (serviceKey) => {
    if (serviceKey === 'prabhu') return PRABHU_API_BASE_URL;
    if (serviceKey === 'remittance') return REMITTANCE_API_BASE_URL;
    if (serviceKey === 'ime') return IME_PARTNER_API_BASE_URL;
    return '';
};

const resolveTimeoutForService = (serviceKey) => {
    if (serviceKey === 'prabhu') return PRABHU_TIMEOUT_MS;
    if (serviceKey === 'ime') return IME_TIMEOUT_MS;
    return 30000;
};

// Inject service-specific auth headers so upstream partner gets credentials
const buildServiceHeaders = (req, serviceKey) => {
    const base = buildForwardHeaders(req);
    if (serviceKey === 'ime') {
        // Doc v1.2: credentials passed as custom headers for REST gateway;
        // for raw SOAP endpoints the SOAP controller handles envelope wrapping.
        base['X-IME-AccessCode']      = IME_SOAP_CREDS.AccessCode;
        base['X-IME-UserName']        = IME_SOAP_CREDS.UserName;
        base['X-IME-Password']        = IME_SOAP_CREDS.Password;
        base['X-IME-PartnerBranchId'] = IME_SOAP_CREDS.PartnerBranchId;
    }
    return base;
};

const proxyPartnerService = async (req, res) => {
    try {
        const startedAt = Date.now();
        const serviceKey = deriveServiceKey(req.originalUrl);
        if (serviceKey && req.user?.role) {
            const serviceAccess = await getServiceAccessForRole(req.user.role, serviceKey);
            if (!serviceAccess.enabled) {
                return res.status(403).json({
                    success: false,
                    message: `Service '${serviceKey}' is disabled for role '${req.user.role}'.`,
                    commission: serviceAccess.commission
                });
            }
        }

        const targetBaseUrl = resolveBaseUrlForService(serviceKey);
        if (!targetBaseUrl) {
            return res.status(500).json({
                success: false,
                message: `Base URL is not configured for service '${serviceKey || 'unknown'}'. Set env config before calling this endpoint.`
            });
        }
        const targetUrl = `${targetBaseUrl}${req.originalUrl}`;

        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: buildServiceHeaders(req, serviceKey),
            data: req.body,
            timeout: resolveTimeoutForService(serviceKey),
            validateStatus: () => true,
            responseType: 'json',
        });

        if (serviceKey && ['ime', 'prabhu', 'remittance'].includes(serviceKey)) {
            await logAction(
                req,
                `Partner ${serviceKey.toUpperCase()} ${req.method}`,
                'PartnerTransaction',
                extractReference(response.data),
                {
                    service: serviceKey,
                    endpoint: req.originalUrl,
                    method: req.method,
                    statusCode: response.status,
                    durationMs: Date.now() - startedAt,
                    requestQuery: req.query || {},
                    requestBody: safeSerialize(req.body),
                    responseBody: safeSerialize(response.data)
                },
                response.status < 400 ? 'Success' : 'Failure'
            );
        }

        res.status(response.status).json(response.data);
    } catch (error) {
        const serviceKey = deriveServiceKey(req.originalUrl);
        if (serviceKey && ['ime', 'prabhu', 'remittance'].includes(serviceKey)) {
            await logAction(
                req,
                `Partner ${serviceKey.toUpperCase()} ${req.method}`,
                'PartnerTransaction',
                null,
                {
                    service: serviceKey,
                    endpoint: req.originalUrl,
                    method: req.method,
                    statusCode: error?.response?.status || 502,
                    requestQuery: req.query || {},
                    requestBody: safeSerialize(req.body),
                    responseBody: safeSerialize(error?.response?.data || { message: error.message })
                },
                'Failure'
            );
        }

        console.error('[PartnerProxy] Request failed:', {
            method: req.method,
            path: req.originalUrl,
            message: error.message,
            status: error?.response?.status,
            data: error?.response?.data,
        });

        res.status(error?.response?.status || 502).json({
            success: false,
            message: error?.response?.data?.message || 'Partner service request failed',
            error: error.message,
        });
    }
};

module.exports = {
    proxyPartnerService,
};
