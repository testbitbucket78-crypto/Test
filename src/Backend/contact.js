var express = require("express");
var app = express();
app.get('/', function(req, res){
  var data = 


    [
      { "id": 1, "name": "ashok", "phone_number": "8699424667", "email": "ak31@gmail.com" },
      { "id": 2, "name": "ashok Kumar", "phone_number": "8699424667", "email": "ak31@gmail.com" },
      { "id": 3, "name": "Amit", "phone_number": "8699424667", "email": "ak31@gmail.com" },
      { "id": 4, "name": "Anuj", "phone_number": "8699424667", "email": "ak31@gmail.com" },
      { "id": 5, "name": "Sumit", "phone_number": "8699424667", "email": "ak31@gmail.com" },
      { "id": 6, "name": "Arjun", "phone_number": "8690424667", "email": "ak31@gmail.com" }
  
     
    ]
   res.send(data);
});

app.listen(3002);
