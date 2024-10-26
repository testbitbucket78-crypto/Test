const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json()); // creates express http server

require('dotenv').config()
const { json } = require("body-parser");
const db = require('../dbhelper');
const notify = require('./PushNotifications');
const aws = require('../awsHelper');
const Routing = require('../RoutingRules')
const token = process.env.WHATSAPP_TOKEN;
const incommingmsg = require('../IncommingMessages')
const moment = require('moment');
const mytoken = process.env.VERIFY_TOKEN;
const mapCountryCode = require('../Contact/utils.js');
const commonFun = require('../common/resuableFunctions.js')
let notifyInteraction = `SELECT InteractionId FROM Interaction WHERE customerId IN (SELECT customerId FROM EndCustomer WHERE Phone_number = ? and SP_ID=?  ) and is_deleted !=1   order by created_at desc`
let metaPhoneNumberID = 211544555367892 //todo need to make it dynamic 

app.listen(process.env.PORT, () => {
  console.log('Server is running on port ' + process.env.PORT);
});
app.get('/', (req, res) => {
  res.send("Welcome in Whatshap webhook ");
})
app.get("/webhook", (req, res) => {

  let mode = req.query["hub.mode"];
  let challange = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token === mytoken) {
      res.status(200).send(challange);
    } else {
      res.status(403);
    }
  }

})



// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST

  try {
    console.log("===========================##############==========================")
    let body = req.body;

    // Check the Incoming webhook message    
    if (body != undefined) {
      console.log(JSON.stringify(body, null, 2))
    }
    else {
      res.status(404).send({
        msg: err,
        status: 404
      });
      return;
    }

    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages

    let extractedMessage = await extractDataFromMessage(body)

    res.status(200).send({
      msg: "extractedMessage",
      status: 200
    });

  } catch (err) {
    db.errlog(err);
    console.log("errrrrrrrr", err)
    res.status(500).send({
      msg: err,
      status: 500
    });
  }

});

const updateTemplateStatus = async (templateId, newStatus) => {
  const query = `
      UPDATE templateMessages
      SET status = ?, updated_at = NOW()
      WHERE templateID = ?
  `;
  const values = [newStatus, templateId];
  const result = await db.excuteQuery(query, values);
  return result;
};

const updateQuality = async (templateId, newQualityStatus) => {
  const query = `
      UPDATE templateMessages
      SET quality = ?, updated_at = NOW()
      WHERE templateID = ?
  `;
  try {
    const values = [newQualityStatus, templateId];
    const result = await db.excuteQuery(query, values);
    if (result && result?.affectedRows > 0) {
      console.log("Data Updated Successfully!");
    } else {
      console.log("No records were updated.");
    }
    return result;
  } catch (error) {
    console.error('Error in updateQuality:', error);
  }
};

