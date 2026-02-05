require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001',
        'https://onlinesaathi-sso.vercel.app' // Production Domain
    ],
    credentials: true
}));

// Database Connection
connectDB();

app.get('/', (req, res) => {
    res.send('SSO System API is working nicely!');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/applications', require('./routes/applicationRoutes'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Export for Vercel Serverless
module.exports = app;
