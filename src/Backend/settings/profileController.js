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
//const puppeteer = require('puppeteer');
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
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
        const date = new Date();

        var resQuery = await db.excuteQuery(val.PasswordQuery, [uid])
        if (resQuery.length >= 0) {
            const hash = await bcrypt.compare(oldPass, resQuery[0].password);

            console.log(hash)
            if (hash == false) {
                res.status(401).send({
                    msg: 'Old  Password is wrong !',
                    status: 401
                });
            }
            else {
                if (newPass !== confirmPass) {
                    res.status(400).json({ error: 'Passwords do not match', status: 400 });
                }
                var hasedPass = await bcrypt.hash(newPass, 10);

                var insertRes = await db.excuteQuery(val.updatePasswordQuery, [hasedPass, date, uid])
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
        res.send(err)
    }



}

const userActiveStatus = async (req, res) => {
    try {
        IsActive = req.body.IsActive;
        LastModifiedDate = new Date()

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
        UID = req.body.UID,
            notificationId = req.body.notificationId,
            PushNotificationValue = req.body.PushNotificationValue,
            SoundNotificationValue = req.body.SoundNotificationValue,
            isDeleted = 0,
            created_at = new Date()


        var addNotification = await db.excuteQuery(val.addNotification, [[[UID, notificationId, PushNotificationValue, SoundNotificationValue, isDeleted, created_at]]])
        res.status(200).send({
            msg: 'Notification added',
            addNotification: addNotification,
            status: 200
        })
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
            tax = req.body.tax,
            created_at = new Date()
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
        billing_date = new Date()
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

// const invoicePdf = async (req, res) => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     let data = await db.excuteQuery(val.selectBillingDetails, [req.query.spid])

//     // Set the dynamic data here
//     if (data.length >= 0) {
//         var dynamicData = {
//             name: 'Raunak',
//             age: 23,
//             Address1: data[0].Address1,
//             billing_email: data[0].billing_email,
//             created_at: data[0].created_at

//             // Add more properties as needed
//         };
//     }
//     // Create a dynamic HTML template with the data
//     const html = `
//       <html>
//         <body>
//           <h1>Invoice</h1>
//           <p>Name: ${dynamicData.name}</p>
//           <p>Age: ${dynamicData.age}</p>
//           <p>Address: ${dynamicData.Address1}</p>
//           <p>Email: ${dynamicData.billing_email}</p>
//           <p>created_at: ${dynamicData.created_at}</p>
//           <!-- Add more HTML content here -->
//         </body>
//       </html>
//     `;

//     // Generate the PDF from the HTML
//     await page.setContent(html);
//     const pdfBuffer = await page.pdf();

//     // Close the browser
//     await browser.close();

//     // Set the response headers
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'attachment; filename=dynamic_pdf.pdf');

//     // Send the PDF buffer as the response
//     res.send(pdfBuffer);
// }


const invoiceDetails = async (req, res) => {
    try {
        let invoiceData = await db.excuteQuery(val.invoiceData, [req.params.spid]);
        res.status(200).send({
            invoiceData: invoiceData,
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

        var nameImg = filePath
        // if (filePath = 'undefined') {

        //     nameImg = path.join(__dirname, 'temple.jpg')
        // }
        console.log("  nameImg  " + nameImg)
        let awsres = await awsHelper.uploadFileToAws(spid + "/" + uid + "/" + name + "/profile.jpg", nameImg)

        console.log(awsres.value.Location)
        let userimgquery = `UPDATE user  set profile_img=? where uid=?`
        let result = await db.excuteQuery(userimgquery, [awsres.value.Location, uid]);
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
        let UsageInsightData = await db.excuteQuery(val.usageInsiteQuery, [req.params.spid])
        res.status(200).send({
            msg: 'Uses Usage Insight',
            UsageInsightData: UsageInsightData,
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

const deletePaymentMethod=async (req,res) =>{
try{
    let date=new Date()
  var  deletePayMethodQuery=`UPDATE PaymentMethodDetails SET isDeleted=1,updated_at=? where SP_ID=?`
  let deletepay=await db.excuteQuery(deletePayMethodQuery,[date,req.params.spid])
  res.status(200).send({
    deletepay:deletepay,
    status:200
  })
}
catch (err) {
    console.log(err)
    db.errlog(err);
    res.send(err)
}
}

module.exports = {
    teamName, roleName, usesData, userProfile, changePassword, userActiveStatus, addNotification, getNotificationByUid, saveManagePlan,
    saveBillingHistory, getBillingDetails, invoiceDetails, UsageInsightCon, ApproximateCharges,deletePaymentMethod
}