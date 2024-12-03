
const express = require('express')
const router = require('./router.js')
const bodyParser = require('body-parser');
const db = require("../dbhelper");
const userController = require('./user.js');
const indexController = require('./index.js');
const val = require('./constant');
const cors = require('cors')
const app = express();

app.use(cors());

app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express')

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "EngageKart API Documentation",
      version: "1.0.0",
      description: "API documentation for EngageKart project. *Note:* For authorization, enter only the raw token without 'Bearer' prefix."
    },
    servers: [
      {
        url: 'https://authapi.stacknize.com',
        description: 'Preprod Server',
      },
      {
        url: 'http://localhost:3003',
        description: 'Stagging Server',
      },
      {
        url: 'https://waweb.stacknize.com',
        description: 'Stagging Server',
      },
      {
        url: 'http://localhost:3009',
        description: 'Preprod Server',
      },{
        url: 'https://contactapi.stacknize.com/',
        description: 'Stagging Server',
      },
      {
        url: 'http://localhost:3002',
        description: 'Preprod Server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // Optional, you can specify the token format
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],

    tags: [
      { name: 'Authentication' },
      {name: 'webJS'},
      {name: 'Contact'}

    ],
  },
  apis: [
    './router.js',
    '../webJS/whatsAppWeb.js',
    '../Contact/contact.js'

  ]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  swaggerOptions: {
    deepLinking: false,
  },
}));
app.use('/', router);


app.listen(3003, () => {
  console.log('Server is running on port 3003');
});

