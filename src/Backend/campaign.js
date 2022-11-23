var express = require("express");
var app = express();
app.get('/', function(req, res){
  var data = 


    [
      { "id": 1, "name": "xyz", "time": "10-7-2022", "channel": "Whatsapp web", "message": "ABC" },
       { "id": 2, "name": "xyz", "time": "10-4-2022", "channel": "Whatsapp web", "message": "ABC" },
        { "id": 3, "name": "xyz", "time": "13-7-2022", "channel": "Whatsapp web", "message": "ABC" }
     
    ]
   res.send(data);
});

app.listen(3003);

