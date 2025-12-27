
const mysql = require('mysql');
require('dotenv').config();

var db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.CUSTOMUSER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    charset: 'utf8mb4',
    multipleStatements: true,
    insecureAuth: true

});




//________________________ADD FOR SMART REPLY______________________________//
//________________________________________________________________________//


db.connect((err) => {
    if (!err) {

        console.log("Connected ");
        console.log('Connection state ***** : ', db.state);
        // ping the database every 5 min
        const pingInterval = setInterval(() => {
            db.ping((error) => {
                if (error) {
                    console.error('Error pinging the MySQL database: ', error);
                    clearInterval(pingInterval); // stop pinging if an error occurs
                } else {
                    console.log('Successfully pinged the MySQL database.');
                }
            });
        }, 5 * 60 * 1000); // ping interval in milliseconds



    } else {
        console.log("Connection failed" + JSON.stringify(err, undefined, 2));
    }
});


async function runQuery(req, res, query, param) {


    try {
        if (db.state === 'disconnected') {
            console.log("** if con" + "runQuery" + "**" + db.state)
            db.connect();
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
    } catch (err) {
        console.log(err)
    }

}

function errlog(errData) {
    // console.log(errData)
    if (errData != '') {
        var issue = encodeURIComponent(errData)
        console.log("***********")
        console.log(issue)
        excuteQuery(process.env.crachlogQuery, [issue])
    }
}

async function excuteQuery(query, param) {
    try {
        if (db.state === 'disconnected') {
            console.log("** if con" + "excuteQuery" + "**" + db.state)
            db.connect();
        }
        console.log("**" + "excuteQuery" + "**" + db.state)
        return new Promise((resolve, reject) => {
            db.query(query, param, (err, results) => {
                console.log(query)
                if (err) {
                    
                    console.log(err)
                    return reject(err);
                }
                return resolve(results);
            });

        }).catch((reason) => {
            console.log("Error is loged by promise")
           console.log(reason);
          })

    } catch (err) {
        console.log("_____DB EXCUTEQUERY ERR ______")
        console.log(err)
    }


}


module.exports = { runQuery, db, excuteQuery, errlog };


