require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const app = express();
const path = require('path');
const helmet = require('helmet');
const { generalLimiter } = require('./middleware/rateLimiter');
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(generalLimiter);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001',
        'https://onlinesaathi-sso.vercel.app', // Legacy Vercel Domain
        'https://docs.i-sewa.in', // Production Docs
        'https://accounts.i-sewa.in', // Production Client
        'https://api.i-sewa.in', // Production API
        'https://www.i-sewa.in',
        'https://i-sewa.in'

    ],
    credentials: true
}));

// Database Connection
connectDB();

app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auth/webauthn', require('./routes/webauthnRoutes')); // WebAuthn / Biometrics
app.get('/.well-known/openid-configuration', require('./controllers/oauthController').discovery);
app.use('/api/oauth', require('./routes/oauthRoutes')); // Mount OAuth
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/applications', require('./routes/applicationRoutes'));
app.use('/api/admin/orgs', require('./routes/organizationRoutes'));
app.use('/api/admin/audit', require('./routes/auditRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/devices', require('./routes/deviceRoutes'));
app.use('/api/2fa', require('./routes/twoFactorRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger Documentation
// Swagger Documentation
try {
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpecs = require('./config/swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
} catch (err) {
    console.error("Swagger setup failed:", err);
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'A server error has occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Export for Vercel Serverless
module.exports = app;
