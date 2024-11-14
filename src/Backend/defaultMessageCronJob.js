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
const logger = require('./common/logger.log');
const lostMessageTimeGap = 6;
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

var insertMessageQuery = "INSERT INTO Message (SPID,Type,ExternalMessageId, interaction_id, Agent_id, message_direction,message_text,message_media,media_type,Message_template_id,Quick_reply_id,created_at,updated_at,system_message_type_id,assignAgent,msg_status) VALUES ?"
let metaPhoneNumberID = 211544555367892
const batchSize = 10; // Number of users to send in each batch
const delayBetweenBatches = 5000; // 5 seconds in milliseconds


async function NoCustomerReplyReminder() {
  try {
    let defaultMessage = await db.excuteQuery(settingVal.CustomerReplyReminder, [lostMessageTimeGap]);
   
    logger.info(`NoCustomerReplyReminder, ${defaultMessage?.length , new Date()}`)
    if (defaultMessage?.length > 0) {
      // Caches to avoid redundant calculations for the same SP_ID
      const replyPauseCache = new Map();
      const extractedMessageCache = new Map();

      for (let i = 0; i < defaultMessage.length; i += batchSize) {
        const batch = defaultMessage.slice(i, i + batchSize);
     
         logger.info(`NoCustomerReplyReminder Processing batch ${(i / batchSize) + 1} with ${batch.length} messages ${new Date()}`)
        for (const message of batch) {
          try {
            let isReplyPause, message_text;

            // --------- one SPID one time ------------//

            // Check if replyPauseCache already has the result for this SP_ID
            if (!replyPauseCache.has(message.SP_ID)) {
              isReplyPause = await isReplySent(message.isAutoReply, message.defaultAction_PauseTime, message.isAutoReplyDisable, message.AgentId, message.interaction_status);
              replyPauseCache.set(message.SP_ID, isReplyPause); // Cache the result
            } else {
              isReplyPause = replyPauseCache.get(message.SP_ID);
            }
            let latestMessageTime = await db.excuteQuery('select * from Message where interaction_id =?  order by created_at desc limit 1',[message.InteractionId])
            logger.info(`isReplyPause NoCustomerReplyReminder , SPID, phone_number,${latestMessageTime[0]?.created_at},${message.latestMessageDate} ,${message.Is_disable != 0},${isReplyPause} , ${new Date()} , ${message.SPID} , ${message.customer_phone_number }`)
            if (isReplyPause && latestMessageTime[0]?.created_at < message.latestMessageDate && message.Is_disable != 0) {
              // Check if extractedMessageCache already has the result for this SP_ID
              if (!extractedMessageCache.has(message.SP_ID)) {
               // message_text = await getExtraxtedMessage(message.message_value, message.SP_ID, message.customerId);
               if(message.value != null){
                message_text = await removeTags.removeTagsFromMessages(message.value); // Clean up message
               }
                
                extractedMessageCache.set(message.SP_ID, message_text); // Cache the result
              } else {
                message_text = extractedMessageCache.get(message.SP_ID);
              }
             
              logger.info(`send no NoCustomerReplyReminder start  ${new Date()}   ,  ${message.SPID},  ${message.customer_phone_number}`)
              // Send the message via the selected channel
              let response = await messageThroughselectedchannel(
                message.SPID,
                message.customer_phone_number,
                message.message_type,
                message_text,
                message.link,
                metaPhoneNumberID,
                message.channel,
                message.message_type
              );
              logger.info(`ssend no NoCustomerReplyReminder succes----  ${new Date()}   ,  ${message.SPID},  ${message.customer_phone_number} ,${response?.status}`)
              if (response?.status == 200) {
                let myUTCString = new Date().toUTCString();
                const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

                // Update message status and insert new message
                await db.excuteQuery(settingVal.systemMsgQuery, [5, currenttime, message.MaxMessageId]);
                let messageValu = [
                  [message.SPID, 'text', metaPhoneNumberID, message.interaction_id, message.Agent_id, 'Out', message.value, (message.link ? message.link : 'text'), message.message_type,  response?.message?.messages[0]?.id, "", currenttime, currenttime, 5, -2, 1]
                ];
                await db.excuteQuery(insertMessageQuery, [messageValu]);
              }
            }
          } catch (error) {
            logger.error(`inner Error processing NoCustomerReplyReminder phone_number: ${error.message} ${message.customer_phone_number}`);
          }
        }

        // Add delay between processing batches
        if (i + batchSize < defaultMessage.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }

        logger.info(`============================================================`)




        logger.info(` ${i} Second batch of NoCustomerReplyReminder  ${new Date()}`)
      }
    }
  } catch (error) {
    logger.error(`Error processing NoCustomerReplyReminder: ${error.message}`);
  }
}



