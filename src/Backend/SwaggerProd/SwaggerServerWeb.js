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
            title: 'EngageZilla API',
            version: '1.0.0',
            description: 'API documentation for Engagezilla project.',
        },
        servers: [
        {
            url: getUrl('settings'),
            description: 'Engagezilla Server',
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
       `${basePath}/SwaggerDocProd/WA_Web.js`
    ],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger));



app.listen(3012, function () {
  console.log("Server is running on port 3012");
});