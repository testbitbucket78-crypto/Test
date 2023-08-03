const cron = require('node-cron');
const db = require('./dbhelper')
const val=require('./Authentication/constant')
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
     var messagesData = await db.excuteQuery(`select * from CampaignMessages where status=0`, [])
     console.log("messagesData")
     for (const message of messagesData) {
     
        if (isWithinTimeWindow(message.schedule_datetime)) {
          try {
            const response = await getTextMessageInput(message.phone_number, message.message_content);
            sendMessage(response)
           // console.log(`Message sent to ${message.phone_number}. Response:`, response);
          } catch (error) {
            console.error(`Error sending message to ${message.phone_number}.`, error.message);
          }
       }
      }
   // var data = getTextMessageInput('918130818921', 'in one minute');

    // sendMessage(data)
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
            "body": "Testing of node-cron  : " + text
        }

    });
}

cron.schedule('*/5 * * * *', async () => {
    console.log('Running scheduled task...');
  
    fetchScheduledMessages();
   
});