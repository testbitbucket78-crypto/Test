const express=require('express')
const bodyParser = require('body-parser');
const cors=require('cors');
const router=require('./flowRouter')
const app=express();
app.use(bodyParser.json({limit: '10mb'}));
app.use(cors());
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use('/',router);
app.use(express.json());

app.listen(3013, () => {
    console.log('Server is running on port 3013');
});