async function extractDataFromMessage(body) {

  if (body.entry && body.entry.length > 0 && body.entry[0].changes && body.entry[0].changes.length > 0 &&
    body.entry[0].changes[0].value && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages.length > 0
    && body.entry[0].changes[0].value.metadata) {

    let changes = body.entry[0].changes[0];

    let phone_number_id = changes.value.metadata.phone_number_id;
    let display_phone_number = changes.value.metadata.display_phone_number;
    let firstMessage = changes.value.messages[0];

    let from = firstMessage.from; // extract the phone number from the webhook payload

    let contact = changes.value.contacts && changes.value.contacts.length > 0 ? changes.value.contacts[0] : null;

    let contactName = contact.profile.name ? contact.profile.name : from;


    let phoneNo = contact.wa_id;
    let countryCodeObj;
    if (phoneNo) {
      countryCodeObj = mapCountryCode.mapCountryCode(phoneNo); //Country Code abstraction `countryCode` = '91', `country` = 'IN', `localNumber` = '8130818921'
    }

    let countryCode = countryCodeObj.country + " +" + countryCodeObj.countryCode


    let ExternalMessageId = body.entry[0].id;
    let message_text = firstMessage.text ? firstMessage.text.body : "";  // extract the message text from the webhook payload
    let message_media = firstMessage.type;

    let Message_template_id = firstMessage.id;
    let Type = firstMessage.type
    // Variable to hold the filename
    let extension;

    var d = new Date(firstMessage.timestamp * 1000).toUTCString();

    const message_time = moment.utc(d).format('YYYY-MM-DD HH:mm:ss');
    console.log("message_time", message_time)


    if (firstMessage.context) {
      let spid = await db.excuteQuery('select SP_ID from user where mobile_number =? limit 1', [display_phone_number])
      let campaignRepliedQuery = `UPDATE CampaignMessages set status=4,RepliedTime=${message_time} where phone_number =${from} and (status = 3 OR status =2) and SP_ID = ${spid[0]?.SP_ID} AND messageTemptateId = '${firstMessage.context?.id}'` // will replace it withmessage id later
      console.log(campaignRepliedQuery)
      let campaignReplied = await db.excuteQuery(campaignRepliedQuery, [])
      //console.log(repliedNumber, spid, "campaignReplied*******", campaignReplied?.affectedRows)
    }

    // Conditional check to determine the filename based on type
    if (Type === 'image') {
      extension = '.jpg';
    } else if (Type === 'video') {
      extension = '.mp4';
    } else if (Type === 'document') {
      let filename = firstMessage.document.filename;
      extension = filename.substring(filename.lastIndexOf('.'));
    }


    // Getting the file extension

    console.log(Type, " body.entry " + phoneNo, extension)
    let firstStatus = "";
    let Quick_reply_id = "";
    let uniqueId = "";

    if (changes.value.statuses && changes.value.statuses.length > 0) {
      firstStatus = changes.value.statuses[0];
      Quick_reply_id = firstStatus.id;
      uniqueId = firstStatus.recipient_id;
      console.log(Quick_reply_id + uniqueId);
      console.log("status present");
    }
    console.log("________________SAVEING MESSAGE___________________");

    if (message_text) {
      message_text = message_text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
      message_text = message_text.replace(/_(.*?)_/g, '<em>$1</em>');
      message_text = message_text.replace(/~(.*?)~/g, '<del>$1</del>');
      message_text = message_text.replace(/\n/g, '<br>');
    }
    console.log("after text replacement", message_text)
    var saveMessages = await saveIncommingMessages(from, firstMessage, phone_number_id, display_phone_number, phoneNo, message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, contactName, extension, message_time, countryCode)
    var SavedMessageDetails = await getDetatilsOfSavedMessage(saveMessages, message_text, phone_number_id, contactName, from, display_phone_number)
  }
  else if (body.entry && body.entry.length > 0 && body.entry[0].changes && body.entry[0].changes.length > 0 &&
    body.entry[0].changes[0].value && body.entry[0].changes[0].value.statuses &&
    body.entry[0].changes[0].value.statuses.length > 0 && body.entry[0].changes[0].value.statuses[0]) {

    let messageStatus = body.entry[0].changes[0].value.statuses[0].status
    let smsId = body.entry[0].changes[0].value.statuses[0].id
    let smsTime = body.entry[0].changes[0].value.statuses[0].timestamp
    var d = new Date(smsTime * 1000).toUTCString();

    const message_time = moment.utc(d).format('YYYY-MM-DD HH:mm:ss');
    let displayPhoneNumber = body.entry[0].changes[0].value.metadata.display_phone_number
    let customerPhoneNumber = body.entry[0].changes[0].value.statuses[0].recipient_id
    let failedMessageReason = '';
    let failedMessageCode = '';
    if (body.entry[0].changes[0].value.statuses[0].errors?.length > 0) {
      failedMessageReason = body.entry[0].changes[0].value.statuses[0]?.errors[0].error_data.details
      failedMessageCode = body.entry[0].changes[0].value.statuses[0]?.errors[0].code
    }

    //console.log("messageStatus ,displayPhoneNumber ,customerPhoneNumber " )
    // console.log(messageStatus ,displayPhoneNumber ,customerPhoneNumber)
    let updatedStatus = await saveSendedMessageStatus(messageStatus, displayPhoneNumber, customerPhoneNumber, smsId, message_time, failedMessageReason, failedMessageCode)
  } else if (body.entry && body.entry.length > 0 && body.entry[0].changes && body.entry[0].changes.length > 0 &&
    body.entry[0].changes[0].value) {

    if (body.object === 'whatsapp_business_account') {
      body.entry.forEach(async (entry) => {
        const changes = entry.changes;
        changes.forEach(async (change) => {
          console.log("Fields name from whatsapp_business_account" +change?.field)
          if (change.field === 'message_template_status_update') {
            const templateId = change.value.message_template_id;
            const newStatus = change.value.event;

            // Update your database
            await updateTemplateStatus(templateId, newStatus);
            console.log(`Template ${templateId} status updated to ${newStatus}`);
          } else if (change.field === 'account_update') {
            const waba_id = change.value.waba_info.waba_id;
            const phone_id = change.value.waba_info.owner_business_id;
            await updateWhatsAppDetails(waba_id, phone_id,'unique identifire verify from UI IN SIGNUP TIME');
          }

          //todo Need to test this webhook
          if (change?.field === 'phone_number_quality_update') {
            const currentLimit = change?.value?.current_limit;
            const messaging_limit_tier = commonFun.convertMessagingLimitTier(currentLimit);
            if(currentLimit) await commonFun.updateCurrentLimit(metaPhoneNumberID, messaging_limit_tier, 'Web hook');
            console.log("phone_number_quality_update" +currentLimit);
          }
          
          if(change?.field === 'message_template_quality_update') {
            const templateId = change?.value?.message_template_id;
            const newQualityStatus = change?.value?.new_quality_score;
            if(templateId) await updateQuality(templateId, newQualityStatus);
            console.log("message_template_quality_update" +newQualityStatus);
          }
        });
      });

    }
  }

}


