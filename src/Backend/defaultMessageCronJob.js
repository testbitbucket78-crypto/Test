const cron = require('node-cron');
const db = require('./dbhelper')
const val = require('./Authentication/constant')
const settingVal = require('./settings/generalconstant')
var axios = require('axios');
var express = require("express");
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const middleWare = require('./middleWare')
const moment = require('moment');
const removeTags = require('./removeTagsFromRichTextEditor')
const commonFun = require('./common/resuableFunctions')
const lostMessageTimeGap = 6;
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

var insertMessageQuery = "INSERT INTO Message (SPID,Type,ExternalMessageId, interaction_id, Agent_id, message_direction,message_text,message_media,media_type,Message_template_id,Quick_reply_id,created_at,updated_at,system_message_type_id,assignAgent,msg_status) VALUES ?"
let metaPhoneNumberID = 211544555367892
const batchSize = 10; // Number of users to send in each batch
const delayBetweenBatches = 1000; // 10 seconds in milliseconds


async function NoCustomerReplyReminder() {
  try {
    let defaultMessage = await db.excuteQuery(settingVal.CustomerReplyReminder, [lostMessageTimeGap]);
    console.log("NoCustomerReplyReminder", defaultMessage?.length);

    if (defaultMessage?.length > 0) {
      for (let i = 0; i < defaultMessage.length; i += batchSize) {
        // Process messages in batches
        const batch = defaultMessage.slice(i, i + batchSize);
        console.log(`NoCustomerReplyReminder Processing batch ${(i / batchSize) + 1} with ${batch.length} messages`);
         
        // Process each message in the current batch
        for (const message of batch) {
          try {
            let isReplyPause = await isAutoReplyPause(message.SP_ID, message.InteractionId, message.defaultAction_PauseTime);

            if (isReplyPause) {
              let data = await db.excuteQuery(`SELECT * FROM defaultmessages WHERE Is_disable = 1 and title=? and SP_ID=?`, ['No Customer Reply Reminder', message.SPID]);

              if (data.length > 0) {
                let message_text = await getExtraxtedMessage(data[0].value, message.SP_ID, message.customerId);
                let response = await messageThroughselectedchannel(
                  message.SPID,
                  message.customer_phone_number,
                  data[0].message_type,
                  message_text,
                  data[0].link,
                  metaPhoneNumberID,
                  message.channel,
                  data[0].message_type
                );

                if (response?.status == 200) {
                  let myUTCString = new Date().toUTCString();
                  const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
                  
                  // Update message status and insert new message
                  await db.excuteQuery(settingVal.systemMsgQuery, [5, currenttime, message.MaxMessageId]);
                  let messageValu = [
                    [message.SPID, 'text', metaPhoneNumberID, message.interaction_id, message.Agent_id, 'out', data[0].value, (message.link ? message.link : 'text'), data[0].message_type, "", "", currenttime, currenttime, 5, -2, 1]
                  ];
                  await db.excuteQuery(insertMessageQuery, [messageValu]);
                }
              }
            }
          } catch (error) {
            console.error(`Error sending message to ${message}.`, error.message);
          }
        }

        // Add delay between processing batches
        if (i + batchSize < defaultMessage.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }
    }
  } catch (error) {
    console.error("Error processing NoCustomerReplyReminder:", error.message);
  }
}

let systemMsgQuery = `SELECT
ic.interaction_status,
ic.InteractionId,
ic.customerId,
ic.updated_at as updateTime,
ec.channel,
ec.phone_number AS customer_phone_number,
ec.defaultAction_PauseTime,
dm.*,
latestmsg.*
FROM
Interaction ic
JOIN EndCustomer ec ON ic.customerId = ec.customerId
JOIN defaultmessages dm ON dm.SP_ID = ic.SP_ID
JOIN (
SELECT 
    m1.*
FROM 
    Message m1
INNER JOIN (
    SELECT
        interaction_id,
        MAX(updated_at) AS latestMessageDate
    FROM
        Message
    WHERE 
        (system_message_type_id IS NULL OR system_message_type_id IN (1, 2,3,4,5))
    GROUP BY 
        interaction_id
) m2 ON m1.interaction_id = m2.interaction_id AND m1.updated_at = m2.latestMessageDate
WHERE 
    m1.message_direction = 'out'
) latestmsg ON ic.InteractionId = latestmsg.interaction_id
WHERE 
(ic.interaction_status = 'open' OR ic.interaction_status = 'Open Interactions')
AND ic.is_deleted = 0
AND dm.title = 'No Customer Reply Timeout'
AND dm.Is_disable = 1 
and (latestmsg.msg_status != 9 AND latestmsg.msg_status != 10) 
AND latestmsg.updated_at <= DATE_SUB(NOW(), INTERVAL dm.autoreply MINUTE)
group by latestmsg.interaction_id ,ic.customerId
`


async function NoCustomerReplyTimeout() {
  try {
    // Fetch customer reply timeout data
    let CustomerReplyTimeout = await db.excuteQuery(systemMsgQuery, [lostMessageTimeGap]);
    console.log(CustomerReplyTimeout?.length, "NoCustomerReplyTimeout");

    if (CustomerReplyTimeout?.length > 0) {
      for (let i = 0; i < CustomerReplyTimeout.length; i += batchSize) {
        // Process messages in batches
        const batch = CustomerReplyTimeout.slice(i, i + batchSize);
        console.log(`NoCustomerReplyTimeout Processing batch ${(i / batchSize) + 1} with ${batch.length} messages`);

        // Process each message in the current batch
        for (const msg of batch) {
          let isReplyPause = await isAutoReplyPause(msg.SP_ID, msg.InteractionId, msg.defaultAction_PauseTime);

          // Check conditions for customer reply timeout and send the message
          if (isReplyPause && msg.Is_disable != 0 && !(msg.updated_at >= msg.updateTime)) {
            let message_text = await getExtraxtedMessage(msg.value, msg.SP_ID, msg.customerId);
            let response = await messageThroughselectedchannel(
              msg.SPID,
              msg.customer_phone_number,
              msg.message_type,
              message_text,
              msg.link,
              metaPhoneNumberID,
              msg.channel,
              msg.message_type
            );

            if (response?.status == 200) {
              let myUTCString = new Date().toUTCString();
              const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
              
              // Update message status and insert system message
              await db.excuteQuery(settingVal.systemMsgQuery, [6, currenttime, msg.Message_id]);
              let messageValu = [
                [msg.SPID, 'text', metaPhoneNumberID, msg.interaction_id, msg.Agent_id, 'out', msg.value, (msg.link ? msg.link : 'text'), msg.message_type, "", "", currenttime, currenttime, 6, -2, 1]
              ];
              let insertedMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
              console.log("NoCustomerReplyTimeout msg", insertedMessage);

              // Close interaction if applicable
              let closeInteraction = await db.excuteQuery(`UPDATE Interaction SET interaction_status='Resolved' WHERE InteractionId=${msg.InteractionId}`, []);
              if (closeInteraction.affectedRows > 0) {
                await db.excuteQuery(`UPDATE InteractionMapping SET AgentId='-1' WHERE InteractionId = ?`, [msg.interaction_id]);
              }
            }
          }
        }

        // Add delay between processing batches
        if (i + batchSize < CustomerReplyTimeout.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }
    }
  } catch (error) {
    console.error(`Error processing NoCustomerReplyTimeout: `, error);
  }
}



async function NoAgentReplyTimeOut() {
  try {
    // Fetch messages that need processing
    let noAgentReplydata = await db.excuteQuery(settingVal.getLatestMsgbyInteraction, [lostMessageTimeGap]);
    console.log(noAgentReplydata?.length, "NoAgentReplyTimeOut");

    if (noAgentReplydata?.length > 0) {
      for (let i = 0; i < noAgentReplydata.length; i += batchSize) {
        const batch = noAgentReplydata.slice(i, i + batchSize); // Process in batches

        console.log(`NoAgentReplyTimeOut Processing batch ${(i / batchSize) + 1} with ${batch.length} messages`);

        // Process each message in the current batch
        for (const msg of batch) {
          let isReplyPause = await isAutoReplyPause(msg.SPID, msg.interaction_id, msg.defaultAction_PauseTime);
          let currentTime = new Date(); // Server time for comparison

          let autoReplyVal = new Date(msg.nonSystemUpdatedMsgTime.getTime() + msg.autoreply * 60000); // Clone the UTC time

          // Check conditions to send a reply
          if (isReplyPause && msg.Is_disable != 0 && (!(msg.updated_at >= msg.updateTime) || msg.updated_at == null) && msg.nonSystemUpdatedMsgTime <= autoReplyVal) {
            let isWorkingTime = await workingHoursDetails(msg.SPID);

            if (isWorkingTime === true) {
              let message_text = await getExtraxtedMessage(msg.value, msg.SPID, msg.customerId);
              let response = await messageThroughselectedchannel(
                msg.SPID, 
                msg.customer_phone_number, 
                msg.message_type, 
                message_text, 
                msg.link, 
                metaPhoneNumberID, 
                msg.channel, 
                msg.message_type
              );

              let myUTCString = new Date().toUTCString();
              const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

              if (response?.status === 200) {
                let messageValu = [
                  [msg.SPID, 'text', metaPhoneNumberID, msg.interaction_id, msg.Agent_id, 'out', msg.value, (msg.link ? msg.link : 'text'), msg.message_type, "", "", currenttime, currenttime, 4, -2, 1]
                ];
                let insertedMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
               // console.log("no agent reply ", insertedMessage);
              }
            }
          }
        }

        // Add delay between processing batches
        if (i + batchSize < noAgentReplydata.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }
    }
  } catch (error) {
    console.error(`Error sending message: `, error);
  }
}





async function isClientActive(spid) {

  return new Promise(async (resolve, reject) => {
    try {

      const apiUrl = 'https://waweb.stacknize.com/IsClientReady'; // Replace with your API endpoint
      const dataToSend = {
        spid: spid
      };

      const response = await axios.post(apiUrl, dataToSend);
      //  console.log('Response from API:', response.data);

      resolve(response.data); // Resolve with the response data
    } catch (error) {
      //console.error('Error:', error.message);
      reject(error.message); // Reject with the error
    }
  });


}

async function isAutoReplyPause(spid, newId, contactDefaultPauseTime) {
  let defaultQuery = 'select * from defaultActions where spid=?';
  let defaultAction = await db.excuteQuery(defaultQuery, [spid]);
  // let contactDefaultPauseTime = await db.excuteQuery('select * from EndCustomer where customerId=? and SP_ID=?',[customerId,spid])
  //console.log(defaultAction)You have a new message in you current Open Chat
  if (defaultAction.length > 0) {
    //console.log(defaultAction[0].isAutoReply + " isAutoReply " + defaultAction[0].autoReplyTime + " autoReplyTime " + defaultAction[0].isAutoReplyDisable + " isAutoReplyDisable ")
    var isAutoReply = defaultAction[0].isAutoReply
    var autoReplyTime = contactDefaultPauseTime
    var isAutoReplyDisable = defaultAction[0].isAutoReplyDisable
  }
  let assignAgent = await db.excuteQuery('select * from InteractionMapping where InteractionId =?', [newId]);
  let interactionStatus = await db.excuteQuery('select * from Interaction where InteractionId = ? and is_deleted !=1 ', [newId])
  let replysended = await isReplySent(isAutoReply, autoReplyTime, isAutoReplyDisable, assignAgent, interactionStatus)
  return replysended;

}

async function isReplySent(isAutoReply, autoReplyTime, isAutoReplyDisable, assignAgent, interactionStatus) {
  if (isAutoReply != 1) {

    return true;
  }
  else if (isAutoReply == 1) {

    let currentTime = new Date();

    let autoReplyVal = new Date(currentTime);
    if (autoReplyTime != 0) {
      autoReplyVal.setMinutes(autoReplyVal.getMinutes() + autoReplyTime);
    }
    //const autoReplyVal = new Date(currentTime)   // autoReplyTime when auto reply start
    //  console.log("currentTime,autoReplyVal ,autoReplyTime", currentTime, autoReplyVal, autoReplyTime)
    if (autoReplyTime != null && (autoReplyVal <= currentTime) && autoReplyTime != undefined && autoReplyTime != 0) {

      return true;
    }
    else if (isAutoReplyDisable == 1 && (assignAgent?.length == 0 || (assignAgent?.length != 0 && interactionStatus[0]?.interaction_status == 'Resolved'))) {
      return true;
    }
    return false;

  }
}

async function messageThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType, media_type) {
 // console.log("spid, from, type, text, media, phone_number_id, channelType")
  let getMediaType = determineMediaType(media_type);
  if(getMediaType === 'unknown' && media) getMediaType = commonFun.determineMediaFromLink(media);
  //console.log(spid, from, getMediaType, phone_number_id, channelType)
  try {
    if (channelType == 'WhatsApp Official' || channelType == 1 || channelType == 'WA API') {

      let respose = await middleWare.sendDefultMsg(media, text, getMediaType, phone_number_id, from);
      return respose;
    } if (channelType == 'WhatsApp Web' || channelType == 2 || channelType == 'WA Web') {
      let clientReady = await isClientActive(spid);

      if (clientReady.status) {
        let response = await middleWare.postDataToAPI(spid, from, getMediaType, text, media);
        console.log("response", JSON.stringify(response.status));
        return response;
      }

      else {
        console.log("isActiveSpidClient returned false for WhatsApp Web");
        return { status: 404 };
      }

    }
  } catch (err) {
    //console.log(" err middleware -----", err)
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
// Common Function to parse the message template and retrieve {{}} placeholders
function parseMessageTemplate(template) {
  const placeholderRegex = /{{(.*?)}}/g;
  const placeholders = [];
  let match;
  while ((match = placeholderRegex.exec(template))) {
    placeholders.push(match[1]);
  }
  return placeholders;
}

async function getExtraxtedMessage(message_text, SPID, customerId) {
  try {
    let content = await removeTags.removeTagsFromMessages(message_text);
    // Parse the message template to get placeholders
    const placeholders = parseMessageTemplate(content);
    if (placeholders.length > 0) {
      // Construct a dynamic SQL query based on the placeholders
      //console.log(placeholders)
      const results = await commonFun.getDefaultAttribue(placeholders, SPID, customerId);
     // console.log("results", results)

      placeholders.forEach(placeholder => {
        const result = results.find(result => result.hasOwnProperty(placeholder));
        const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
        content = content.replace(`{{${placeholder}}}`, replacement);
      });
    }
    return content;
  } catch (err) {
    console.log("ERR getExtractedMessage---", err)
  }
}





function isWorkingTime(data, currentTime) {

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  let datetime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });

  for (const item of data) {
    const workingDays = item.working_days.split(',');
    const date = new Date(datetime).getHours();
    const getMin = new Date(datetime).getMinutes();

    const start_time = (item.start_time).replace(/\s*(AM|PM)/, "");
    const end_time = (item.end_time).replace(/\s*(AM|PM)/, "");
    const startTime = start_time.split(':');
    const endTime = end_time.split(':');

    if (workingDays.includes(currentDay) && (((startTime[0] < date) || (date === startTime[0] && startTime[1] <= getMin)) && ((endTime[0] > date) || ((endTime[1] === getMin) && (endTime[1] >= getMin))))) {
      //console.log("data===========")
      return true;
    }



  }

  return false;
}


async function workingHoursDetails(sid) {
  const currentTime = new Date();
  let workingHourQuery = `select * from WorkingTimeDetails where SP_ID=? and isDeleted !=1`;
  var workingData = await db.excuteQuery(workingHourQuery, [sid]);
  if ((isWorkingTime(workingData, currentTime))) {

    //console.log('It is currently  within working hours.');
    return true;
  }
  //console.log('It is currently not within working hours.');
  return false;
}

// // Calculate the initial delay
// function calculateInitialDelay() {
//   const now = new Date();
//   const minutes = now.getMinutes();
//   const seconds = now.getSeconds();

//   // Calculate how many minutes to add to reach the next multiple of 5
//   const minutesToNextMultipleOf5 = (5 - (minutes % 5)) % 5;

//   // Calculate the total delay in milliseconds
//   const delay = (minutesToNextMultipleOf5 * 60 - seconds) * 1000;
//   console.log("delay ---------", delay)
//   return delay;
// }

// // Initial startup
// const initialDelay = calculateInitialDelay();

// if (initialDelay > 0) {
//   console.log(`Waiting ${initialDelay / 1000} seconds to start the scheduler...`);
//   setTimeout(() => {
//     console.log('Starting the scheduler at:', new Date());
//     startScheduler();
//   }, initialDelay);
// } else {
//   console.log('Starting the scheduler immediately at:', new Date());
//   startScheduler();
// }



//function startScheduler() {
  cron.schedule('*/2 * * * *', async () => {
    console.log('Running scheduled task...');
    NoCustomerReplyReminder();  // system_message_type_id  = 5
    NoCustomerReplyTimeout();     // system_message_type_id  = 6
    NoAgentReplyTimeOut();         // system_message_type_id = 4

  });
//}
app.listen(3006, () => {
  console.log("defaultMessage scheduler  is listening on port 3006");
});