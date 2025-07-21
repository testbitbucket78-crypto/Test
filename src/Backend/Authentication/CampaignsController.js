const express = require('express');
const db = require("../dbhelper");
const bodyParser = require('body-parser');
const app = express();
const http = require("https");
const middleWare = require('../middleWare')
const removeTags = require('../removeTagsFromRichTextEditor')
const nodemailer = require('nodemailer');
const val = require('./constant')
const moment = require('moment');
const ExcelJS = require('exceljs');
app.use(bodyParser.json());
const path = require("path");
const { EmailConfigurations } =  require('../Authentication/constant');
const { MessagingName }= require('../enum');
const {EmailTemplateProvider}= require('../common/template')
const { sendEmail }= require('../Services/EmailService');
const mysql = require('mysql');
app.use(bodyParser.urlencoded({ extended: true }));

const getCampaigns = (req, res) => {
    let Query = "SELECT * from Campaign  where  Campaign.is_deleted =0 and Campaign.sp_id=" + req.body.SPID
    if (req.body.key) {
        Query += sQuery + " and  Campaign.title like '%" + req.body.key + "%'"
    }
    //  console.log(Query)
    db.runQuery(req, res, Query, []);
}


const addCampaign = async (req, res) => {
    try {
        let status = req.body.status
        let SP_ID = req.body.SP_ID
        let title = req.body.title
        let channel_id = req.body.channel_id
        let message_heading = req.body.message_heading
        let message_content = req.body.message_content
        let message_media = req.body.message_media
        let message_variables = req.body.message_variables
        let button_yes = req.body.button_yes
        let button_no = req.body.button_no
        let button_exp = req.body.button_exp
        let category = req.body.category
        let time_zone = req.body?.time_zone
        let start_datetime = req.body.start_datetime  // Get UTC TIME FROM FE
        let end_datetime = req.body.end_datetime
        let csv_contacts = req.body.csv_contacts
        let segments_contacts = req.body.segments_contacts
        let category_id = req.body.category_id
        let OptInStatus = req.body.OptInStatus
        let start_time = req.body?.start_time
        let end_time = req.body?.end_time
        let message_footer = req.body?.message_footer
        let templateId = req.body.templateId
        var header = req.body?.headerText ? req.body?.headerText : '';
        var body = req.body?.bodyText
        var buttons = req.body?.buttons
        var buttonsVariable = req.body?.buttonsVariable
        var interactive_buttons = req.body?.interactive_buttons
        message_variables = (message_variables?.length <= 0) ? '' : message_variables;
        csv_contacts = (csv_contacts?.length <= 0) ? '' : csv_contacts;
        segments_contacts = (segments_contacts?.length <= 0) ? '' : segments_contacts;

        let media_type = req.body?.media_type;

        if (req.body.Id != '') {
            var updateQuery = "UPDATE Campaign set";
            updateQuery += " title='" + req.body.title + "',";
            updateQuery += " channel_id='" + req.body.channel_id + "',";
            updateQuery += " message_heading='" + req.body.message_heading + "',";
            updateQuery += " message_content=" + mysql.escape(req.body.message_content) + ",";
            updateQuery += " message_media='" + req.body.message_media + "',";
            updateQuery += " message_variables='" + req.body.message_variables + "',";
            updateQuery += " button_yes='" + req.body.button_yes + "',";
            updateQuery += " button_no='" + req.body.button_no + "',";
            updateQuery += " button_exp='" + req.body.button_exp + "',";
            updateQuery += " category='" + req.body.category + "',";
            updateQuery += " time_zone='" + req.body?.time_zone + "',";
            updateQuery += " start_datetime='" + req.body.start_datetime + "',";
            updateQuery += " end_datetime='" + req.body.end_datetime + "',";
            updateQuery += " csv_contacts='" + req.body.csv_contacts + "',";
            updateQuery += " segments_contacts='" + req.body.segments_contacts + "',";
            updateQuery += " status= '" + req.body.status + "',";
            updateQuery += " category_id= '" + req.body.category_id + "',";
            updateQuery += " start_time= '" + req.body?.start_time + "',";
            updateQuery += " end_time= '" + req.body?.end_time + "',";
            updateQuery += " media_type= '" + req.body?.media_type + "',";
            updateQuery += " message_footer= '" + req.body?.message_footer + "',";
            updateQuery += " OptInStatus= '" + req.body?.OptInStatus + "',";
            updateQuery += " templateId= '" + req.body?.templateId + "',";
            updateQuery += " headerText= '" + req.body?.headerText + "',";
            updateQuery += " bodyText= " + mysql.escape(req.body?.bodyText) + ",";
            updateQuery += " buttons= '" + req.body?.buttons + "',";
            updateQuery += " buttonsVariable= '" + req.body?.buttonsVariable + "',";
            updateQuery += " interactive_buttons= '" + req.body?.interactive_buttons + "'";
            updateQuery += " WHERE Id =" + req.body.Id
            let editedCampaign = await db.excuteQuery(updateQuery, [])
            let editCampaign = {
                insertId: req.body.Id
            }
            let statusToUpdate = 1;  //For scheduled campaign status
            if (status == '2') {
                statusToUpdate = 2;
            }
            // campaignAlerts(req.body, req.body.Id, statusToUpdate)
            // db.runQuery(req, res, updateQuery, []);
            res.send({
                "status": 200,
                "message": "Campaign edited",
                "addcampaign": editCampaign
            })
        } else {

            var inserQuery = "INSERT INTO Campaign (status,sp_id,title,channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,time_zone,start_datetime,end_datetime,csv_contacts,segments_contacts,category_id,OptInStatus,start_time,end_time,media_type,message_footer, templateId,headerText,bodyText,buttons,buttonsVariable,interactive_buttons) values ? ";
            let addCampaignValue = [[status, SP_ID, title, channel_id, message_heading, message_content, message_media, message_variables, button_yes, button_no, button_exp, category, time_zone, start_datetime, end_datetime, csv_contacts, segments_contacts, category_id, OptInStatus, start_time, end_time, media_type, message_footer, templateId,header,body,buttons,buttonsVariable,interactive_buttons]]

            let addcampaign = await db.excuteQuery(inserQuery, [addCampaignValue]);

            let statusToUpdate = 1;  //For scheduled campaign status
            if (status == '2') {
                statusToUpdate = 2;
            }
            campaignAlerts(req.body, addcampaign.insertId, statusToUpdate)
            res.send({
                "status": 200,
                "message": "Campaign added",
                "addcampaign": addcampaign
            })
        }
    } catch (err) {
        res.send({
            "status": 500,
            "message": err
        })
    }
}

