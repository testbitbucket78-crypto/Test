const mysql = require('mysql2');

var mysqlConnection = mysql.createConnection({
    host: "8.219.172.35",
    user: "scroot",
    password: "amsdb1234",
    database: "cip_project",
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