async function NoCustomerReplyTimeout() {
  try {
    let CustomerReplyTimeout = await db.excuteQuery(settingVal.systemMsgQuery, [lostMessageTimeGap]);
   
    logger.info(`NoCustomerReplyTimeout, ${CustomerReplyTimeout?.length}, ${new Date()}`);
    
    if (CustomerReplyTimeout?.length > 0) {
      // Caches for isAutoReplyPause and getExtractedMessage results
      const replyPauseCache = new Map();
      const extractedMessageCache = new Map();

      for (let i = 0; i < CustomerReplyTimeout.length; i += batchSize) {
        const batch = CustomerReplyTimeout.slice(i, i + batchSize);
        logger.info(`NoCustomerReplyTimeout Processing batch ${(i / batchSize) + 1} with ${batch.length} messages, ${new Date()}`);
        
        for (const msg of batch) {
          try {
            let isReplyPause;
            let message_text;

            // --------- one SPID one time ------------//

            // Check if replyPauseCache already has the result for this SP_ID
            if (!replyPauseCache.has(msg.SP_ID)) {
              isReplyPause = await isReplySent(msg.isAutoReply, msg.defaultAction_PauseTime, msg.isAutoReplyDisable, msg.AgentId, msg.interaction_status);
              replyPauseCache.set(msg.SP_ID, isReplyPause); // Cache the result
            } else {
              isReplyPause = replyPauseCache.get(msg.SP_ID);
            }
            let currentTime = new Date(); // Server time for comparison
            let autoReplyVal = new Date(msg.nonSystemUpdatedMsgTime.getTime() + msg.autoreply * 60000); // Clone the UTC time
            logger.info(`isReplyPause NoCustomerReplyTimeout, SPID, phone_number, msg.updated_at , interaction updateTime ,autoReplyVal ${isReplyPause}, ${new Date()}, ${msg.SPID}, ${msg.customer_phone_number},${msg.updated_at}, ${msg.updateTime}, ${autoReplyVal}`);

           

            // If isReplyPause is true and conditions are met, proceed
            if (isReplyPause && msg.Is_disable != 0 && (!(msg.updated_at >= msg.updateTime) || msg.updated_at == null) && currentTime >= autoReplyVal) {
              // Check if extractedMessageCache already has the result for this SP_ID
              if (!extractedMessageCache.has(msg.SP_ID)) {
                if (msg.value != null) {
                  message_text = await removeTags.removeTagsFromMessages(msg.value);
                }
                extractedMessageCache.set(msg.SP_ID, message_text); // Cache the result
              } else {
                message_text = extractedMessageCache.get(msg.SP_ID);
              }

              logger.info(`send no NoCustomerReplyTimeout start, ${new Date()}, ${msg.SPID}, ${msg.customer_phone_number}`);
              
              // Send the message via the selected channel
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

              logger.info(`send NoCustomerReplyTimeout success, ${new Date()}, ${msg.SPID}, ${msg.customer_phone_number}, response?.status`);

              if (response?.status == 200) {
                let myUTCString = new Date().toUTCString();
                const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

                // Update message status and insert system message
                await db.excuteQuery(settingVal.systemMsgQuery, [6, currenttime, msg.Message_id]);

                let messageValu = [
                  [msg.SPID, 'text', metaPhoneNumberID, msg.interaction_id, msg.Agent_id, 'Out', msg.value, (msg.link ? msg.link : 'text'), msg.message_type,  response?.message?.messages[0]?.id, "", currenttime, currenttime, 6, -2, 1]
                ];
                let insertedMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
                logger.info(`NoCustomerReplyTimeout msg, ${insertedMessage}, ${new Date()}`);

                // Close interaction if applicable
                let closeInteraction = await db.excuteQuery(`UPDATE Interaction SET interaction_status='Resolved' WHERE InteractionId=${msg.InteractionId}`, []);
                if (closeInteraction.affectedRows > 0) {
                  await db.excuteQuery(`UPDATE InteractionMapping SET AgentId='-1' WHERE InteractionId = ?`, [msg.interaction_id]);
                }
              }
            }
          } catch (error) {
            logger.error(`inner try Error sending message to ${msg.customer_phone_number}, ${error.message}, ${new Date()}`);
          }
        }

        // Add delay between processing batches
        if (i + batchSize < CustomerReplyTimeout.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
        logger.info(`******************************************************`)



        logger.info(` ${i} Second batch of NoCustomerReplyTimeout, ${new Date()}`);
      }
    }
  } catch (error) {
    logger.error(`Outer try Error processing NoCustomerReplyTimeout: ${error.message}, ${new Date()}`);
  }
}




async function NoAgentReplyTimeOut() {
  try {
    // Fetch messages that need processing
    let noAgentReplydata = await db.excuteQuery(settingVal.getLatestMsgbyInteraction, []);
    logger.info(`${noAgentReplydata?.length} messages fetched for NoAgentReplyTimeOut`, { timestamp: new Date() });

    if (noAgentReplydata?.length > 0) {
      // Caches for isAutoReplyPause and workingHoursDetails results
      const replyPauseCache = new Map();
      const workingHoursCache = new Map();
      const extractedMessageCache = new Map();

      for (let i = 0; i < noAgentReplydata.length; i += batchSize) {
        const batch = noAgentReplydata.slice(i, i + batchSize); // Process in batches
       // logger.info(`Processing batch ${(i / batchSize) + 1} with ${batch.length} messages`, { timestamp: new Date() });

        // Process each message in the current batch
        for (const msg of batch) {
          let isReplyPause;
          let isWorkingHour;
          let message_text;
          // Check if replyPauseCache already has the result for this SPID
          if (!replyPauseCache.has(msg.SPID)) {
            isReplyPause = await isReplySent(msg.isAutoReply, msg.defaultAction_PauseTime, msg.isAutoReplyDisable, msg.AgentId, msg.interaction_status);
            replyPauseCache.set(msg.SPID, isReplyPause);
          //  logger.info(`isReplyPause calculated for SPID: ${msg.SPID}`, { isReplyPause });
          } else {
            isReplyPause = replyPauseCache.get(msg.SPID);
          }

          // Check if workingHoursCache already has the result for this SPID
          if (!workingHoursCache.has(msg.SPID)) {
            //console.log(msg.start_time, msg.end_time, msg.working_days,msg.SPID,"working hour")
            //console.log("Types - starthour:", typeof msg.start_time, ", endhour:", typeof msg.end_time, ", workDays:", typeof msg.working_days, ", spid:", typeof msg.SPID);

            isWorkingHour = isWorkingTime(msg.start_time, msg.end_time, msg.working_days,msg.SPID);
            workingHoursCache.set(msg.SPID, isWorkingHour);
           // logger.info(`isWorkingHour calculated for SPID: ${msg.SPID}, ${isWorkingHour}`);
          } else {
            isWorkingHour = workingHoursCache.get(msg.SPID);
          }

          // Check if extractedMessageCache already has the result for this SPID
          if (!extractedMessageCache.has(msg.SPID)) {
            if (msg.value != null) {
              message_text = await removeTags.removeTagsFromMessages(msg.value);
            }
            extractedMessageCache.set(msg.SPID, message_text);
           // logger.info(`Message extracted for SPID: ${msg.SPID}`, { message_text });
          } else {
            message_text = extractedMessageCache.get(msg.SPID);
          }

          let currentTime = new Date(); // Server time for comparison
          let autoReplyVal = new Date(msg.nonSystemUpdatedMsgTime.getTime() + msg.autoreply * 60000); // Clone the UTC time

          // Log conditions before checking if a reply should be sent
     
            logger.info(`Checking conditions for isWorkingHour, isReplyPause ,SPID, phone_number, msg.updated_at , interaction updateTime ,autoReplyVal :${isWorkingHour} ${isReplyPause}, ${new Date()}, ${msg.SPID}, ${msg.customer_phone_number},${msg.updated_at}, ${msg.updateTime}, ${autoReplyVal}`)    

         // Check conditions to send a reply
          if (isReplyPause && msg.Is_disable != 0 && (!(msg.updated_at >= msg.updateTime) || msg.updated_at == null) && currentTime >= autoReplyVal && msg.message_direction == 'IN') {
            if (isWorkingHour === true) {
              logger.info(`Sending message for SPID: ${msg.SPID}`, { timestamp: new Date() });
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

              logger.info(`Message sent successfully for SPID: ${msg.SPID}`, { timestamp: new Date() });

              if (response?.status === 200) {
                let myUTCString = new Date().toUTCString();
                const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
                let messageValu = [
                  [msg.SPID, 'text', metaPhoneNumberID, msg.interaction_id, msg.Agent_id, 'Out', msg.value, (msg.link ? msg.link : 'text'), msg.message_type, response?.message?.messages[0]?.id, "", currenttime, currenttime, 4, -2, 1]
                ];
                let insertedMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);

                logger.info(`Message inserted into DB for SPID: ${msg.SPID}`, { messageValu });
              }
            }
          }
        

        // Add delay between processing batches
        if (i + batchSize < noAgentReplydata.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }

       // logger.info(`-------------------------------------------------------------`)



      }


       // logger.info(`${i} NoAgentReplyTimeOut another batch ${new Date()}`)

      }
    }
  } catch (error) {
    logger.error(`Error in NoAgentReplyTimeOut: ${error.message}`, { error });
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
     // console.log("isAutoReply, autoReplyTime, isAutoReplyDisable, assignAgent, interactionStatus",isAutoReply, autoReplyTime, isAutoReplyDisable, assignAgent, interactionStatus)
    if (autoReplyTime != null && (autoReplyVal <= currentTime) && autoReplyTime != undefined && autoReplyTime != 0) {

      return true;
    }
    else if (isAutoReplyDisable == 1 && (( interactionStatus[0]?.interaction_status == 'Resolved') || (assignAgent == -1 && interactionStatus[0]?.interaction_status == 'Open'))) {
      return true;
    }
    return false;

  }
}

