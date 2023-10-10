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




// Function to check if the schedule_datetime is within 1-2 minutes from the current time
function isWithinTimeWindow(scheduleDatetime) {
  const currentTime = moment();
  const scheduledTime = moment(scheduleDatetime);
  const diffInMinutes = scheduledTime.diff(currentTime, 'minutes');
  return diffInMinutes >= 0 && diffInMinutes <= 2;
}


async function fetchScheduledMessages() {
  var messagesData = await db.excuteQuery(`select * from Campaign where status=1 and is_deleted != 1`, [])
  var remaingMessage = [];


  const currentDate = new Date();
 
  const currentDay = currentDate.getDay();
 

  for (const message of messagesData) {
  
    let campaignTime = await getCampTime(message.sp_id)
    if (isWorkingTime(campaignTime)) {
      if (new Date(message.start_datetime) < new Date()) {
      
        const phoneNumber = message.segments_contacts.length > 0 ? mapPhoneNumberfomList(message) : mapPhoneNumberfomCSV(message);
   
    
      } else {
        remaingMessage.push(message);
      }
    }
  }

  for (const message of remaingMessage) {
   

    let campaignTime = await getCampTime(message.sp_id)
    if (isWorkingTime(campaignTime)) {
    
      if (isWithinTimeWindow(message.start_datetime)) {
      
        const phoneNumber = message.segments_contacts.length > 0 ? mapPhoneNumberfomList(message) : mapPhoneNumberfomCSV(message);
        
      }
    }

  }


}


async function sendMessages(phoneNumber, message, id, campaign) {
  try {
    let MessageBodyData = {
      phone_number: phoneNumber,
      button_yes: campaign.button_yes,
      button_no: campaign.button_no,
      button_exp: campaign.button_exp,
      message_media: campaign.message_media,
      message_content: campaign.message_content,
      message_heading: this.message_heading,
      CampaignId: campaign.Id,
      schedule_datetime: campaign.start_datetime

    }

    const response = getTextMessageInput(phoneNumber, message);
    sendMessage(response)
    // Status Update
    let updateQuery = `UPDATE Campaign SET status=2,updated_at=? where Id=?`;
    let updatedStatus = await db.excuteQuery(updateQuery, [new Date(), id])
    console.log(`Message sent to ${phoneNumber}. Response:`, response);
    MessageBodyData['status_message'] = 'Message Sent';
    MessageBodyData['status'] = 1
   
    saveSendedMessage(MessageBodyData)
  } catch (error) {
    // console.error(`Error sending message to ${phoneNumber}.`, error.message);
    MessageBodyData['status_message'] = error.message
    MessageBodyData['status'] = 0;
 
    saveSendedMessage(MessageBodyData)
  }

}

async function saveSendedMessage(MessageBodyData) {
  var inserQuery = "INSERT INTO CampaignMessages (phone_number,button_yes,button_no,button_exp,message_media,message_content,message_heading,CampaignId,schedule_datetime,status_message,status)";
  let saveMessage = await db.excuteQuery(inserQuery, [MessageBodyData])
}


async function mapPhoneNumberfomCSV(message) {
  // Map the values to customer IDs
  console.log("mapPhoneNumberfomCSV")
  var contacts = JSON.parse(message.csv_contacts);

 

  sendMessages(contacts[0].Phone_number, message.message_content, message.Id, message)

}

async function mapPhoneNumberfomList(message) {
  // Map the values to customer IDs
  console.log("mapPhoneNumberfomList")

  var dataArray = JSON.parse(message.segments_contacts);
  for (const number of dataArray) {
  
    let Query = "SELECT * from EndCustomer  where customerId = " + number + " and isDeleted != 1"
  
    let phoneNo = await db.excuteQuery(Query, []);
 
    if (phoneNo.length > 0) {
      sendMessages(phoneNo[0].Phone_number, message.message_content, message.Id, message)
    }
  }
}

async function getCampTime(spid) {
  var CampaignTimings = await db.excuteQuery(`select * from CampaignTimings where sp_id=? and isDeleted != 1`, [spid]);
  
  return CampaignTimings;
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





async function campaignAlerts() {
  try {
    console.log("campaignAlerts")
    let query = `select * from Campaign where  is_deleted != 1`;
    let campaign = await db.excuteQuery(query, []);
    let alertUser = `select c.uid,u.* from CampaignAlerts c
JOIN user u ON u.uid=c.uid
 where c.SP_ID=? and c.isDeleted !=1 `;


    for (let alert of campaign) {
      let user = await db.excuteQuery(alertUser, [alert.sp_id]);
      if (user.length > 0) {
        let phoneNo = user[0].mobile_number;
        let message = await msg(alert)
     
         const response = getTextMessageInput(phoneNo, message);
      
        sendMessage(response)
      }
    }

  }
  catch (err) {

    console.log(err)
     db.errlog(err);
     res.send(err)
  }
}

async function find_message_status(alert){
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
 AND C.sp_id = ? AND C.Id=?
 GROUP BY
 CM.status;`
   let msgStatus = await db.excuteQuery(msgStatusquery, [alert.sp_id, alert.Id]);
   
  for (const item of msgStatus) {
    if (item.status === 1) {
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
  let message = ''

 let msgStatus=await find_message_status(alert)
 

  let audience = alert.segments_contacts.length > 0 ? alert.segments_contacts.length : alert.csv_contacts.length


  if (alert.status == '1') {
    message = `Hi there, your Engagekart Campaign has been Scheduled:
    Campaign Name: `+ alert.title + `
    Scheduled Time: `+ alert.start_datetime + `
    Taget Audience: `+ 'alert.title' + `
    Channel: < `+ 'WhatsApp' + `,` + alert.channel_id + `> 
    Category: `+ alert.category + ` `
  } if (alert.status == '2') {
    message = `Hello, your Engagekart Campaign has Started:
    Campaign Name: `+ alert.title + `
    Taget Audience: <count of target base>
    Channel:< `+ 'WhatsApp' + `,` + alert.channel_id + `>
    Category:`+ alert.category + ` `
  } if (alert.status == '3') {
    message = `Hi, here is the Summary of your finished Engagekart Campaign:
    Campaign Name: `+ alert.title + `
    Taget Audience: <count of target base>
    Channel: <`+ 'WhatsApp' + `,` + alert.channel_id + `>
    Category: `+ alert.category + `
    Sent: ` + msgStatus.Sent + `
    Failed: ` + msgStatus.Failed + `
    For more detailed report, please login to your Engagkart account`
  } if (alert.status == '0') {
    message = `Engagekart Campaign Alert:
    Hi, Please note your Engagekart campaign ` + alert.title + ` has stopped/Paused. Please login to Engagkart account for more details and take further action.`
  }

  return message;
}







function isWorkingTime(data, currentTime) {

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  for (const item of data) {
    const workingDays = item.day.split(',');
    const date = new Date().getHours();
    const getMin = new Date().getMinutes();
  

    const startTime = item.start_time.split(':');
    const endTime = item.end_time.split(':');
  
    if (workingDays.includes(currentDay) && (((startTime[0] < date) || (date === startTime[0] && startTime[1] <= getMin)) && ((endTime[0] > date) || ((endTime[1] === getMin) && (endTime[1] >= getMin))))) {
      console.log("data===========")
      return true;
    }



  }

  return false;
}



cron.schedule('*/5 * * * *', async () => {
  console.log('Running scheduled task...');

  fetchScheduledMessages();
  campaignAlerts()

});

app.listen(3008, () => {
  console.log("Campaign scheduler  is listening on port 3008");
});