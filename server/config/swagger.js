const swaggerJsdoc = require('swagger-jsdoc');

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
            securitySchemes: {
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
    },
    // Vercel serverless environment path resolution
    apis: [
        require('path').join(__dirname, '../routes/*.js'), // Local/Standard
        require('path').join(process.cwd(), 'routes/*.js'), // Vercel potentially
        require('path').join(process.cwd(), 'server/routes/*.js') // Vercel monorepo structure
    ],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
