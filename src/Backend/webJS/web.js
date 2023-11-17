const express = require('express');
const { request } = require('http');
const app = express();
const { Client, LocalAuth, MessageMedia, Location } = require('whatsapp-web.js');
const puppeteer = require('puppeteer')
//const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "10000kb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10000kb", extended: true }));
const Routing = require('../RoutingRules')
const db = require('../dbhelper')
const awsHelper = require('../awsHelper');
const incommingmsg = require('../IncommingMessages')
const notify = require('../whatsApp/PushNotifications')
const fs = require('fs')
const path = require("path");
let clientSpidMapping = {};


// File path
const filePath = path.join(__dirname, 'IsActiveClient.js');

async function createClientInstance(spid, phoneNo) {
  console.log(spid, phoneNo);

  if (isActiveSpidClient(spid)) {
    console.log("Client found in memory map and is ready");
    return { status: 201, value: 'Client is ready!' };
  }

  var authStr = new LocalAuth({
    clientId: spid
  });

  return new Promise(async (resolve, reject) => {
    try {
      const client = new Client({
        puppeteer: {
          headless: true,
           executablePath: "/usr/bin/google-chrome-stable",
         // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",

        
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage', // <-- add this one
          ],

          takeoverOnConflict: true,
          takeoverTimeoutMs: 10,
        },
        authStrategy: authStr,
      });
      console.log("client created");

      const worker = `${authStr.dataPath}/session-${spid}/Default/Service Worker`;

      if (fs.existsSync(worker)) {

        console.log(worker)
        try {
          //var dir = path.join(__dirname, '.wwebjs_auth');
          fs.rmdirSync(worker, { recursive: true })

        } catch (sessionerr) {
          console.log("Error while deleting old session");
          console.error(sessionerr);
        }

      }

      // Handle client creation errors
      client.on('error', (error) => {
        console.error('Client error:', error);
        notify.NotifyServer(phoneNo, false, 'Client creation failed')
        reject({ status: 500, value: 'Client creation failed' });
      });

      client.on('auth_failure', () => {
        console.log('Client is auth_failure!');
      });

      let inc = 0;
      client.on("qr", (qr) => {
        // Generate and scan this code with your phone
        console.log("QR RECEIVED", qr);
        inc++;
        console.log("inc: " + inc);
        if (inc > 5) {
          console.log("Destroying client..." + client.authStrategy.userDataDir);
          client.destroy();
          notify.NotifyServer(phoneNo, false, 'QR generation timed out. Plese re-open account settings and generate QR code')
          resolve({ status: 400, value: 'QR is expired' });
        }
        notify.NotifyServer(phoneNo, false, qr)
        resolve({ status: 200, value: qr });
      });
      client.on('ready', () => {

        try {
          console.log('Client is ready!');
          notify.NotifyServer(phoneNo, false, 'Client is ready!')
          return resolve({ status: 201, value: 'Client is ready!' });
        } catch (readyerr) {
          console.log("client ready err")
        }
        // }
      });

      client.initialize().catch(_ => _);


      client.on('message', async message => {
        try {
          console.log("inside on message");
          const contact = await message.getContact();
          saveInMessages(message);
        } catch (messageerr) {
          console.log("client message err")
        }
      });

      client.on('authenticated', (session) => {
        try {
          console.log("client authenticated");

          clientSpidMapping[[spid]] = client;

          writeClientFile(clientSpidMapping);    // Call write file function

          notify.NotifyServer(phoneNo, false, 'Client Authenticated')

        } catch (authenticatederr) {
          console.log(authenticatederr)
        }

      });
      client.on('disconnected', (reason) => {
        setTimeout(async () => {
          try {
            console.log("disconnected");

            if (clientSpidMapping.hasOwnProperty(spid)) {
              // console.log(clientSpidMapping[[spid]])
              delete clientSpidMapping[spid];
              writeClientFile(clientSpidMapping);        // Write clean file after disconnect client
              console.log(`Removed ${spid} from clientSpidMapping.`);

            }
            notify.NotifyServer(phoneNo, false, 'Client is disconnected!')

          } catch (error) {
            console.log("disconnect error")

          }
        }, 3000);

      })
      client.on('message_ack', (message, ack) => {

        try {
          if (ack == '1') {
            console.log(`Message has been sent`);
          } else if (ack == '2') {
            console.log(`Message has been delivered`);
          } else if (ack == '3') {
            console.log(`Message has been read`);
          }
          let updatedStatus = saveSendedMessageStatus(ack, message.timestamp, message.to, message.id.id)
        } catch (message_ackErr) {
          console.log(message_ackErr)
        }
      });


    } catch (err) {
      console.log("createClientInstance err");
      console.log(err);
      return ({ status: 500, value: err });
    }
  })


}

function getCircularReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };
}


