
const express=require('express')
const router=require('./router.js')
const bodyParser = require('body-parser');
const db = require("../dbhelper");
const userController=require('./user.js');
const indexController=require('./index.js');
const cors=require('cors')
const app=express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/',router);
app.listen(3003, () => {
    console.log('Server is running on port 3003');
});