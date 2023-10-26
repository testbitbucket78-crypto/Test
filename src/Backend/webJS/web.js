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
let clientSpidMapping = {};

async function createClientInstance(spid, phoneNo) {
  console.log(spid, phoneNo);

  return new Promise(async (resolve, reject) => {
    try {
      const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer:{
          headless: true,
         // executablePath:  "C:/Program Files/Google/Chrome/Application/chrome.exe",
         
         args: ['--no-sandbox']
        },
        authStrategy: new LocalAuth({
          clientId: spid
        }),
      });
      console.log("client created");

      client.on('qr', (qr) => {
        console.log('QR RECEIVED', qr);
//        qrcode.generate(qr, { small: true });
        resolve({ status: 200, value: qr });
      });
      client.on('ready', () => {

        if (phoneNo != client.info.wid.user) {
          console.log("wrong Number")
          notify.NotifyServer(phoneNo,false,'Wrong Number')
          return resolve({ status: 404, value: 'Wrong Number' });
          //client.destroy()

        }
        console.log('Client is ready!');
        notify.NotifyServer(phoneNo,false,'Client is ready!')
        return resolve({ status: 200, value: 'Client is ready!' });

      });

      client.initialize();

      client.on('message', async message => {
        console.log(message.body);
        // Get the profile of the sender of the message
        const contact = await message.getContact();
        console.log('Sender Name:', contact);
        saveInMessages(message);
      });

      client.on('authenticated', (session) => {
        console.log("client authenticated");
        console.log("session");
        console.log(session)
        clientSpidMapping = {
          [spid]: client
        }
        // console.log(clientSpidMapping);

      });
    } catch (err) {
      console.log("client err", err);
      reject(err); // Reject the Promise in case of an error
    }
  })
  // .then(result => {
  //     // Handle success here
  //     console.log("Promise resolved with result:", result);
  // })
  // .catch(error => {
  //     // Handle errors here
  //     console.error('Error createClientInstance:', error);
  // });

}



async function sendMessages(spid, endCust, type, text, link) {
  try {
    let client = clientSpidMapping[[spid]];
    console.log(spid, endCust, type,)
    if (client) {
      console.log("if");
      let msg = await sendDifferentMessagesTypes(client, endCust, type, text, link);
    } else {
      console.log("else");
      let clientResonce = await createClientInstance(spid)
      client = clientSpidMapping[[spid]];
      let msg = await sendDifferentMessagesTypes(client, endCust, type, text, link);
    }
  } catch (err) {
    console.log(err)
  }
}

async function sendDifferentMessagesTypes(client, endCust, type, text, link) {
  try {
    console.log("messagesTypes")

    if (type === 'text') {
      //console.log(text)
      client.sendMessage(endCust + '@c.us', text);
    }
    if (type === 'image') {
      const media = await MessageMedia.fromUrl(link);

      client.sendMessage(endCust + '@c.us', media, { caption: text });
    }
    if (type === 'video') {
      const media = await MessageMedia.fromUrl(link);
      console.log(media.mimetype)
      client.sendMessage(endCust + '@c.us', media, { caption: text });

    }
    if (type === 'attachment') {
      const media = new MessageMedia('pdf', link);
      client.sendMessage(endCust + '@c.us', media);

    } if (type === 'location') {
      const location = new Location(37.422, -122.084, 'Sampana Digital Private limited');
      const msg = await client.sendMessage(endCust + '@c.us', location);
    }
    if (type === 'vcard') {
      client.sendMessage(endCust + '@c.us', contat);
    }
  } catch (err) {
    console.log(err)
  }
}




async function saveInMessages(message) {
  // console.log(message)
  // console.log(message.from); //from
  // console.log(message.body); //firstMessage //message_text
  // console.log(message.id.id); //phone_number_id
  // console.log(message.to); //display_phone_number //phoneNo
  // console.log(message.type)//message_media //Type
  // console.log(message._data.notifyName) //contactName
  try {
    let message_text = message.body   //firstMessage
    let from = (message.from).replace(/@c\.us$/, '')   //phoneNo
    let phone_number_id = message.id.id
    let display_phone_number = (message.to).replace(/@c\.us$/, '')
    let message_media = message.type           //Type
    let Type = message.type
    let contactName = message._data.notifyName      //contactName
    if (message.hasMedia) {
      const media = await message.downloadMedia();

      message_media = media.data
    }
    //[phoneNo, 'IN', message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, display_phone_number, contactName, media_type])
    //from, firstMessage, phone_number_id, display_phone_number, phoneNo, message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, contactName
    let saveMessage = await saveIncommingMessages(from, message_text, phone_number_id, display_phone_number, from, message_text, message_media, "Message_template_id", "Quick_reply_id", Type, "ExternalMessageId", contactName);
    console.log("saveMessage")
    console.log(saveMessage)

    var SavedMessageDetails = await getDetatilsOfSavedMessage(saveMessage, message_text, phone_number_id, contactName, from, display_phone_number)
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

    console.log("====SAVED MESSAGE====" + " replyValue length  " + JSON.stringify(saveMessage));


  }
  return saveMessage;
}


async function saveImageFromReceivedMessage(from, message, phone_number_id, display_phone_number, type) {
  console.log("saveImageFromReceivedMessage")

  return new Promise(async (resolve, reject) => {
    try {
      console.log(from, phone_number_id, display_phone_number, type)

      //TODO: NEED TO get SID from DB using Display phone number.
      //let sid = query to get using display phone number.
      let findSpid = 'select SP_ID from user where mobile_number=?'
      let sid = await db.excuteQuery(findSpid, [display_phone_number])
      let awsDetails = ""
      console.log(type == 'image')
      console.log(2)
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

      notify.NotifyServer(display_phone_number,true);

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
    console.log(display_phone_number + " .." + message_text)
    //notify.NotifyServer(display_phone_number);  //// we have to active this
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



module.exports = { createClientInstance, sendMessages }