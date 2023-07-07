const express=require('express')
const router=require('./settingsRouter.js')
const bodyParser = require('body-parser');
const cors=require('cors')
const app=express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/',router);


app.listen(3004, () => {
    console.log('Server is running on port 3004');
});