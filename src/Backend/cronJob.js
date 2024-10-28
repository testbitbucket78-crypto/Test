const cron = require('node-cron');
const db = require('./dbhelper')
const val = require('./Authentication/constant')
var axios = require('axios');
var express = require("express");
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const moment = require('moment');
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
const middleWare = require('./middleWare')
const batchSize = 10; // Number of users to send in each batch
const delayBetweenBatches = 10000; // 10 seconds in milliseconds
const web = require('./webJS/web')
const removeTags = require('./removeTagsFromRichTextEditor')
const logger = require('./common/logger.log');
const mapCountryCode = require('./Contact/utils.js');
let metaPhoneNumberID = 211544555367892
// Function to check if the schedule_datetime is within 1-2 minutes from the current time
function isWithinTimeWindow(scheduleDatetime) {
  const currentTime = moment();
  const scheduledTime = moment(scheduleDatetime);
  const diffInMinutes = scheduledTime.diff(currentTime, 'minutes');
  return diffInMinutes >= 0 && diffInMinutes <= 2;
}


async function fetchScheduledMessages() {
  try {

    var messagesData = await db.excuteQuery(`select * from Campaign where (status=1 or status=2) and is_deleted != 1`, [])
    var remaingMessage = [];
    //console.log(messagesData)
    logger.info(`fetchScheduledMessages ${messagesData?.length}`)
    const currentDate = new Date();

    const currentDay = currentDate.getDay();

    let currentDateTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }); // UTC
   // console.log("messagesData", messagesData)

    // HAVE TO CHANGE THIS IN ASYNC FOR EACH SPID
    for (const message of messagesData) {
        console.log(message.sp_id,new Date(currentDateTime)  ,new Date(message.start_datetime),message.Id,message.start_datetime)
      //  let campaignTime = await getCampTime(message.sp_id)  // same as below loop
     // console.log(message.sp_id, "campaignTime", isWorkingTime(message), new Date(message.start_datetime) < new Date(currentDateTime), new Date(message.start_datetime), new Date(), new Date(currentDateTime))
      logger.info(`fetchScheduledMessages isWorkingTime ${isWorkingTime(message)}  time ${new Date(message.start_datetime) <= new Date(currentDateTime)}`)
      if (isWorkingTime(message)) {

        if (new Date(message.start_datetime) <= new Date(currentDateTime)) {
          console.log(" isWorkingTime messagesData loop",)
          const phoneNumber = message.segments_contacts.length > 0 ? mapPhoneNumberfomList(message) : mapPhoneNumberfomCSV(message);

        }
      } else {
        remaingMessage.push(message);
      }

    }
    //console.log("remaingMessage", remaingMessage)
    logger.info(`remaingMessage ${remaingMessage?.length}`)
    for (const message of remaingMessage) {

      console.log("remaingMessage loop", message.sp_id)
      //let campaignTime = await getCampTime(message.sp_id)  //comment for get time from campaign instead of campaign timing settings
      if (isWorkingTime(message)) {
        //  console.log("remaingMessage  isWorkingTime loop", isWithinTimeWindow(message.start_datetime))
        if (isWithinTimeWindow(message.start_datetime)) {
          //  console.log("remaingMessage  start_datetime loop",)
          const phoneNumber = message.segments_contacts.length > 0 ? mapPhoneNumberfomList(message) : mapPhoneNumberfomCSV(message);

        }
      }


    }

  } catch (err) {
    logger.error(`fetchScheduledMessages  error ${err}`)
  }

}


















