const express = require('express');
const mysqlConnection = require("./connection");
const bodyParser = require('body-parser');

const app = express();


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));




app.post('/login1', (req, res) => {
    
    mysqlConnection.query('select * from rk where `email`=? and `pass`=?', [req.body.email, req.body.pass], function(error, results, fields) {
        console.log(results);
        if (Object.keys(results).length === 0) {
            console.log("alert");
            
            
        } else {
            console.log("find user")
            res.send(req.body)
          
        }
    });
});



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});