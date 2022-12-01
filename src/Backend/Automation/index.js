var express = require("express");
var app = express();
app.get('/', function(req, res){
  var data = 


    [
      { "id": 1, "subscribers": "2", "status": "active", "message": "6" },
       { "id": 2, "subscribers": "1", "status": "inactive", "message": "9" },
        { "id": 3, "subscribers": "6", "status": "active", "message": "2" }
     
    ]
   res.send(data);
});

app.listen(3004);