async function parseMessage(testMessage, custid, sid, msgVar) {
  // // Replace placeholders in the content with values from message_variables
  // let message_variables = messageVariable && messageVariable.length > 0 ? JSON.parse(messageVariable) : undefined;

  // if (message_variables) {
  //   message_variables.forEach(variable => {
  //     const label = variable.label;
  //     const value = variable.value;
  //     content = content.replace(new RegExp(label, 'g'), value);
  //   });
  // }
  // const placeholders = parseMessageTemplate(content);
  // if (placeholders.length > 0) {
  //   const results = await removeTags.getDefaultAttribue(placeholders, spid, customerId);
  //   console.log("results", results)

  //   placeholders.forEach(placeholder => {
  //     const result = results.find(result => result.hasOwnProperty(placeholder));
  //     const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
  //     content = content.replace(`{{${placeholder}}}`, replacement);
  //   });
  // }
  // return content;








  let content = await removeTags.removeTagsFromMessages(testMessage);
  const placeholders = parseMessageTemplate(testMessage);
  //console.log(testMessage)
  if (placeholders.length > 0) {
    // Construct a dynamic SQL query based on the placeholders

    let results;
    // console.log(msgVar !='',"msgVar",msgVar != null ,msgVar,msgVar != null || msgVar !='')
    if (msgVar != null && msgVar != '') {

      results = await removeTags.getDefaultAttribue(msgVar, sid, custid);
      //console.log("atribute result ")
      placeholders.forEach((placeholder, index) => {
        //const result = results.find(result => result.hasOwnProperty(placeholder));
        const result = results[index];
        //  console.log(placeholder,"place foreach",results)
        const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
        content = content.replace(`{{${placeholder}}}`, replacement);
      });
    } else {

      results = await removeTags.getDefaultAttribueWithoutFallback(placeholders, sid, custid);
    }

    // console.log("results", results);

    placeholders.forEach((placeholder, index)  => {
     // const result = results.find(result => result.hasOwnProperty(placeholder));
      const result = results[index];
      const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
      content = content.replace(`{{${placeholder}}}`, replacement);
    });
  }
  return content;
}

