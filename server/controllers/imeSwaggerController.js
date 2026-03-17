const axios = require('axios');

const IME_BASE_URL = process.env.IME_API_BASE_URL || 'https://imerex.imepay.com.np';
const IME_USERNAME = process.env.IME_API_USERNAME || '';
const IME_PASSWORD = process.env.IME_API_PASSWORD || '';
const IME_TOKEN_URL = process.env.IME_TOKEN_URL || `${IME_BASE_URL}/token`;

let cachedToken = null;
let tokenExpiresAt = 0;

const getAccessToken = async () => {
    if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
        return cachedToken;
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', IME_USERNAME);
    params.append('password', IME_PASSWORD);

    const { data } = await axios.post(IME_TOKEN_URL, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 20_000,
    });

    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
    return cachedToken;
};

const imeSwaggerProxy = async (req, res) => {
    try {
        const token = await getAccessToken();
        const targetUrl = `${IME_BASE_URL}/api/IME${req.path}`;

        const response = await axios({
            method: req.method,
            url: targetUrl,
            params: req.query,
            data: req.body,
            timeout: 30_000,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            validateStatus: () => true,
        });

        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error('[IME Swagger Proxy] Request failed:', {
            method: req.method,
            path: req.originalUrl,
            message: error.message,
            status: error?.response?.status,
            data: error?.response?.data,
        });

        return res.status(error?.response?.status || 500).json({
            success: false,
            message: error?.response?.data?.message || 'IME API request failed',
            error: error.message,
        });
    }
};

module.exports = {
    imeSwaggerProxy,
};
