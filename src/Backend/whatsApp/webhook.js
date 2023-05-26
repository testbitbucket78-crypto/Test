const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json()); // creates express http server

require('dotenv').config();
const { json } = require("body-parser");
const db = require('./dbHelper');

const token = process.env.WHATSAPP_TOKEN;

const mytoken = process.env.VERIFY_TOKEN;

app.listen(process.env.PORT, () => {
  console.log('Server is running on port ' + process.env.PORT);
});
app.get('/', (req, res) => {
  res.send("Welcome in Whatshap webhook ");
})
app.get("/webhook", (req, res) => {

  let mode = req.query["hub.mode"];
  let challange = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token === mytoken) {
      res.status(200).send(challange);
    } else {
      res.status(403);
    }
  }

})



// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST

  try {
    console.log("===========================##############==========================")
    let body = req.body;

    // Check the Incoming webhook message    
    if (body != undefined) {
      console.log(JSON.stringify(body, null, 2))
    }
    else {
      res.status(404).send({
        msg: err,
        status: 404
      });
      return;
    }

    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    if (body.entry && body.entry.length > 0 && body.entry[0].changes && body.entry[0].changes.length > 0 &&
      body.entry[0].changes[0].value && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages.length > 0
      && body.entry[0].changes[0].value.metadata) {

      let changes = body.entry[0].changes[0];
      let phone_number_id = changes.value.metadata.phone_number_id;
      let display_phone_number = changes.value.metadata.display_phone_number;
      let firstMessage = changes.value.messages[0];

      let from = firstMessage.from; // extract the phone number from the webhook payload

      let contact = changes.value.contacts && changes.value.contacts.length > 0 ? changes.value.contacts[0] : null;

      let contactName = contact.profile.name ? contact.profile.name : from;
      let phoneNo = contact.wa_id;
      let ExternalMessageId = body.entry[0].id;
      let message_text = firstMessage.text ? firstMessage.text.body : "";  // extract the message text from the webhook payload
      let message_media = firstMessage.type;

      let Message_template_id = firstMessage.id;
      let Type = firstMessage.type

      console.log(" body.entry " + phoneNo)
      let firstStatus = "";
      let Quick_reply_id = "";
      let uniqueId = "";
      if (changes.value.statuses && changes.value.statuses.length > 0) {
        firstStatus = changes.value.statuses[0];
        Quick_reply_id = firstStatus.id;
        uniqueId = firstStatus.recipient_id;
        console.log(Quick_reply_id + uniqueId);
        console.log("status present");
      }
      console.log("________________SAVEING MESSAGE___________________");
      if (message_text.length > 0) {
        var saveMessage = await db.excuteQuery(process.env.query, [phoneNo, 'IN', message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, display_phone_number, contactName]);
        var replyValue = "";
        if (saveMessage.length > 0) {
          console.log("________________SAVED MESSAGE___________________" + saveMessage[0][0]["@replystatus"] + " replyValue length  " + saveMessage.length);
          replyValue = saveMessage[0][0]["@replystatus"];
        }
        var response = await getSmartReplies(message_text, phone_number_id, contactName, from, replyValue);
        console.log("____Send SMART REPLIESS______" + response);
      }
    }
    res.status(200).send({
      msg: saveMessage,
      status: 200
    });

  } catch (err) {
    db.errlog(err);
    res.status(500).send({
      msg: err,
      status: 500
    });
  }

});

async function sendMessage(message, phone_number_id, from) {
  try {
    const response = axios({
      method: "POST", // Required, HTTP method, a string, e.g. POST, GET
      url:
        "https://graph.facebook.com/v15.0/" +
        phone_number_id +
        "/messages?access_token=" +
        token,
      data: {
        messaging_product: "whatsapp",
        to: from,
        text: { body: "Reply: " + message }
        ,
      },
      headers: { "Content-Type": "application/json" },

    })
    console.log("****META APIS****" + response)
  }
  catch (err) {
    console.log("______META ERR_____" + err)
  }

}

async function getSmartReplies(message_text, phone_number_id, contactname, from, replyValue) {
  try {
    console.log("in side getSmartReplies method")
    console.log(message_text)
    console.log("_________process.env.insertMessage__________")


    var replymessage = await db.excuteQuery(process.env.sreplyQuery, [[message_text]])
    //var autoReply = replymessage[0].Message
    //console.log(autoReply + replymessage[0].ActionID)
    console.log(replymessage)
    iterateArray(replymessage, phone_number_id, from, replyValue)
  } catch (err) {
    console.log("____getSmartReplies method err______")
    console.log(err)
  }
}

async function iterateArray(replymessage, phone_number_id, from, replyValue) {
  // Loop over the messages array and send each message
  replymessage.forEach((message) => {
    console.log("===================================")
    console.log("***********************************")

    var value = message.Value;
    var testMessage = message.Message;                  // Assuming the 'Message' property contains the message content
    var actionId = message.ActionID;                 // Assuming the 'ActionID' property contains the action ID
    console.log(testMessage + "____________" + value + "_________" + actionId)
    // Perform actions based on the Action ID
    switch (actionId) {
      case 1:
        console.log(`Performing action 1 for  Assign Conversation: ${value}`);
        break;
      case 2:
        console.log(`Performing action 2 for Add Contact Tag: ${value}`);
        break;
      case 3:
        console.log(`Performing action 3 for Remove Contact Tag: ${value}`);
        break;
      case 4:
        console.log(`Performing action 4 for Trigger Flow: ${value}`);
        break;
      case 5:
        console.log(`Performing action 5 for Name Update: ${value}`);
        break;
      case 6:
        console.log(`Performing action 6 for Resolve Conversation: ${value}`);
        break;
      default:
        // Handle any other Action IDs
        console.log(`Unknown action ID: ${actionId}`);
    }

    //sendMessage(testMessage, phone_number_id, from);
    handleAutoReply(replyValue, testMessage, phone_number_id, from)
  });

}



// Function to handle auto-reply
async function handleAutoReply(replyValue, testMessage, phone_number_id, from) {
  const autoReplyValue = replyValue;

  if (autoReplyValue === 'Pause for 5 mins') {
    console.log('Auto-reply is set to pause.');

    setTimeout(sendMessage, 300000);
  } else if (autoReplyValue === 'Pause for 10 mins') {
    console.log('Auto-reply is set to pause for 10 minutes.');

    setTimeout(sendMessage, 600000);
  } else if (autoReplyValue === 'Pause for 15 mins') {
    console.log('Auto-reply is set to pause for 15 minutes.');

    setTimeout(sendMessage, 900000);
  }
  else if (autoReplyValue === 'Pause for 20 mins') {
    console.log('Auto-reply is set to pause for 20 minutes.');

    setTimeout(sendMessage, 1200000);
  }
  else {
    console.log('Auto-reply is not set to pause.');

    sendMessage(testMessage, phone_number_id, from);
  }
}




