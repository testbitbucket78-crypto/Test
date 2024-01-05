const cron = require('node-cron');
const db = require('../dbhelper');
var express = require("express");
var app = express();
const val = require('./constant');
const middleWare = require('./funnelMiddleWare')
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));



async function ScheduledFunnels() {
  try {

    var funnelData = await db.excuteQuery(`select * from Funnel where status=1 and is_deleted != 1`, [])

    for (const funnel of funnelData) {
      let contactList = await subscribers(funnel);
      // console.log(contactList) 
      funnelMessages(funnel, contactList)

    }

  } catch (err) {
    console.log(err)
  }

}





async function funnelMessages(funnel, contactList) {
  try {
    let messageQuery = 'select * from FunnelMessages where  FunnelId=?  and sp_id=? and isDeleted !=1';
    let messages = await db.excuteQuery(messageQuery, [funnel.FunnelId, funnel.sp_id]);



    for (let i = 0; i < messages.length; i++) {
      console.log(isScheduledTime(messages[i]), '1')

      if (isScheduledTime(messages[i])) {

        IsSubscriberCreated(messages[i], contactList, i ,funnel.channel_id)
      }
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


async function subscribers(funnel) {
  let sendFunnel = await db.excuteQuery(val.funnelById, [funnel.FunnelId, funnel.sp_id])
  let csvContact = [];
  if (sendFunnel[0]?.csv_contacts?.length > 0) {
    const dataArray = JSON.parse(sendFunnel[0].csv_contacts);
    const phoneNumbersArray = dataArray.map(dataObject => dataObject.Phone_number);
    csvContact = csvContact.concat(phoneNumbersArray);
  }

  if (sendFunnel[0]?.segments_contacts?.length > 0) {
    let listnumber = await infoOfcontactList(sendFunnel[0].segments_contacts);
    csvContact = csvContact.concat(listnumber.map(rowDataPacket => rowDataPacket.Phone_number));

  }


  if (sendFunnel[0]?.new_contact?.length > 0) {
    console.log("new_contact")
    let newContactNumber = await infoOfNewContact(sendFunnel[0].new_contact);
    csvContact = csvContact.concat(newContactNumber.map(rowDataPacket => rowDataPacket.Phone_number));


  }
  if (sendFunnel[0]?.attribute_update?.length > 0) {
    console.log("attribute_update")
    let updateContactNumber = await infoOfUpdatedContact(sendFunnel[0].attribute_update);
    csvContact = csvContact.concat(updateContactNumber.map(rowDataPacket => rowDataPacket.Phone_number));
  }
  let uniqueArray = [...new Set(csvContact)];
  return uniqueArray;
}


async function infoOfcontactList(contactList) {
  try {
    let query = 'Select Phone_number from EndCustomer where customerId IN (?)'

    let listedPhone = await db.excuteQuery(query, [JSON.parse(contactList)]);

    return listedPhone;
  } catch (err) {
    contactList
    console.log(err);
  }
}


async function infoOfNewContact(contactList) {
  try {
    let newContactPhone = await db.excuteQuery(contactList, []);
    return newContactPhone;
  } catch (err) {
    console.log(err);
  }
}


async function infoOfUpdatedContact(contactList) {
  try {
    let newContactPhone = await db.excuteQuery(contactList, []);
    return newContactPhone;
  } catch (err) {
    console.log(err);
  }
}





async function IsSubscriberCreated(funnel, contactArray, index ,channel_id) {
  try {

    let daysQuery = 'select day from FunnelDays where  FunnelId=? and Message_id=? and isDeleted !=1 and sp_id=?'
    let scheduledDays = await db.excuteQuery(daysQuery, [funnel.FunnelId, funnel.Message_id, funnel.sp_id]);

    // Extract values of the 'day' property and store in a new array
    const extractedDays = scheduledDays.map(row => row.day);

    if (areWorkingDays(extractedDays)) {
      for (let i = 0; i < contactArray.length; i++) {
        let query = 'Select  created_at from EndCustomer where Phone_number =? and isDeleted != 1 and SP_ID=3'
        let createdTime = await db.excuteQuery(query, [contactArray[i]]);


        // Assuming createdTime is an array with a property scheduled_min
        const scheduledMinutes = parseInt(funnel.scheduled_min, 10); // Parse the string to an integer

        // Assuming Message is an array with a property created_at
        const messageCreatedAtString = createdTime[0]?.created_at;

        // Convert the string to a Date object
        const messageCreatedAt = new Date(messageCreatedAtString);

        // Find the next time (e.g., scheduledMinutes minutes later)
        const nextTime = new Date(messageCreatedAt.getTime() + scheduledMinutes * 60 * 1000); // Add scheduledMinutes minutes in milliseconds

        // Get the timestamp of the next time
        const nextTimestamp = nextTime.getTime();
        
        if (!contactArray[i].includes('@g.us')) {
          let sendedmessage = await track_sendedFunnel(funnel, contactArray[i])
          if (sendedmessage != '') {
            sendFirstMessage(funnel, contactArray[i] ,nextTimestamp,index+1 ,channel_id);
          } else if (index > sendedmessage) {
            sendOtherMessages(funnel, contactArray[i],nextTimestamp,index+1 ,channel_id);
          }

        }
        // console.log(contactArray[i].includes('@g.us'),nextTimestamp <= new Date(), i, new Date(nextTimestamp));
      }
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


async function sendFirstMessage(funnel, contact,next_messageTime,messageNo,channel_id) {
  try {
    console.log("First message")
    sendMessage(funnel,contact,next_messageTime,messageNo,channel_id);
  } catch (err) {
    console.log(err);
  }
}



async function sendOtherMessages(funnel , contact ,next_messageTime,messageNo,channel_id) {
  try {
     sendMessage(funnel,contact,next_messageTime,messageNo,channel_id)
    console.log("2nd Message")
  } catch (err) {
    console.log(err);
  }
}


async function sendMessage(funnel,contact,next_messageTime,messageNo,channel_id) {
  try {
    let response = await messageThroughselectedchannel(funnel.sp_id,contact, 'text', funnel.message_content, funnel.message_media, 'phone_number_id', channel_id);
    console.log("response", JSON.stringify(response.status))
    saveFunnelSendedMessage(funnel.message_content, contact, 'status_message', response.status, next_messageTime, messageNo)
  } catch (err) {
    console.log(err);
  }
}

async function track_sendedFunnel(funnel, phone_number) {
  try {
    let sendedmsgQuery = 'SELECT MAX(messageNo) AS max_messageNo FROM FunnelSendedMessage where Message_id=? and FunnelId=? and phone_number=? and sp_id=?';
    let maxMessage = await db.excuteQuery(sendedmsgQuery, [funnel.Message_id, funnel.FunnelId, phone_number, funnel.sp_id]);

    console.log(maxMessage)
    return maxMessage;

  } catch (err) {
    console.log(err);
  }
}
async function updateMessage() {
  try {
    let sendedmsgQuery = 'update FunnelSendedMessage  set next_messageTime=?,messageNo=? where Message_id=? and FunnelId=? and phone_number=? and sp_id=?';
    let maxMessage = await db.excuteQuery(sendedmsgQuery, [Message_id, FunnelId, phone_number, sp_id]);

    console.log(maxMessage)

  } catch (err) {
    console.log(err);
  }
}


async function saveFunnelSendedMessage(msg, phone, status_message, status, next_messageTime, messageNo) {
  try {
    var status = 0
    if (response == 200) {
      status = 1;
    }
    let funnalQuery = 'Insert into FunnelSendedMessage(Message_id,FunnelId,phone_number,message_content,message_media,message_heading,button_yes,button_exp,button_no,status_message,status,next_messageTime,messageNo,sp_id,created_at) values ?';
    let values = [[msg.Message_id, msg.FunnelId, phone, msg.message_content, msg.message_media, msg.message_heading, msg.button_yes, msg.button_exp, msg.button_no, status_message, status, next_messageTime, messageNo, msg.sp_id, new Date()]]
    let savemessage = await db.excuteQuery(funnalQuery, [values])
  } catch (err) {

  }

}


//_________________________COMMON METHOD FOR SEND MESSAGE___________________________//

async function messageThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType) {
  // console.log("messageThroughselectedchannel", spid, from, type, channelType,web.isActiveSpidClient(spid))
  if (channelType == 'WhatsApp Official' || channelType == 1) {

    let respose = await middleWare.sendDefultMsg(media, text, type, phone_number_id, from);
    return respose;
  } if (channelType == 'WhatsApp Web' || channelType == 2) {

    let response = await middleWare.postDataToAPI(spid, from, type, text, media)
    console.log("response", JSON.stringify(response.status))
    return response;


  }
}

cron.schedule('*/5 * * * *', async () => {
  console.log('Running scheduled task...');
  ScheduledFunnels()


});

app.listen(3012, () => {
  console.log("Campaign scheduler  is listening on port 3008");
});