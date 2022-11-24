var express = require("express");
const mysqlConnection = require("./connection");
var app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

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



app.post('/contact', function (req, res) {
    Name = req.body.Name
    Phone_number = req.body.Phone_number
    emailId = req.body.emailId
         var sql = "INSERT INTO EndCustomer (Name,Phone_number,emailId) VALUES ?";
        var values = [[Name, Phone_number, emailId]];

        mysqlConnection.query(sql, [values], function (err, result , fields) {
            if (err) {
                
                throw err;
            }
            else {
                res.status(200).send({
                    msg: 'Registered Contact',
                    user: result
                });

            }
        });
   
});

app.listen(3002);
