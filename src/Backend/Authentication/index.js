const express = require('express');
const db = require("../dbhelper");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { json } = require('body-parser');
const val = require('./constant');
var generator = require('generate-password');

const { Status } = require('tslint/lib/runner');
const SECRET_KEY = 'RAUNAK'
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));



const allregisterdUser = (req, res) => {

    db.runQuery(req, res, val.selectAllQuery, [req.body.id])


}
var password = generator.generate({
    length: 10,
    numbers: true
});
//post Api for login
const login = (req, res) => {
    db.db.query(val.loginQuery, [req.body.email_id], function (err, result) {

        // user does not exists
        if (err) {
            return res.status(400).send({
                msg: err
            });
        }
        if (!result.length) {
            console.log("length error")
            return res.status(401).send({
                msg: 'Email or password is incorrect!'
            });
        }
        // check password

        console.log("Password")
        bcrypt.compare(
            req.body.password,
            result[0]['password'],
            (bErr, bResult) => {
                // wrong password
                if (bErr) {
                    throw bErr;

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

                    res.send(err)
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






//common method for send email through node mailer
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: val.email,
        pass: val.appPassword
    },
    port: val.port,
    host: val.emailHost
});

//Post api for forget password
const forgotPassword = (req, res) => {


    db.db.query(val.loginQuery, [req.body.email_id], function (error, results, fields) {
        // Send Email for For forget password varification

        if (Object.keys(results).length === 0) {
            console.log(error)

        }
        else {

            var mailOptions = {
                to: req.body.email_id,
                subject: "password for login is: ",
                html: "<h3>password for account login is </h3>" + "<h1 style='font-weight:bold;'>" + password + "</h1>" // html body
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                res.status(200).send({ msg: "password has been sent" });
            });
        }
    })

}

const verifyPassword = function (req, res, err) {

    console.log(req.body.password)
    if (req.body.password == password) {
        return res.send("You has been successfully login");
    }
    return res.send(err)


};

// Opt for Varification
const sendOtp = function (req, res) {
    email_id = req.body.email_id;

    // send mail with defined transport object
    var mailOptions = {
        to: req.body.email_id,
        subject: "Otp for registration is: ",
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + val.otp + "</h1>" // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.send(Status);
    });
};
const verifyOtp = function (req, res, err) {
    otp = req.body.otp
    console.log(req.body.otp)
    if (req.body.otp == val.otp) {
        return res.send(Status);
    }
    return res.send(err)
};



module.exports = { allregisterdUser, login, register, forgotPassword, sendOtp, verifyOtp, verifyPassword };
