const express = require('express');
const { request } = require('http');
const app = express();
const { Client, LocalAuth, MessageMedia, Location } = require('whatsapp-web.js');
const puppeteer = require('puppeteer')
// const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
const moment = require('moment');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "5mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
const Routing = require('../RoutingRules')
const db = require('../dbhelper')
const awsHelper = require('../awsHelper');
const incommingmsg = require('../IncommingMessages')
const notify = require('../whatsApp/PushNotifications')
const fs = require('fs')
const path = require("path");
let clientSpidMapping = {};
let clientPidMapping = {};
let clientSpidInprogress = {};
let isQRstack;
let undefinedCount = 0;

let notifyInteraction = `SELECT InteractionId FROM Interaction WHERE customerId IN (SELECT customerId FROM EndCustomer WHERE Phone_number = ? and SP_ID=? ) and is_deleted !=1   order by created_at desc`
async function createClientInstance(spid, phoneNo) {
  console.log(spid, phoneNo, new Date().toUTCString());
  console.log(clientPidMapping.hasOwnProperty(spid))
  if (isActiveSpidClient(spid)) {
    console.log("Client found in memory map and is ready");
    return { status: 201, value: 'Client is ready!' };
  }
  // if (isInProgressSpidQR(spid)) {
  //   try{
  //   console.log("Client qr generation inprogress");
  //   var inPclient = clientSpidInprogress[spid];

  //   inPclient.destroy();

  //   if (clientSpidInprogress.hasOwnProperty(spid)) {
  //     console.log("clear mapping __________")
  //     delete clientSpidInprogress[spid];
  //   }
  // }catch(err){
  //   console.log("ERR isInProgressSpidQR");
  //   console.log(err)
  // }
  // }

  // delete chrome process
  if (clientPidMapping.hasOwnProperty(spid)) {
    try {
      // kill the cycle with pid and sign = 'SIGINT' 
      // process.kill(clientPidMapping[spid], 'SIGINT');
      process.kill(clientPidMapping[spid])
      console.log("process killed", new Date().toUTCString())
      delete clientPidMapping[spid];
    } catch (err) {
      console.log("Delete clientPidMapping issues in wrong scan", err)
    }
  }

  var authStr = new LocalAuth({
    clientId: spid
  });

  console.log("client created call after verify", new Date().toUTCString())
  return await ClientInstance(spid, authStr, phoneNo);
}

process.on('uncaughtException', function (err) {
  try {
    console.log("uncaught exception was trying to close this. THe expectation is that it is coming from pupeeter hence ignoring.")
    console.log(err)
    if (err.message.includes('Puppeteer')) {
      console.log("Ignoring Puppeteer-related error");
      // Perform any necessary cleanup or handling specific to Puppeteer errors
    } else {
      // Handle other types of errors
      console.log("Handling other types of errors");
    }
    //Need spid in this process for delete client from mapping
  } catch (err) {

    console.log(err);
  }
});