async function parseMessageForCSV(message_content, contact, messageVariable) {
  // Replace placeholders in the content with values from message_variables
  let content = await removeTags.removeTagsFromMessages(message_content);
  let message_variables = messageVariable && messageVariable.length > 0 ? JSON.parse(messageVariable) : undefined;
  if (message_variables) {
    message_variables.forEach(variable => {
      const label = variable.label;
      const value = variable.value;
      const regex = new RegExp(label);

      content = content.replace(regex, (match) => {
        if (contact.hasOwnProperty(value)) {
          return contact[value]; 
        } else {
          return value;
        }
      });
    });
  }
  // Replace any remaining placeholders in the content with values from the contact object
  // Object.keys(contact).forEach(key => {
  //   const value = contact[key];
  //   content = content.replace(new RegExp(`${key}`, 'g'), value);
  // });

  return content;
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

async function sendMessages(phoneNumber, message, id, campaign, response, textMessage, msgId,channel,FailureCode,FailureReason) {
  try {
    var status = 0
    if (response == 200) {
      status = 1;
    }
    let MessageBodyData = {
      phone_number: phoneNumber,
      button_yes: campaign.button_yes,
      button_no: campaign.button_no,
      button_exp: campaign.button_exp,
      message_media: campaign.message_media,
      message_content: textMessage,
      message_heading: campaign.message_heading,
      CampaignId: campaign.Id,
      schedule_datetime: campaign.start_datetime,
      status_message: response,
      status: status,
      sp_id: campaign.sp_id,
      msgId: msgId,
      FailureReason : FailureReason,
      FailureCode : FailureCode
    }


    saveSendedMessage(MessageBodyData)
  } catch (error) {

  }

}



async function saveSendedMessage(MessageBodyData) {
  var inserQuery = "INSERT INTO CampaignMessages (phone_number,button_yes,button_no,button_exp,message_media,message_content,message_heading,CampaignId,schedule_datetime,status_message,status,SP_ID,messageTemptateId,FailureReason,FailureCode) values ?";
  let saveMessage = await db.excuteQuery(inserQuery, [[[MessageBodyData.phone_number, '', '', '', MessageBodyData.message_media, MessageBodyData.message_content, '', MessageBodyData.CampaignId, MessageBodyData.schedule_datetime, MessageBodyData.status_message, MessageBodyData.status, MessageBodyData.sp_id, MessageBodyData.msgId,MessageBodyData.FailureReason,MessageBodyData.FailureCode]]])
}


async function mapPhoneNumberfomCSV(message) {
  try {
    // Map the values to customer IDs

    var contacts = JSON.parse(message.csv_contacts);

    var type = message?.media_type;
    if (message.message_media == null || message.message_media == "") {
      type = 'text';
    }
    campaignAlerts(message, 2) // campaignAlerts(new Date(), message.Id)    //Campaign is Running
    let updateQuery = `UPDATE Campaign SET status=2,updated_at=? where Id=?`;
    let myUTCString = new Date().toUTCString();
    const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
    let updatedStatus = await db.excuteQuery(updateQuery, [currenttime, message.Id])
    //let content = await removeTags.removeTagsFromMessages(message.message_content);
    batchofScheduledCampaign(contacts, message.sp_id, type, message.message_content, message.message_media, message.phone_number_id, message.channel_id, message, 'csv') //channelType[0].connected_id
  } catch (err) {
    console.log(err)
  }


}

async function mapPhoneNumberfomList(message) {
  // Map the values to customer IDs
  //console.log("mapPhoneNumberfomList", message)
  var dataArray = JSON.parse(message.segments_contacts);
  // var type = 'image';
  // if (message.message_media == null || message.message_media == "") {
  //   type = 'text';
  // }



  let Query = "SELECT * from EndCustomer  where customerId IN ? and isDeleted != 1 and isBlocked !=1";
  if (message.OptInStatus == 'Yes') {
    Query = `SELECT * FROM EndCustomer WHERE customerId IN ? and (OptInStatus='Yes' OR OptInStatus=1) AND SP_ID=? and isDeleted !=1 and isBlocked !=1`;
  }


  let phoneNo = await db.excuteQuery(Query, [[dataArray], message.sp_id]);
  console.log("phoneNo.length", phoneNo.length)
  // if ((message.channel_id == 2 && web.isActiveSpidClient(message.sp_id)) || (message.channel_id == 1)) {
  //   console.log("___________****" ,message.sp_id)
  campaignAlerts(message, 2)    //Campaign is Running
  let updateQuery = `UPDATE Campaign SET status=2,updated_at=? where Id=?`;
  let myUTCString = new Date().toUTCString();
  const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
  let updatedStatus = await db.excuteQuery(updateQuery, [currenttime, message.Id])
  //let content = await removeTags.removeTagsFromMessages(message.message_content);
  batchofScheduledCampaign(phoneNo, message.sp_id, message.media_type, message.message_content, message.message_media, message.phone_number_id, message.channel_id, message, 'List')
  // }

}



async function getCampTime(spid) {
  var CampaignTimings = await db.excuteQuery(`select * from CampaignTimings where sp_id=? and isDeleted != 1`, [spid]);

  return CampaignTimings;
}


async function batchofScheduledCampaign(users, sp_id, type, message_content, message_media, phone_number_id, channel_id, message, list) {
  //console.log("batchofScheduledCampaign" ,message_content)
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    console.log("batch i", i, batch.length)
    sendScheduledCampaign(batch, sp_id, type, message_content, message_media, phone_number_id, channel_id, message, list)

    if (i + batchSize < users.length) {
      setTimeout(() => {
        batchofScheduledCampaign(users.slice(i + batchSize), sp_id, type, message_content, message_media, phone_number_id, channel_id, message, list);
      }, delayBetweenBatches);
    }
  }
  setTimeout(() => {
    campaignCompletedAlert(message)
  }, 10000)
}

async function campaignCompletedAlert(message) {
  let updateQuery = `UPDATE Campaign SET status=3,updated_at=? where Id=?`;
  let myUTCString = new Date().toUTCString();
  const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
  let updatedStatus = await db.excuteQuery(updateQuery, [currenttime, message.Id])
  campaignAlerts(message, 3) // Campaign Finish 

}

async function sendScheduledCampaign(batch, sp_id, type, message_content, message_media, phone_number_id, channel_id, message, list) {
  console.log("sendScheduledCampaign", "channel_id", sp_id, type,  message_media, phone_number_id, channel_id)
  for (var i = 0; i < batch.length; i++) {
    let Phone_number = batch[i].Phone_number
    //Attributes for contact_list
    let textMessage = await parseMessage(message_content, batch[i].customerId, batch[i].SP_ID, message.message_variables)

    if (list == 'csv') {
      Phone_number = batch[i].Contacts_Column
      //Attributes for segment contacts
      textMessage = await parseMessageForCSV(message_content, batch[i], message.message_variables)

    }


    var response;
    setTimeout(async () => {
      response = await messageThroughselectedchannel(sp_id, Phone_number, type, textMessage, message_media, phone_number_id, channel_id, message.Id, message,message_content);
      //console.log("response",response)     
    }, 10)

  }
}


