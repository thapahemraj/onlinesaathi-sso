const axios = require('axios');

const PARTNER_API_BASE_URL = process.env.PARTNER_API_BASE_URL || 'https://api.onlinesaathi.org';

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

const proxyPartnerService = async (req, res) => {
    const targetUrl = `${PARTNER_API_BASE_URL}${req.originalUrl}`;

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: buildForwardHeaders(req),
            data: req.body,
            timeout: 30000,
            validateStatus: () => true,
            responseType: 'json',
        });

        res.status(response.status).json(response.data);
    } catch (error) {
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
