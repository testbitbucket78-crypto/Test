const mysql = require('mysql2');

var mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "raunak",
    multipleStatements: true,
    insecureAuth: true

});

mysqlConnection.connect((err) => {
    if (!err) {
        console.log("Connected");
    } else {
        console.log("Connection failed" + JSON.stringify(err, undefined, 2));
    }
});

module.exports = mysqlConnection;