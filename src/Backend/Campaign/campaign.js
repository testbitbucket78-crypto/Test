var express = require("express");
const db = require("./dbhelper");
const val=require('./constant');
var app = express();
app.get('/', function(req, res){
  // var data = 


  //   [
  //     { "id": 1, "name": "xyz", "time": "10-7-2022", "channel": "Whatsapp web", "message": "ABC" },
  //      { "id": 2, "name": "xyz", "time": "10-4-2022", "channel": "Whatsapp web", "message": "ABC" },
  //       { "id": 3, "name": "xyz", "time": "13-7-2022", "channel": "Whatsapp web", "message": "ABC" }
     
  //   ]
  //  res.send(data);
  db.runQuery(req,res,val.camQuery,[req.body])

});

app.listen(3006);

