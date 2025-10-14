var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const cors = require('cors')
const AWS = require('aws-sdk');
const fs = require("fs");
const path = require("path");
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const awsHelper = require('../awsHelper');
const moment = require('moment');
//const puppeteer = require('puppeteer');
var pdfMake = require('pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
const { EmailConfigurations } =  require('../Authentication/constant');
const { MessagingName }= require('../enum');

app.use(bodyParser.json());
app.use(cors());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "10000kb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10000kb", extended: true }));


const teamName = async (req, res) => {
    try {
        var teamMap = await db.excuteQuery(val.teamID, [req.params.uid])
        console.log(teamMap)
        // var teamid = teamMap[0].teamID
        const teamIDs = teamMap.map((row) => row.teamID)
        console.log(teamIDs)

        var teamRes = await db.excuteQuery(val.teamName, [teamIDs])
        console.log(teamRes);
        res.status(200).send({
            msg: 'team name',
            teamRes: teamRes,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}


const roleName = async (req, res) => {
    try {

        var roleMap = await db.excuteQuery(val.roleIDQuery, [req.params.uid])
        var roleIDdata = roleMap[0].UserType
        var roleRes = await db.excuteQuery(val.roleNameQuery, [roleIDdata])
        console.log(roleRes);
        res.status(200).send({
            msg: 'team name',
            roleRes: roleRes,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const changePassword = async (req, res) => {
    try {

        uid = req.body.uid;
        oldPass = req.body.oldPass
        newPass = req.body.newPass
        confirmPass = req.body.confirmPass
        channel = req?.body?.channel
        let emailSender = MessagingName[channel];
        const transporter = getTransporter(emailSender);
        const senderConfig = EmailConfigurations[emailSender];

        let myUTCString = new Date().toUTCString();
        const date = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

        var resQuery = await db.excuteQuery(val.PasswordQuery, [uid])
        if (resQuery.length >= 0) {
            const hash = await bcrypt.compare(oldPass, resQuery[0].password);

            console.log(hash)
            if (hash == false) {
                res.status(403).send({
                    msg: 'Old  Password is wrong !',
                    status: 403
                });
            }
            else {
                if (newPass !== confirmPass) {
                    res.status(400).json({ error: 'Passwords do not match', status: 400 });
                }
                var hasedPass = await bcrypt.hash(newPass, 10);

                var insertRes = await db.excuteQuery(val.updatePasswordQuery, [hasedPass, date, uid]);
                // send mail with defined transport object
                var mailOptions = {
                    from: senderConfig.email,
                    to: req.body?.email_id,
                    subject: `${emailSender} Password Reset`,
                    //html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
                    html: `
            <p>Dear ${req.body?.name},</p>
   
            <p>You have successfully reset your ${emailSender} account password.</p?
            <p>If you find anything fishy, immediately contact your business admin manager.</p>

            <p>Thank you,</p>
            <p>Team ${emailSender}</p> `
                };

                transporter.sendMail(mailOptions, (error, info) => {

                    if (error) {
                        console.log("error ampt ----------", error)
                    } else {
                        console.log("info---------", info)
                    }


                });

                let text = `You've successfully reset your password. Keep your new password safe, and contact your account Admin immediately if you didn't initiate this change.
- Team ${emailSender}`

                var data = getTextMessageInput(req.body?.mobile_number, text);

                sendMessage(data)
                res.status(200).send({
                    msg: 'password updated',
                    insertRes: insertRes,
                    status: 200
                })
            }
        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.status(500).send({
            msg: 'err on password updated',
            status: 500
        })
    }



}


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
const userActiveStatus = async (req, res) => {
    try {

        IsActive = req.body.isActive;

        if (IsActive != 1) {
            let IsUserAssign = await db.excuteQuery('SELECT * FROM InteractionMapping WHERE AgentId=?', [req.body.uid]);
            if (IsUserAssign?.length > 0) {
                
                let unAssignChat = await db.excuteQuery('update InteractionMapping set AgentId=? and is_active =1 where AgentId=?', [-1, req.body.uid])
            }
        }
        let myUTCString = new Date().toUTCString();
        const LastModifiedDate = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        var saveActiveStatus = await db.excuteQuery(val.activeStatusquery, [IsActive, LastModifiedDate, req.body.uid]);

        res.status(200).send({
            msg: 'save active status',
            saveActiveStatus: saveActiveStatus,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}


const addNotification = async (req, res) => {
    try {
        ID = req.body.ID
        UID = req.body.UID,
            notificationId = req.body.notificationId,
            PushNotificationValue = req.body.PushNotificationValue,
            SoundNotificationValue = req.body.SoundNotificationValue,
            isDeleted = 0

        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

        if (ID == 0) {
            var addNotification = await db.excuteQuery(val.addNotification, [[[UID, notificationId, PushNotificationValue, SoundNotificationValue, isDeleted, created_at]]])
            res.status(200).send({
                msg: 'Notification added',
                addNotification: addNotification,
                status: 200
            })
        } else {
            var updateNotification = await db.excuteQuery(val.updateNotification, [UID, notificationId, PushNotificationValue, SoundNotificationValue, created_at, ID])
            res.status(200).send({
                msg: 'Notification updated',
                updateNotification: updateNotification,
                status: 200
            })
        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const getNotificationByUid = async (req, res) => {
    try {

        var notify = await db.excuteQuery(val.getNotification, [req.params.UID])
        res.status(200).send({
            msg: 'Get Notifications',
            notify: notify,
            status: 200
        })

    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }


}

const saveManagePlan = async (req, res) => {
    try {
        SP_ID = req.body.SP_ID,
            planType = req.body.planType,
            planDivision = req.body.planDivision,
            discount = req.body.discount,
            subtotalAmount = req.body.subtotalAmount,
            totalAmount = req.body.totalAmount,
            tax = req.body.tax

        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let existingPlan = await db.excuteQuery(val.selectPlan, [SP_ID]);


        if (existingPlan.length != 0) {
            console.log("existingPlan")
            let ID = existingPlan[0].ID
            let updatePlanVal = [created_at, ID]
            let updatePlanRes = await db.excuteQuery(val.updatePlanQuery, updatePlanVal);
            let savePlanVal = [[SP_ID, planType, planDivision, discount, subtotalAmount, totalAmount, tax, created_at]]
            let savePlanRes = await db.excuteQuery(val.savePlanQuery, [savePlanVal]);

            res.status(200).send({
                msg: 'update plan',
                updatedPlan: savePlanRes,
                status: 200
            })
        }
        else {
            let savePlanVal = [[SP_ID, planType, planDivision, discount, subtotalAmount, totalAmount, tax, created_at]]
            let savePlanRes = await db.excuteQuery(val.savePlanQuery, [savePlanVal]);
            res.status(200).send({
                msg: 'save plan',
                savePlanRes: savePlanRes,
                status: 200
            })
        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}



const saveBillingHistory = async (req, res) => {
    try {
        SP_ID = req.body.SP_ID


        let myUTCString = new Date().toUTCString();
        const billing_date = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        billing_id = req.body.billing_id
        amount = req.body.amount
        payment_status = req.body.payment_status
        payment_method = req.body.payment_method
        billing_type = req.body.billing_type

        let profilebillVal = [[SP_ID, billing_date, billing_id, amount, payment_status, payment_method, billing_type]]
        let ProfileBillingHistory = await db.excuteQuery(val.profilebillQuery, [profilebillVal])
        res.status(200).send({
            msg: 'billing details added',
            ProfileBillingHistory: ProfileBillingHistory,
            status: 200
        })

    } catch {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const getBillingDetails = async (req, res) => {
    try {
        let getbillingDetails = await db.excuteQuery(val.selectbillinghistory, [req.params.spid]);
        console.log(getbillingDetails)
        res.status(200).send({
            msg: 'billing history',
            getbillingDetails: getbillingDetails,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}


// let transporter = nodemailer.createTransport({
//     // service: 'SMTP',
//     host: val.emailHost,
//     port: val.port,
//     secure: true,
//     auth: {
//         user: val.email,
//         pass: val.appPassword
//     },
//     port: val.port,
//     host: val.emailHost
// });
function getTransporter(channel) {
    const senderConfig = EmailConfigurations[channel];
    if (!senderConfig) {
        throw new Error(`Invalid channel: ${channel}`);
    }

    return nodemailer.createTransport({
        host: senderConfig.emailHost,
        port: senderConfig.port,
        secure: true,
        auth: {
            user: senderConfig.email,
            pass: senderConfig.appPassword,
        },
    });
}
const invoicePdf = async (req, res) => {
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // let data = await db.excuteQuery(val.selectBillingDetails, [req.query.spid])

    // // Set the dynamic data here
    // if (data.length >= 0) {
    //     var dynamicData = {
    //         name: 'Raunak',
    //         age: 23,
    //         Address1: data[0].Address1,
    //         billing_email: data[0].billing_email,
    //         created_at: data[0].created_at

    //         // Add more properties as needed
    //     };
    // }
    // // Create a dynamic HTML template with the data
    // const html = `
    //   <html>
    //     <body>
    //       <h1>Invoice</h1>
    //       <p>Name: ${dynamicData.name}</p>
    //       <p>Age: ${dynamicData.age}</p>
    //       <p>Address: ${dynamicData.Address1}</p>
    //       <p>Email: ${dynamicData.billing_email}</p>
    //       <p>created_at: ${dynamicData.created_at}</p>
    //       <!-- Add more HTML content here -->
    //     </body>
    //   </html>
    // `;

    // // Generate the PDF from the HTML
    // await page.setContent(html);
    // const pdfBuffer = await page.pdf();

    // // Close the browser
    // await browser.close();

    // // Set the response headers
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename=dynamic_pdf.pdf');

    // // Send the PDF buffer as the response
    // res.send(pdfBuffer);

    let invoicePdfData = await db.excuteQuery(val.invoicePdf, [req.params.spid]);
    console.log(invoicePdfData)

    // let cNameQuery=`Select name from user where uid=?`
    let cNameData = await db.excuteQuery(val.cNameQuery, [invoicePdfData[0].uid])

    // let planquery=`select *  from PlanPricing where SP_ID=? and isDeleted !=1`
    let planqueryData = await db.excuteQuery(val.planquery, [req.params.spid])

    // let billhistoryQuery=`select *  from BillingHistory where SP_ID=?
    // ORDER BY billing_date DESC
    // LIMIT 1;`

    let billhistoryData = await db.excuteQuery(val.billhistoryQuery, [req.params.spid])

    const docDefinition = {
        content: [
            {
                text: 'Invoice',
                style: 'header',
            },

            {
                columns: [
                    {
                        width: '50%',
                        image: 'Company logo URL',
                        text: invoicePdfData[0].profile_img,
                        // fit: [100, 100],
                        style: 'sectionHeader',
                    },

                    {
                        width: '50%',
                        text: 'Engagekart Private Limited',
                        style: 'sectionHeader',
                    },
                ],
                margin: [12, 0, 0, 10],
            },


            {
                margin: [8, 0, 10, 0],
                columns: [

                    {
                        width: '50%',
                        text: [
                            { text: '' },

                        ],
                        style: 'billedTo'
                    },
                    {
                        width: '50%',
                        text: [
                            { text: 'SCO No. 53-54, Sector 8,' },

                        ],
                        style: 'addressInfo'
                    }

                ],

            },
            {
                margin: [8, 0, 10, 0],
                columns: [
                    {
                        width: '50%',
                        text: [
                            { text: '' },

                        ],
                        style: 'billedTo'
                    },
                    {
                        width: '50%',
                        text: [
                            { text: 'Chandigarh 160009' },

                        ],
                        style: 'addressInfo'
                    }

                ],

            },
            {
                margin: [8, 0, 10, 0],
                columns: [
                    {
                        width: '50%',
                        text: [
                            { text: '' },

                        ],
                        style: 'billedTo'
                    },
                    {
                        width: '50%',
                        text: [
                            { text: 'Email: ', style: 'invoiceInfo' },
                            { text: '', style: 'values' },
                        ],
                        style: 'addressInfo'
                    }

                ],

            },
            {
                margin: [8, 0, 10, 0],
                columns: [
                    {
                        width: '50%',
                        text: [
                            { text: '' },

                        ],
                        style: 'billedTo'
                    },
                    {
                        width: '50%',
                        text: [
                            { text: 'Contact NO.: ', style: 'invoiceInfo' },
                            { text: '', style: 'values' },
                        ],
                        style: 'addressInfo'
                    }

                ],

            },
            {
                margin: [8, 0, 10, 0],
                columns: [
                    {
                        width: '50%',
                        text: [
                            { text: '' },

                        ],
                        style: 'billedTo'
                    },
                    {
                        width: '50%',
                        text: [
                            { text: 'State: ', style: 'invoiceInfo' },
                            { text: '', style: 'values' },
                        ],
                        style: 'addressInfo'
                    }

                ],

            },
            {
                margin: [8, 0, 10, 0],
                columns: [
                    {
                        width: '50%',
                        text: [
                            { text: '' },

                        ],
                        style: 'billedTo'
                    },
                    {
                        width: '50%',
                        text: [
                            { text: 'GSTIN: ', style: 'invoiceInfo' },
                            { text: '', style: 'values' },
                        ],
                        style: 'addressInfo'
                    }

                ],

            },

            {
                margin: [0, 15, 0, 0],
                columns: [
                    {
                        width: '50%',
                        text: [
                            { text: 'Billed To', fontSize: 14, },
                        ],
                        margin: [30, 0, 0, 0],
                        bold: true,

                    },
                    {
                        width: '50%',
                        text: [
                            { text: 'Invoice Number: ', style: 'invoiceInfo' },
                            { text: '180001', style: 'values' },
                        ],
                        style: 'invoiceInfo'
                    }
                ],

            },
            {
                columns: [
                    {
                        width: '50%',
                        text: [
                            { text: 'Contact Name: ', style: 'invoiceInfo' },
                            { text: cNameData[0].name, style: 'values' },
                        ],
                        style: 'billedTo'
                    },
                    {
                        width: '50%',
                        text: [
                            { text: 'Invoice Date: ', style: 'invoiceInfo' },
                            { text: billhistoryData[0].billing_date, style: 'values' },
                        ],
                        style: 'invoiceInfo'
                    }

                ],

            },
            {
                columns: [
                    {
                        width: '50%',
                        text: [
                            { text: 'Bussiness Name: ', style: 'invoiceInfo' },
                            { text: invoicePdfData[0].Company_Name, style: 'values' },
                        ],
                        style: 'billedTo'
                    },
                    {
                        width: '50%',
                        text: [
                            { text: 'Invoice Amount: ', style: 'invoiceInfo' },
                            { text: planqueryData[0].subtotalAmount, style: 'values' },
                        ],
                        style: 'invoiceInfo'
                    }

                ],

            },
            {
                columns: [
                    {
                        width: '50%',
                        text: invoicePdfData[0].Address1,
                        style: 'billedTo'
                    },
                    {
                        width: '50%',
                        text: '',
                        style: 'invoiceInfo'
                    }

                ],

            },
            {
                columns: [
                    {
                        width: '50%',
                        text: '(Company Address)',
                        style: 'billedTo'
                    },
                    {
                        width: '50%',

                        text: [
                            { text: 'Payment Type: ', style: 'invoiceInfo' },
                            { text: billhistoryData[0].billing_type, style: 'values' },
                        ],
                        style: 'invoiceInfo'
                    }

                ],

            },
            {
                columns: [
                    {
                        width: '50%',
                        text: [
                            { text: 'State: ', style: 'invoiceInfo' },
                            { text: invoicePdfData[0].State, style: 'values' },
                        ],

                        style: 'billedTo'
                    },
                    {
                        width: '50%',
                        text: [
                            { text: 'Billing Period: ', style: 'invoiceInfo' },
                            { text: 'Mar 14 to Apr 14, 2023', style: 'values' },
                        ],
                        style: 'invoiceInfo'
                    }

                ],

            },

            {
                columns: [

                    {
                        width: '50%',

                        text: [
                            { text: 'GSTIN: ', style: 'invoiceInfo' },
                            { text: invoicePdfData[0].GSTId, style: 'values' },
                        ],
                        style: 'billedTo'
                    },

                    {
                        width: '50%',

                        text: [
                            { text: 'Next Due Date: ', style: 'invoiceInfo' },
                            { text: 'Apr 14, 2023', style: 'values' },
                        ],
                        style: 'invoiceInfo'
                    }

                ],

            },
            // table for main content
            {
                margin: [0, 25, 0, 0],
                table: {
                    widths: ['auto', '*', 'auto'], // Adjust the widths
                    body: [
                        [
                            { text: 'S No.', style: 'tableHeader', margin: [10, 3, 0, 3] },
                            { text: 'Description', style: 'tableHeader', margin: [60, 3, 0, 3] },
                            { text: 'Amount', style: 'tableHeader', margin: [15, 3, 0, 3] },
                        ],
                        [
                            { text: '1', bold: true, margin: [20, 5, 0, 0] },
                            { text: planqueryData[0].planType, bold: true, margin: [60, 5, 0, 0] },
                            { text: planqueryData[0].subtotalAmount, alignment: 'right', bold: true, margin: [0, 6, 0, 0] },
                        ],
                        [
                            { text: '' },
                            { text: 'GST@18%', bold: true, margin: [60, 40, 0, 0] },
                            { text: planqueryData[0].tax, alignment: 'right', bold: true, margin: [0, 40, 5, 20] },
                        ],
                        [
                            { text: '' },
                            { text: 'Total', bold: true, alignment: 'right', fontSize: 16 },
                            { text: planqueryData[0].totalAmount, alignment: 'right', bold: true, margin: [0, 2, 0, 0] },
                        ],

                    ],

                },
                layout: {
                    hLineWidth: function () {
                        return 0;
                    },
                    vLineWidth: function () {
                        return 0;
                    },
                },

            },
            {
                canvas: [
                    {
                        type: 'line',
                        x1: 0,
                        y1: 10,
                        x2: 510,
                        y2: 10,
                        lineWidth: 0.1,
                        lineColor: 'black',
                    },
                ],
            },

            {
                columns: [{ text: 'Amount In Words', margin: [12, 8, 0, 8] }],

            },
            {
                columns: [{ text: 'INR Three Thousand Four Hundred and Twenty Two Only ', bold: true, fontSize: 12, margin: [12, 0, 0, 0] },],

            },
            {
                columns: [{ text: 'This is computer generated invoice hence no signature required', bold: true, fontSize: 11, margin: [0, 140, 0, 0], alignment: 'center' }],

            },

            {
                canvas: [
                    {
                        type: 'line',
                        x1: 0,
                        y1: 10,
                        x2: 510,
                        y2: 10,
                        lineWidth: 1.5,
                        lineColor: 'black',
                    },
                ],
            },

            {
                columns: [{ text: 'Registered Address', fontSize: 11, margin: [0, 8, 0, 0], alignment: 'center' }],

            },


            {
                columns: [{ text: 'SCO No. 53-54, Sector 8, Chandigarh 160009', fontSize: 12, margin: [0, 6, 0, 0], alignment: 'center' }],

            },
        ],

        styles: {
            header: {
                fontSize: 25,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 30]
            },
            sectionHeader: {
                fontSize: 16,
                bold: true,
                margin: [30, 0, 0, 0]
            },
            tableHeader: {
                bold: true,
                fillColor: '#4845D9',
                color: '#ffffff',
            },
            billedTo: {
                fontSize: 11,
                alignment: 'left',
                margin: [30, 5, 0, 0]
            },
            invoiceInfo: {
                fontSize: 11,
                alignment: 'left',
                margin: [38, 0, 0, 0]
            },
            addressInfo: {
                fontSize: 12,
                alignment: 'left',
                margin: [38, 2, 0, 0]
            },
            values: {
                fontSize: 12,
                bold: true
            }


        }

    };
    // res.send(docDefinition)


    pdfMake.vfs = pdfFonts.pdfMake.vfs;


    // printer.fonts= {'Roboto' : {
    //     normal: 'Roboto-Regular.ttf',
    //     bold: 'Roboto-Medium.ttf',
    //     italics: 'Roboto-Italic.ttf',
    //     bolditalics: 'Roboto-Italic.ttf'
    //  },

    //  'OpenSans' : {
    //     normal: 'OpenSans-Regular.ttf',
    //     bold: 'OpenSans-Medium.ttf',
    //     italics: 'OpenSans-Italic.ttf',
    //     bolditalics: 'OpenSans-Italic.ttf'
    //  }
    // }
    var fonts = {
        Roboto: {
            normal: './fonts/roboto/Roboto-Regular.ttf',
            bold: './fonts/roboto/Roboto-Medium.ttf',
            italics: './fonts/roboto/Roboto-Italic.ttf',
            bolditalics: './fonts/roboto/Roboto-MediumItalic.ttf'
        }
    };
    let printer = new pdfMake(fonts);


    const pdfDoc = printer.createPdfKitDocument(docDefinition, {});
    const stream = fs.createWriteStream('invoice.pdf')
    pdfDoc.pipe(stream);
    stream.on('finish', () => {
        console.log('PDF generated and saved as invoice.pdf');
    });
    pdfDoc.end();
    var mailOptions = {
        from: val.email,
        to: '', //to be added
        subject: "Request for Download",
        html: '<p>Please find  the attachment of exported Contact_Data, kindly use  this file to see your contacts</p>',
        attachments: [
            {
                filename: `invoice.pdf`,
                path: path.join(__dirname, '/invoice.pdf'),
            },
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.send(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.status(200).send({ msg: "data has been sent" });
    });


}


const invoiceDetails = async (req, res) => {
    try {
        let invoiceData = await db.excuteQuery(val.invoicePdf, [req.params.spid]);
        //  console.log(invoicePdfData)


        let cNameData = await db.excuteQuery(val.cNameQuery, [invoiceData[0].uid])


        let planqueryData = await db.excuteQuery(val.planquery, [req.params.spid])



        let billhistoryData = await db.excuteQuery(val.billhistoryQuery, [req.params.spid])
        res.status(200).send({
            invoiceData: invoiceData,
            cNameData: cNameData,
            planqueryData: planqueryData,
            billhistoryData: billhistoryData,
            status: 200
        })

    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}


const userProfile = async (req, res) => {
    try {
        uid = req.body.uid
        name = req.body.name
        filePath = req.body.filePath
        spid = req.body.spid
        // Remove header
        let streamSplit = filePath.split(';base64,');
        let base64Image = streamSplit.pop();//With the change done in aws helper this is not required though keeping it in case required later.
        let datapart = streamSplit.pop();// this is dependent on the POP above

        let imgType = datapart.split('/').pop();
        let imageName = 'Profile.png';//Default it to png.
        if (imgType) {
            imageName = 'Profile' + '.' + imgType;
        }

        let awsres = await awsHelper.uploadStreamToAws(spid + "/" + uid + "/" + name + "/" + imageName, filePath)
        console.log(awsres.value.Location)
        let userimgquery = `UPDATE user  set profile_img='` + awsres.value.Location + `'` + `where uid=` + uid;
        console.log("userimgquery");
        console.log(userimgquery)
        let result = await db.excuteQuery(userimgquery, []);
        res.status(200).send({
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const usesData = async (req, res) => {
    try {
        let useData = await db.excuteQuery(val.useData, [req.query.spid])
        res.status(200).send({
            msg: "data",
            useData: useData,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

}

const UsageInsightCon = async (req, res) => {
    try {
        let allUsageInsightCount = await db.excuteQuery(val.allusageInsiteCount, [req.params.spid])
        let UsageInsightData = await db.excuteQuery(val.usageInsiteQuery, [req.params.spid])
        res.status(200).send({
            msg: 'Uses Usage Insight',
            UsageInsightData: UsageInsightData,
            allUsageInsightCount: allUsageInsightCount,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const ApproximateCharges = async (req, res) => {
    try {
        var countryQuery = ` select Country from  billing where SP_ID=2`
        let countryData = await db.excuteQuery(countryQuery, [req.params.spid])

        let country = countryData[0].Country;
        var priceQuery = `select * from whatsappPlanPricing where Market=?`
        let priceData = await db.excuteQuery(priceQuery, [country])
        let marketingPrice = parseFloat(priceData[0].Marketing)
        let utilityPrice = parseFloat(priceData[0].Utility)
        let authenticationPrice = parseFloat(priceData[0].Authentication)
        let ServicePrice = parseFloat(priceData[0].Service)

        let MarketingCount = 0;
        let utilityCount = 0;
        let authCount = 0;
        let ServiceCount = 0;

        let conversations = await db.excuteQuery(val.usageInsiteQuery, [req.query.params])

        for (var i = 0; i < conversations.length; i++) {
            if (conversations[i].interaction_type === 'Marketing') {
                console.log("conversations" + conversations[i].count)
                MarketingCount = conversations[i].count
            }
            if (conversations[i].interaction_type === "User Initiated") {
                console.log("conversations" + conversations[i].count)
                ServiceCount = conversations[i].count
            }
            if (conversations[i].interaction_type === "Authentication") {
                console.log("conversations" + conversations[i].count)
                authCount = conversations[i].count
            }
            if (conversations[i].interaction_type === "Utility") {
                console.log("conversations" + conversations[i].count)
                utilityCount = conversations[i].count
            }
        }

        const ApproxCharges = {
            Marketing: MarketingCount * marketingPrice,
            Utility: utilityPrice * utilityCount,
            Authentication: authenticationPrice * authCount,
            UserInitiated: ServicePrice * ServiceCount
        }

        res.status(200).send({
            ApproxCharges: ApproxCharges,
            status: 200

        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const deletePaymentMethod = async (req, res) => {
    try {

        let myUTCString = new Date().toUTCString();
        const date = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        var deletePayMethodQuery = `UPDATE PaymentMethodDetails SET isDeleted=1,updated_at=? where SP_ID=?`
        let deletepay = await db.excuteQuery(deletePayMethodQuery, [date, req.params.spid])
        res.status(200).send({
            deletepay: deletepay,
            status: 200
        })
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const addfunds = async (req, res) => {
    try {
        sp_id = req.body.sp_id


        let myUTCString = new Date().toUTCString();
        const transation_date = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        amount = req.body.amount
        transation_type = req.body.transation_type
        description = req.body.description
        interaction_id = req.body.interaction_id
        currency = req.body.currency
        let values = [[sp_id, transation_date, amount, transation_type, description, interaction_id, currency]]
        let addedFund = await db.excuteQuery(val.addFunds, [values]);
        res.status(200).send({
            addedFund: addedFund,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const getAvailableAmout = async (req, res) => {
    try {
        let query = `select SUM(amount) as remaningblance from SPTransations where sp_id=?`

        let result = await db.excuteQuery(query, [req.params.spid])
        //    let netAmount=result[0].amount
        //    let usedAmount=result[0].available_blance

        let AvailableAmout = result[0].remaningblance
        //    console.log(AvailableAmout)

        res.status(200).send({
            AvailableAmout: AvailableAmout,
            status: 200
        })

    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

}

const getFAQs = async (req, res) => {
    try {
        let FAQs = await db.excuteQuery(val.FAQsQuery, []);
        res.status(200).send({
            FAQs: FAQs,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}
const getSubFAQS = async (req, res) => {
    try {
        let subFAQs = await db.excuteQuery(val.subFAQsQuery, [req.params.id]);
        res.status(200).send({
            subFAQs: subFAQs,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const UserGuideTopics = async (req, res) => {
    try {
        let topics = await db.excuteQuery(val.UserGuideTopicsQuery, [])
        res.status(200).send({
            topics: topics,
            status: 200
        })
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const UserGuideSubTopics = async (req, res) => {
    try {
        let subtopics = await db.excuteQuery(val.UserGuideSubTopicsQuery, [req.params.id])
        res.status(200).send({
            subtopics: subtopics,
            status: 200
        })
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const addSPTransations = async (req, res) => {
    try {

        sp_id = req.body.sp_id


        let myUTCString = new Date().toUTCString();
        const transation_date = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        amount = req.body.amount
        transation_type = req.body.transation_type
        currency = req.body.currency

        let values = [[sp_id, transation_date, amount, transation_type, currency]]
        let SPTransations = await db.excuteQuery(val.insertSPTransations, [values])
        res.status(200).send({
            SPTransations: SPTransations,
            status: 200
        })

    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const getmanagePlansandCharges = async (req, res) => {
    try {
        let plans = await db.excuteQuery(val.manageplans, []);
        let plansCharges = await db.excuteQuery(val.manageplansCharges, [req.params?.SP_ID])
        res.status(200).send({
            plans: plans,
            plansCharges: plansCharges,
            status: 200
        })

    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}


module.exports = {
    teamName, roleName, usesData, userProfile, changePassword, userActiveStatus, addNotification, getNotificationByUid, saveManagePlan,
    saveBillingHistory, getBillingDetails, invoiceDetails, UsageInsightCon, ApproximateCharges, deletePaymentMethod, getAvailableAmout, addfunds,
    getFAQs, getSubFAQS, UserGuideTopics, UserGuideSubTopics, invoicePdf, addSPTransations, getmanagePlansandCharges
}