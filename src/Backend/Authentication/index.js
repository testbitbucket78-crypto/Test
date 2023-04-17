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
    mailOpt = data

}
const get=(req,res)=>{
    console.log(mailOpt)
    var mailOptions = {
        to: mailOpt,
        subject: "Request for download Contact_Data: ",
        html: '<p>You requested for download Contact_Data, kindly use this <a href="http://localhost:3002/getCheckedExportContact">link</a>to see your contacts</p>'
      };
    
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.status(200).send({ msg: "data has been sent" });
      });
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
    // service: 'SMTP',
    host: val.emailHost,
    port: val.port,
    secure: false,
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
                        from: val.email,
                        to: req.body.email_id,
                        subject: "Request for reset Password: ",
                        // html: '<p>You requested for reset password, kindly use this <a href="https://cip.sampanatechnologies.com/reset-password?SP_ID=' + cipherdata + '">link</a>to reset your password</p>'
                        html: '<p>You requested for reset password, kindly use this page  <a href="https://cip.sampanatechnologies.com/reset-password">link</a>to reset your password</p>'
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: %s', info.messageId);
                        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                        res.status(200).send({
                            msg: "password has been sent",
                            id: results
                        });
                    });
                }


            });
        }
    })

}

//resetPssword api
const resetPassword = function (req, res) {
    console.log(req.body)
    console.log(req.body.id)
    //console.log("req headrer"+req.body.value)
    SP_ID = req.body.id
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
    console.log(req.body)
    let otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp)
    // send mail with defined transport object
    var mailOptions = {
        from: val.email,
        to: req.body.email_id,
        subject: "Otp for registration is: ",
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.send(Status);
    });

    db.db.query(val.insertOtp, [req.body.email_id,otp,'Email'],function (err, result){
        console.log("  1") 
     console.log(result)
    })
      
    db.db.query(val.insertOtp, [req.body.mobile_number,otp,'Mobile'],function (err, result){
        console.log("  2") 
     console.log(result)
    })
    //db.runQuery(req, res, val.insertOtp, [req.body.email_id,otp,'email'])
    return res.status(200).send({
        msg: 'Otp Sended sucessfully !',
    })


};
const verifyOtp = function (req, res, err) {
    console.log("req.body")
    console.log(req.body.otpfieldvalue)
    console.log(req.body.otp)

    db.db.query(val.verifyOtp, [req.body.otpfieldvalue], function (err, result) {
        console.log(result[0].otp)
        console.log(req.body.otp != result[0].otp)
        if (err) {
            throw err;
        }
        if (result.length != 0 && req.body.otp == result[0].otp) {
            return res.status(200).send({
                msg: 'Otp Verified',
            })
        }
        if ((result.length != 0 && req.body.otp != result[0].otp)) {
            return res.status(200).send({
                msg: 'Invalid otp',
            })
        }
        if (result.length == 0) {
            return res.status(200).send({
                msg: 'Otp Expired ! Please resend otp',
            })
        }

    })
   
};



module.exports = { allregisterdUser, login, register, forgotPassword, sendOtp, verifyOtp, resetPassword, mailOpt };