const updateWhatsAppDetails = async (waba_id, phone_id, phoneNo) => {
  try {
    const query = `
    UPDATE WA_API_Details
    SET waba_id = ?,phoneNumber_id=? updated_at = NOW()
    WHERE phoneNo = ?
`;
    const values = [waba_id, phone_id, phoneNo];       // find unique identifire
    const result = await db.excuteQuery(query, values);
    return result;
  } catch (err) {
    console.log("wadetails update err", err)
  }

};

async function saveIncommingMessages(from, firstMessage, phone_number_id, display_phone_number, phoneNo, message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, contactName, extension, message_time, countryCode) {
  console.log("sabewdfesk", Type, extension)
  if (Type == "image") {
    console.log("lets check the image");

    var imageurl = await saveImageFromReceivedMessage(from, firstMessage.image.id, phone_number_id, display_phone_number, extension, firstMessage.image.mime_type);

    message_media = imageurl.value;

    message_text = " "
    var media_type = 'image/jpg'
  }

  if (Type == "video") {
    var imageurl = await saveImageFromReceivedMessage(from, firstMessage.video.id, phone_number_id, display_phone_number, extension, firstMessage.video.mime_type);

    message_media = imageurl.value;

    // message_text = " "
    var media_type = "video/mp4"
  }
  if (Type == "document") {
    var imageurl = await saveImageFromReceivedMessage(from, firstMessage.document.id, phone_number_id, display_phone_number, extension, firstMessage.document.mime_type);

    message_media = imageurl.value;

    // message_text = " "
    var media_type = "application/pdf"
  }

  if (message_text.length > 0 || message_media.length > 0) {
    let myUTCString = new Date().toUTCString();
    const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
    var saveMessage = await db.excuteQuery(process.env.query, [phoneNo, 'IN', message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, display_phone_number, contactName, media_type, 'NULL', 'WA API', message_time, countryCode]);

    console.log("====SAVED MESSAGE====" + " replyValue length  " + JSON.stringify(saveMessage));


  }
  return saveMessage;
}