function isWorkingTime(item) {
  try {
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });  // for finding current date
    let datetime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }); // TO CHANGE WITH UTC
   // Check if starthour, endhour, and workDays are provided and not null
   if (!item.start_time || !item.end_time) {
    console.error("Error: Missing required parameters. Please check starthour, endhour, or workDays.");
    return true;
  }

    // for (const item of data) {
    //   const workingDays = item.day.split(',');
    const date = new Date(datetime).getHours();
    const getMin = new Date(datetime).getMinutes();



    const startTime = item.start_time.split(':');
    const endTime = item.end_time.split(':');

    if ((((startTime[0] < date) || (date === startTime[0] && startTime[1] <= getMin)) && ((endTime[0] > date) || ((endTime[1] === getMin) && (endTime[1] >= getMin))))) {
      return true;
    }



    // }

    return true;
  }
  catch (err) {
    console.log(err)
  }
}




async function campaignAlerts(message, updatedStatus) {
  try {
    console.log("campaignAlerts")

    //     let query = `select * from Campaign where  is_deleted != 1 limit 1`;
    //     let campaign = await db.excuteQuery(query, []);
    //     let alertUser = `select c.uid,u.* from CampaignAlerts c
    // JOIN user u ON u.uid=c.uid
    //  where c.SP_ID=? and c.isDeleted !=1 `;


    //     for (let alert of campaign) {
    //       console.log("alert")

    //       let user = await db.excuteQuery(alertUser, [alert.sp_id]);

    //       let message = await msg(alert)
    //       var type = 'image';
    //       if (alert.message_media == null || alert.message_media == "") {
    //         type = 'text';
    //       }

    let alertmessages = await msg(message, updatedStatus)

    let alertUser = `select c.uid,u.* from CampaignAlerts c
JOIN user u ON u.uid=c.uid
 where c.SP_ID=? and c.isDeleted !=1 `;


    let user = await db.excuteQuery(alertUser, [message.sp_id]);

    var type = 'image';
    if (message.message_media == null || message.message_media == "") {
      type = 'text';
    }

    sendBatchMessage(user, message.sp_id, message.media_type, alertmessages, message.message_media, message.phone_number_id, message.channel_id, message.CampaignId, updatedStatus)


    //batchofAlertUsers(user, alert.sp_id, type, message, alert.message_media, '101714466262650', alert.channel_id)



  }
  catch (err) {

    console.log(err)
    db.errlog(err);

  }
}



// async function batchofAlertUsers(users, sp_id, type, message_content, message_media, phone_number_id, channel_id) {

//   for (let i = 0; i < users.length; i += batchSize) {
//     const batch = users.slice(i, i + batchSize);
//     sendBatchMessage(batch, sp_id, type, message_content, message_media, phone_number_id, channel_id)

//     if (i + batchSize < users.length) {
//       setTimeout(() => {
//         batchofAlertUsers(users.slice(i + batchSize), sp_id, type, message_content, message_media, phone_number_id, channel_id);
//       }, delayBetweenBatches);
//     }
//   }
// }


function sendBatchMessage(batch, sp_id, type, message_content, message_media, phone_number_id, channel_id) {
  for (var i = 0; i < batch.length; i++) {
    let mobile_number = batch[i].mobile_number

    setTimeout(() => {
      campaignAlertsThroughselectedchannel(sp_id, mobile_number, type, message_content, message_media, phone_number_id, channel_id)
    }, 10)
  }
}

//___________________CAMPAIGN ALERT MESSAGE WITH FILTERD STATUS _____________________________//


