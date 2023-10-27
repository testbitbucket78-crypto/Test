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
const { error } = require('console');
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
        if (credentials.length <= 0) {
            res.status(401).send({
                msg: 'Invalid User !',
                status: 401
            });
        } else {
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
        }
    } catch (err) {
        console.error(err);
        db.errlog(err)
        res.status(500).send({
            msg: err,
            status: 500
        });
    }

}

//post api for register

const register = async function (req, res) {
    console.log(req.body)
    name = req.body.name
    mobile_number = req.body.mobile_number
    email_id = req.body.email_id
    password = req.body.password
    confirmPassword = req.body.confirmPassword
    

    try {
        var credentials = await db.excuteQuery(val.loginQuery, [req.body.email_id])
        if (credentials.length > 0) {
            res.status(409).send({
                msg: 'User Already Exist with this email !',
                status: 409
            });
        }
        else {
            if (password !== confirmPassword) {
                res.status(400).json({ error: 'Passwords do not match', status: 400 });
            }
            // Hash the password before storing it in the database
            const hash = await bcrypt.hash(password, 10);
            var values = [name, mobile_number, email_id, hash]
            var registeredUser = await db.excuteQuery(val.registerQuery, values)
            const token = jwt.sign({ email_id: registeredUser.email_id }, SECRET_KEY);
            res.status(200).send({
                msg: 'Registered !',
                token,
                user: registeredUser,
                status: 200
            });
        }
    }
    catch (err) {
        console.error(err);
        db.errlog(err);
        res.status(500).send({
            msg: err,
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
const forgotPassword = async (req, res) => {
    try {
        email_id = req.body.email_id;

        var results = await db.excuteQuery(val.loginQuery, [req.body.email_id])

        // Send Email for For forget password varification

        if (Object.keys(results).length === 0) {
            res.status(400).send({
                msg: "Email not found",
                status: 400
            });

        }
        else {

            var uid = results[0].uid

            // Encrypt
            var cipherdata = CryptoJS.AES.encrypt(JSON.stringify(uid), 'secretkey123').toString();
            console.log("_____FORGOT PASSWORD ENCRYPT___")
            console.log(cipherdata)

            var mailOptions = {
                from: val.email,
                to: req.body.email_id,
                subject: "Request for reset Password: ",
                html: '<p>You requested for reset password, kindly use this <a href="https://cip.sampanatechnologies.com/#/reset-password?uid=' + cipherdata + '">  link  </a>to reset your password</p>'
                //html: '<p>You requested for reset password, kindly use this <a href="http://localhost:4200/#/reset-password?uid=' + cipherdata + '">link</a>to reset your password</p>'

            };

            transporter.sendMail(mailOptions, (error, info) => {


                res.status(200).send({
                    msg: "password has been sent",
                    id: results
                });


            });

        }

    } catch (err) {
        db.errlog(err);
        res.status(500).send({
            msg: err,
            status: 500
        });
    }

}

//resetPssword api
const resetPassword = function (req, res) {

    try {
        console.log("resetPassword")
        console.log(req.query.uid)
        var updateduid = req.query.uid;
        if (req.query.uid.includes(' ')) {
            var url = req.query.uid.split(' ');
            updateduid = '';
            url.forEach(item => {
                updateduid = updateduid + (updateduid ? '+' : '') + item;
            })

        }
        console.log(updateduid)
        password = req.body.password
        confirmPassword = req.body.confirmPassword
        var uid = "";
        const bytes = CryptoJS.AES.decrypt(updateduid, 'secretkey123')
        if (bytes.toString()) {
            console.log("_______crypto________")
            uid = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
            console.log(JSON.parse(bytes.toString(CryptoJS.enc.Utf8)))

        }
        if (password != confirmPassword) {

            console.log(error)
        }
        else {
            bcrypt.hash(password, 10, async function (err, hash) {

                //db.runQuery(req, res, val.updatePassword, [hash, uid]);

                var response = await db.excuteQuery(val.updatePassword, [hash, uid])

                console.log(response)
                console.log(response.affectedRows)
                if (response.affectedRows != 0) {
                    res.status(200).send({
                        msg: 'Password Reset Successfully !',
                        status: 200
                    });
                }
                else {
                    res.status(404).send({
                        msg: 'Password in not reset',
                        status: 404
                    });
                }

            })
        }

    } catch (err) {
        console.error(err);
        db.errlog(err);
        res.status(500).send({
            msg: err,
            status: 500
        });
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
const sendOtp = async function (req, res) {

    try {

        email_id = req.body.email_id;
        mobile_number = req.body.mobile_number;

        let otp = Math.floor(100000 + Math.random() * 900000);

        // send mail with defined transport object
        var mailOptions = {
            from: val.email,
            to: req.body.email_id,
            subject: "Otp for registration is: ",
            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
            try {


                res.send(Status);
            } catch (error) {

                res.send(err)
            }

        });


        var data = getTextMessageInput('918130818921', otp);

        sendMessage(data)
        var storeEmailOtp = await db.excuteQuery(val.insertOtp, [req.body.email_id, otp, 'Email'])
        console.log(storeEmailOtp)

        var storePhoneOtp = await db.excuteQuery(val.insertOtp, [mobile_number, otp, 'Mobile'])
        console.log(storePhoneOtp)


        return res.status(200).send({
            msg: 'Otp Sended sucessfully !',
            status: 200
        })
    } catch (err) {
        console.error(err);
        db.errlog(err);

        res.status(500).send({
            msg: err,
            status: 500
        });
    }

};
const verifyOtp = async function (req, res, err) {

    try {

        var result = await db.excuteQuery(val.verifyOtp, [req.body.otpfieldvalue])


        try {
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
        } catch (err) {
            console.log(err)
            res.send(err)
        }

    } catch (err) {
        console.error(err);
        db.errlog(err);
        res.status(500).send({
            msg: err,
            status: 500
        });
    }
};

const verifyPhoneOtp = async function (req, res, err) {

    try {

        var result = await db.excuteQuery(val.verifyOtp, [req.body.otpfieldMobilevalue])

        try {
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
        } catch (err) {
            console.log(err)
            res.send(err)
        }

    } catch (err) {
        console.error(err);
        db.errlog(err);
        res.status(500).send({
            msg: err,
            status: 500
        });
    }
};



module.exports = { allregisterdUser, login, register, forgotPassword, sendOtp, verifyOtp, resetPassword, verifyPhoneOtp };
