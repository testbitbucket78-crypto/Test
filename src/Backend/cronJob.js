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
const delayBetweenBatches = 1000; // 10 seconds in milliseconds
const web = require('./webJS/web')
const removeTags = require('./removeTagsFromRichTextEditor')
const logger = require('./common/logger.log');

// Function to check if the schedule_datetime is within 1-2 minutes from the current time
function isWithinTimeWindow(scheduleDatetime) {
  const currentTime = moment();
  const scheduledTime = moment(scheduleDatetime);
  const diffInMinutes = scheduledTime.diff(currentTime, 'minutes');
  return diffInMinutes >= 0 && diffInMinutes <= 2;
}


async function fetchScheduledMessages() {
  try {

    var messagesData = await db.excuteQuery(`select * from Campaign where status=1 and is_deleted != 1`, [])
    var remaingMessage = [];
    //console.log(messagesData)

    const currentDate = new Date();

    const currentDay = currentDate.getDay();

    let currentDateTime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
    console.log(currentDateTime)
    for (const message of messagesData) {

      //  let campaignTime = await getCampTime(message.sp_id)  // same as below loop
      console.log(message.sp_id, "campaignTime", isWorkingTime(message), new Date(message.start_datetime) < new Date(currentDateTime), new Date(message.start_datetime), new Date(), new Date(currentDateTime))
      if (isWorkingTime(message)) {

        if (new Date(message.start_datetime) < new Date(currentDateTime)) {
          console.log(" isWorkingTime messagesData loop",)
          const phoneNumber = message.segments_contacts.length > 0 ? mapPhoneNumberfomList(message) : mapPhoneNumberfomCSV(message);

        }
      } else {
        remaingMessage.push(message);
      }

    }

    for (const message of remaingMessage) {

      //  console.log("remaingMessage loop", message.sp_id)
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
    console.log(err)
  }

}

async function parseMessage(content, customerId, spid, messageVariable) {
  // Replace placeholders in the content with values from message_variables
  let message_variables = messageVariable && messageVariable.length > 0 ? JSON.parse(messageVariable) : undefined;

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
  return content;
}

async function parseMessageForCSV(content, contact, messageVariable) {
  // Replace placeholders in the content with values from message_variables
  let message_variables = messageVariable && messageVariable.length > 0 ? JSON.parse(messageVariable) : undefined;
  if (message_variables) {
    message_variables.forEach(variable => {
      const label = variable.label;
      const value = variable.value;
      content = content.replace(new RegExp(label, 'g'), value);
    });
  }
  // Replace any remaining placeholders in the content with values from the contact object
  Object.keys(contact).forEach(key => {
    const value = contact[key];
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

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

async function sendMessages(phoneNumber, message, id, campaign, response) {
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
      message_content: campaign.message_content,
      message_heading: campaign.message_heading,
      CampaignId: campaign.Id,
      schedule_datetime: campaign.start_datetime,
      status_message: response,
      status: status
    }


    saveSendedMessage(MessageBodyData)
  } catch (error) {

  }

}



async function saveSendedMessage(MessageBodyData) {
  var inserQuery = "INSERT INTO CampaignMessages (phone_number,button_yes,button_no,button_exp,message_media,message_content,message_heading,CampaignId,schedule_datetime,status_message,status,SP_ID) values ?";
  let saveMessage = await db.excuteQuery(inserQuery, [[[MessageBodyData.phone_number, '', '', '', MessageBodyData.message_media, MessageBodyData.message_content, '', MessageBodyData.CampaignId, MessageBodyData.schedule_datetime, MessageBodyData.status_message, MessageBodyData.status, MessageBodyData.sp_id]]])
}


async function mapPhoneNumberfomCSV(message) {
  try {
    // Map the values to customer IDs

    var contacts = JSON.parse(message.csv_contacts);

    var type = 'image';
    if (message.message_media == null || message.message_media == "") {
      type = 'text';
    }
    campaignAlerts(message, 2) // campaignAlerts(new Date(), message.Id)    //Campaign is Running
    let updateQuery = `UPDATE Campaign SET status=2,updated_at=? where Id=?`;
    let myUTCString = new Date().toUTCString();
    const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
    let updatedStatus = await db.excuteQuery(updateQuery, [currenttime, message.Id])
    let content = await removeTags.removeTagsFromMessages(message.message_content);
    batchofScheduledCampaign(contacts, message.sp_id, type, content, message.message_media, message.phone_number_id, message.channel_id, message, 'csv') //channelType[0].connected_id
  } catch (err) {
    console.log(err)
  }


}

async function mapPhoneNumberfomList(message) {
  // Map the values to customer IDs
  console.log("mapPhoneNumberfomList", message)
  var dataArray = JSON.parse(message.segments_contacts);
  var type = 'image';
  if (message.message_media == null || message.message_media == "") {
    type = 'text';
  }



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
  let content = await removeTags.removeTagsFromMessages(message.message_content);
  batchofScheduledCampaign(phoneNo, message.sp_id, type, content, message.message_media, message.phone_number_id, message.channel_id, message, 'List')
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
  }, 60000)
}