const isExistCampaign = async (req, res) => {
    try {

        let campaignTitle = await db.excuteQuery("SELECT * from Campaign  where title=? and is_deleted !=1 and sp_id=? AND Id !=?", [req.params.title, req.params.spid, req.params.Id])

        if (campaignTitle?.length == 0) {

            res.send({
                "status": 200,
                "message": "Campaign ready to add",
            })
        } else {
            res.send({
                "status": 409,
                "message": "Campaign Name already exist"
            })
        }
    } catch (err) {
        res.send({
            "status": 500,
            "message": err
        })
    }
}

const getCampaignDetail = (req, res) => {
    let Query = "SELECT * from Campaign  where  Campaign.Id=" + req.params.CampaignId
    db.runQuery(req, res, Query, []);
}


const getFilteredCampaign = (req, res) => {
    let filterQuery = "SELECT * from Campaign  where Campaign.is_deleted =0 and Campaign.sp_id=" + req.body.SPID
    // if (req.body.start_date) {
    //     filterQuery += " and  Date(start_datetime) >= '" + req.body.start_date + "'"
    // }

    // if (req.body.end_date) {
    //     filterQuery += " and  Date(end_datetime) <= '" + req.body.end_date + "'"
    // }

    if (req.body.start_date && req.body.end_date) {
        filterQuery += " AND ((DATE(start_datetime) >= '" + req.body.start_date + "' AND DATE(end_datetime) <= '" + req.body.end_date + "' AND DATE(end_datetime) != '0000-00-00') OR (DATE(start_datetime) >= '" + req.body.start_date + "' AND DATE(start_datetime) <= '" + req.body.end_date + "' AND DATE(end_datetime) = '0000-00-00'))";
    } else if (req.body.start_date) {
        filterQuery += " AND DATE(start_datetime) >= '" + req.body.start_date + "'";
    }
    if (req.body.channelIn.length > 0) {
        filterQuery += " and  channel_id IN (" + req.body.channelIn + ")"
    }

    if (req.body.categoryIn.length > 0) {
        filterQuery += " and  category_id IN (" + req.body.categoryIn + ")"
    }

    if (req.body.statusIn.length > 0) {
        filterQuery += " and  status IN (" + req.body.statusIn + ")"
    }

    if (req.body.key) {
        filterQuery += " and  title like '%" + req.body.key + "%'"
    }

    console.log(filterQuery)
    db.runQuery(req, res, filterQuery, []);
}


const getContactList = (req, res) => {
    let Query = "SELECT ContactList.* ,user.name as owner from ContactList,user  where user.uid =ContactList.created_by and  ContactList.is_deleted !=1 and ContactList.SP_id = " + req.body.SPID
    if (req.body.key) {
        Query += " and  ContactList.list_name like '%" + req.body.key + "%'"
    }

    db.runQuery(req, res, Query, []);
}

const updatedContactList = (req, res) => {

    var updateQueryQuery = "UPDATE ContactList SET filters ='" + req.body.filters + "',";
    updateQueryQuery += " contact_id_list ='" + req.body.contact_id_list + "',"
    updateQueryQuery += " updated_at ='" + new Date().toISOString().slice(0, 19).replace('T', ' ') + "'"

    updateQueryQuery += " WHERE Id =" + req.body.Id

    db.runQuery(req, res, updateQueryQuery, [])



}

const addNewContactList = (req, res) => {
    var inserQuery = "INSERT INTO ContactList (SP_id,created_by,filters,contact_id_list,list_name) VALUES (" + req.body.SP_id + "," + req.body.created_by + ",'" + req.body.filters + "','" + req.body.contact_id_list + "','" + req.body.list_name + "')";
    db.runQuery(req, res, inserQuery, []);
}

const deleteContactList = (req, res) => {
    var inserQuery = "UPDATE ContactList SET is_deleted = 1 where Id= ?"
    db.runQuery(req, res, inserQuery, [req.body.id]);
}

