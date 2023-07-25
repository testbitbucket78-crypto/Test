const cron = require('node-cron');
const db = require('./dbhelper')
const val=require('../Backend/Authentication/constant')
var axios = require('axios');
var express = require("express");
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

async function fetchScheduledMessages() {
    // let result = await db.excuteQuery(`select * from CampaignMessages`, [])

    // return result;
    var data = getTextMessageInput('918130818921', 'in one minute');

    sendMessage(data)
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

cron.schedule('* * * * *', async () => {
    console.log('Running scheduled task...');
  
    fetchScheduledMessages();
   
});