function writeClientFile(clientSpidMapping) {
  let jsonData = JSON.stringify(clientSpidMapping, getCircularReplacer(), 2);
  jsonData = jsonData + ',';


  // Writing to the file
  fs.writeFile(filePath, jsonData, (err) => {
    if (err) {
      console.error('Error writing to the file:', err);
    } else {
      console.log('File has been written successfully.');
    }
  });
}


function isActiveSpidClient(spid) {

  if (clientSpidMapping[spid]) {
    return true;
  } else {
    return false;
  }
}


async function saveSendedMessageStatus(messageStatus, timestamp, to, id) {
  console.log(timestamp, to, id)
  const phoneNumber = to.replace(/@c\.us$/, "");
  console.log("phoneNumber", phoneNumber)
  // Create a new Date object and multiply the Unix timestamp by 1000 to convert it to milliseconds
  const dateObject = new Date(timestamp * 1000);

  // Format the date as 'YYYY-MM-DD HH:mm:ss'
  const formattedDate = `${dateObject.getFullYear()}-${String(dateObject.getMonth() + 1).padStart(2, '0')}-${String(dateObject.getDate()).padStart(2, '0')} ${String(dateObject.getHours()).padStart(2, '0')}:${String(dateObject.getMinutes()).padStart(2, '0')}:${String(dateObject.getSeconds()).padStart(2, '0')}`;

  console.log(formattedDate);

  let msgIdQuery = `SELECT m.Message_id
  FROM Message m
  LEFT JOIN Interaction i ON m.interaction_id = i.InteractionId
  WHERE m.updated_at = ?`
  //AND i.customerId = (SELECT customerId FROM EndCustomer WHERE Phone_number = ? and isDeleted !=1)`;

  let getMessageId = await db.excuteQuery(msgIdQuery, [formattedDate]);
  console.log("saveSendedMessageStatus", getMessageId)
  if (getMessageId.length > 0) {
    var message_id = getMessageId[0].Message_id;
  }
  console.log(message_id)
  let saveStatus = await db.excuteQuery(`UPDATE Message set msg_status=? ,ExternalMessageId=? where Message_id=?`, [messageStatus, id, message_id])
}

async function sendMessages(spid, endCust, type, text, link, interaction_id, msg_id) {
  try {
    let client = clientSpidMapping[[spid]];
    console.log(spid, endCust, type, interaction_id, msg_id)
    if (client) {
      console.log("if");
      let msg = await sendDifferentMessagesTypes(client, endCust, type, text, link, interaction_id, msg_id);
      console.log("return send msg status")
      return '200';
    } else {
      console.log("else");
      return '401'
    }
  } catch (err) {
    console.log(err)
  }
}

async function sendDifferentMessagesTypes(client, endCust, type, text, link, interaction_id, msg_id) {
  try {
    console.log("messagesTypes", interaction_id, msg_id)
    if (client.info) {
      console.log("client info avilable")
    } else {
      console.log("not avilable")
    }
    if (type === 'text') {
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? where Message_id=?`, [new Date(), msg_id])
      client.sendMessage(endCust + '@c.us', text);
    }
    if (type === 'image') {
      const media = await MessageMedia.fromUrl(link);
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? where Message_id=?`, [new Date(), msg_id])
      client.sendMessage(endCust + '@c.us', media, { caption: text });
    }
    if (type === 'video') {
      const media = await MessageMedia.fromUrl(link);
      // console.log(media.mimetype)
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? where Message_id=?`, [new Date(), msg_id])
      client.sendMessage(endCust + '@c.us', media, { caption: text });

    }
    if (type === 'attachment') {
      const media = new MessageMedia('pdf', link);
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? where Message_id=?`, [new Date(), msg_id])
      client.sendMessage(endCust + '@c.us', media);

    } if (type === 'location') {
      const location = new Location(37.422, -122.084, 'Sampana Digital Private limited');
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? where Message_id=?`, [new Date(), msg_id])
      const msg = await client.sendMessage(endCust + '@c.us', location);
    }
    if (type === 'vcard') {
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? where Message_id=?`, [new Date(), msg_id])
      client.sendMessage(endCust + '@c.us', contat);
    }

  } catch (err) {
    console.log("++++++++++++++++++++++++++++++++++++++++++++")
    console.log(err)
  }
}




async function saveInMessages(message) {
  try {
    let message_text = message.body   //firstMessage
    let from = (message.from).replace(/@c\.us$/, '')   //phoneNo
    let phone_number_id = message.id.id
    let display_phone_number = (message.to).replace(/@c\.us$/, '')
    let message_media = ""           //Type
    let Type = message.type
    let contactName = message._data.notifyName      //contactName
    if (message.hasMedia) {
      const media = await message.downloadMedia();

      message_media = media.data
    }

    if (from != 'status@broadcast') {


      let saveMessage = await saveIncommingMessages(from, message_text, phone_number_id, display_phone_number, from, message_text, message_media, "Message_template_id", "Quick_reply_id", Type, "ExternalMessageId", contactName);
      console.log("saveMessage")
      console.log(saveMessage)

      var SavedMessageDetails = await getDetatilsOfSavedMessage(saveMessage, message_text, phone_number_id, contactName, from, display_phone_number)
    }
  } catch (err) {
    console.log(err);

  }
}