const applyFilterOnEndCustomer = async (req, res) => {
    try {
        let Query = req.body.Query //+ " and EC.isDeleted !=1  AND EC.IsTemporary !=1 GROUP BY EC.customerId"
        console.log(Query)
        let contactList = await db.excuteQuery(Query, []);
        //console.log(contactList)
        res.send(contactList)
    } catch (err) {
        console.log(err);
        res.send(err)
    }

}
const processContactQueries = async (req, res) => {
    const queries = req.body.Query;
    const isOptIn = req.body?.isOptIn;
    if (!queries || !Array.isArray(queries) || queries.length === 0) {
        res.send({
            status: 400,
            error: 'Invalid queries provided'
        });
    }

    let results = [];

    try {
        // Execute each query sequentially
        for (let query of queries) {
            let listQuery = query //+ " and EC.isDeleted !=1  AND EC.IsTemporary !=1"
            if (isOptIn == 1) {
                //+ " and EC.isDeleted !=1  AND EC.IsTemporary !=1 and EC.OptInStatus =? "
                query = query.replace('Group by EC.customerId', ' and EC.OptInStatus =? Group by EC.customerId ')
                listQuery = query
            }
            const queryResult = await db.excuteQuery(listQuery, ['Yes']);
            results = results.concat(queryResult);
        }

        // Remove duplicates from the combined results
        const uniqueResults = results.filter((value, index, self) => self.findIndex(v => v.Phone_number === value.Phone_number) === index);


        res.send({
            status: 200,
            uniqueResults: uniqueResults
        });
    } catch (error) {
        console.log(error)
        res.send({
            status: 500,
            error: 'Error processing queries'
        });
    }
}


const getAdditiionalAttributes = (req, res) => {
    let Query = "SELECT * from sip_attributes  where SP_id = " + req.params.SPID
    db.runQuery(req, res, Query, []);
}

const deleteCampaign = (req, res) => {
    var updateQueryQuery = "UPDATE Campaign SET is_deleted =1 WHERE Id =" + req.params.CampaignId

    db.runQuery(req, res, updateQueryQuery, [])
}

const getEndCustomerDetail = (req, res) => {
    let Query = "SELECT * from EndCustomer  where  IsTemporary !=1 AND customerId = " + req.params.customerId

    db.runQuery(req, res, Query, []);
}

const getContactAttributesByCustomer = (req, res) => {
    let Query = "SELECT * from ContactAttributes where EndCustomerId = " + req.params.customerId

    db.runQuery(req, res, Query, []);
}



// Function to parse the message template and retrieve placeholders
function parseMessageTemplate(template) {
    // console.log("2983728",template)
    // const placeholderRegex = /{{(.*?)}}/g;
    // const placeholders = [];
    // let match;
    // while ((match = placeholderRegex.exec(template))) {
    //     console.log(match[1])
    //     placeholders.push(match[1]);
    // }
    // console.log(placeholders)
    // return placeholders;
    const placeholderRegex = /{{(.*?)}}/g;
    const placeholders = [];
    let match;
    while ((match = placeholderRegex.exec(template)) !== null) {
        console.log(`Matched placeholder: ${match[1]} at position ${match.index}`);
        placeholders.push(match[1]);
    }
    // console.log("All placeholders:", placeholders);
    return placeholders;
}

function getTimeZoneTimes(serverDateTime, time_zone) {
    //console.log(serverDateTime ,time_zone)
    var inputString = time_zone;//time zone value from database

    // Extract hours and minutes from the input string
    var parts = inputString.split(' ');
    var timeParts = parts[1].split(':');
    var hours = parseInt(timeParts[0]);
    var minutes = parseInt(timeParts[1]);
    // Convert to decimal representation
    var decimalRepresentation = hours + (minutes / 60);

    //get the timezone offset from local time in minutes
    var tzDifference = decimalRepresentation * 60;

    //convert the date time to the timezone so that we can directly compare campaign date time with it.
    var timeToCompareWith = new Date(serverDateTime.getTime() + tzDifference * 60 * 1000)
    return timeToCompareWith;
}


