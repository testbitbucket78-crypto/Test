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

    //Variables 
    var Quick_reply_id = "";
    var ExternalMessageId = "";
    var message_text = "";
    var message_media = "";
    var Message_template_id = "";
    var Type = "";
    var uniqueId = "";
   


    let body = req.body;

    // Check the Incoming webhook message
    var sendedSms = "";
    if (body != undefined) {
      sendedSms = JSON.stringify(req.body, null, 2)
      console.log(sendedSms)

    }
    else {

      res.status(404).send({
        msg: err,
        status: 404
      });

      return;
    }

    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    if (req.body.object.length > 0) {


      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0] &&
        req.body.entry[0].changes[0].value.messages &&
        req.body.entry[0].changes[0].value.messages[0]

      ) {




        let phone_number_id =
          req.body.entry[0].changes[0].value.metadata.phone_number_id;
        let from =
          req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload

        ExternalMessageId = req.body.entry[0].id;
        message_text = req.body.entry[0].changes[0].value.messages[0].text.body;  // extract the message text from the webhook payload
        message_media = req.body.entry[0].changes[0].value.messages[0].type;
        Message_template_id = req.body.entry[0].changes[0].value.messages[0].id;
        Type = req.body.entry[0].changes[0].value.messages[0].type

       


        var response = await getSmartReplies(message_text, phone_number_id, from)
        

      }


      Quick_reply_id = req.body.entry[0].changes[0].value.statuses[0].id;
      uniqueId = req.body.entry[0].changes[0].value.statuses[0].recipient_id;
     

      if (Quick_reply_id != undefined && uniqueId != undefined) {
        var saveMessage = await db.excuteQuery(process.env.query, [uniqueId, 'IN', message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId])

      
      }

      res.status(200).send({
        msg: saveMessage,
        status: 200
      });
    }
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








async function getSmartReplies(message_text, phone_number_id, from) {
  try {
  
    var replymessage = await db.excuteQuery(process.env.sreplyQuery, [[message_text]])
  
    iterateArray(replymessage, phone_number_id, from)
  } catch (err) {
    console.log("____getSmartReplies method err______")
    console.log(err)
  }
}




async function iterateArray(replymessage, phone_number_id, from) {
  // Loop over the messages array and send each message
  replymessage.forEach((message) => {
  
    var value = message.Value;
    var testMessage = message.Message;                  // Assuming the 'Message' property contains the message content
    var actionId = message.ActionID;                 // Assuming the 'ActionID' property contains the action ID
  
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
    sendMessage(testMessage, phone_number_id, from);
  });

}






