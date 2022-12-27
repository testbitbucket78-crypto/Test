const express = require('express');
const db = require("./dbhelper");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { json } = require('body-parser');
const val = require('./constant');
const SECRET_KEY = 'RAUNAK'
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));



const allregisterdUser = (req, res) => {

    db.runQuery(req, res, val.selectAllQuery, [req.body.id])


}
//post Api for login
const login = (req, res) => {
    db.db.query(val.loginQuery, [req.body.email_id], function (err, result) {

        // user does not exists
        if (err) {
            throw err;
            return res.status(400).send({
                msg: err
            });
        }
        if (!result.length) {
            return res.status(401).send({
                msg: 'Email or password is incorrect!'
            });
        }
        // check password
        bcrypt.compare(
            req.body.password,
            result[0]['password'],
            (bErr, bResult) => {
                // wrong password
                if (bErr) {
                    throw bErr;
                    return res.status(401).send({
                        msg: 'Email or password is incorrect!'
                    });
                }
                if (bResult) {
                    const token = jwt.sign({ email_id: result.email_id }, SECRET_KEY);
                    return res.status(200).send({
                        msg: 'Logged in!',
                        token,
                        user: result[0]
                    });
                }
                return res.status(401).send({
                    msg: 'Username or password is incorrect!'
                });
            }
        );
    }
    );

}

//post api for register

const register = function (req, res) {
    name = req.body.name
    mobile_number = req.body.mobile_number
    email_id = req.body.email_id
    password = req.body.password
   confirmPassword = req.body.confirmPassword
    if (password != confirmPassword) {
        throw error;
    } else {
        bcrypt.hash(password, 10, function (err, hash) {

            var values = [[name, mobile_number, email_id, hash]]

            db.db.query(val.registerQuery, [values], function (err, result, fields) {
                if (err) {

                    throw err;
                }
                else {
                    const token = jwt.sign({ email_id: result.email }, SECRET_KEY);
                    res.status(200).send({
                        msg: 'Registered !',
                        token,
                        user: result
                    });

                }
            });
        });
    }
}





//Post api for forget password


const forgotPassword = (req, res) => {


    db.db.query(val.loginQuery, [req.body.email_id], function (error, results, fields) {
        // Send Email for For forget password varification

        if (Object.keys(results).length === 0) {
            console.log(error)
        }
        else {

            const msg = {
                from: val.email,
                to: req.body.email_id,
                subject: "Verification mail for forgot Password",
                text: "Verification For Forgot Password"
            };
            nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: val.email,
                    pass: val.appPassword
                },
                port: val.port,
                host: val.emailHost
            })
                .sendMail(msg, (err) => {
                    if (err) {
                        return console.log('ERROR');
                    }
                    return console.log('Email sent');

                })
 
        }
    })

}

module.exports = { allregisterdUser, login, register, forgotPassword };