const sendCampinMessage = async (req, res) => {

    try {
        var TemplateData = req.body
        var messageTo = TemplateData.phone_number
        var messateText = TemplateData.message_content
        console.log(" Send TemplateData")
        let channel = TemplateData.channel_label
        //+++++++++++++++++ waitinh
        let schedule_datetime = TemplateData.schedule_datetime
        let spid = TemplateData.SP_ID
        let media = TemplateData.message_media
        let optInStatus = TemplateData.optInStatus
        let time_zone = TemplateData && TemplateData.time_zone ? TemplateData.time_zone : 'GMT +5:30';
        let isFinished = req.body.isFinished;
        let type = req.body?.media_type;
        var customerId = TemplateData.customerId


        let content = await removeTags.removeTagsFromMessages(messateText);


        // Get VALUES from the message_variables whose labels  are within {{}} 
        const message_variables = req.body.message_variables && req.body.message_variables.length > 0 ? JSON.parse(req.body.message_variables) : undefined;

        console.log(content, "___________message_variables ____________", message_variables)
        //         // Replace placeholders in the content with values from message_variables
        const placeholders = parseMessageTemplate(content);
        // if (message_variables) {
        //     message_variables.forEach(variable => {
        //         const label = variable.label;
        //         const value = variable.value;
        //         content = content.replace(new RegExp(label, 'g'), value);
        //     });
        // }



        //console.log(placeholders?.length,"parseMessageTemplate"  ,parseMessageTemplate)
        if (placeholders?.length > 0) {

            const results = await removeTags.getDefaultAttribue(message_variables, spid, customerId);
            console.log("getDefaultAttribue", results)
            //console.log("placeholders",placeholders)
            placeholders.forEach(placeholder => {
                const result = results.find(result => result.hasOwnProperty(placeholder));
                console.log(placeholder, "place foreach", results)
                const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
                content = content.replace(`{{${placeholder}}}`, replacement);
            });
        }

        let serverDateTime = new Date();
        let formattedTime = getTimeZoneTimes(serverDateTime, time_zone)

        //let channelType = await db.excuteQuery('select channel_id from WhatsAppWeb where spid=? limit 1', [spid] 
        let inputDate = new Date(schedule_datetime);
        console.log(formattedTime, inputDate, new Date(formattedTime), new Date(inputDate), new Date(inputDate) <= new Date(formattedTime))

        const sqlQuery = `SELECT * FROM EndCustomer WHERE customerId=?  and SP_ID=? and isDeleted !=1`;
        let results = await db.excuteQuery(sqlQuery, [customerId, spid]);
        console.log(spid, req.body.channel_id, type, messageTo, "****", customerId)

        if (new Date(inputDate) <= new Date(formattedTime) && results[0]?.isBlocked != 1) {
            //  console.log("iiiiiiiiiiiiiii",content)
            let messagestatus;
            if (optInStatus == 'Yes') {

                if (results[0]?.OptInStatus == 'Yes' || results[0]?.OptInStatus == '1') {
                    messagestatus = await middleWare.channelssetUp(spid, req.body.channel_id, type, messageTo, content, media)
                }
            } else {
                //   console.log(spid, req.body.channel_id, type, messageTo, "+++++++", customerId)
                messagestatus = await middleWare.channelssetUp(spid, req.body.channel_id, type, messageTo, content, media)
                // messagestatus = await middleWare.createWhatsAppPayload(type, messageTo, templateName, languageCode, headerVariables = [], bodyVariables = [], media)
            }
            console.log("isFinished ", isFinished, TemplateData.status)
            if (isFinished == true) {
                setTimeout(() => {
                    campaignAlerts(TemplateData, TemplateData.CampaignId, 3);
                }, 2000); // 2 seconds delay
            }

            //console.log('The input date is in the past.');
            //if(messagestatus =='')
            console.log("messagestatus  " + JSON.stringify(messagestatus?.status))
            return res.send(messagestatus);
        } else {
            return res.send({
                msg: 'time not match Or Contact is Block'
            });
        }


        //    var reqBH = http.request(WHATSAPPOptions, (resBH) => {
        //     var chunks = [];
        // 	  resBH.on("data", function (chunk) {
        // 		chunks.push(chunk);
        // 	  });
        //     resBH.on("end", function () {
        // 		const body = Buffer.concat(chunks);
        // 		 return res.send(body.toString());
        // 	  });
        //   });


        //   reqBH.write(JSON.stringify({
        // 	"messaging_product": "whatsapp",    
        // 	"recipient_type": "individual",
        // 	"to": messageTo,
        // 	"type": "text",
        //     "text": { 
        // 		"body": content
        // 		}  
        //    }));

        /* 
        reqBH.write(JSON.stringify({
     "messaging_product": "whatsapp",
     "to": messageTo,
     "type": "template",
     "template": {
         "name": "hello_world",
         "language": {
             "code": "en_US",
             "policy": "deterministic"
         },
         "components": [
             {
                 "type": "body",
                 "parameters": [
                     {
                         "type": "text",
                         "text": content
                     }
                 ]
             },
             {
                 "type": "button",
                 "sub_type": "quick_reply",
                 "index": 0,
                 "parameters": [
                     {
                         "type": "text",
                         "text": "Yes"
                     }
                 ]
             },
             {
                 "type": "button",
                 "sub_type": "quick_reply",
                 "index": 1,
                 "parameters": [
                     {
                         "type": "text",
                         "text": "No"
                     }
                 ]
             }
         ]
     }
    }));
    
    */
        //reqBH.end();
    } catch (err) {
        console.log(err);
        res.send({
            status: 500,
            msg: err
        })
    }

}

// const campaignAlerts = async (req, res) => {
//     var TemplateData = req.body
//     console.log("campaignAlerts ")
//     //console.log(req.body)

async function campaignAlerts(TemplateData, insertId, statusToUpdate) {
    console.log(insertId, "campaignAlerts ***************", TemplateData.channel_id, statusToUpdate)
    message_content = TemplateData.message_content
    message_media = TemplateData.message_media
    channel_id = TemplateData.channel_id
    phone_number_id = ''
    updatedStatus = TemplateData.status
    let alertmessages = await msg(TemplateData)

    let alertUser = `select c.uid,u.* from CampaignAlerts c
    JOIN user u ON u.uid=c.uid
     where c.SP_ID=? and c.isDeleted !=1 `;

     let querry = `SELECT mobile_number 
     FROM user 
     WHERE SP_ID = ? AND ParentId IS NULL`
    const spData = await  db.excuteQuery(querry, [TemplateData.SP_ID]);
    let spNumber
    if(spData.length > 0) {
        spNumber = spData[0].mobile_number
    }
    let user = await db.excuteQuery(alertUser, [TemplateData.SP_ID]);
    for (let i = 0; i < user.length; i++) {
        let { subject, body, emailSender } = await EmailTemplateProvider(TemplateData, updatedStatus, user[i]?.Channel, user[i]?.name, spNumber);
  
        const emailOptions = {
          to: user[i]?.email_id,
          subject,
          html: body,
          fromChannel: emailSender,
        };
        try {
        if(body){
            let emailSent = sendEmail(emailOptions);
        }
          //console.log(`Email sent to ${user[i]?.email}:`, emailSent);
        } catch (error) {
          console.error(`Failed to send email to ${user[i]?.email}:`, error.message);
        }
      }

    var type = TemplateData.media_type;

    // whats app messages to whats app sendBatchMessage(user, TemplateData.SP_ID, TemplateData.media_type, alertmessages, message_media, phone_number_id, channel_id, insertId, statusToUpdate)

}

