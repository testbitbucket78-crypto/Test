const express = require('express');
const db = require("../dbhelper");
const bodyParser = require('body-parser');
const app = express();
const http = require("https");
const middleWare = require('../middleWare')
const removeTags = require('../removeTagsFromRichTextEditor')
app.use(bodyParser.json());

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
        let start_datetime = req.body.start_datetime
        let end_datetime = req.body.end_datetime
        let csv_contacts = req.body.csv_contacts
        let segments_contacts = req.body.segments_contacts
        let category_id = req.body.category_id
        let OptInStatus = req.body.OptInStatus
        let start_time = req.body?.start_time
        let end_time = req.body?.end_time
        message_variables = (message_variables?.length <= 0) ? '' : message_variables;
        csv_contacts = (csv_contacts?.length <= 0) ? '' : csv_contacts;
        segments_contacts = (segments_contacts?.length <= 0) ? '' : segments_contacts;

        let media_type = req.body?.media_type;

        if (req.body.Id != '') {
            var updateQuery = "UPDATE Campaign set";
            updateQuery += " title='" + req.body.title + "',";
            updateQuery += " channel_id='" + req.body.channel_id + "',";
            updateQuery += " message_heading='" + req.body.message_heading + "',";
            updateQuery += " message_content='" + req.body.message_content + "',";
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
            updateQuery += " status= " + req.body.status + "',";
            updateQuery += " category_id= " + req.body.category_id + "',";
            updateQuery += " start_time= " + req.body?.start_time + "',";
            updateQuery += " end_time= " + req.body?.end_time + "',";
            updateQuery += " media_type= " + req.body?.media_type + "',";
            updateQuery += " OptInStatus= " + req.body?.OptInStatus;

            updateQuery += " WHERE Id =" + req.body.Id

            db.runQuery(req, res, updateQuery, []);
        } else {

            var inserQuery = "INSERT INTO Campaign (status,sp_id,title,channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,time_zone,start_datetime,end_datetime,csv_contacts,segments_contacts,category_id,OptInStatus,start_time,end_time,media_type) values ? ";
            let addCampaignValue = [[status, SP_ID, title, channel_id, message_heading, message_content, message_media, message_variables, button_yes, button_no, button_exp, category, time_zone, start_datetime, end_datetime, csv_contacts, segments_contacts, category_id, OptInStatus, start_time, end_time, media_type]]

            let addcampaign = await db.excuteQuery(inserQuery, [addCampaignValue]);

            let statusToUpdate = 1;  //For scheduled campaign status
            if (status == '-1') {
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

        let campaignTitle = await db.excuteQuery("SELECT * from Campaign  where title=? and is_deleted !=1 and sp_id=?", [req.params.title, req.params.spid])

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
        let Query = req.body.Query + " and isDeleted !=1  AND IsTemporary !=1"
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

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
        res.send({
            status: 400,
            error: 'Invalid queries provided'
        });
    }

    let results = [];

    try {
        // Execute each query sequentially
        for (const query of queries) {
            const queryResult = await db.excuteQuery(query + " and isDeleted !=1  AND IsTemporary !=1");
            results = results.concat(queryResult);
        }

        // Remove duplicates from the combined results
        const uniqueResults = results.filter((value, index, self) => self.findIndex(v => v.Phone_number === value.Phone_number) === index);


        res.send({
            status: 200,
            uniqueResults: uniqueResults
        });
    } catch (error) {
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
    const placeholderRegex = /{{(.*?)}}/g;
    const placeholders = [];
    let match;
    while ((match = placeholderRegex.exec(template))) {
        placeholders.push(match[1]);
    }
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
        console.log(TemplateData)
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
        if (message_variables) {
            message_variables.forEach(variable => {
                const label = variable.label;
                const value = variable.value;
                content = content.replace(new RegExp(label, 'g'), value);
            });
        }


        const placeholders = parseMessageTemplate(content);
        if (placeholders.length > 0) {

            const results = await removeTags.getDefaultAttribue(placeholders, spid, customerId);
            console.log("results", results)

            placeholders.forEach(placeholder => {
                const result = results.find(result => result.hasOwnProperty(placeholder));
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

        if (new Date(inputDate) <= new Date(formattedTime) || results[0]?.isBlocked !=1) {
            let messagestatus;
            if (optInStatus == 'Yes') {

                if (results[0]?.OptInStatus == 'Yes' || results[0]?.OptInStatus == '1') {
                    messagestatus = await middleWare.channelssetUp(spid, req.body.channel_id, type, messageTo, content, media)
                }
            } else {
                console.log(spid, req.body.channel_id, type, messageTo, "+++++++", customerId)
                messagestatus = await middleWare.channelssetUp(spid, req.body.channel_id, type, messageTo, content, media)
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
        }else{
            return res.send({
                msg : 'time not match Or Contact is Block'
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


    let user = await db.excuteQuery(alertUser, [TemplateData.SP_ID]);

    var type = TemplateData.media_type;

    sendBatchMessage(user, TemplateData.SP_ID, TemplateData.media_type, alertmessages, message_media, phone_number_id, channel_id, insertId, statusToUpdate)

}

async function sendBatchMessage(user, sp_id, type, message_content, message_media, phone_number_id, channel_id, Id, updatedStatus) {
    //console.log("channel_id, Id" ,channel_id, Id)
    for (var i = 0; i < user.length; i++) {
        let mobile_number = user[i]?.mobile_number
        //console.log("sendBatchMessage" ,sp_id, channel_id, type, mobile_number, message_content, message_media)
        setTimeout(async () => {
            //  messageThroughselectedchannel(sp_id, mobile_number, type, message_content, message_media, phone_number_id, channel_id)
            let batchresponse = await middleWare.channelssetUp(sp_id, channel_id, type, mobile_number, message_content, message_media);
            console.log(batchresponse, "batchresponse", type)
        }, 10)
    }
    let updateQuery = `UPDATE Campaign SET status=?,updated_at=? where Id=?`;
    let updated = await db.excuteQuery(updateQuery, [updatedStatus, new Date(), Id])
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
        let message = ''
        console.log("findmessages", alert.SP_ID, alert?.CampaignId)
        let msgStatus = await find_message_status(alert.SP_ID, alert?.CampaignId)
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
        } else {

            // Check for the maximum created_at date of Message
            let maxdate = await db.excuteQuery(
                'SELECT max(created_at) into maxdate from Message where interaction_id in (select InteractionId from Interaction where customerId=? and is_deleted !=1 and SP_ID=?)',
                [custid, sid]
            );


            // If maxdate is older than 24 hours, insert a new interaction
            if (!maxdate || new Date(maxdate) <= new Date(Date.now() - 24 * 60 * 60 * 1000)) {
                console.log("______________________")
                await db.excuteQuery(
                    'INSERT INTO Interaction (customerId, interaction_status, SP_ID, interaction_type) VALUES (?, ?, ?, ?)',
                    [custid, 'empty', sid, 'User Initiated']
                );
            }
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
        // console.log(req.body)
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
        // let content = req.body.message_content
        button_yes = (button_yes === null || button_yes === undefined) ? '' : button_yes;
        button_no = (button_no === null || button_no === undefined) ? '' : button_no;
        button_exp = (button_exp === null || button_exp === undefined) ? '' : button_exp;
        message_heading = (message_heading === null || message_heading === undefined) ? '' : message_heading;


        let InteractionId = await insertInteractionAndRetrieveId(req.body.customerId, req.body.SP_ID);
        // console.log(req.body.message_content, "InteractionId InteractionId")

        let msgQuery = `insert into Message (interaction_id,message_direction,message_text,message_media,Type,SPID,media_type,Agent_id,assignAgent) values ?`
        let savedMessage = await db.excuteQuery(msgQuery, [[[InteractionId[0]?.InteractionId, 'Out', req.body.message_content, req.body.message_media, type, req.body.SP_ID, type, '',-1]]]);


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


const copyCampaign = (req, res) => {
    let Query = "SELECT * from CampaignMessages  where CampaignId = " + req.params.CampaignId

    let CopyQuery = "INSERT INTO Campaign (sp_id,title,channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,time_zone,start_datetime,end_datetime,csv_contacts,segments_contacts,media_type) SELECT sp_id, CONCAT('Copy of ',title),channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,time_zone,' ',' ',csv_contacts,segments_contacts,media_type FROM Campaign WHERE Id = " + req.params.CampaignId

    //  console.log(CopyQuery)
    db.runQuery(req, res, CopyQuery, []);
}

module.exports = { copyCampaign, getCampaignMessages, sendCampinMessage, saveCampaignMessages, getContactAttributesByCustomer, getEndCustomerDetail, getAdditiionalAttributes, deleteCampaign, addCampaign, getCampaigns, getCampaignDetail, getFilteredCampaign, getContactList, updatedContactList, addNewContactList, applyFilterOnEndCustomer, campaignAlerts, deleteContactList, isExistCampaign, processContactQueries };






