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
var axios = require('axios');
const SECRET_KEY = 'RAUNAK'
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));



const allregisterdUser = (req, res) => {

    db.runQuery(req, res, val.selectAllQuery, [req.body.id])


}

//post Api for login
const login = async (req, res) => {
    try {
        var credentials = await db.excuteQuery(val.loginQuery, [req.body.email_id])
        var password = await bcrypt.compare(req.body.password, credentials[0]['password'])
        if (!password) {
            res.status(401).send({
                msg: 'Username or password is incorrect!',
                status: 401
            });
        }
        else {
            const token = jwt.sign({ email_id: credentials.email_id }, SECRET_KEY);
            res.status(200).send({
                msg: 'Logged in!',
                token,
                user: credentials[0],
                status: 200
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).send({
            msg: 'Internal server error',
            status: 500
        });
    }

}

//post api for register

const register = async function (req, res) {
    name = req.body.name
    mobile_number = req.body.mobile_number
    email_id = req.body.email_id
    password = req.body.password
    confirmPassword = req.body.confirmPassword
    var mobile = mobile_number;

    try {
        if (password !== confirmPassword) {
             res.status(400).json({ error: 'Passwords do not match', status: 400 });
        }
        // Hash the password before storing it in the database
        const hash = await bcrypt.hash(password, 10);
        var values = [name, mobile, email_id, hash]
        var registeredUser =await db.excuteQuery(val.registerQuery, values)
        const token = jwt.sign({ email_id: registeredUser.email_id }, SECRET_KEY);
        res.status(200).send({
            msg: 'Registered !',
            token,
            user: registeredUser,
            status: 200
        });
    }
    catch (err) {
        res.status(500).send({
            msg: 'Internal server error',
            status: 500
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

                    // var mailOptions = {
                    //     from: val.email,
                    //     to: req.body.email_id,
                    //     subject: "Request for reset Password: ",
                    //     // html: '<p>You requested for reset password, kindly use this <a href="https://cip.sampanatechnologies.com/reset-password?SP_ID=' + cipherdata + '">link</a>to reset your password</p>'
                    //     html: '<p>You requested for reset password, kindly use this page  <a href="https://cip.sampanatechnologies.com/reset-password">link</a>to reset your password</p>'
                    // };

                    // transporter.sendMail(mailOptions, (error, info) => {
                    //     if (error) {
                    //         return console.log(error);
                    //     }

                        res.status(200).send({
                            msg: "password has been sent",
                            id: results,
                            status: 200
                        });
                    // });
                }


            });
        }
    })

}

//resetPssword api
const resetPassword = function (req, res) {

    uid = req.body.id
    password = req.body.password
    confirmPassword = req.body.confirmPassword
    if (password != confirmPassword) {
        throw error;
    }
    else {
        bcrypt.hash(password, 10, function (err, hash) {

            db.runQuery(req, res, val.updatePassword, [hash, uid]);
        })
    }


};



function sendMessage(data) {
    var config = {
        method: 'post',
        url: val.url,
        headers: {
            'Authorization': val.access_token,
            'Content-Type': val.content_type
        },
        data: data
    };

    return axios(config)
}

function getTextMessageInput(recipient, text) {
    return JSON.stringify({

        "messaging_product": "whatsapp",
        "preview_url": false,
        "recipient_type": "individual",
        "to": recipient,
        "type": "text",
        "text": {
            "body": "OTP for verification : " + text
        }

    });
}




// Opt for Varification
const sendOtp = function (req, res) {
    email_id = req.body.email_id;
    mobile_number = req.body.mobile_number.internationalNumber;

    let otp = Math.floor(100000 + Math.random() * 900000);

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


    var data = getTextMessageInput('919971129777', otp);

    sendMessage(data)

    db.db.query(val.insertOtp, [req.body.email_id, otp, 'Email'], function (err, result) {

    })

    db.db.query(val.insertOtp, [mobile_number, otp, 'Mobile'], function (err, result) {

    })

    return res.status(200).send({
        msg: 'Otp Sended sucessfully !',
        status: 200
    })


};
const verifyOtp = function (req, res, err) {


    db.db.query(val.verifyOtp, [req.body.otpfieldvalue], function (err, result) {

        if (err) {
            return res.send(err);
        }
        if (result.length != 0 && req.body.otp == result[0].otp) {
            return res.status(200).send({
                msg: 'Otp Verified',
                status: 200
            })
        }
        if ((result.length != 0 && req.body.otp != result[0].otp)) {
            return res.status(401).send({
                msg: 'Invalid otp',
                status: 401
            })
        }
        if (result.length == 0) {
            return res.status(410).send({
                msg: 'Otp Expired ! Please resend otp',
                status: 410
            })
        }

    })

};

const verifyPhoneOtp = function (req, res, err) {


    db.db.query(val.verifyOtp, [req.body.otpfieldvalue], function (err, result) {

        if (err) {
            return res.send(err);
        }
        if (result.length != 0 && req.body.otp == result[0].otp) {
            return res.status(200).send({
                msg: 'Otp Verified',
                status: 200
            })
        }
        if ((result.length != 0 && req.body.otp != result[0].otp)) {
            return res.status(401).send({
                msg: 'Invalid otp',
                status: 401
            })
        }
        if (result.length == 0) {
            return res.status(410).send({
                msg: 'Otp Expired ! Please resend otp',
                status: 410
            })
        }

    })

};



module.exports = { allregisterdUser, login, register, forgotPassword, sendOtp, verifyOtp, resetPassword, verifyPhoneOtp };
