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
                email: 'support@onlinesaathi.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Local Development Server',
            },
            {
                url: 'https://onlinesaathi-sso.vercel.app/api',
                description: 'Production Server',
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
    apis: [require('path').join(__dirname, '../routes/*.js')], // Use absolute path
};

const specs = swaggerJsdoc(options);
module.exports = specs;
