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
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

var insertMessageQuery = "INSERT INTO Message (SPID,Type,ExternalMessageId, interaction_id, Agent_id, message_direction,message_text,message_media,media_type,Message_template_id,Quick_reply_id,created_at,updated_at,system_message_type_id) VALUES ?"




async function NoCustomerReplyReminder() {
  let defaultMessage = await db.excuteQuery(settingVal.CustomerReplyReminder, [])
 // console.log("NoCustomerReplyReminder" +defaultMessage.length)
  if (defaultMessage?.length > 0) {
    for (const message of defaultMessage) {

  
      try {

        let data = await db.excuteQuery(settingVal.selectdefaultMsgQuery, ['No Customer Reply Reminder',message.SP_ID])
        if (data.length > 0) {

          //let sendDefult = await sendDefultMsg(data[0].link, data[0].value, data[0].message_type, 101714466262650, message.customer_phone_number)
          let message_text =await getExtraxtedMessage(data.value)
          messageThroughselectedchannel(message.SPID,message.customer_phone_number,data.message_type,message_text,data.link,'211544555367892',msg.channel)
          let myUTCString = new Date().toUTCString();
          const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
          let updateSmsRes = await db.excuteQuery(settingVal.systemMsgQuery, [5, currenttime, message.Message_id]);
    
         let messageValu=[[message.SPID,message.Type,"211544555367892",message.interaction_id,message.Agent_id, 'out',data[0].value,data[0].link,data[0].message_type,"","",currenttime,currenttime,5]]
         let insertedMessage=await db.excuteQuery(insertMessageQuery,[messageValu])
        }
      } catch (error) {

        console.error(`Error sending message to ${message}.`, error.message);
      }

    }
  }
}

let systemMsgQuery=`SELECT
ic.interaction_status,
ic.InteractionId,
ic.customerId,
ec.channel,
ec.phone_number AS customer_phone_number,
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
AND latestmsg.updated_at <= DATE_SUB(NOW(), INTERVAL dm.autoreply MINUTE);
`


async function NoCustomerReplyTimeout() {
  try {
   
    let CustomerReplyTimeout = await db.excuteQuery(systemMsgQuery, [])  //settingVal.noCustomerRqplyTimeOut
    console.log("NoCustomerReplyTimeout" + CustomerReplyTimeout)
    if (CustomerReplyTimeout.length > 0) {
      
   
      for (const msg of CustomerReplyTimeout) {
        //let sendDefult = await sendDefultMsg(msg.link, msg.value, msg.message_type, 101714466262650, msg.customer_phone_number)
        let message_text =await getExtraxtedMessage(msg.value)
        messageThroughselectedchannel(msg.SPID,msg.customer_phone_number,msg.message_type,message_text,msg.link,'211544555367892',msg.channel)
        
        let myUTCString = new Date().toUTCString();
        const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let updateSmsRes = await db.excuteQuery(settingVal.systemMsgQuery, [6, currenttime, msg.Message_id]);
    
        let messageValu=[[msg.SPID,msg.Type,"211544555367892",msg.interaction_id,msg.Agent_id, 'out',msg.value,msg.link,msg.message_type,"","",currenttime,currenttime,6]]
         let insertedMessage=await db.excuteQuery(insertMessageQuery,[messageValu])
        let closeInteraction=await db.excuteQuery(`UPDATE Interaction SET interaction_status='' WHERE InteractionId=${msg.InteractionId}`,[]);
      }
    }
  } catch (error) {

    console.error(`Error sending message to `, error);

  }
}



async function NoAgentReplyTimeOut() {
  try {

    let noAgentReplydata = await db.excuteQuery(settingVal.noAgentReply, [])
  //  console.log("NoAgentReplyTimeOut" ,noAgentReplydata)
    if (noAgentReplydata.length > 0) {
    //  console.log("NoAgentReplyTimeOut" +noAgentReplydata.length)
      for (const msg of noAgentReplydata) {
        let isWorkingTime = await workingHoursDetails(msg.SP_ID);
     //   console.log("isWorkingTime"  ,isWorkingTime)
        if (isWorkingTime === true) {
      //    console.log("time out working hour")
          //let sendDefult = await sendDefultMsg(msg.link, msg.value, msg.message_type, 101714466262650, msg.customer_phone_number)
          let message_text =await getExtraxtedMessage(msg.value)
          messageThroughselectedchannel(msg.SPID,msg.customer_phone_number,msg.message_type,message_text,msg.link,'211544555367892',msg.channel)
          let myUTCString = new Date().toUTCString();
          const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
          let messageValu=[[msg.SPID,msg.Type,"211544555367892",msg.interaction_id,msg.Agent_id, 'out',msg.value,msg.link,msg.message_type,"","",currenttime,currenttime,4]]
          let insertedMessage=await db.excuteQuery(insertMessageQuery,[messageValu])
          let updateSmsRes = await db.excuteQuery(settingVal.systemMsgQuery, [4, currenttime, msg.Message_id]);
      
        }
      }
    }
  } catch (error) {

    console.error(`Error sending message to `, error);
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
      console.error('Error:', error.message);
      reject(error.message); // Reject with the error
    }
  });


}


async function messageThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType) {
  //console.log("spid, from, type, text, media, phone_number_id, channelType")
  console.log(spid, from, type, phone_number_id, channelType)
  try{
    if (channelType == 'WhatsApp Official' || channelType == 1) {

      let respose = await middleWare.sendDefultMsg(media, text, type, phone_number_id, from);
      return respose;
    } if (channelType == 'WhatsApp Web' || channelType == 2) {
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
}catch(err){
  console.log(" err middleware -----" ,err)
}
}



async function getExtraxtedMessage(message_text) {
  try {
    let content = await removeTags.removeTagsFromMessages(message_text);
    // Parse the message template to get placeholders
    const placeholders = parseMessageTemplate(content);
    if (placeholders.length > 0) {
      // Construct a dynamic SQL query based on the placeholders
      console.log(placeholders)
      const results = await removeTags.getDefaultAttribue(placeholders, SPID, customerId);
      console.log("results", results)

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


  for (const item of data) {
    const workingDays = item.working_days.split(',');
    const date = new Date().getHours();
    const getMin = new Date().getMinutes();
 
    const start_time = (item.start_time).replace(/\s*(AM|PM)/, "");
    const end_time = (item.end_time).replace(/\s*(AM|PM)/, "");
    const startTime = start_time.split(':');
    const endTime = end_time.split(':');
 
    if (workingDays.includes(currentDay) && (((startTime[0] < date) || (date === startTime[0] && startTime[1] <= getMin)) && ((endTime[0] > date) || ((endTime[1] === getMin) && (endTime[1] >= getMin))))) {
      console.log("data===========")
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

    console.log('It is currently  within working hours.');
    return true;
  }
  console.log('It is currently not within working hours.');
  return false;
}

cron.schedule('*/5 * * * *', async () => {
  console.log('Running scheduled task...');
  NoCustomerReplyReminder();  // system_message_type_id  = 5
  NoCustomerReplyTimeout();     // system_message_type_id  = 6
  NoAgentReplyTimeOut();         // system_message_type_id = 4

});

app.listen(3006, () => {
  console.log("defaultMessage scheduler  is listening on port 3006");
});