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
const logger = require('../common/logger.log');
const moment = require('moment');
const SECRET_KEY = 'RAUNAK'
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));



const allregisterdUser = (req, res) => {

    db.runQuery(req, res, val.selectAllQuery, [req.body.id])


}

//post Api for login
const login = async (req, res) => {
    try {
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const ip = clientIp.startsWith('::ffff:') ? clientIp.substring(7) : clientIp;
        console.log('Client IP:', ip);

        const emailId = req.body.email_id;
        const password = req.body.password;
        const Channel = req.body.Channel;
        // Retrieve all user records with the matching email ID
        const credentials = await db.excuteQuery('SELECT * FROM user WHERE email_id = ? AND isDeleted != 1 and Channel=? AND IsActive != 2', [emailId,Channel]);

        if (credentials.length === 0) {
            return res.status(401).send({
                msg: 'Invalid User!',
                status: 401
            });
        }

        let user = null;
        let spPhoneNumber = null;
        for (let i = 0; i < credentials.length; i++) {
            const validPassword = await bcrypt.compare(password, credentials[i]['password']);
            if (validPassword) {
                user = credentials[i];
                spPhoneNumber = await db.excuteQuery('select * from user where SP_ID=? and Channel=? AND ParentId IS NULL ORDER BY CreatedDate DESC LIMIT 1',[credentials[i]?.SP_ID,Channel])
                break;
            }
        }

        if (!user) {
            return res.status(401).send({
                msg: 'Username or password is incorrect!',
                status: 401
            });
        }

        const token = jwt.sign({ email_id: user.email_id }, SECRET_KEY, { expiresIn: '24h' });
        const utcTimestamp = moment.utc(new Date()).format('YYYY-MM-DD HH:mm:ss');

        await db.excuteQuery('UPDATE user SET LastLogIn = ?, LoginIP = ?, IsActive = 1 WHERE email_id = ?', [utcTimestamp, ip, emailId]);

        res.status(200).send({
            msg: 'Logged in!',
            token,
            user: user,
            spPhoneNumber : spPhoneNumber[0]?.mobile_number,
            status: 200
        });
    } catch (err) {
        logger.error(`login error ${err}`)
        console.error(err);
        db.errlog(err);
        res.status(500).send({
            msg: 'Internal Server Error',
            status: 500
        });
    }
};


const isSpAlreadyExist = async function (req, res) {
    try {
        var loginQuery = `SELECT * FROM user WHERE email_id =?  and isDeleted !=1 and IsActive !=2 ` //I have to use unique email troughout engagekart
        var credentialsOfEmail = await db.excuteQuery(loginQuery, [req.body.email_id])
        if (credentialsOfEmail?.length > 0) {
            return res.status(409).send({
                msg: 'User Already Exist with this email !',
                status: 409
            });
        }
        var loginQueryPhone = `SELECT * FROM user WHERE  registerPhone=? and isDeleted !=1 and IsActive !=2 and ParentId is null`
        var credentialsOfPhone = await db.excuteQuery(loginQueryPhone, [req.body.mobile_number])
        if (credentialsOfPhone?.length > 0) {
            return res.status(409).send({
                msg: 'User Already Exist with this Phone Number !',
                status: 409
            });
        }
        if (credentialsOfEmail?.length <= 0 && credentialsOfPhone?.length <= 0) {
            return res.status(200).send({
                msg: 'User Ready to register !',
                status: 200
            });
        }


    } catch (err) {
        console.error(err);
        db.errlog(err);
        res.status(500).send({
            msg: 'Internal Server Error',
            status: 500
        });
    }
}

//post api for register

