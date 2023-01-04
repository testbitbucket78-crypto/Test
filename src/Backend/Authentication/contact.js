var express = require("express");
const db = require("./dbhelper");
var app = express();
const val=require('./constant');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res){
 
  db.runQuery(req,res,val.sql1,[req.body.id]);
});



app.post('/contact', function (req, res) {
    Name = req.body.Name
    Phone_number = req.body.Phone_number
    emailId = req.body.emailId
       
        var values = [[Name, Phone_number, emailId]];

        db.runQuery(req,res,val.sql, [values]) 
    
   
});

app.listen(3002);
