const express=require('express')
const router=require('./settingsRouter.js')
const bodyParser = require('body-parser');
const cors=require('cors')
const app=express();
app.use(bodyParser.json({limit: '10mb'}));
app.use(cors());
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use('/',router);
app.use(express.json());
const swagger = require('./swagger.js');
const swaggerUI = require('swagger-ui-express');


app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swagger));
app.get('/swagger-json', (_, res) => res.json(swagger));
app.listen(3004, () => {
    console.log('Server is running on port 3004');
});