var express = require("express");
const db = require("./dbhelper");
var app = express();
const val=require('./constant');

var app = express();
app.get('/', function(req, res){

  db.runQuery(req,res,val.selectQuery,[req.body])

});

app.listen(3004);