async function find_message_status(alert) {
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
  C.is_deleted != 1 and C.status=3
 AND C.sp_id =${alert.sp_id} AND C.Id=${alert.Id}
 GROUP BY
 CM.status;`

  let msgStatus = await db.excuteQuery(msgStatusquery, []);
  for (const item of msgStatus) {
    console.log("item.status", item.status)
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

//___________________CAMPAIGN ALERT MESSAGE ON THE BASIS OF FILTERD STATUS _____________________________//

async function msg(alert, status) {
  let message = ''

  let msgStatus = await find_message_status(alert)


  let audience = alert.segments_contacts.length > 0 ? JSON.parse(alert.segments_contacts).length : JSON.parse(alert.csv_contacts).length


  if (status == '1') {
    message = `Hi there, your Engagekart Campaign has been Scheduled:
    Campaign Name: `+ alert.title + `
    Scheduled Time: `+ alert.start_datetime + `
    Taget Audience: `+ 'alert.title' + `
    Channel: `+ 'WhatsApp' + `,` + alert.channel_id + `
    Category: `+ alert.category + ` `
  } if (status == '2') {
    message = `Hello, your Engagekart Campaign has Started:
    Campaign Name: `+ alert.title + `
    Taget Audience: ` + audience + `
    Channel:`+ 'WhatsApp' + `,` + alert.channel_id + `
    Category:`+ alert.category + ` `
  } if (status == '3') {
    message = `Hi, here is the Summary of your finished Engagekart Campaign:
    Campaign Name: `+ alert.title + `
    Taget Audience: ` + audience + `
    Channel: `+ 'WhatsApp' + `,` + alert.channel_id + `
    Category: `+ alert.category + `
    Sent: ` + msgStatus.Sent + `
    Failed: ` + msgStatus.Failed + `
    For more detailed report, please login to your Engagkart account`
  } if (status == '0') {
    message = `Engagekart Campaign Alert:
    Hi, Please note your Engagekart campaign ` + alert.title + ` has stopped/Paused. Please login to Engagkart account for more details and take further action.`
  }

  return message;
}



async function isClientActive(spid) {
  return new Promise(async (resolve, reject) => {
    try {

      const apiUrl ='https://waweb.stacknize.com/IsClientReady'; // Replace with your API endpoint
      const dataToSend = {
        spid: spid
      };

      const response = await axios.post(apiUrl, dataToSend);
      //console.log('Response from API:', response.data);

      resolve(response.data); // Resolve with the response data
    } catch (error) {
      console.error('Error:', error.message);
      reject(error.message); // Reject with the error
    }
  });


}





//_________________________COMMON METHOD FOR SEND MESSAGE___________________________//

async function messageThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType, campaignId, message,message_content) {
  //console.log("messageThroughselectedchannel", spid, from, type, channelType,web.isActiveSpidClient(spid))
  let getMediaType = determineMediaType(type);
  if(getMediaType === 'unknown' && media) getMediaType = determineMediaFromLink(media);
  if (channelType == 'WhatsApp Official' || channelType == 1 || channelType == 'WA API') {

    let response = await middleWare.sendDefultMsg(media, text, getMediaType, metaPhoneNumberID, from,spid);
    console.log("Official response", JSON.stringify(response?.status));

    if (response?.status == 200) {
      //interaction_id,message_direction,message_text,message_media,Type,SPID,media_type,Agent_id,assignAgent,Message_template_id
      let saveSendedMessage = await saveMessage(from, spid, response?.message?.messages[0]?.id, message_content, media, type, type, 'WA API',"Official campaign message");
      let saveInCampaignMessage = await sendMessages(from, text, campaignId, message, response.status, text, response.message?.messages[0]?.id,'WA API','','')
    } else {
      console.log("else of OFFICIAL")
      let saveInCampaignMessage = await sendMessages(from, text, campaignId, message, response.status, text, response.message?.messages[0]?.id,'WA API',response.message?.error.code,response.message?.error.error_data.details)
    }

    return response;
  } if (channelType == 'WhatsApp Web' || channelType == 2 || channelType == 'WA Web') {

    let clientReady = await isClientActive(spid);
    //console.log("clientReady",clientReady)
    if (clientReady?.status) {
      let saveSendedMessage = await saveMessage(from, spid, '', message_content, media, type, type, 'WA Web',"Web campaign message")
      let response = await middleWare.postDataToAPI(spid, from, getMediaType, text, media, '', saveSendedMessage);
      console.log(spid," web response", JSON.stringify(response?.status), response.msgId);
      if(response.status == 200){
      let saveInCampaignMessage = await sendMessages(from, text, campaignId, message, response.status, text, response.msgId,'WA Web', '','');
      }else{
      console.log("else of webJS",from,spid)
      let updateMessage = await db.excuteQuery('update Message set msg_status=? where Message_id=?',[9,saveSendedMessage]) 
      let saveInCampaignMessage = await sendMessages(from, text, campaignId, message, response.status, text, response.msgId,'WA Web', response.status,response.msgId);
      }
      return response;

    } else {
      console.log("isActiveSpidClient returned false for WhatsApp Web");
      return { status: 404 };
    }

  }
}
function determineMediaFromLink(link) {
  try{
  const fileExtension = link.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
        return 'image';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(fileExtension)) {
        return 'video';
    } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(fileExtension)) {
        return 'document';
    } else {
        return 'unknown'; 
    }
  } catch(error){
       console.error('Error while extracting media type from link:', error.message);
       return 'unknown'; 
    }
}

async function campaignAlertsThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType) {
  //console.log("campaignAlertsThroughselectedchannel", spid, from, type, channelType,web.isActiveSpidClient(spid))
  let getMediaType = determineMediaType(type);
  if (channelType == 'WhatsApp Official' || channelType == 1 || channelType == 'WA API') {

    let respose = await middleWare.sendDefultMsg(media, text, getMediaType, metaPhoneNumberID, from,spid);
    console.log("campaignAlerts", media, text, type, metaPhoneNumberID, from, respose)
    if (respose?.status == 200) {
      let saveSendedMessage = await saveMessage(from, spid, respose?.message?.messages[0]?.id, text, media, type, type, 'WA API',"Official campaign Alert***")
    }

    return respose;
  } if (channelType == 'WhatsApp Web' || channelType == 2 || channelType == 'WA Web') {

    let clientReady = await isClientActive(spid);
    console.log("campaignAlerts ---------- whatsapp web",  type, from)
    if (clientReady?.status == 200) {
      let saveSendedMessage = await saveMessage(from, spid, '', text, media, type, type, 'WA Web',"Web campaign Alert***")
      let response = await middleWare.postDataToAPI(spid, from, getMediaType, text, media, '', saveSendedMessage);
    //  console.log("campaignAlertsThroughselectedchannel response", JSON.stringify(response?.status));

      return response;

    } else {
      console.log("isActiveSpidClient returned false for WhatsApp Web");
      return { status: 404 };
    }

  }
}


function determineMediaType(mediaType) {
  switch (mediaType) {
    case 'video/mp4':
      return 'video';
    case 'application/pdf':
      return 'document';
    case 'image/jpeg':
    case 'image/jpg':
    case 'image/png':
      return 'image';
    case '':
      return 'text';
    case 'text':
      return 'text';
    default:
      return 'unknown'; // Optional: handle other cases
  }
}

async function saveMessage(PhoneNo, spid, msgTemplateId, text, media, type, mediaType, channel,fromWhere) {

  let InteractionId = await insertInteractionAndRetrieveId(PhoneNo, spid, channel);
  console.log(PhoneNo, fromWhere, spid, "InteractionId InteractionId", InteractionId)

  let msgQuery = `insert into Message (interaction_id,message_direction,message_text,message_media,Type,SPID,media_type,Agent_id,assignAgent,msg_status,Message_template_id) values ?`
  let savedMessage = await db.excuteQuery(msgQuery, [[[InteractionId[0]?.InteractionId, 'Out', text, media, 'text', spid, mediaType, '', -1, 1, msgTemplateId]]]);
  let insertedMsgId = saveMessage?.insertId
}

async function insertInteractionAndRetrieveId(phoneNo, sid, channel) {
  try {
    let customerId = await db.excuteQuery(`select customerId from EndCustomer where Phone_Number =? AND SP_ID=?  ORDER BY created_at desc limit 1`, [phoneNo, sid]);

    let custid = customerId[0]?.customerId;
  
    if (!custid) {

      let countryCodeObj;
      if (phoneNo) {
        countryCodeObj = mapCountryCode.mapCountryCode(phoneNo); //Country Code abstraction `countryCode` = '91', `country` = 'IN', `localNumber` = '8130818921'
      }
      let countryCode = countryCodeObj.country + " +" + countryCodeObj.countryCode
      let displayPhoneNumber = countryCodeObj.localNumber
      let addTempContact = await db.excuteQuery(`INSERT into EndCustomer(Phone_Number,SP_ID,channel,Name,OptInStatus,countryCode,displayPhoneNumber,IsTemporary) values (?,?,?,?,?,?,?,?)`, [phoneNo, sid, channel, phoneNo, 'Yes', countryCode, displayPhoneNumber, 1]);
      custid = addTempContact?.insertId
    }
    console.log(phoneNo, sid, custid)
    // Check if Interaction exists for the customerId
    let rows = await db.excuteQuery(
      'SELECT InteractionId FROM Interaction WHERE customerId = ? and is_deleted !=1 and SP_ID=? ',
      [custid, sid]
    );

    if (rows.length == 0) {

      // If no existing interaction found, insert a new one
      await db.excuteQuery(
        'INSERT INTO Interaction (customerId, interaction_status, SP_ID, interaction_type) VALUES (?, ?, ?, ?)',
        [custid, 'Resolved', sid, 'User Initiated']
      );

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




async function autoResolveExpireInteraction() {
  try {
    logger.info('autoResolveExpireInteraction is called');
    // Get the maximum created_at date of messages for the latest interaction of each customer
    const maxCreatedAtQuery = `
    SELECT MAX(m.created_at) AS max_created_at, m.interaction_id
    FROM Message m
    WHERE m.interaction_id IN (
        SELECT i.InteractionId
        FROM (
            SELECT InteractionId, ROW_NUMBER() OVER (PARTITION BY customerId ORDER BY created_at DESC) AS rn
            FROM Interaction
        ) AS i
        WHERE i.rn = 1
    )
    GROUP BY m.interaction_id
`;

    const maxCreatedAtResult = await db.excuteQuery(maxCreatedAtQuery);
    // console.log("maxCreatedAtResult length  of  auto resolve",maxCreatedAtResult)
    // logger.log("maxCreatedAtResult length  of  auto resolve",{maxCreatedAtResult})
    // Update the Interaction table based on the maximum created_at date
    if (Array.isArray(maxCreatedAtResult)) {
      for (const record of maxCreatedAtResult) {
        const updateQuery = `
        UPDATE Interaction
        SET interaction_status = ?
        WHERE InteractionId = ${record.interaction_id}
        AND  TIMESTAMPDIFF(HOUR, (SELECT MAX(created_at) FROM Message WHERE interaction_id = ${record.interaction_id}), NOW()) >= 24 and interaction_status != 'Resolved'`;

        let result = await db.excuteQuery(updateQuery, ['Resolved']);
        // logger.log(record.interaction_id,"result",result?.affectedRows)
        let getMapping = await db.excuteQuery(`select * from InteractionMapping where InteractionId =?`, [record.interaction_id])
        if (result?.length > 0) {
          let updateMapping = await db.excuteQuery(`update InteractionMapping set AgentId='-1' where InteractionId =?`, [record.interaction_id]);

        }
      }
    } else {
      logger.warn(' cron job scheduler maxCreatedAtResult is not an array');
    }


  } catch (err) {
    console.log("err autoResolveExpireInteraction ---", err)
    // logger.error("err autoResolveExpireInteraction ---", {err});
  }
}

// cron.schedule('*/5 * * * *', async () => {
//   console.log('Running scheduled task...');

//   fetchScheduledMessages();
//   autoResolveExpireInteraction();

// });

// Function to start the scheduler
function startScheduler() {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running scheduled task at:', new Date());

    // Execute your scheduled tasks
    await fetchScheduledMessages();
    //await autoResolveExpireInteraction();
  });
}

// Calculate the initial delay
function calculateInitialDelay() {
  const now = new Date();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Calculate how many minutes to add to reach the next multiple of 5
  const minutesToNextMultipleOf5 = (5 - (minutes % 5)) % 5;

  // Calculate the total delay in milliseconds
  const delay = (minutesToNextMultipleOf5 * 60 - seconds) * 1000;
  console.log("delay ---------", delay)
  return delay;
}

// Initial startup
const initialDelay = calculateInitialDelay();

if (initialDelay > 0) {
  console.log(`Waiting ${initialDelay / 1000} seconds to start the scheduler...`);
  setTimeout(() => {
    console.log('Starting the scheduler at:', new Date());
    startScheduler();
  }, initialDelay);
} else {
  console.log('Starting the scheduler immediately at:', new Date());
  startScheduler();
}

app.listen(3008, () => {
  console.log("Campaign scheduler  is listening on port 3008");
});