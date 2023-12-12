
const express=require('express')
const router=require('./router.js')
const bodyParser = require('body-parser');
const db = require("../dbhelper");
const userController=require('./user.js');
const indexController=require('./index.js');
const val = require('./constant');
const cors=require('cors')
const app=express();

app.use(cors());

app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use('/',router);


app.listen(3003, () => {
    console.log('Server is running on port 3003');
});

