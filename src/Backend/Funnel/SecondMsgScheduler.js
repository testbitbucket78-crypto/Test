const cron = require('node-cron');
const db = require('../dbhelper');
var express = require("express");
var app = express();
const val = require('./constant');
const webjs = require('../webJS/web')
const middleWare = require('./funnelMiddleWare')
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

let query=`SELECT
phone_number,
MAX(messageNo) AS messageNo,
MAX(id) AS id,
MAX(Message_id) AS Message_id,
MAX(FunnelId) AS FunnelId,
MAX(message_content) AS message_content,
MAX(message_media) AS message_media,
MAX(message_heading) AS message_heading,
MAX(button_yes) AS button_yes,
MAX(button_exp) AS button_exp,
MAX(button_no) AS button_no,
MAX(status_message) AS status_message,
MAX(status) AS status,
MAX(schedule_datetime) AS schedule_datetime,
MAX(sp_id) AS sp_id,
MAX(isDeleted) AS isDeleted,
MAX(next_messageTime) AS next_messageTime,
MAX(channel) AS channel
FROM FunnelSendedMessage
GROUP BY phone_number;`

async function selectMessage() {
    let sendedMessage = await db.excuteQuery(query, []);

    for (let message of sendedMessage) {

       if (message.next_messageTime <= new Date()) {

            funnelMessages(message)
        }
    }
}

async function funnelMessages(funnel) {
    try {
        let messageQuery = 'select * from FunnelMessages where  FunnelId=?  and sp_id=? and Message_id=? and isDeleted !=1';

        let messages = await db.excuteQuery(messageQuery, [funnel.FunnelId, funnel.sp_id, funnel.messageNo + 1]);

        if (messages?.length) {
            let nextTime = new Date(funnel.next_messageTime);   // created_at = updated_at in addition time


            const ScheduledMinutes = parseInt(messages[0]?.scheduled_min, 10);
            const secondNextTime = new Date(nextTime.getTime() + ScheduledMinutes * 60 * 1000);

            // Set the next timestamp for sending the second message
            const secondNextTimestamp = secondNextTime.getTime();
            let next_messageTime = new Date(secondNextTimestamp);



          
            console.log("next_messageTime <= new Date()"  ,next_messageTime <= new Date())
            if(next_messageTime <= new Date()){
               
            if (isScheduledTime(messages[0])) {
                console.log("messagesfunnel")
                IsSubscriberCreated(funnel ,messages[0],next_messageTime)
            }}

        }
    } catch (err) {
        console.log(err)
    }
}



async function saveFunnelSendedMessage(msg, phoneNo, next_messageTime, messageNo, channel) {
    try {
        let funnalQuery = 'Insert into FunnelSendedMessage(Message_id,FunnelId,phone_number,message_content,message_media,message_heading,button_yes,button_exp,button_no,next_messageTime,messageNo,sp_id,created_at,channel) values ?';
        let values = [[msg.Message_id, msg.FunnelId, phoneNo, msg.message_content, msg.message_media, msg.message_heading, msg.button_yes, msg.button_exp, msg.button_no, next_messageTime, messageNo, msg.sp_id, new Date(), channel]]
        let savemessage = await db.excuteQuery(funnalQuery, [values])

    } catch (err) {

        console.log(err)
    }

}

async function isScheduledTime(item) {
    try{
       // console.log("item"   ,item)
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();


    const startTime = item.start_time.split(':');
    const endTime = item.end_time.split(':');

    const startHour = parseInt(startTime[0]);
    const startMinute = parseInt(startTime[1]);
    const endHour = parseInt(endTime[0]);
    const endMinute = parseInt(endTime[1]);

    if (
        (currentHour > startHour ||
            (currentHour === startHour && currentMinute >= startMinute)) &&
        (currentHour < endHour ||
            (currentHour === endHour && currentMinute <= endMinute))
    ) {
        return true;
    }

    return false;
}catch(err){
    console.log("scheduled days");
    console.log(err)
}
}



async function IsSubscriberCreated(funnel,messages,next_messageTime) {
    try {
        let daysQuery = 'SELECT day FROM FunnelDays WHERE FunnelId=? AND Message_id=? AND isDeleted != 1 AND sp_id=?';
        let scheduledDays = await db.excuteQuery(daysQuery, [messages.FunnelId, messages.Message_id, messages.sp_id]);
console.log(scheduledDays ,messages.FunnelId, messages.Message_id, messages.sp_id)
        // Extract values of the 'day' property and store in a new array
        const extractedDays = scheduledDays.map(row => row.day);

        if (areWorkingDays(extractedDays)) {
            saveFunnelSendedMessage(messages, funnel.phone_number, next_messageTime, funnel.messageNo + 1, funnel.channel);
            sendMessage(funnel,messages)

        }
    } catch (err) {
        console.log(err);
    }
}

function areWorkingDays(days) {
    // Assuming 'days' is an array of strings, e.g., ['Monday', 'Tuesday', 'Wednesday']
    const workingDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // Convert the input days to lowercase for case-insensitive comparison
    const normalizedDays = days.map(day => day.toLowerCase());

    const lowercaseWorkingDays = workingDays.map(day => day.toLowerCase());

    // Check if all normalized days are in the array of working days
    const allWorkingDays = normalizedDays.every(day => lowercaseWorkingDays.includes(day));

    return allWorkingDays;
}

async function sendMessage(funnel,messages) {
    try {
console.log(funnel.sp_id, funnel.phone_number, messages.message_content, messages.message_media, funnel.channel)

        let response = await messageThroughselectedchannel(funnel.sp_id, funnel.phone_number, 'text', messages.message_content, messages.message_media, 'phone_number_id', funnel.channel);
        console.log("response", JSON.stringify(response.status))
        updateSendedStatus(funnel, response.status)
    } catch (err) {
        console.log(err);
    }
}

async function updateSendedStatus(funnel, status) {
    try {
        let updatedStatus = await db.excuteQuery(`UPDATE FunnelSendedMessage SET status =${status} where id=${funnel.id}`, [])
        console.log("_____________________" ,updatedStatus)
    } catch (err) {
        console.log(" Err ")
    }
}

async function isClientActive(spid) {

    return new Promise(async (resolve, reject) => {
        try {

            const apiUrl = 'https://waweb.sampanatechnologies.com/IsClientReady'; // Replace with your API endpoint
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

async function messageThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType) {
    console.log("messageThroughselectedchannel", spid, from, type, text, media, phone_number_id, channelType);

    try {
       // console.log("isActiveSpidClient result:", webjs.isActiveSpidClient(spid));

        if (channelType == 'WhatsApp Official' || channelType == 1) {
            let response = await middleWare.sendDefultMsg(media, text, type, phone_number_id, from);
            return response;
        } else if (channelType == 'WhatsApp Web' || channelType == 2) {
            // if (webjs.isActiveSpidClient(spid)) {
            let clientReady = await isClientActive(spid);
            if (clientReady.status) {
                let response = await middleWare.postDataToAPI(spid, from, type, text, media);
               // console.log("response", JSON.stringify(response.status));
                return response;
            }

            else {
              //  console.log("isActiveSpidClient returned false for WhatsApp Web");
                return { status: 404 };
            }
        }
    } catch (error) {
        console.error("Error in messageThroughselectedchannel:", error);
        return { status: 500, error: "Internal Server Error" };
    }
}


cron.schedule('*/2 * * * *', async () => {
    console.log('Running scheduled task...');
    selectMessage()
});

app.listen(3012, () => {
    console.log("funnel scheduler  is listening on port 3012");
});