const mysql = require('mysql2');
const val = require('./Authentication/constant');


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

    
    try {
        db.connect();
    } catch (err) {
        console.log(err)
    }
    db.query(query, param, (err, result) => {


        try {
            console.log(result)
            res.send(result)
        } catch (err) {
            console.error(err);
            errlog(err)
            res.send(err)

        }



    });


}

function errlog(errData) {
   // console.log(errData)
   if(errData!=''){
   var issue= encodeURIComponent(errData)
   console.log("***********")
   console.log(issue)
   excuteQuery(val.crachlogQuery, [issue])
   }
}

function excuteQuery(query, param) {


    try {
        db.connect();
    } catch (err) {
        console.log(err)
    }
    return new Promise((resolve, reject) => {
        db.query(query, param, (err, results) => {
            if (err) return reject(err);
            return resolve(results);
        });
    });
}


module.exports = { runQuery, db, excuteQuery, errlog };