function ClientInstance(spid, authStr, phoneNo) {
  return new Promise(async (resolve, reject) => {
    try {
      const client = new Client({
        puppeteer: {
          headless: true,
          executablePath: "/usr/bin/google-chrome-stable",
          //executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",

          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage', // <-- add this one
          ],

          takeoverOnConflict: true,
          takeoverTimeoutMs: 10,
        },
        authStrategy: authStr,
         webVersionCache: {
           type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2410.1.html',
       }
      });
      console.log("client created", new Date().toUTCString());

      // Handle client creation errors
      client.on('error', (error) => {
        console.error('Client error:', error);
        notify.NotifyServer(phoneNo, false, 'Client creation failed')
        reject({ status: 500, value: 'Client creation failed' });
      });

      client.on('auth_failure', () => {
        console.log('Client is auth_failure!');
      });

      client.on("loading_screen", (percent, message) => {
        console.log("loading_screen", percent, message)
      })
      let inc = 0;
      client.on("qr", (qr) => {
        try {
          // Generate and scan this code with your phone
          //clientSpidInprogress[[spid]] = client;
          console.log("QR CODE top", new Date().toUTCString())
          console.log("QR RECEIVED", qr);
          inc++;
          console.log("inc: " + inc);
          if (qr.startsWith(undefined)) {
            undefinedCount = undefinedCount + 1;
          }
          if (inc > 5) {
            console.log("Destroying client..." + client.authStrategy.userDataDir);
            client.destroy();
            notify.NotifyServer(phoneNo, false, 'QR generation timed out. Plese re-open account settings and generate QR code')
            resolve({ status: 400, value: 'QR is expired' });
          }
          if (!qr.startsWith(undefined)) {
            console.log("Above notify of QR", new Date().toUTCString())
            notify.NotifyServer(phoneNo, false, qr)
            console.log("Below notifyof QR", new Date().toUTCString())
          } else {
            qr = qr.replace('undefined,', '');
            notify.NotifyServer(phoneNo, false, qr)
            console.log("Else undefined QR", new Date().toUTCString())
          }
          resolve({ status: 200, value: qr });
        } catch (err) {
          console.log("err QR ............");
          console.log(err)
        }
      });
      client.on('ready', async () => {

        try {
          console.log("Above client ready", new Date().toUTCString())
          if (phoneNo != client.info.wid.user) {
            console.log("wrong Number")
            notify.NotifyServer(phoneNo, false, 'Wrong Number')
            client.destroy();
            if (clientSpidMapping.hasOwnProperty(spid)) {
              delete clientSpidMapping[spid];
              try {
                // kill the cycle with pid and sign = 'SIGINT' 
                process.kill(clientPidMapping[spid]);
                delete clientPidMapping[spid];
              } catch (err) {
                console.log("Delete clientPidMapping issues in wrong scan")
              }

              console.log(`destroy wrong no. ${spid} from clientSpidMapping.`);

            }
            return resolve({ status: 404, value: 'Wrong Number ,Please use logged in User Phone Number !' });


          } else {
            console.log('Client is ready!');
            notify.NotifyServer(phoneNo, false, 'Client is ready!')
            let allChats = await client.getChats();
            let chat_activos = allChats.splice(0, 10);
            for (const chat of chat_activos) {
              if (!chat.isGroup) {
                let mensajes_verificar = await chat.fetchMessages({ limit: 20 });

                for (const n_chat_mensaje of mensajes_verificar) {

                  let getmessages = savelostChats(n_chat_mensaje, phoneNo, spid)

                }
              }
            }
            console.log("resolve client ready", new Date().toUTCString())
            return resolve({ status: 201, value: 'Client is ready!' });
          }
        } catch (readyerr) {
          console.log("client ready err", readyerr)
        }
        // }
      });

      client.on('message', async message => {
        try {
          const contact = await message.getContact();
          saveInMessages(message);

          // Check if the received message is a reply
          if (message.hasQuotedMsg) {
            // Check if the replied message is sent by your application
            const repliedMessage = await message.getQuotedMessage();

            if (repliedMessage && repliedMessage.fromMe) {
              // Notify about the reply
              const repliedNumber = (message.from).replace(/@c\.us$/, "");
              console.log("reply ___________________")
              let campaignRepliedQuery = `UPDATE CampaignMessages set status=4 where phone_number =${repliedNumber} and (status = 3 OR status =2) and SP_ID = ${spid} AND message_content = '${repliedMessage._data.caption}'`

              let campaignReplied = await db.excuteQuery(campaignRepliedQuery, [])
              console.log("campaignReplied*******", campaignReplied)
            }
          }



        } catch (messageerr) {
          console.log("client message err")
        }
      });

      client.on('authenticated', (session) => {
        try {

          console.log("client authenticated", new Date().toUTCString());
          clientSpidMapping[[spid]] = client;

          try {
            clientPidMapping[[spid]] = client.pupBrowser.process().pid;
            console.log("clientPidMapping[spid]", clientPidMapping[spid])
          }
          catch (err) {
            console.log("Set clientPidMapping issues in Authentication")
          }
          notify.NotifyServer(phoneNo, false, 'Client Authenticated')

        } catch (authenticatederr) {
          console.log(authenticatederr)
        }

      });
      client.on('disconnected', (reason) => {
        setTimeout(async () => {
          try {
            console.log("disconnected", new Date().toUTCString());

            if (clientSpidMapping.hasOwnProperty(spid)) {
              try {
                delete clientSpidMapping[spid];

                let myUTCString = new Date().toUTCString();
                const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
                let updateConnection = await db.excuteQuery('update WhatsAppWeb set updated_at = ? where connected_id =? and spid=? and is_deleted !=1', [updated_at, phoneNo, spid])
                // kill the cycle with pid and sign = 'SIGINT' 
                console.log("Kill[spid]", clientPidMapping[spid])
                process.kill(clientPidMapping[spid]);
                delete clientPidMapping[spid];
              } catch (err) {
                console.log("Delete clientPidMapping issues in disconnected", err)
              }
              console.log(`Removed ${spid} from clientSpidMapping.`);

            }
            notify.NotifyServer(phoneNo, false, 'Client is disconnected!')

          } catch (error) {
            console.log("disconnect error")

          }
        }, 3000);

      })
      client.on('message_ack', async (message, ack) => {

        try {
          let phoneNumber = (message.to).replace(/@c\.us$/, "");
          if (ack == '1') {
            const smsdelupdate = `UPDATE Message
SET msg_status = 1 
WHERE interaction_id IN (
SELECT InteractionId FROM Interaction 
WHERE customerId IN (SELECT customerId FROM EndCustomer WHERE Phone_number = ? and SP_ID=? and isDeleted !=1 AND isBlocked !=1 )) and is_deleted !=1  AND (msg_status IS NULL); `

     let ack1InId = await db.excuteQuery(notifyInteraction,[phoneNumber, spid])
            // console.log(smsdelupdate)
            let sended = await db.excuteQuery(smsdelupdate, [phoneNumber, spid])
            //  console.log("send", sended?.affectedRows)
            notify.NotifyServer(phoneNo, false, ack1InId[0]?.InteractionId,'Out',1)


          } else if (ack == '2') {
            let campaignDeliveredQuery = 'UPDATE CampaignMessages set status=2 where phone_number =? and status = 1'
            let campaignDelivered = await db.excuteQuery(campaignDeliveredQuery, [phoneNumber])
            const smsdelupdate = `UPDATE Message
SET msg_status = 2 
WHERE interaction_id IN (
SELECT InteractionId FROM Interaction 
WHERE customerId IN (SELECT customerId FROM EndCustomer WHERE Phone_number = ? and SP_ID=? and isDeleted !=1 AND isBlocked !=1 )) and is_deleted !=1 AND (msg_status IS NULL OR msg_status = 1); `
            //console.log(smsdelupdate)
            let deded = await db.excuteQuery(smsdelupdate, [phoneNumber, spid])
            //  console.log("deliver", deded?.affectedRows)
           // notify.NotifyServer(phoneNo, true)
           let ack2InId = await db.excuteQuery(notifyInteraction,[phoneNumber, spid])
           notify.NotifyServer(phoneNo, false, ack2InId[0]?.InteractionId,'Out',2)
          } else if (ack == '3') {
            //  console.log("read")
            let campaignReadQuery = 'UPDATE CampaignMessages set status=3 where phone_number =? and status = 2';
            let campaignRead = await db.excuteQuery(campaignReadQuery, [phoneNumber])
            const smsupdate = `UPDATE Message
SET msg_status = 3 
WHERE interaction_id IN (
SELECT InteractionId FROM Interaction 
WHERE customerId IN (SELECT customerId FROM EndCustomer WHERE Phone_number =? and SP_ID=? and isDeleted !=1 AND isBlocked !=1)) and is_deleted !=1  AND (msg_status =2 OR msg_status = 1);`
            //  console.log(smsupdate)
            let resd = await db.excuteQuery(smsupdate, [phoneNumber, spid])
            //   console.log("read", resd?.affectedRows)
           // notify.NotifyServer(phoneNo, true)
           let ack3InId = await db.excuteQuery(notifyInteraction,[phoneNumber, spid])
           notify.NotifyServer(phoneNo, false, ack3InId[0]?.InteractionId,'Out',3)
          }


        } catch (message_ackErr) {
          console.log(message_ackErr)
        }
      });

      const timeOut = setTimeout(() => {
        //  client.initialize().catch(_ => _);
        client.initialize().catch((error) => {
          console.log("intilize_________________")
          console.error(error);
        });
      }, 5000)

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

function whatsappWebStatus() {
console.log("undefinedCount",undefinedCount)
  if (undefinedCount >= 2) {
    return false;
  } else {
    return true;
  }

}

function isActiveSpidClient(spid) {
  console.log("clientSpidMapping[spid]", spid, clientSpidMapping)
  if (clientSpidMapping[spid]) {
    console.log("if client ready")
    return true;
  } else {
    return false;
  }
}

function isInProgressSpidQR(spid) {

  if (clientSpidInprogress[spid]) {
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

async function sendMessages(spid, endCust, type, text, link, interaction_id, msg_id, spNumber) {
  try {
    let client = clientSpidMapping[[spid]];
    if (client) {
      let msg = await sendDifferentMessagesTypes(client, endCust, type, text, link, interaction_id, msg_id, spNumber);

      return '200';
    } else {
      console.log("else");
      return '401'
    }
  } catch (err) {
    console.log(err)
  }
}

async function sendDifferentMessagesTypes(client, endCust, type, text, link, interaction_id, msg_id, spNumber) {
  try {

    //  console.log("messagesTypes", interaction_id, msg_id)
    if (client.info) {
      // console.log("client info avilable")
    } else {
      console.log("not avilable")
    }
    if (type === 'text') {

      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? where Message_id=?`, [updated_at, msg_id])
      client.sendMessage(endCust + '@c.us', text);
      // notify.NotifyServer(spNumber, false, interaction_id)
    }
    if (type === 'image') {
      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      const media = await MessageMedia.fromUrl(link);
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? where Message_id=?`, [updated_at, msg_id])
      client.sendMessage(endCust + '@c.us', media, { caption: text });
    }
    if (type === 'video') {
      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      const media = await MessageMedia.fromUrl(link);
      // console.log(media.mimetype)
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? where Message_id=?`, [updated_at, msg_id])
      client.sendMessage(endCust + '@c.us', media, { caption: text });

    }
    if (type === 'attachment' || type === 'document') {
      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      const media = new MessageMedia('pdf', link);
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? where Message_id=?`, [updated_at, msg_id])
      client.sendMessage(endCust + '@c.us', media);

    } if (type === 'location') {
      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      const location = new Location(37.422, -122.084, 'Sampana Digital Private limited');
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? where Message_id=?`, [updated_at, msg_id])
      const msg = await client.sendMessage(endCust + '@c.us', location);
    }
    if (type === 'vcard') {
      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      let firstName = 'CIP'
      let lastName = 'TEAM'
      let phoneNumber = '917017683064'
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? where Message_id=?`, [updated_at, msg_id])
      client.sendMessage(endCust + '@c.us',
        'BEGIN:VCARD\n' +
        'VERSION:3.0\n' +
        'N:' + firstName + ';' + lastName + ';;;\n' +
        'FN:' + firstName + lastName + '\n' +
        'TEL;type=Mobile;waid=' + phoneNumber + ':+' + phoneNumber + '\n' +
        'END:VCARD', {
        parseVCards: false
      }


      );
    }

  } catch (err) {
    console.log("++++++++++++++++++++++++++++++++++++++++++++")
    console.log(err)
  }
}

async function sendFunnel(spid, endCust, type, text, link) {
  try {
    let client = clientSpidMapping[[spid]];
    console.log(spid, endCust, type, text, link)
    if (client) {
      console.log("if");
      let msg = await sendDifferentFunnelTypes(client, endCust, type, text, link);
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

async function sendDifferentFunnelTypes(client, endCust, type, text, link) {
  try {

    //  console.log("messagesTypes", interaction_id, msg_id)
    if (client.info) {
      console.log("client info avilable")
    } else {
      console.log("not avilable")
    }
    if (type === 'text') {

      client.sendMessage(endCust + '@c.us', text);
    }
    if (type === 'image') {
      const media = await MessageMedia.fromUrl(link);

      client.sendMessage(endCust + '@c.us', media, { caption: text });
    }
    if (type === 'video') {
      const media = await MessageMedia.fromUrl(link);

      client.sendMessage(endCust + '@c.us', media, { caption: text });

    }
    if (type === 'attachment') {
      const media = new MessageMedia('pdf', link);

      client.sendMessage(endCust + '@c.us', media);

    }

  } catch (err) {
    console.log("++++++++++++++++++++++++++++++++++++++++++++")
    console.log(err)
  }
}




async function saveInMessages(message) {
  try {
    let message_text = message.body   //firstMessage
    if (message_text) {
      message_text = message_text.replace(/\*/g, '<strong>').replace(/\*/g, '</strong>');
      message_text = message_text.replace(/_/g, '<em>').replace(/_/g, '</em>');
      message_text = message_text.replace(/~/g, '<span>').replace(/~/g, '</span>');
      message_text = message_text.replace(/~/g, '<del>').replace(/~/g, '</del>');
      message_text = message_text.replace(/\n/g, '<br>');
    }
    let message_direction = 'IN'
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

      let myUTCString = new Date().toUTCString();
      const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      let saveMessage = await saveIncommingMessages(message_direction, from, message_text, phone_number_id, display_phone_number, from, message_text, message_media, "Message_template_id", "Quick_reply_id", Type, "ExternalMessageId", contactName, 'null', created_at);
      //console.log("saveMessage" ,)
      // console.log(saveMessage)

      var SavedMessageDetails = await getDetatilsOfSavedMessage(saveMessage, message_text, phone_number_id, contactName, from, display_phone_number)
    }
  } catch (err) {
    console.log(err);

  }
}

let messageQuery = `SELECT 
ec.customerId,
i.InteractionId,
MAX(i.created_at) AS latest_interaction_date,
MAX(m.created_at) AS latest_message_created_date
FROM 
EndCustomer ec
JOIN 
Interaction i ON ec.customerId = i.customerId
LEFT JOIN
Message m ON i.interactionId = m.interaction_id
WHERE 
ec.Phone_number = ?
AND ec.isDeleted != 1 
AND ec.SP_ID = ? 
GROUP BY 
ec.customerId;`

async function savelostChats(message, spPhone, spid) {
  try {
    let message_text = message.body   //firstMessage

    if (message_text) {
      message_text = message_text.replace(/\*/g, '<strong>').replace(/\*/g, '</strong>');
      message_text = message_text.replace(/_/g, '<em>').replace(/_/g, '</em>');
      message_text = message_text.replace(/~/g, '<span>').replace(/~/g, '</span>');
      message_text = message_text.replace(/~/g, '<del>').replace(/~/g, '</del>');
      message_text = message_text.replace(/\n/g, '<br>');
    }
    let ackStatus = message.ack;
    let from = (message.from).replace(/@c\.us$/, '')   //phoneNo
    let phone_number_id = message.id.id
    let display_phone_number = (message.to).replace(/@c\.us$/, '')
    let message_direction = 'IN'
    let endCustomer = (message.from).replace(/@c\.us$/, '');  // for handle out messages of a chat
    if (from == spPhone) {
      message_direction = 'Out'
      endCustomer = (message.to).replace(/@c\.us$/, '');
      display_phone_number = spPhone;
    }
    let getLastScannedTime = await db.excuteQuery(messageQuery, [endCustomer, spid]);
    // console.log(getLastScannedTime)
    var d = new Date(message.timestamp * 1000).toUTCString();

    const message_time = moment.utc(d).format('YYYY-MM-DD HH:mm:ss');

    // console.log(d,new Date( getLastScannedTime[0]?.latest_message_created_date) < new Date(d) , getLastScannedTime[0]?.latest_message_created_date)
    if ((d > getLastScannedTime[0]?.latest_message_created_date && d < new Date().toUTCString()) || (getLastScannedTime?.length == 0)) {



      let message_media = ""           //Type
      let Type = message.type
      let contactName = message._data.notifyName !== '' ? message._data.notifyName : endCustomer; //contactName

      if (message.hasMedia) {
        const media = await message.downloadMedia();

        message_media = media?.data
      }





      if (from != 'status@broadcast') {

        console.log("lost messages time", d)
        let saveMessage = await saveIncommingMessages(message_direction, from, message_text, phone_number_id, display_phone_number, endCustomer, message_text, message_media, "Message_template_id", "Quick_reply_id", Type, "ExternalMessageId", contactName, ackStatus, message_time);

      }
    }
  } catch (err) {
    console.log(err);

  }
}



async function saveIncommingMessages(message_direction, from, firstMessage, phone_number_id, display_phone_number, phoneNo, message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, contactName, ackStatus, timestramp) {
  // console.log("saveIncommingMessages")

  if (Type == "image") {
    // console.log("lets check the image");

    var imageurl = await saveImageFromReceivedMessage(from, message_media, phone_number_id, display_phone_number, Type);

    message_media = imageurl.value;
    // console.log(message_media)
    message_text = " "
    var media_type = 'image/jpg'
  }
  if (Type == "video") {
    // console.log("lets check the video");

    var imageurl = await saveImageFromReceivedMessage(from, message_media, phone_number_id, display_phone_number, Type);

    message_media = imageurl.value;
    //  console.log(message_media)
    message_text = " "
    var media_type = 'video/mp4'
  }
  if (message_text.length > 0) {
    let query = "CALL webhook_2(?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    var saveMessage = await db.excuteQuery(query, [phoneNo, message_direction, message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, display_phone_number, contactName, media_type, ackStatus, 'WhatsApp Web', timestramp]);
    notify.NotifyServer(display_phone_number, true);
    //    console.log("====SAVED MESSAGE====" + " replyValue length  " + JSON.stringify(saveMessage), "****", phoneNo, phone_number_id);


  }
  return saveMessage;
}


async function saveImageFromReceivedMessage(from, message, phone_number_id, display_phone_number, type) {
  // console.log("saveImageFromReceivedMessage")

  return new Promise(async (resolve, reject) => {
    try {
      //  console.log(from, phone_number_id, display_phone_number, type)


      let findSpid = 'select SP_ID from user where mobile_number=?'
      let sid = await db.excuteQuery(findSpid, [display_phone_number])
      let awsDetails = ""

      if (type == 'image') {
        awsDetails = await awsHelper.uploadStreamToAws(sid[0]?.SP_ID + "/teambox/" + phone_number_id + "/" + 'whatsAppWeb.jpeg', message)
        // console.log("awsDetails image");
        // console.log(awsDetails)
      }
      if (type == 'video') {
        awsDetails = await awsHelper.uploadVideoToAws(sid[0]?.SP_ID + "/teambox/" + phone_number_id + "/" + "whatsAppWeb.mp4", message)
        // console.log("awsDetails video");

        // console.log(awsDetails)
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
  if (saveMessage?.length > 0) {

    const data = saveMessage;
    // Extracting the values
    const extractedData = {
      sid: data[0][0]['@sid'],
      custid: data[2][0]['@custid'],
      agid: data[1][0]['@agid'],
      newId: data[3][0]['@newId'],
      replystatus: data[4][0]['@replystatus'],
      msg_id: data[5][0]['@msg_id'],
      newlyInteractionId: data[7]?.[0]?.['@newlyInteractionId']
    };


    var sid = extractedData.sid
    var custid = extractedData.custid
    var agid = extractedData.agid
    var replystatus = extractedData.replystatus
    var newId = extractedData.newId
    var msg_id = extractedData.msg_id
    var newlyInteractionId = extractedData?.newlyInteractionId
    console.log("in messages", from, false, "interaction id", newId, display_phone_number)
    notify.NotifyServer(display_phone_number, false, newId,'IN')

    let defaultQuery = 'select * from defaultActions where spid=?';
    let defaultAction = await db.excuteQuery(defaultQuery, [sid]);
    //console.log(defaultAction)
    if (defaultAction.length > 0) {
      //console.log(defaultAction[0].isAutoReply + " isAutoReply " + defaultAction[0].autoReplyTime + " autoReplyTime " + defaultAction[0].isAutoReplyDisable + " isAutoReplyDisable ")
      var isAutoReply = defaultAction[0].isAutoReply
      var autoReplyTime = defaultAction[0].autoReplyTime
      var isAutoReplyDisable = defaultAction[0].isAutoReplyDisable
      var pausedTill = defaultAction[0]?.pausedTill

    }
    let defaultReplyAction = await incommingmsg.autoReplyDefaultAction(isAutoReply, pausedTill, isAutoReplyDisable, message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, 'WhatsApp Web')
    let RoutingRulesVaues = await Routing.AssignToContactOwner(sid, newId, agid, custid)  // CALL Default Routing Rules
  }

}



module.exports = { createClientInstance, sendMessages, isActiveSpidClient, sendFunnel,whatsappWebStatus }