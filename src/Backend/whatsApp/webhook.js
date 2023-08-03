const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json()); // creates express http server

require('dotenv').config();
const { json } = require("body-parser");
const db = require('./dbHelper');
const notify = require('./PushNotifications');
const aws = require('../awsHelper');

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
      if (Type == "image") {
        console.log("lets check the image");
        
        var imageurl = await saveImageFromReceivedMessage(from, firstMessage, phone_number_id, display_phone_number);

        message_media = imageurl.value;

        message_text = " "
        var media_type='image/jpg'
      }

      if (message_text.length > 0) {
        var saveMessage = await db.excuteQuery(process.env.query, [phoneNo, 'IN', message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, display_phone_number, contactName,media_type]);

        if (saveMessage.length > 0) {
          console.log("________________SAVED MESSAGE___________________" + saveMessage[0][0]["@replystatus"] + " replyValue length  " + JSON.stringify(saveMessage));
          notify.NotifyServer(display_phone_number);
          const data = saveMessage;
          // Extracting the values
          const extractedData = {
            sid: data[0][0]['@sid'],
            custid: data[2][0]['@custid'],
            agid: data[1][0]['@agid'],
            newId: data[3][0]['@newId'],
            replystatus: data[4][0]['@replystatus']
          };

          console.log(extractedData);
          var sid = extractedData.sid
          var custid = extractedData.custid
          var agid = extractedData.agid
          var replystatus = extractedData.replystatus
          var newId = extractedData.newId


        }
        const currentTime = new Date();
        const replystatus1 = new Date(replystatus);


        if (replystatus != null && (replystatus1 <= currentTime) && replystatus != undefined) {
          var response = await getSmartReplies(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId);
          console.log("____Send SMART REPLIESS______" + response);
        }
        if(replystatus == null && replystatus == undefined){
          console.log("replystatus == null")
          var response = await getSmartReplies(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId);
          console.log("____Send SMART REPLIESS______" + response);
        }
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
async function saveImageFromReceivedMessage(from, message, phone_number_id, display_phone_number) {
  console.log("saveImageFromReceivedMessage")
  //https://graph.facebook.com/{{Version}}/{{Media-ID}}?phone_number_id=<PHONE_NUMBER_ID>
  return new Promise((resolve, reject) => {
    try {
      const response = axios({
        method: "GET", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v17.0/" +
          message.image.id +
          "?phone_number_id=" + phone_number_id,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },

      }).then(async function (result) {
        console.log("the result is here")
        
        //TODO: NEED TO get SID from DB using Display phone number.
        //let sid = query to get using display phone number.
        let sid= await db.excuteQuery(process.env.findSpid,[display_phone_number])
       
        let awsDetails = await aws.uploadWhatsAppImageToAws(sid[0].SP_ID, message.image.id, result.data.url, token)//spid, imageid, fileUrl, fileAccessToken
       
        //TODO: Save the AWS url to DB in messages table using SP similar to webhook_2 SP. 

        notify.NotifyServer(display_phone_number);

        resolve({ value: awsDetails.value.Location });
      })
      //console.log("****image API****" + JSON.stringify(response))
    }
    catch (err) {
      console.log("______image api ERR_____" + err)
    }

  })
}
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

async function getSmartReplies(message_text, phone_number_id, contactname, from, sid, custid, agid, replystatus, newId) {
  try {
    console.log("in side getSmartReplies method")
    console.log(message_text)
    console.log("_________process.env.insertMessage__________")


    var replymessage = await db.excuteQuery(process.env.sreplyQuery, [[message_text], sid])
    var autoReply = replymessage[0].Message
    console.log(autoReply + replymessage[0].ActionID)
    console.log(replymessage)
    iterateArray(replymessage, phone_number_id, from, sid, custid, agid, replystatus, newId)
  } catch (err) {
    console.log("____getSmartReplies method err______")
    console.log(err)
  }
}

async function iterateArray(replymessage, phone_number_id, from, sid, custid, agid, replystatus, newId) {
  // Loop over the messages array and send each message
  replymessage.forEach(async (message) => {
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
        is_active = 1
        var values = [[is_active, newId, agid, value]]
        var assignCon = await db.excuteQuery(process.env.updateInteractionMapping, [values])
        console.log(assignCon)
        break;
      case 2:
        console.log(`Performing action 2 for Add Contact Tag: ${value}`);
        var addConRes = await db.excuteQuery(process.env.addTagQuery, [value, custid, sid])
        console.log(addConRes)
        break;
      case 3:
        console.log(`Performing action 3 for Remove Contact Tag: ${value}`);
        var maptag = value;
        var maptagItems = maptag.split(',')
        console.log("maptag " + maptag)
        var result = await db.excuteQuery(process.env.selectTagQuery, [custid])
        console.log(result)
        var removetagQuery = ""
        if (result.length > 0) {

          const tagValue = result[0].tag
          console.log("tagValue" + tagValue)
          if (tagValue != ' ' && tagValue != null) {
            // Split the tag value into an array of tag items
            const tagItems = tagValue.split(',');

            var itemmap = '';

            console.log(itemmap == maptag)
            // Get the count of tag items
            const tagItemCount = tagItems.length;
            console.log("tagItemCount" + tagItemCount)
            for (var i = 0; i < tagItems.length; i++) {

              if (!(maptagItems.includes(tagItems[i]))) {
                var itemmap = itemmap + (itemmap ? ',' : '') + tagItems[i]

              }


            }
            console.log("for loop end" + itemmap)
            removetagQuery = "UPDATE EndCustomer SET tag ='" + itemmap + "' WHERE customerId = " + custid + "";

          }
        }
        console.log(removetagQuery)
        var remTagCon = await db.excuteQuery(removetagQuery, [])
        console.log(remTagCon)
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







