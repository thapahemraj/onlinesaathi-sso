const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

const partnerSwaggerPath = path.join(__dirname, 'partner-swagger.json');

const loadPartnerSwagger = () => {
    try {
        if (!fs.existsSync(partnerSwaggerPath)) return null;
        return JSON.parse(fs.readFileSync(partnerSwaggerPath, 'utf8'));
    } catch (error) {
        console.error('Failed to load partner-swagger.json:', error.message);
        return null;
    }
};

const partnerSwagger = loadPartnerSwagger();

const normalizePartnerPath = (swaggerPath) => swaggerPath.replace(/^\/api/, '');

const includePartnerPath = (swaggerPath) => swaggerPath.startsWith('/api/');

const detailedPartnerPaths = Object.entries(partnerSwagger?.paths || {}).reduce((acc, [swaggerPath, pathDef]) => {
    if (!includePartnerPath(swaggerPath)) return acc;
    acc[normalizePartnerPath(swaggerPath)] = pathDef;
    return acc;
}, {});

const partnerComponents = partnerSwagger?.components || {};
const partnerTags = partnerSwagger?.tags || [];

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Online Saathi SSO API',
            version: '1.0.0',
            description: 'API documentation for the Online Saathi Single Sign-On system',
            contact: {
                name: 'API Support',
                email: 'support@onlinesaathi.org',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Local Development Server',
            },
            {
                url: 'https://api.i-sewa.in/api',
                description: 'Production Server (i-sewa.in)',
            },
        ],
        components: {
            ...partnerComponents,
            securitySchemes: {
                ...(partnerComponents.securitySchemes || {}),
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            ...partnerTags,
            {
                name: 'IME',
                description: 'IME service endpoints',
            },
            {
                name: 'Prabhu',
                description: 'Prabhu service endpoints',
            },
            {
                name: 'Remittance',
                description: 'Remittance service endpoints',
            },
        ],
        paths: detailedPartnerPaths,
    },
    // Vercel serverless environment path resolution
    apis: [
        path.join(__dirname, '../routes/*.js'), // Local/Standard
        path.join(process.cwd(), 'routes/*.js'), // Vercel potentially
        path.join(process.cwd(), 'server/routes/*.js') // Vercel monorepo structure
    ],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