const register = async function (req, res) {
    console.log(req.body)
    name = req.body.name
    mobile_number = req.body?.mobile_number
    email_id = req.body.email_id
    password = req.body.password
    confirmPassword = req.body.confirmPassword
    LoginIP = req.body.LoginIP
    countryCode = req.body.country_code
    display_mobile_number = req.body?.display_mobile_number
    registerPhone = req.body?.registerPhone
    Channel = req.body?.Channel
    try {


        var credentials = await db.excuteQuery(val.loginQuery, [req.body.email_id, registerPhone])
        if (credentials.length > 0) {
            res.status(409).send({
                msg: 'User Already Exist with this email or Phone Number !',
                status: 409
            });
        }
        else {
            if (password !== confirmPassword) {
                res.status(400).json({ error: 'Passwords do not match', status: 400 });
            }
            // Hash the password before storing it in the database
            const hash = await bcrypt.hash(password, 10);
            var values = [name,registerPhone, email_id, hash, LoginIP, countryCode, display_mobile_number,Channel]  // pending add countryCode in stored procedure
            var registeredUser = await db.excuteQuery(val.registerQuery, values)   //need to change LoginIP in signup stored procedure
            const token = jwt.sign({ email_id: registeredUser.email_id }, SECRET_KEY);

            let body = `
            Welcome to Engagekart, ${name}!
            Your account is all set and ready to go. Start exploring your new features and make the most out of our platform today!
            - Team Engagekart
          `;
            var data = getTextMessageInput(registerPhone, body);

            sendMessage(data)


            let loginPageURL = "https://cip.stacknize.com/login";
            
            if(Channel == 'api'){
              loginPageURL = "https://cipapp.stacknize.com/login";
            }
            var mailOptions = {
                from: val.email, // Use the sender's email address here
                to: req.body.email_id, // Recipient's email address from the request body
                subject: `Hello ${req.body.name}! Getting started with Engagekart`, // Email subject

                html: `<p>Dear ${req.body.name},</p>
           <p>Welcome to Engagekart!</p>
           <p>We are delighted to have you onboard and can't wait to see you automate your business operations effortlessly with our platform. So get going and explore all the features on Engagekart to engage with your customers while converting new leads.</p>
           <p>Here are your account details on Engagekart:</p>
           <p><a href="${loginPageURL}">${loginPageURL}</a></p>
           <p>User ID: ${req.body.email_id}<br>
           Mobile: ${req.body.registerPhone}<br>
           Role: Admin</p>
           <p>Thank you for choosing Engagekart!</p>
           <p>Best regards,<br>
           Team Engagekart</p>`
            };



            transporter.sendMail(mailOptions, (error, info) => {
                // console.log(info)

            });
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
    secure: true,
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

        var results = await db.excuteQuery('SELECT * FROM user WHERE email_id =? and isDeleted !=1 and IsActive !=2', [req.body.email_id])

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
            let ResetPageURL = `https://cip.stacknize.com/reset-password?uid=${cipherdata}`;
            
            if(results[0]?.Channel == 'api'){
             ResetPageURL = `https://cipapp.stacknize.com/reset-password?uid=${cipherdata}`;
            }
            var mailOptions = {
                from: val.email,
                to: req.body.email_id,
                subject: "Engagekart Forgot Password Request",
                //html: '<p>You requested for reset password, kindly use this <a href="https://cip.stacknize.com/#/reset-password?uid=' + cipherdata + '">  link  </a>to reset your password</p>'
                html: `<p>Hello,</p>

                <p>We have received a Forgot Password request for your Engagekart account. Please use this link provided below to proceed with the reset.<br>
                <a href="${ResetPageURL}">${ResetPageURL}</a></p>
                
                <p>If you did not initiate this request, you may ignore this email and we suggest you report this to your business admin manager.</p>

                <p>Thank you </p>
                <p>Team Engagekart</p>`


            };

            transporter.sendMail(mailOptions, (error, info) => {
                //   if(error){
                //     console.log(error)
                //   }else{

                // console.log(info)
                res.status(200).send({
                    msg: "password has been sent",
                    id: results
                });

                //  }
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
            "body": text
        }


    });
}

async function createWhatsAppPayload(type, to, templateName, languageCode, headerVariables = [], bodyVariables = [], mediaLink = null) {
    let payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: languageCode
            }
        }
    };

    if (type === 'text') {
        let components = [];

        if (headerVariables.length > 0) {
            components.push({
                type: "header",
                parameters: headerVariables.map(variable => ({
                    type: "text",
                    text: variable
                }))
            });
        }

        if (bodyVariables.length > 0) {
            components.push({
                type: "body",
                parameters: bodyVariables.map(variable => ({
                    type: "text",
                    text: variable
                }))
            });
        }

        payload.template.components = components;
    } else if (['image', 'video', 'doc'].includes(type)) {
        let headerComponent = {
            type: "header",
            parameters: [{
                type: type,
                [type]: { link: mediaLink }
            }]
        };

        if (bodyVariables.length > 0) {
            payload.template.components = [
                headerComponent,
                {
                    type: "body",
                    parameters: bodyVariables.map(variable => ({
                        type: "text",
                        text: variable
                    }))
                }
            ];
        } else {
            payload.template.components = [headerComponent];
        }
    }

    return payload;
}