async function currentlyAssigned(interactionId) {
  const query = `SELECT user.uid 
                 FROM InteractionMapping 
                 JOIN user ON user.uid = InteractionMapping.AgentId 
                 WHERE is_active = 1 
                 AND InteractionMapping.InteractionId = ? 
                 ORDER BY InteractionMapping.MappingId DESC 
                 LIMIT 1`;

  try {
    let result = await db.excuteQuery(query, [interactionId]);
    return result.length > 0 ? result[0].uid : null;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

async function getDetatilsOfSavedMessage(saveMessage, message_text, phone_number_id, contactName, from, display_phone_number) {
  if (saveMessage?.length > 0) {
    console.log(display_phone_number + " .." + message_text)
    const data = saveMessage;
    // Extracting the values
    const extractedData = {
      sid: data[0][0]['@sid'],
      custid: data[2][0]['@custid'],
      agid: data[1][0]['@agid'],
      newId: data[3][0]['@newId'],
      replystatus: data[4][0]['@replystatus'],
      msg_id: data[5][0]['@msg_id'],
      newlyInteractionId: data[7][0]['@newlyInteractionId'],
      isContactPreviousDeleted: data[10][0]['@isContactPreviousDeleted'],
      ifgot: data[12][0]['ifgot']
    };

    var sid = extractedData.sid
    var custid = extractedData.custid
    var agid = extractedData.agid
    var replystatus = extractedData.replystatus
    var newId = extractedData.newId
    var msg_id = extractedData.msg_id
    var newlyInteractionId = extractedData.newlyInteractionId
    var isContactPreviousDeleted = extractedData.isContactPreviousDeleted
    var ifgot = extractedData.ifgot
    notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', msg_id)


    let myUTCString = new Date().toUTCString();
    const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
    const currentAssignedUser = await currentlyAssigned(newId); //todo need to check after deploy out of scope to test
    const check = await commonFun.notifiactionsToBeSent(currentAssignedUser, 3);
    if (check) {
      let notifyvalues = [[sid, 'New Message in your Chat', 'You have a new message in you current Open Chat', agid, 'WA Web', currentAssignedUser, utcTimestamp]];
      let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
    }

    let contact = await db.excuteQuery('select * from EndCustomer where customerId =? and SP_ID=?', [custid, sid])
    // if(contact?.length >0){
    //   funnel.ScheduledFunnels(contact[0].SP_ID, contact[0].Phone_number, contact[0].OptInStatus, new Date(), new Date(),0);
    // }
    if (contact[0]?.isBlocked != 1) {
      let defaultQuery = 'select * from defaultActions where spid=?';
      let defaultAction = await db.excuteQuery(defaultQuery, [sid]);
      console.log(defaultAction.length)
      if (defaultAction.length > 0) {
        console.log(defaultAction[0].isAutoReply + " isAutoReply " + defaultAction[0].autoReplyTime + " autoReplyTime " + defaultAction[0].isAutoReplyDisable + " isAutoReplyDisable ")
        var isAutoReply = defaultAction[0].isAutoReply
        var autoReplyTime = contact[0].defaultAction_PauseTime
        var isAutoReplyDisable = defaultAction[0].isAutoReplyDisable
        var inactiveAgent = defaultAction[0].isAgentActive
        var inactiveTimeOut = defaultAction[0].pauseAgentActiveTime

      }
      let defaultReplyAction = await incommingmsg.autoReplyDefaultAction(isAutoReply, autoReplyTime, isAutoReplyDisable, message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, 'WA API', isContactPreviousDeleted, inactiveAgent, inactiveTimeOut, ifgot, display_phone_number)
      console.log("defaultReplyAction-->>> boolean", defaultReplyAction)
      if (defaultReplyAction >= -1) {
        //console.log("defaultReplyAction________ boolean", defaultReplyAction)
        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        if (ifgot == 'If not exist') {

          let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', ['Resolved', updated_at, newId]);
          if (updateInteraction?.affectedRows > 0) {
            notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Status changed')

            let updateMapping = await db.excuteQuery(`update InteractionMapping set AgentId='-1' where InteractionId =?`, [newId]);
            if (updateMapping?.affectedRows > 0) {
              notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Assign Agent')
            }
          }
        } else {
          let getIntractionStatus = await db.excuteQuery('select * from Interaction WHERE InteractionId=? and SP_ID=?', [newId, sid]);
          //check if assignment trigger and chat is ressolve then open 
          if (defaultReplyAction >= 0) {
            let isEmptyInteraction = await commonFun.isStatusEmpty(newId, sid, custid)
            let ResolveOpenChat = await db.excuteQuery('UPDATE Interaction SET interaction_status =? WHERE InteractionId !=? and customerId=?', ['Resolved', newId, custid]);
            console.log("ResolveOpenChat *********", ResolveOpenChat)
            let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=? ,interaction_open_datetime=? WHERE InteractionId=?', ['Open', updated_at, newId])
            if (isEmptyInteraction == 1) {
              updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? ,interaction_open_datetime=? WHERE InteractionId=?', ['Open', updated_at, updated_at, newId])
            }
            console.log("commonFun", updateInteraction)
            if (updateInteraction?.affectedRows > 0) {
              notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Status changed')
            }
            notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Assign Agent')
          } else {
            let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=? WHERE InteractionId=?', [getIntractionStatus[0]?.interaction_status, newId])
            console.log("DEBUGGGGGGGGGGGGGGGGGG", updateInteraction.affectedRows)
            if (updateInteraction?.affectedRows > 0) {
              notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Status changed')
            }
          }


        }
      }
      if (defaultReplyAction == 'false' && replystatus != "Open") {
        //  console.log("routing ------------ called after false return")
        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let isEmptyInteraction = await commonFun.isStatusEmpty(newId, sid, custid)

        let ResolveOpenChat = await db.excuteQuery('UPDATE Interaction SET interaction_status =? WHERE InteractionId !=? and customerId=?', ['Resolved', newId, custid]);
        console.log("ResolveOpenChat -----", ResolveOpenChat)

        let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=? WHERE InteractionId=?', ['Open', newId])
        if (isEmptyInteraction == 1) {
          updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', ['Open', updated_at, newId])
        }
        if (updateInteraction?.affectedRows > 0) {
          notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Status changed')
        }
        let RoutingRulesVaues = await Routing.AssignToContactOwner(sid, newId, agid, custid)  //CALL Default Routing Rules
        console.log("RoutingRulesVaues", RoutingRulesVaues)
        if (RoutingRulesVaues == 'broadcast' || RoutingRulesVaues == true) {
          notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Assign Agent')

          let myUTCString = new Date().toUTCString();
          const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
          const check = await commonFun.notifiactionsToBeSent(agid, 2);
          if (check) {
            let notifyvalues = [[sid, 'New Chat Assigned to You', 'A new Chat has been Assigned to you', agid, 'Routing rules', agid, utcTimestamp]];
            let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
          }
        }
        //Here i have to check if any routing rules addded then send websocket
      }
    }
  }

}

async function saveImageFromReceivedMessage(from, message, phone_number_id, display_phone_number, extension, mime_type) {
  console.log("saveImageFromReceivedMessage")
  //https://graph.facebook.com/{{Version}}/{{Media-ID}}?phone_number_id=<PHONE_NUMBER_ID>
  return new Promise((resolve, reject) => {
    try {
      const response = axios({
        method: "GET", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v19.0/" +
          message +
          "?phone_number_id=" + phone_number_id,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },

      }).then(async function (result) {
        console.log("the result is here")

        //TODO: NEED TO get SID from DB using Display phone number.
        //let sid = query to get using display phone number.
        let sid = await db.excuteQuery(process.env.findSpid, [display_phone_number])

        let awsDetails = await aws.uploadWhatsAppImageToAws(sid[0].SP_ID, message, result.data.url, token, extension, mime_type)//spid, imageid, fileUrl, fileAccessToken

        //TODO: Save the AWS url to DB in messages table using SP similar to webhook_2 SP. 

        notify.NotifyServer(display_phone_number, true);

        resolve({ value: awsDetails.value.Location });
      })
      //console.log("****image API****" + JSON.stringify(response))
    }
    catch (err) {
      console.log("______image api ERR_____" + err)
    }

  })
}

async function saveSendedMessageStatus(messageStatus, displayPhoneNumber, customerPhoneNumber, smsId, createdTime, failedMessageReason, failedMessageCode) {

  // let getMessageId = await db.excuteQuery(process.env.messageIdQuery, []);
  // console.log(getMessageId)
  // if (getMessageId.length > 0) {
  //   var message_id = getMessageId[0].Message_id;
  // }
  // console.log(message_id)
  // let myUTCString = new Date().toUTCString();
  // const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
  // let saveStatus = await db.excuteQuery(process.env.updateStatusQuery, [messageStatus, created_at, message_id])
  let userSP = await db.excuteQuery(`SELECT SP_ID from user where mobile_number = ? and isDeleted !=1 order by CreatedDate desc LIMIT 1`, [displayPhoneNumber])
  let spid;
  if (userSP?.length) {
    spid = userSP[0].SP_ID
  }
  if (messageStatus == 'sent') {
    let campaignDeliveredQuery = 'UPDATE CampaignMessages set status=1 , SentTime=? where phone_number =?  and messageTemptateId =?'
    let campaignDelivered = await db.excuteQuery(campaignDeliveredQuery, [createdTime, customerPhoneNumber, smsId])
    let updateMessageTime = await db.excuteQuery('UPDATE Message set created_at=? where Message_template_id=?', [createdTime, smsId])
    const smsdelupdate = `UPDATE Message
SET msg_status = 1 
WHERE interaction_id IN (
SELECT InteractionId FROM Interaction 
WHERE customerId IN (SELECT customerId FROM EndCustomer WHERE Phone_number = ? and SP_ID=? and isDeleted !=1 AND isBlocked !=1 )) and is_deleted !=1  AND (msg_status IS NULL); `
    // console.log(smsdelupdate)
    let sended = await db.excuteQuery(smsdelupdate, [customerPhoneNumber, spid])
    //  console.log("send", sended?.affectedRows)

    let ack1InId = await db.excuteQuery(notifyInteraction, [customerPhoneNumber, spid])
    //notify.NotifyServer(displayPhoneNumber, true)
    notify.NotifyServer(displayPhoneNumber, false, ack1InId[0]?.InteractionId, 'Out', 1, 0)

  } else if (messageStatus == 'delivered') {
    let campaignDeliveredQuery = 'UPDATE CampaignMessages set status=2 , DeliveredTime=? where phone_number =? and status = 1  and messageTemptateId =?'
    let campaignDelivered = await db.excuteQuery(campaignDeliveredQuery, [createdTime, customerPhoneNumber, smsId])
    const smsdelupdate = `UPDATE Message
SET msg_status = 2 
WHERE interaction_id IN (
SELECT InteractionId FROM Interaction 
WHERE customerId IN (SELECT customerId FROM EndCustomer WHERE Phone_number = ? and SP_ID=? and isDeleted !=1 AND isBlocked !=1 )) and is_deleted !=1 AND (msg_status IS NULL OR msg_status = 1); `
    //console.log(smsdelupdate)
    let deded = await db.excuteQuery(smsdelupdate, [customerPhoneNumber, spid])
    //  console.log("deliver", deded?.affectedRows)
    //notify.NotifyServer(displayPhoneNumber, true)
    let ack2InId = await db.excuteQuery(notifyInteraction, [customerPhoneNumber, spid])
    notify.NotifyServer(displayPhoneNumber, false, ack2InId[0]?.InteractionId, 'Out', 2, 0)

  } else if (messageStatus == 'read') {
    //  console.log("read")
    let campaignReadQuery = 'UPDATE CampaignMessages set status=3 , SeenTime=? where phone_number =? and status = 2   and messageTemptateId =?';
    let campaignRead = await db.excuteQuery(campaignReadQuery, [createdTime, customerPhoneNumber, smsId])
    const smsupdate = `UPDATE Message
SET msg_status = 3 
WHERE interaction_id IN (
SELECT InteractionId FROM Interaction 
WHERE customerId IN (SELECT customerId FROM EndCustomer WHERE Phone_number =? and SP_ID=? and isDeleted !=1 AND isBlocked !=1)) and is_deleted !=1  AND (msg_status =2 OR msg_status = 1);`
    //  console.log(smsupdate)
    let resd = await db.excuteQuery(smsupdate, [customerPhoneNumber, spid])
    //   console.log("read", resd?.affectedRows)
    // notify.NotifyServer(displayPhoneNumber, true)
    let ack3InId = await db.excuteQuery(notifyInteraction, [customerPhoneNumber, spid])
    notify.NotifyServer(displayPhoneNumber, false, ack3InId[0]?.InteractionId, 'Out', 3, 0)
  } else if (messageStatus == 'failed') {
    let campaignReadQuery = 'UPDATE CampaignMessages set status=0,FailureReason=?,FailureCode=? where phone_number =?  and messageTemptateId =?';
    let campaignRead = await db.excuteQuery(campaignReadQuery, [failedMessageReason, failedMessageCode, customerPhoneNumber, smsId])
    const smsupdate = `UPDATE Message SET msg_status = 9 ,failedMessageReason=? where Message_template_id =? and SPID=?`
    //  console.log(smsupdate)
    let resd = await db.excuteQuery(smsupdate, [failedMessageReason, smsId, spid])
    //   console.log("read", resd?.affectedRows)
    // notify.NotifyServer(displayPhoneNumber, true)
    let ack3InId = await db.excuteQuery(notifyInteraction, [customerPhoneNumber, spid])
    notify.NotifyServer(displayPhoneNumber, false, ack3InId[0]?.InteractionId, 'Out', 9, 0)
  }
}