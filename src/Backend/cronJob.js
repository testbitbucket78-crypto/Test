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


    const currentDate = new Date();

    const currentDay = currentDate.getDay();

    let i = 0;
    for (const message of messagesData) {
      console.log("index of i ", messagesData.length, i + 1)
      let campaignTime = await getCampTime(message.sp_id)
    
      if (isWorkingTime(campaignTime)) {
        console.log(" isWorkingTime messagesData loop",)
        if (new Date(message.start_datetime) < new Date()) {
          const phoneNumber = message.segments_contacts.length > 0 ? mapPhoneNumberfomList(message) : mapPhoneNumberfomCSV(message);

        }
      } else {
        remaingMessage.push(message);
      }

    }

    for (const message of remaingMessage) {

      console.log("remaingMessage loop",)
      let campaignTime = await getCampTime(message.sp_id)
      if (isWorkingTime(campaignTime)) {
        console.log("remaingMessage  isWorkingTime loop",)
        if (isWithinTimeWindow(message.start_datetime)) {
          console.log("remaingMessage  start_datetime loop",)
          const phoneNumber = message.segments_contacts.length > 0 ? mapPhoneNumberfomList(message) : mapPhoneNumberfomCSV(message);

        }
      }


    }
  } catch (err) {
    console.log(err)
  }

}


async function sendMessages(phoneNumber, message, id, campaign, response) {
  try {
    var status = 0
    if (response == 'Message Sent') {
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
  var inserQuery = "INSERT INTO CampaignMessages (phone_number,button_yes,button_no,button_exp,message_media,message_content,message_heading,CampaignId,schedule_datetime,status_message,status) values ?";
  let saveMessage = await db.excuteQuery(inserQuery, [[[MessageBodyData.phone_number, MessageBodyData.button_yes, MessageBodyData.button_no, MessageBodyData.button_exp, MessageBodyData.message_media, MessageBodyData.message_content, MessageBodyData.message_heading, MessageBodyData.CampaignId, MessageBodyData.schedule_datetime, MessageBodyData.status_message, MessageBodyData.status]]])
}


async function mapPhoneNumberfomCSV(message) {
  // Map the values to customer IDs
  console.log("mapPhoneNumberfomCSV")
  var contacts = JSON.parse(message.csv_contacts);
  var type = 'image';
  if (alert.message_media == null || alert.message_media == "") {
    type = 'text';
  }

  batchofScheduledCampaign(contacts, message.sp_id, type, message.message_content, message.message_media, message.phone_number_id, message.channel_id, message)



}

async function mapPhoneNumberfomList(message) {
  // Map the values to customer IDs


  var dataArray = JSON.parse(message.segments_contacts);
  var type = 'image';
  if (message.message_media == null || message.message_media == "") {
    type = 'text';
  }


  let Query = "SELECT * from EndCustomer  where customerId IN ? and isDeleted != 1"

  let phoneNo = await db.excuteQuery(Query, [[dataArray]]);
  console.log("phoneNo.length", phoneNo.length)
  batchofScheduledCampaign(phoneNo, message.sp_id, type, message.message_content, message.message_media, message.phone_number_id, message.channel_id, message)


}

async function getCampTime(spid) {
  var CampaignTimings = await db.excuteQuery(`select * from CampaignTimings where sp_id=? and isDeleted != 1`, [spid]);

  return CampaignTimings;
}


async function batchofScheduledCampaign(users, sp_id, type, message_content, message_media, phone_number_id, channel_id, message) {

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    console.log("batch i", i, batch.length)
    sendScheduledCampaign(batch, sp_id, type, message_content, message_media, phone_number_id, channel_id, message)

    if (i + batchSize < users.length) {
      setTimeout(() => {
        batchofScheduledCampaign(users.slice(i + batchSize), sp_id, type, message_content, message_media, phone_number_id, channel_id, message);
      }, delayBetweenBatches);
    }
  }

  let updateQuery = `UPDATE Campaign SET status=2,updated_at=? where Id=?`;
  let updatedStatus = await db.excuteQuery(updateQuery, [new Date(), message.Id])
}


function sendScheduledCampaign(batch, sp_id, type, message_content, message_media, phone_number_id, channel_id, message) {
  console.log("sendScheduledCampaign")
  for (var i = 0; i < batch.length; i++) {
    let Phone_number = batch[i].Phone_number

    var response;
    setTimeout(() => {
      response = messageThroughselectedchannel(sp_id, Phone_number, type, message_content, message_media, phone_number_id, channel_id);
      console.log("response", response)
    }, 10)
    sendMessages(Phone_number, message.message_content, message.Id, message, response)
  }
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








async function campaignAlerts() {
  try {
    console.log("campaignAlerts")
    let query = `select * from Campaign where  is_deleted != 1 limit 1`;
    let campaign = await db.excuteQuery(query, []);
    let alertUser = `select c.uid,u.* from CampaignAlerts c
JOIN user u ON u.uid=c.uid
 where c.SP_ID=? and c.isDeleted !=1 `;


    for (let alert of campaign) {
      console.log("alert")

      let user = await db.excuteQuery(alertUser, [alert.sp_id]);

      let message = await msg(alert)
      var type = 'image';
      if (alert.message_media == null || alert.message_media == "") {
        type = 'text';
      }

      batchofAlertUsers(user, alert.sp_id, type, message, alert.message_media, '101714466262650', alert.channel_id)

    }

  }
  catch (err) {

    console.log(err)
    db.errlog(err);

  }
}



async function batchofAlertUsers(users, sp_id, type, message_content, message_media, phone_number_id, channel_id) {

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    sendBatchMessage(batch, sp_id, type, message_content, message_media, phone_number_id, channel_id)

    if (i + batchSize < users.length) {
      setTimeout(() => {
        batchofAlertUsers(users.slice(i + batchSize), sp_id, type, message_content, message_media, phone_number_id, channel_id);
      }, delayBetweenBatches);
    }
  }
}


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

//___________________CAMPAIGN ALERT MESSAGE ON THE BASIS OF FILTERD STATUS _____________________________//

async function msg(alert) {
  let message = ''

  let msgStatus = await find_message_status(alert)


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









//_________________________COMMON METHOD FOR SEND MESSAGE___________________________//

async function messageThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType) {

  if (channelType == 'WhatsApp Official' || channelType == 1) {

    middleWare.sendDefultMsg(media, text, type, phone_number_id, from);
  } if (channelType == 'WhatsApp Web' || channelType == 2) {

    let result = middleWare.postDataToAPI(spid, from, type, text, media)
    return result;
  }
}


cron.schedule('*/5 * * * *', async () => {
  console.log('Running scheduled task...');

  fetchScheduledMessages();
   campaignAlerts()

});

app.listen(3008, () => {
  console.log("Campaign scheduler  is listening on port 3008");
});