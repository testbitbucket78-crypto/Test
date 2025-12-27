const express = require("express");
const { getUrl } = require('../config');
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require('swagger-jsdoc');

const isServer = true;
const basePath = isServer ? '..' : 'src/Backend';

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
            url: getUrl('settings'),
            description: 'EngageKart Server',
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
       `${basePath}/SwaggerDocProd/WA_Official.js`
    ],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger));

app.listen(3014, function () {
  console.log("Server is running on port 3014");
});