// Opt for Varification
const sendOtp = async function (req, res) {

    try {

        email_id = req.body.email_id;
        mobile_number = req.body.mobile_number;

        let otp = Math.floor(100000 + Math.random() * 900000);
        let phoneOtp = Math.floor(100000 + Math.random() * 900000);
        let otpFor = req.body?.otpFor;

        let bodyVar=[req.body?.name, phoneOtp]
        let headerVar =[]
        // send mail with defined transport object
        var mailOptions = {
            from: val.email,
            to: req.body.email_id,
            subject: "Verify your email - Engagekart",
            //html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
            html: `
            <p>Dear ${req.body?.name},</p>
            <p>To complete your Engagekart account activation, please use the below provided One-Time Password (OTP) to validate your email address on the sign up page.</p>
            <P>OTP for account verification is</P>
            <h5 style="font-weight:bold;">${otp}</h5>
            <p>Best regards,</p>
            <p>Team Engagekart</p> `
        };




        if (otpFor == 'both') {
            transporter.sendMail(mailOptions, (error, info) => {
                try {
                    if (error) {
                        console.log("error ampt ----------", error)
                    } else {
                        console.log("info---------", info)
                    }

                    res.send(Status);
                } catch (error) {

                    res.send(err)
                }

            });

            let text = `Hi ${req.body?.name}!
        Just one more step to get started with Engagekart.
        Here's your verification code: ${otp}.
        Enter it on the signup page to verify your Phone Number.
        Let's make magic happen!
        - Team Engagekart`

            // var data = getTextMessageInput(mobile_number, text);


            let sendWAmsg =await createWhatsAppPayload('text', mobile_number, 'verify_opt_signin', 'en', headerVar, bodyVar, mediaLink = null)
            let data = JSON.stringify(sendWAmsg, null, 2);
            sendMessage(data)
            var storeEmailOtp = await db.excuteQuery(val.insertOtp, [req.body.email_id, otp, 'Email'])
            // console.log(storeEmailOtp)

            var storePhoneOtp = await db.excuteQuery(val.insertOtp, [mobile_number, phoneOtp, 'Mobile'])

            // console.log(storePhoneOtp)
        } else if (otpFor == 'email') {

            // 6 entries and within 2 hour 
            let otpcansend = await canSendOTP(email_id);
            console.log(otpcansend,"email")
            if (!otpcansend.canSend) {

                console.log(`Please wait ${otpcansend.remainingTime} minutes before sending another OTP.`);

                return res.status(403).send({
                    msg: `Please wait ${otpcansend.remainingTime} minutes before sending another OTP.`,
                    status: 403
                })

            }else{

            transporter.sendMail(mailOptions, (error, info) => {
                try {
                    if (error) {
                        console.log("error ampt ----------", error)
                    } else {
                        console.log("info---------", info)
                    }

                    res.send(Status);
                } catch (error) {

                    res.send(err)
                }

            });
            var storeEmailOtp = await db.excuteQuery('insert into otpVerify (otpfieldvalue,otp,fieldtype) values (?,?,?)', [req.body.email_id, otp, 'Email'])
        }
        } else if (otpFor == 'phone') {

            // 6 entries and within 2 hour 
            let otpcansend = await canSendOTP(mobile_number);
            console.log(otpcansend)
            if (!otpcansend.canSend) {

                console.log(`Please wait ${otpcansend.remainingTime} minutes before sending another OTP.`);

                return res.status(403).send({
                    msg: `Please wait ${otpcansend.remainingTime} minutes before sending another OTP.`,
                    status: 403
                })

            }else{

            let sendWAmsg =await createWhatsAppPayload('text', mobile_number, 'verify_opt_signin', 'en', headerVar,bodyVar , mediaLink = null)
            let data = JSON.stringify(sendWAmsg, null, 2);
            sendMessage(data)

            var storePhoneOtp = await db.excuteQuery('insert into otpVerify (otpfieldvalue,otp,fieldtype) values (?,?,?)', [mobile_number, phoneOtp, 'Mobile']);
            console.log("storePhoneOtp",storePhoneOtp?.insertId,mobile_number, phoneOtp)

        }}
        return res.status(200).send({
            msg: 'opt sended',
            status: 200
        })
    } catch (err) {
        //console.error(err);
        db.errlog(err);

        res.status(500).send({
            msg: err,
            status: 500
        });
    }

};



async function canSendOTP(mobile_number) {
    try {
        const result = await db.excuteQuery(
            'SELECT COUNT(*) AS count, MIN(created_at) AS first_sent_time FROM otpVerify WHERE otpfieldvalue = ? AND created_at >= NOW() - INTERVAL 2 HOUR order by created_at desc',
            [mobile_number]
        );

        const otpCount = result[0].count;
        const firstSentTime = result[0].first_sent_time;

        if (otpCount < 4) {   // increase one because of one already add on both case
            // Allow sending OTP
            return { canSend: true };
        } else {
            // Calculate remaining time
            const currentTime = moment().utc();
            const firstSentTimeMoment = moment(firstSentTime).utc();
            const timePassed = currentTime.diff(firstSentTimeMoment, 'minutes');
            const remainingTime = Math.abs(120 - timePassed); // 120 minutes = 2 hours
            console.log("remainingTime,firstSentTime ,timePassed",remainingTime,firstSentTime ,timePassed)
            return { canSend: false, remainingTime: remainingTime };
        }
    } catch (err) {
        console.log("ERR -- canSendOTP", err);
        return err;
    }
}


const verifyOtp = async function (req, res, err) {

    try {

        var result = await db.excuteQuery(val.verifyOtp, [req.body.otpfieldvalue])


        try {
            if (result.length != 0 && req.body.otp1 == result[0].otp) {
                return res.status(200).send({
                    msg: 'Otp Verified',
                    status: 200
                })
            }
            if ((result.length != 0 && req.body.otp1 != result[0].otp)) {
                return res.status(403).send({
                    msg: 'Invalid otp',
                    status: 403
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
                return res.status(403).send({
                    msg: 'Invalid otp',
                    status: 403
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



module.exports = { allregisterdUser, login, register, forgotPassword, sendOtp, verifyOtp, resetPassword, verifyPhoneOtp, isSpAlreadyExist };
