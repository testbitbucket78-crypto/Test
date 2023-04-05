const express = require('express');
const db = require("../dbhelper");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { json } = require('body-parser');
const val = require('./constant');
const { Status } = require('tslint/lib/runner');
const CryptoJS = require('crypto-js');
const SECRET_KEY = 'RAUNAK'
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
var mailOpt = "";


const allregisterdUser = (req, res) => {

    db.runQuery(req, res, val.selectAllQuery, [req.body.id])


}

//post Api for login
const login = (req, res) => {
    var data = req.body.email_id
    db.db.query(val.loginQuery, [req.body.email_id], function (err, result) {
        email = req.body.email_id;
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
    mailOpt=data

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
    email_id = req.body.email_id;

    db.db.query(val.loginQuery, [req.body.email_id], function (error, results, fields) {
        // Send Email for For forget password varification

        if (Object.keys(results).length === 0) {
            console.log(error)

        }
        else {

            db.db.query(val.uidresetEmailQuery, [req.body.email_id], function (err, results, fields) {
                var uid = results;

                // Encrypt
                var cipherdata = CryptoJS.AES.encrypt(JSON.stringify(uid), 'secretkey123').toString();




                if (err) {
                    console.log(err)
                } else {

                    var mailOptions = {
                        to: req.body.email_id,
                        subject: "Request for reset Password: ",
                        html: '<p>You requested for reset password, kindly use this <a href="http://localhost:4200/reset-password?SP_ID=' + cipherdata + '">link</a>to reset your password</p>'
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


            });
        }
    })

}

//resetPssword api
const resetPassword = function (req, res) {
    SP_ID = req.body.SP_ID
    password = req.body.password
    confirmPassword = req.body.confirmPassword
    if (password != confirmPassword) {
        throw error;
    }
    else {
        bcrypt.hash(password, 10, function (err, hash) {
            db.runQuery(req, res, val.updatePassword, [hash, SP_ID]);
        })
    }


};

// Opt for Varification
const sendOtp = function (req, res) {
    email_id = req.body.email_id;
   console.log("send otp")
   console.log(val.otp)
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
      console.log(otp)
      console.log(val.otp)
    if (req.body.otp == val.otp) {
        return res.send(Status);
    }
    return res.send(err)
};



module.exports = { allregisterdUser, login, register, forgotPassword, sendOtp, verifyOtp, resetPassword, mailOpt };
