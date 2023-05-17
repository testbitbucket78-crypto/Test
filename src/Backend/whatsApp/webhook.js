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

//Variables 
var Quick_reply_id = "";
var ExternalMessageId = "";
var message_text = "";
var message_media = "";
var Message_template_id = "";
var Type = "";
var flag = true;
var count = 0;
var array = [];
var uniqueId = "";
var replymessage = "";
var autoReply = ""
// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST


  let body = req.body;

  // Check the Incoming webhook message
  var sendedSms = "";
  if (body != undefined) {
    sendedSms = JSON.stringify(req.body, null, 2)
    replymessage = await db.excuteQuery(process.env.sreplyQuery, [])

  }

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {


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
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
      ExternalMessageId = req.body.entry[0].id;
      message_text = req.body.entry[0].changes[0].value.messages[0].text.body;
      message_media = req.body.entry[0].changes[0].value.messages[0].type;
      Message_template_id = req.body.entry[0].changes[0].value.messages[0].id;
      Type = req.body.entry[0].changes[0].value.messages[0].type

      try {
        console.log("message_text" + message_text)
        console.log("_________process.env.insertMessage__________")
        console.log(process.env.insertMessage)
        var sreplyMessage = await db.excuteQuery(process.env.insertMessage, [['62', '1', 'webhook', message_text, 'whatsApp']])
        console.log(sreplyMessage)
        replymessage = await db.excuteQuery(process.env.sreplyQuery, [])
        autoReply = replymessage.Description
        // console.log(sendedSms)
        console.log(autoReply)
      } catch (err) {

      }

      array.push(Message_template_id);


      if (array.length > 1 && array[array.length] != array[array.length - 1]) {
        count = 0;
        flag = true;
      }
      axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v15.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: { body: "Reply: " + autoReply }
          ,
        },
        headers: { "Content-Type": "application/json" },

      })
    }

    res.sendStatus(200)
  }
  else {
    //     // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }


  if (!flag) {
    Quick_reply_id = req.body.entry[0].changes[0].value.statuses[0].id;
    uniqueId = req.body.entry[0].changes[0].value.statuses[0].recipient_id;
  }

  flag = false;

  if (count == 1) {

    //var values = [uniqueId,'IN',message_text,message_media,Message_template_id,Quick_reply_id,Type,ExternalMessageId]
    // db.query(process.env.query, [uniqueId,'IN',message_text,message_media,Message_template_id,Quick_reply_id,Type,ExternalMessageId], function (err, result, fields) {
    //   if (err) {
    //     console.log("Error Occour");
    //     throw err;
    //   } else {
    //     console.log(result)
    //   }
    // });


  }
  count++;

});






