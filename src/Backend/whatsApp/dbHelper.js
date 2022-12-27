
const mysql = require('mysql2');
require('dotenv').config();

var db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.CUSTOMUSER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    multipleStatements: true,
    insecureAuth: true

});

db.connect((err) => {
    if (!err) {
        console.log("Connected ");

    } else {
        console.log("Connection failed" + JSON.stringify(err, undefined, 2));
    }
});
module.exports=db;