async function saveIncommingMessages(from, firstMessage, phone_number_id, display_phone_number, phoneNo, message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, contactName) {
  console.log("saveIncommingMessages")

  if (Type == "image") {
    console.log("lets check the image");

    var imageurl = await saveImageFromReceivedMessage(from, message_media, phone_number_id, display_phone_number, Type);

    message_media = imageurl.value;
    console.log(message_media)
    message_text = " "
    var media_type = 'image/jpg'
  }
  if (Type == "video") {
    console.log("lets check the video");

    var imageurl = await saveImageFromReceivedMessage(from, message_media, phone_number_id, display_phone_number, Type);

    message_media = imageurl.value;
    console.log(message_media)
    message_text = " "
    var media_type = 'video/mp4'
  }
  if (message_text.length > 0) {
    let query = "CALL webhook_2(?,?,?,?,?,?,?,?,?,?,?)"
    var saveMessage = await db.excuteQuery(query, [phoneNo, 'IN', message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, display_phone_number, contactName, media_type]);
    notify.NotifyServer(display_phone_number, true);
    console.log("====SAVED MESSAGE====" + " replyValue length  " + JSON.stringify(saveMessage));


  }
  return saveMessage;
}


async function saveImageFromReceivedMessage(from, message, phone_number_id, display_phone_number, type) {
  console.log("saveImageFromReceivedMessage")

  return new Promise(async (resolve, reject) => {
    try {
      console.log(from, phone_number_id, display_phone_number, type)


      let findSpid = 'select SP_ID from user where mobile_number=?'
      let sid = await db.excuteQuery(findSpid, [display_phone_number])
      let awsDetails = ""
      console.log("type == 'image'")

      console.log(type === 'image')
      if (type == 'image') {
        awsDetails = await awsHelper.uploadStreamToAws(sid[0].SP_ID + "/" + phone_number_id + "/" + 'whatsAppWeb.jpeg', message)
        console.log("awsDetails image");
        console.log(awsDetails)
      }
      if (type == 'video') {
        awsDetails = await awsHelper.uploadVideoToAws(from + "/" + phone_number_id + "/" + "whatsAppWeb.mp4", message)
        console.log("awsDetails video");

        console.log(awsDetails)
      }
      //TODO: Save the AWS url to DB in messages table using SP similar to webhook_2 SP. 

      notify.NotifyServer(display_phone_number, true);

      resolve({ value: awsDetails.value.Location });

      //console.log("****image API****" + JSON.stringify(response))
    }
    catch (err) {
      console.log("______image api ERR_____" + err)
    }

  })
}






async function getDetatilsOfSavedMessage(saveMessage, message_text, phone_number_id, contactName, from, display_phone_number) {
  if (saveMessage.length > 0) {

    const data = saveMessage;
    // Extracting the values
    const extractedData = {
      sid: data[0][0]['@sid'],
      custid: data[2][0]['@custid'],
      agid: data[1][0]['@agid'],
      newId: data[3][0]['@newId'],
      replystatus: data[4][0]['@replystatus'],
      msg_id: data[5][0]['@msg_id'],
      newlyInteractionId: data[7][0]['@newlyInteractionId']
    };

    console.log("getDetatilsOfSavedMessage");
    console.log(extractedData)
    var sid = extractedData.sid
    var custid = extractedData.custid
    var agid = extractedData.agid
    var replystatus = extractedData.replystatus
    var newId = extractedData.newId
    var msg_id = extractedData.msg_id
    var newlyInteractionId = extractedData.newlyInteractionId



    let defaultQuery = 'select * from defaultActions where spid=?';
    let defaultAction = await db.excuteQuery(defaultQuery, [sid]);
    console.log(defaultAction.length)
    if (defaultAction.length > 0) {
      console.log(defaultAction[0].isAutoReply + " isAutoReply " + defaultAction[0].autoReplyTime + " autoReplyTime " + defaultAction[0].isAutoReplyDisable + " isAutoReplyDisable ")
      var isAutoReply = defaultAction[0].isAutoReply
      var autoReplyTime = defaultAction[0].autoReplyTime
      var isAutoReplyDisable = defaultAction[0].isAutoReplyDisable


    }
    let defaultReplyAction = await incommingmsg.autoReplyDefaultAction(isAutoReply, autoReplyTime, isAutoReplyDisable, message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, 'WhatsApp Web')
    let RoutingRulesVaues = await Routing.AssignToContactOwner(sid, newId, agid, custid)  // CALL Default Routing Rules
  }

}



module.exports = { createClientInstance, sendMessages, isActiveSpidClient }