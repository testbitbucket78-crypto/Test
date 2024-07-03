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


async function selectMessage() {
    let sendedMessage = await db.excuteQuery(`select * from FunnelSendedMessage where status = '-1'`, []);
    for (let message of sendedMessage) {
       // console.log(message)
        //console.log( message.next_messageTime, new Date(),message.next_messageTime <= new Date() ,"message.next_messageTime <= new Date()")
        if (message.next_messageTime <= new Date()) {
            console.log(message.next_messageTime <= new Date() ,"message.next_messageTime <= new Date()")
            funnelMessages(message)
        }
    }
}


async function funnelMessages(funnel) {
    try {
        let messageQuery = 'select * from FunnelMessages where  FunnelId=?  and sp_id=?  and Message_id=? and isDeleted !=1';
        let messages = await db.excuteQuery(messageQuery, [funnel.FunnelId, funnel.sp_id, funnel.Message_id]);


        if (isScheduledTime(messages)) {
console.log("messagesfunnel")
            IsSubscriberCreated(funnel)
        }


    } catch (err) {
        console.log(err)
    }
}

async function isScheduledTime(item) {
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
}



async function IsSubscriberCreated(funnel) {
    try {
        let daysQuery = 'SELECT day FROM FunnelDays WHERE FunnelId=? AND Message_id=? AND isDeleted != 1 AND sp_id=?';
        let scheduledDays = await db.excuteQuery(daysQuery, [funnel.FunnelId, funnel.Message_id, funnel.sp_id]);

        // Extract values of the 'day' property and store in a new array
        const extractedDays = scheduledDays.map(row => row.day);

        if (areWorkingDays(extractedDays)) {
            console.log("")
            console.log("workinghgfgghd")
            sendMessage(funnel)
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

async function sendMessage(funnel) {
    try {


        let response = await messageThroughselectedchannel(funnel.sp_id, funnel.phone_number, 'text', funnel.message_content, funnel.message_media, 'phone_number_id', funnel.channel);
        console.log("response", JSON.stringify(response.status))
        updateSendedStatus(funnel, response.status)
    } catch (err) {
        console.log(err);
    }
}

async function updateSendedStatus(funnel, status) {
    try {
        let updatedStatus = await db.excuteQuery(`UPDATE FunnelSendedMessage SET status =${status} where id=${funnel.id}`, [])
        console.log(updatedStatus)
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
    console.log("messageThroughselectedchannel", spid, from, type, channelType);

    try {
        console.log("isActiveSpidClient result:", webjs.isActiveSpidClient(spid));

        if (channelType == 'WhatsApp Official' || channelType == 1) {
            let response = await middleWare.sendDefultMsg(media, text, type, phone_number_id, from);
            return response;
        } else if (channelType == 'WhatsApp Web' || channelType == 2) {
            // if (webjs.isActiveSpidClient(spid)) {
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
    } catch (error) {
        console.error("Error in messageThroughselectedchannel:", error);
        return { status: 500, error: "Internal Server Error" };
    }
}


cron.schedule('*/2 * * * *', async () => {
    console.log('Running scheduled task...');
    selectMessage()
});

app.listen(3013, () => {
    console.log("funnel scheduler  is listening on port 3013");
});