async function messageThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType, media_type) {
  let getMediaType = determineMediaType(media_type);
  if (getMediaType === 'unknown' && media) getMediaType = commonFun.determineMediaFromLink(media);

  // Log initial input parameters
  logger.info(`Starting messageThroughselectedchannel process ${spid } ,${from}, ${getMediaType}`);

  try {
    if (channelType == 'WhatsApp Official' || channelType == 1 || channelType == 'WA API') {
      logger.info(`WhatsApp Official send process start`, { spid, from, timestamp: new Date() });
      
      let response = await middleWare.sendDefultMsg(media, text, getMediaType, phone_number_id, from,spid);
      
      logger.info(`WhatsApp Official send process end`, { spid, from, timestamp: new Date(), responseStatus: response?.status });
      return response;
      
    } else if (channelType == 'WhatsApp Web' || channelType == 2 || channelType == 'WA Web') {
      let clientReady = await isClientActive(spid);

      if (clientReady.status) {
        logger.info(`WhatsApp Web send process start`, { spid, from, timestamp: new Date() });
        
        let response ='' //await middleWare.postDataToAPI(spid, from, getMediaType, text, media);
        logger.info(`WhatsApp Web send process end`, { spid, from, responseStatus: response?.status, timestamp: new Date() });
        
        return response;
      } else {
        logger.warn(`Client is not active for WhatsApp Web`, { spid, timestamp: new Date() });
        return { status: 404 };
      }
    }
  } catch (err) {
    logger.error(`Error in messageThroughselectedchannel ${err}`);
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





function isWorkingTime(starthour, endhour , workDays,spid) {

    // Check if starthour, endhour, and workDays are provided and not null
    if (!starthour || !endhour || !workDays) {

      console.log("Error: Missing required parameters. Please check starthour, endhour, or workDays.",starthour, endhour , workDays,spid);
      return false;
    }

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  let datetime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });

  // for (const item of data) {
    const workingDays = workDays.split(',');
    const date = new Date(datetime).getHours();
    const getMin = new Date(datetime).getMinutes();

    const start_time = (starthour).replace(/\s*(AM|PM)/, "");
    const end_time = (endhour).replace(/\s*(AM|PM)/, "");
    const startTime = start_time.split(':');
    const endTime = end_time.split(':');
//console.log("starthour, endhour , workDays",starthour, endhour , workDays)
    if (workingDays.includes(currentDay) && (((startTime[0] < date) || (date === startTime[0] && startTime[1] <= getMin)) && ((endTime[0] > date) || ((endTime[1] === getMin) && (endTime[1] >= getMin))))) {
      //console.log("data===========",spid)
      return true;
    }



  //}

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