async function sendBatchMessage(user, sp_id, type, message_content, message_media, phone_number_id, channel_id, Id, updatedStatus) {
    console.log(sp_id, "channel_id, Id", channel_id, Id, updatedStatus)
    for (var i = 0; i < user.length; i++) {
        let mobile_number = user[i]?.mobile_number
        //console.log("sendBatchMessage" ,sp_id, channel_id, type, mobile_number, message_content, message_media)
        setTimeout(async () => {
            //  messageThroughselectedchannel(sp_id, mobile_number, type, message_content, message_media, phone_number_id, channel_id)
            let batchresponse = await middleWare.channelssetUp(sp_id, channel_id, type, mobile_number, message_content, message_media);
            console.log(channel_id, batchresponse, "batchresponse", type)
        }, 10)
    }
    let updateQuery = `UPDATE Campaign SET status=?,updated_at=? where Id=?`;
    let updated = await db.excuteQuery(updateQuery, [updatedStatus, new Date().toUTCString(), Id])
    console.log("updated")
    //console.log(updated)
}

async function find_message_status(sp_id, Id) {
    console.log("gottttttttt", sp_id, Id)
    let Sent = 0;
    let Failed = 0;
    let msgStatusquery = `SELECT
    
    CM.status,
   COUNT( CM.status) AS Status_Count
   FROM
    CampaignMessages AS CM
   JOIN
    Campaign AS C ON CM.CampaignId = C.Id
   WHERE
    C.is_deleted != 1 and C.status>=1   
   AND C.sp_id = ? AND C.Id=?
   GROUP BY
   CM.status;`   //status 2 for running campaign
    let msgStatus = await db.excuteQuery(msgStatusquery, [sp_id, Id]);
    console.log("(((((((((((((((((((((((((((", msgStatus)
    for (const item of msgStatus) {
        console.log(item.status)
        if (item.status != 0) {
            Sent += item.Status_Count;
        } else if (item.status === 0) {
            Failed += item.Status_Count;
        }
    }

    return {
        Sent: Sent,
        Failed: Failed,
    };
}

async function msg(alert) {
    try {
        console.log("alert", alert.status)
        let message = ''
        console.log("findmessages", alert.SP_ID, alert?.Id)
        let msgStatus = await find_message_status(alert.SP_ID, alert?.Id)
        console.log("alert.channel_id", alert.channel_id, alert.status)

        var audience = alert.segments_contacts?.length > 0 ? JSON.parse(alert?.segments_contacts)?.length : JSON.parse(alert?.csv_contacts)?.length


        if (alert.status == '1') {
            message = `Hi there, your Engagekart Campaign has been Scheduled:
      Campaign Name: `+ alert.title + `
      Scheduled Time: `+ alert.start_datetime + `
      Taget Audience: `+ audience + `
      Channel: `+ 'WhatsApp' + `,` + alert.channel_id + `
      Category: `+ alert.category + ` `
        } if (alert.status == '-1') {
            message = `Hello, your Engagekart Campaign has Started:
      Campaign Name: `+ alert.title + `
      Taget Audience:  `+ audience + `
      Channel: `+ 'WhatsApp' + `,` + alert.channel_id + `
      Category:`+ alert.category + ` `
        } if (alert.status == '3') {
            message = `Hi, here is the Summary of your finished Engagekart Campaign:
      Campaign Name: `+ alert.title + `
      Taget Audience:  `+ audience + `
      Channel: `+ 'WhatsApp' + `,` + alert.channel_id + `
      Category: `+ alert.category + `
      Sent: ` + msgStatus.Sent + `
      Failed: ` + msgStatus.Failed + `
      For more detailed report, please login to your Engagkart account`
        } if (alert.status == '0') {
            message = `Engagekart Campaign Alert:
      Hi, Please note your Engagekart campaign ` + alert.title + ` has stopped/Paused. Please login to Engagkart account for more details and take further action.`
        }

        return message;
    } catch (err) {
        console.log(err)
    }
}


