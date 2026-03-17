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
app.set('trust proxy', 1); // Trust the first proxy (Vercel) so rate limiting works accurately
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(generalLimiter);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174', // Vite fallback port
        'http://localhost:5175', // Vite fallback port
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
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/devices', require('./routes/deviceRoutes'));

// Defined routes with require
const twoFactorRoutes = require('./routes/twoFactorRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const auditRoutes = require('./routes/auditRoutes');

app.use('/api/2fa', twoFactorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/account', require('./routes/accountRoutes'));
app.use('/api/features', require('./routes/featureRoutes'));
app.use('/api/apps/voice-ai', require('./routes/appRoutes'));

// RBAC feature routes
app.use('/api/kyc', require('./routes/kycRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/schemes', require('./routes/schemeRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/ime', require('./routes/imeRoutes'));
app.use('/api/IME', require('./routes/imeSwaggerRoutes'));
app.use('/api', require('./routes/partnerServiceRoutes'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger Documentation
try {
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpecs = require('./config/swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
} catch (err) {
    console.error("Swagger setup failed:", err);
}

// Only listen if run directly (Vercel imports this file so require.main !== module)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

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
