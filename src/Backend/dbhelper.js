const mysql = require('mysql2');
const val = require('./Authentication/constant')

var db = mysql.createConnection({
    host: val.host,
    user: val.user,
    password: val.password,
    database: val.database,
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


function runQuery(req, res, query, param) {
    if (db.state === 'disconnected'){
       db.connect();
    }
    db.query(query, param, (err, result) => {
     
        if (err) {
            
            res.send(err);
        }

       
        res.send(result)





    });


}



function excuteQuery(query, param) {
    if (db.state === 'disconnected'){
        db.connect();
     }
    return new Promise((resolve, reject) => {
        db.query(query, param, (err, results) => {
            if (err) return reject(err);
            return resolve(results);
        });
    });
}

  
module.exports = { runQuery, db, excuteQuery };