async function insertInteractionAndRetrieveId(custid, sid) {
    try {
        console.log(custid, sid)
        // Check if Interaction exists for the customerId
        let rows = await db.excuteQuery(
            'SELECT InteractionId FROM Interaction WHERE customerId = ? and is_deleted !=1 and SP_ID=? ',
            [custid, sid]
        );

        if (rows.length == 0) {

            // If no existing interaction found, insert a new one
            await db.excuteQuery(
                'INSERT INTO Interaction (customerId, interaction_status, SP_ID, interaction_type) VALUES (?, ?, ?, ?)',
                [custid, 'empty', sid, 'User Initiated']
            );
            // } else {

            //     // Check for the maximum created_at date of Message
            //     let maxdate = await db.excuteQuery(
            //         'SELECT max(created_at) as maxdate from Message where interaction_id in (select InteractionId from Interaction where customerId=? and is_deleted !=1 and SP_ID=?)',
            //         [custid, sid]
            //     );


            //     // If maxdate is older than 24 hours, insert a new interaction
            //     if (!maxdate || new Date(maxdate) <= new Date(Date.now() - 24 * 60 * 60 * 1000)) {
            //         console.log("______________________")
            //         await db.excuteQuery(
            //             'INSERT INTO Interaction (customerId, interaction_status, SP_ID, interaction_type) VALUES (?, ?, ?, ?)',
            //             [custid, 'empty', sid, 'User Initiated']
            //         );
            //     }
        }

        // Retrieve the newly inserted or existing Interaction ID
        let InteractionId = await db.excuteQuery(
            'SELECT InteractionId FROM Interaction WHERE customerId = ? and is_deleted !=1 and SP_ID=? ORDER BY created_at DESC LIMIT 1',
            [custid, sid]
        );

        // console.log('Newly inserted or existing Interaction ID:', InteractionId);

        return InteractionId;
    } catch (error) {
        console.error('Error:', error);
        return error;
    }
}





const saveCampaignMessages = async (req, res) => {
    try {
        console.log("saveCampaignMessages")
        let media = req.body.message_media
        let status_message = req.body.status_message
        let button_yes = req.body.button_yes
        let button_no = req.body.button_no
        let button_exp = req.body.button_exp
        let message_heading = req.body.message_heading
        let CampaignId = req.body.CampaignId
        let phone_number = req.body.phone_number
        let status = req.body.status
        let schedule_datetime = req.body.schedule_datetime
        let SP_ID = req.body.SP_ID
        let type = req.body.media_type
        let mediaType;
        if (type == 'image') {
            mediaType = 'image/jpg'
        } if (type == 'video') {
            mediaType = 'video/mp4'
        } if (type == 'document') {
            mediaType = 'application/pdf'
        }
        // let content = req.body.message_content
        button_yes = (button_yes === null || button_yes === undefined) ? '' : button_yes;
        button_no = (button_no === null || button_no === undefined) ? '' : button_no;
        button_exp = (button_exp === null || button_exp === undefined) ? '' : button_exp;
        message_heading = (message_heading === null || message_heading === undefined) ? '' : message_heading;


        let InteractionId = await insertInteractionAndRetrieveId(req.body.customerId, req.body.SP_ID);
        // console.log(req.body.message_content, "InteractionId InteractionId")

        let msgQuery = `insert into Message (interaction_id,message_direction,message_text,message_media,Type,SPID,media_type,Agent_id,assignAgent) values ?`
        let savedMessage = await db.excuteQuery(msgQuery, [[[InteractionId[0]?.InteractionId, 'Out', req.body.message_content, req.body.message_media, 'text', req.body.SP_ID, mediaType, '', -1]]]);


        let content = await removeTags.removeTagsFromMessages(req.body.message_content);


        // Parse the message template to get placeholders
        const placeholders = parseMessageTemplate(content);
        if (placeholders.length > 0) {
            // Construct a dynamic SQL query based on the placeholders
            const sqlQuery = `SELECT ${placeholders.join(', ')} FROM EndCustomer WHERE customerId=? and isDeleted !=1 and SP_ID=?`;
            let results = await db.excuteQuery(sqlQuery, [req.body.customerId, SP_ID]);
            const data = results[0];


            placeholders.forEach(placeholder => {
                content = content.replace(`{{${placeholder}}}`, data[placeholder]);
            });
        }
        // console.log("++", content)
        var inserQuery = "INSERT INTO CampaignMessages (status_message,button_yes,button_no,button_exp,message_media,message_content,message_heading,CampaignId,phone_number,status,schedule_datetime,SP_ID) values ?";

        let campaignMessagesValue = [[status_message, button_yes, button_no, button_exp, media, content, message_heading, CampaignId, phone_number, status, schedule_datetime, SP_ID]]
        let CampaignMessage = await db.excuteQuery(inserQuery, [campaignMessagesValue]);
        //console.log("CampaignMessage"  ,CampaignMessage)
        res.send({
            status: 200,
            savedMessage: CampaignMessage
        })
    } catch (err) {
        console.log(err)
        res.send({
            status: 500,
            err: err
        })
    }
}


const WHATSAPP_TOKEN = 'Bearer EAAD3Jp4D3lIBABUpzqZCpd8JxKT9aBjEmU1dGGxYFZBVcrbve6NtdiGpKwTb8EuthKEYKjU44dxgKuxZCZA3gXJEquZBwRUhC8en0s42JYdZCKknbzxeY54wvBZCrx3GKfFd33o5lykgZCJGtiZCUT3pw2IQOLTQ8EVTrT33ll3Nwm4Xl0caAF66DFxSxHakWpTRDKTXcHCPytPhuyaTMtnog'
const WHATSAPPOptions = {
    "method": "POST",
    "hostname": 'graph.facebook.com',
    "path": "/v15.0/102711876156078/messages",
    "headers": {
        "Authorization": WHATSAPP_TOKEN,
        "Content-Type": "application/json",
    }
};

