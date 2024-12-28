const swaggerJSDoc = require('swagger-jsdoc');

const swagger = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'EngageKart API',
            version: '1.0.0',
            description: 'API documentation for EngageKart project.',
        },
        servers: [
            {
                url: 'http://localhost:3004',
                description: 'Development Server',
            },
            {
                url: 'https://settings.stacknize.com',
                description: 'Staging Server',
            }
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
    apis: [
        'src/Backend/settings/settingsRouter.js'
    ],
});

module.exports = swagger;