async function campaignCompletedAlert(message) {
  let updateQuery = `UPDATE Campaign SET status=3,updated_at=? where Id=?`;
  let myUTCString = new Date().toUTCString();
  const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
  let updatedStatus = await db.excuteQuery(updateQuery, [currenttime, message.Id])
  campaignAlerts(message, 3) // Campaign Finish 

}

async function sendScheduledCampaign(batch, sp_id, type, message_content, message_media, phone_number_id, channel_id, message, list) {
  //  console.log("sendScheduledCampaign", "channel_id", batch, sp_id, type, message_content, message_media, phone_number_id, channel_id, message)
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
      response = await messageThroughselectedchannel(sp_id, Phone_number, type, textMessage, message_media, phone_number_id, channel_id);
      console.log("response", JSON.stringify(response.status))
      sendMessages(Phone_number, message.message_content, message.Id, message, response.status)
    }, 10)

  }
}


function isWorkingTime(item) {
  try {
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });  // for finding current date
    let datetime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });


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

    return false;
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

    sendBatchMessage(user, message.sp_id, type, alertmessages, message.message_media, message.phone_number_id, message.channel_id, message.CampaignId, updatedStatus)


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
      messageThroughselectedchannel(sp_id, mobile_number, type, message_content, message_media, phone_number_id, channel_id)
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

      const apiUrl = 'https://waweb.stacknize.com/IsClientReady'; // Replace with your API endpoint
      const dataToSend = {
        spid: spid
      };

      const response = await axios.post(apiUrl, dataToSend);
      console.log('Response from API:', response.data);

      resolve(response.data); // Resolve with the response data
    } catch (error) {
      console.error('Error:', error.message);
      reject(error.message); // Reject with the error
    }
  });


}





//_________________________COMMON METHOD FOR SEND MESSAGE___________________________//

async function messageThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType) {
  //console.log("messageThroughselectedchannel", spid, from, type, channelType,web.isActiveSpidClient(spid))
  if (channelType == 'WhatsApp Official' || channelType == 1) {

    let respose = await middleWare.sendDefultMsg(media, text, type, phone_number_id, from);
    return respose;
  } if (channelType == 'WhatsApp Web' || channelType == 2) {
    // if (web.isActiveSpidClient(spid)) {
    // let respose = await middleWare.postDataToAPI(spid, from, type, text, media)
    //return respose;
    // } else {
    //   return ({status:401});
    // }
    let clientReady = await isClientActive(spid);
    if (clientReady.status) {
      let response = await middleWare.postDataToAPI(spid, from, type, text, media);
      console.log("response", JSON.stringify(response.status));
      return response;
    }

    else {
      console.log("isActiveSpidClient returned false for WhatsApp Web");
      return { status: 404 };
    }

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
    //console.log("maxCreatedAtResult",maxCreatedAtResult)
    logger.log("maxCreatedAtResult length  of  auto resolve",{maxCreatedAtResult})
    // Update the Interaction table based on the maximum created_at date
    if (Array.isArray(maxCreatedAtResult)) {
      for (const record of maxCreatedAtResult) {
        const updateQuery = `
        UPDATE Interaction
        SET interaction_status = ?
        WHERE InteractionId = ${record.interaction_id}
        AND  TIMESTAMPDIFF(HOUR, (SELECT MAX(created_at) FROM Message WHERE interaction_id = ${record.interaction_id}), NOW()) >= 24 and interaction_status != 'Resolved'`;

        let result = await db.excuteQuery(updateQuery, ['Resolved']);
        logger.log(record.interaction_id,"result",result?.affectedRows)
        let getMapping = await db.excuteQuery(`select * from InteractionMapping where InteractionId =?`, [record.interaction_id])
        if (updateQuery?.length > 0) {
          let updateMapping = await db.excuteQuery(`update InteractionMapping set AgentId='-1' where InteractionId =?`, [record.interaction_id]);
          
        }
      }
    } else {
      logger.warn(' cron job scheduler maxCreatedAtResult is not an array');
    }

    
  } catch (err) {
    logger.error("err autoResolveExpireInteraction ---", {err});
  }
}

cron.schedule('*/5 * * * *', async () => {
  console.log('Running scheduled task...');

  fetchScheduledMessages();
  autoResolveExpireInteraction();

});

app.listen(3008, () => {
  console.log("Campaign scheduler  is listening on port 3008");
});