const getCampaignMessages = async (req, res) => {
    try {
        let Query = "SELECT * from CampaignMessages  where CampaignId = " + req.params.CampaignId
        let MessageStatusQuery = `SELECT CampaignId, status, COUNT(*) AS status_count
        FROM CampaignMessages
        WHERE CampaignId = ${req.params.CampaignId}
        GROUP BY CampaignId, status;`
        let report = await db.excuteQuery(MessageStatusQuery, [])
        let campaignMsg = await db.excuteQuery(Query, []);
        res.send({
            status: 200,
            report: report,
            campaignMsg: campaignMsg
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }

}


const copyCampaign = async (req, res) => {
    let Query = "SELECT * from Campaign  where Id = " + req.params.CampaignId
    let existCampaign = await db.excuteQuery(Query, [])
    //console.log("existCampaign",'Copy of '+existCampaign[0].title)
    let randomName = Math.floor(10000 + Math.random() * 90000);
    let CopyQuery;
    let campaignTitle = await db.excuteQuery("SELECT * from Campaign  where title=? and is_deleted !=1 and sp_id=?", ['copy of ' + existCampaign[0].title, req.params.spid])
    if (campaignTitle?.length == 0) {
        CopyQuery = "INSERT INTO Campaign (sp_id,title,channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,time_zone,start_datetime,end_datetime,csv_contacts,segments_contacts,media_type,templateId,buttons) SELECT sp_id, CONCAT('copy of ',title),channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,time_zone,' ',' ',csv_contacts,segments_contacts,media_type,templateId,buttons FROM Campaign WHERE Id = " + req.params.CampaignId

    } else {
        CopyQuery = `INSERT INTO Campaign (sp_id,title,channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,time_zone,start_datetime,end_datetime,csv_contacts,segments_contacts,media_type,templateId,buttons) SELECT sp_id, CONCAT('copy of ${existCampaign[0].title} ', ${randomName}),channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,time_zone,' ',' ',csv_contacts,segments_contacts,media_type,templateId,buttons FROM Campaign WHERE Id = ` + req.params.CampaignId
    }
    //  console.log(CopyQuery)
    let campaignCopied = await db.excuteQuery(CopyQuery, []);
    res.send({
        "status": 200,
        "message": campaignCopied,
    })



}


const download = (req, res) => {
    try {
        var file = path.join(__dirname, '/sample_file.csv')


        res.download(file)
    } catch (err) {
        console.error(err);
        db.errlog(err);
        res.status(500).send({
            msg: err,
            status: 500
        });
    }
}



  const convertToMomentFormat = (format) => {
        const formatMapping = {
            'd': 'D', 
            'dd': 'DD', 
            'm': 'M', 
            'mm': 'MM',
            'yy': 'YY', 
            'yyyy': 'YYYY'
        };
        return format.replace(/d{1,2}|m{1,2}|y{2,4}/gi, match => formatMapping[match.toLowerCase()] || match);
  };
  
  async function formatterDateTime(data, sp_id) {
    const select = 'SELECT * FROM localDetails WHERE SP_ID = ?';
    const formatSettings = await db.excuteQuery(select, [sp_id]);

    if (!formatSettings || formatSettings.length === 0) {
        return data; // No formatting if no settings found
    }

    let { Date_Format, Time_Format } = formatSettings[0];

    if (Date_Format) {
        Date_Format = convertToMomentFormat(Date_Format);
    }

    const timeFields = ['Submit Time', 'Delivered Time', 'Seen Time', 'Replied Time'];

    const formattedData = data.map(record => {
        timeFields.forEach(field => {
            const originalTime = record[field];

            // Log the original time for debugging
            // console.log(`Original ${field}:`, originalTime);

            if (originalTime) {
                try {
                    // Parse the ISO date-time using moment
                    const dateTime = moment(originalTime);

                    // Log the parsed date for debugging
                    // console.log(`Parsed ${field} with moment:`, dateTime.isValid() ? dateTime.toISOString() : 'Invalid');

                    if (dateTime.isValid()) {
                        const formattedDate = dateTime.format(Date_Format || 'MM/DD/YYYY');
                        const formattedTime = dateTime.format(Time_Format === '12' ? 'h:mm A' : 'HH:mm');

                        // Combine the formatted date and time into one field
                        record[field] = `${formattedDate} ${formattedTime}`;
                    } else {
                        console.error(`Invalid date for ${field}:`, originalTime);
                    }
                } catch (error) {
                    console.error(`Error formatting ${field}:`, error);
                }
            } else {
                // Set to empty string if null
                record[field] = '';
            }
        });

        record['Message Status'] = mapStatusToText(record['Message Status']); // Map status

        return record; // Return formatted record
    });

    return formattedData; // Return the formatted data
}



  
  
  
const fetchCampaignMessages = async (campaignId, timeZone) => {
    const query = `
    SELECT 
        id AS "Msg ID",
        phone_number AS "Customer Number",
        status AS "Message Status",
        CONVERT_TZ(SentTime, '+00:00', '${timeZone}') AS "Submit Time",
        CONVERT_TZ(DeliveredTime, '+00:00', '${timeZone}') AS "Delivered Time",
        CONVERT_TZ(SeenTime, '+00:00', '${timeZone}') AS "Seen Time",
        CONVERT_TZ(RepliedTime, '+00:00', '${timeZone}') AS "Replied Time",
        FailureReason AS "Failure Reason",
        FailureCode AS "Error Codes"
    FROM CampaignMessages
    WHERE CampaignId = ?
`;
    let result = await db.excuteQuery(query, [campaignId]);
    return result;
};

const mapStatusToText = (status) => {
    const statusMap = {
        0: 'Failed',
        1: 'Submitted',
        2: 'Delivered',
        3: 'Seen',
        4: 'Replied'
    };
    return statusMap[status] || ''; // Return an empty string if status is not in the map
};

const sanitizeMessages = (messages) => {
    return messages.map(message => ({
        'Msg ID': message['Msg ID'] || '',
        'Customer Number': message['Customer Number'] || '',
        'Message Status': message['Message Status'] || '',//mapStatusToText(message['Message Status']),
        'Submit Time': message['Submit Time'] || '',
        'Delivered Time': message['Delivered Time'] || '',
        'Seen Time': message['Seen Time'] || '',
        'Replied Time': message['Replied Time'] || '',
        'Failure Reason': message['Failure Reason'] || '',
        'Error Codes': message['Error Codes'] || ''
    }));
};



const campaignReport = async (req, res) => {
    try {
        const campaignId = req.body.campaignId;
        const userName = req.body.userName;
        const emailId = req.body.emailId;
        const campaignName = req.body.campaignName;
        const spid = req.body.spid;
        const timeZone = req?.body?.timeZone
        // Step 1: Fetch data from the CampaignMessages table
        const campaignMessages = await fetchCampaignMessages(campaignId, timeZone);
        const formattedMessages = await formatterDateTime(campaignMessages, spid);

        // Step 2: Sanitize the messages (replace null values with empty strings)
        const sanitizedMessages = sanitizeMessages(formattedMessages);


        // Step 1: Prepare the data for ExcelJS

        const headerMessageText = "To check the exact reason for message failure from Meta error codes, please refer to this";
        const linkText = "https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes";
        const headerMessageLink = "https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes";
        const afterLinkText = "and search for the relevant error code.";
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Campaign Report');
        let Channel = (await db.excuteQuery('select Channel from user where SP_ID = ? limit 1', [spid]))[0]?.Channel;
        let emailSender = MessagingName[Channel];
        const transporter = getTransporter(emailSender);
        const senderConfig = EmailConfigurations[emailSender];
        /// Add cells with separate parts of the message
       // worksheet.addRow([headerMessageText, linkText, afterLinkText]);

        // Set hyperlink on the "link" cell 
       // const linkCell = worksheet.getCell('B1');
        //linkCell.value = { text: linkText, hyperlink: headerMessageLink };
        //linkCell.font = { color: { argb: 'FF0000FF' }, underline: true }; // Blue color and underline to indicate a hyperlink

        // Adjust column widths for better readability 
        worksheet.getColumn(1).width = 50;
        worksheet.getColumn(2).width = 10;
        worksheet.getColumn(3).width = 50;

        // Step 3: Add an empty row for spacing
        worksheet.addRow([]);

        // Step 4: Add headers
        worksheet.addRow(['Msg ID', 'Customer Number', 'Message Status', 'Submit Time', 'Delivered Time', 'Seen Time', 'Replied Time', 'Failure Reason', 'Error Codes']);

        // Step 5: Add sanitized messages
        sanitizedMessages.forEach(message => {
            worksheet.addRow([
                message['Msg ID'],
                message['Customer Number'],
                message['Message Status'],
                message['Submit Time'],
                message['Delivered Time'],
                message['Seen Time'],
                message['Replied Time'],
                message['Failure Reason'],
                message['Error Codes']
            ]);
        });

        // Step 6: Write the workbook to a file
        const filePath = path.join(__dirname, 'campaign_report.xlsx');
        workbook.xlsx.writeFile(filePath).then(() => {
            console.log('Excel file created successfully!');
        }).catch(error => {
            console.error('Error writing Excel file:', error);
        });

        const timestamp = Date.now();
        const randomNumber = Math.floor(Math.random() * 10000);
        var mailOptions = {
            from: senderConfig.email,
            to: emailId,
            subject: `${emailSender} - Campaign Detail report`,
            html: `
            <p>Dear ${userName},</p>
            <p>Please find attached here the detail report for your campaign ${campaignName} from your ${emailSender} account.</p>
            <p>Thank you,</p>
            <p>Team ${emailSender}</p>
            `,
            attachments: [
                {
                    filename: `${timestamp}-${randomNumber}.xlsx`, // Change the extension to .xlsx
                    path: filePath,
                },
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.send(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            res.status(200).send({ msg: "Campaign report has been sent" });
        });

    } catch (error) {
        console.error('Error generating campaign report:', error);
        db.errlog(error); // Log error to your database or logging system
        res.status(500).send({
            msg: 'Internal server error while generating report',
            status: 500
        });
    }
};




//common method for send email through node mailer
// let transporter = nodemailer.createTransport({
//     //service: 'gmail',
//     host: val.emailHost,
//     port: val.port,
//     secure: true,
//     auth: {
//         user: val.email,
//         pass: val.appPassword
//     },
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


module.exports = { copyCampaign, getCampaignMessages, sendCampinMessage, saveCampaignMessages, getContactAttributesByCustomer, getEndCustomerDetail, getAdditiionalAttributes, deleteCampaign, addCampaign, getCampaigns, getCampaignDetail, getFilteredCampaign, getContactList, updatedContactList, addNewContactList, applyFilterOnEndCustomer, campaignAlerts, deleteContactList, isExistCampaign, processContactQueries, download, campaignReport };






