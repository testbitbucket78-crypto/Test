var express = require("express");
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "10000kb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10000kb", extended: true }));
const Routing = require('./RoutingRules')
const db = require('./dbhelper')
const awsHelper = require('./awsHelper');
const webJs=require('./webJS/web');







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
      console.log(type =='image')
      console.log(2)
      console.log(type ==='image')
      if (type =='image') {
        awsDetails = await awsHelper.uploadStreamToAws(sid[0].SP_ID + "/" + phone_number_id + "/" + 'whatsAppWeb.jpeg', message)
        console.log("awsDetails image");
        console.log(awsDetails)
      }
      if (type =='video') {
        awsDetails = await awsHelper.uploadVideoToAws(from + "/" + phone_number_id + "/" + "whatsAppWeb.mp4", message)
        console.log("awsDetails video");

        console.log(awsDetails)
      }
      //TODO: Save the AWS url to DB in messages table using SP similar to webhook_2 SP. 

      //notify.NotifyServer(display_phone_number);

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
    let defaultReplyAction = await autoReplyDefaultAction(isAutoReply, autoReplyTime, isAutoReplyDisable, message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId)
   // let RoutingRulesVaues = await Routing.AssignToContactOwner(sid, newId, agid, custid)  // CALL Default Routing Rules
  }

}


async function autoReplyDefaultAction(isAutoReply, autoReplyTime, isAutoReplyDisable, message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId) {
  // if (isAutoReply != 1 && isAutoReplyDisable != 1) {
  //   const currentTime = new Date();
  //   const autoReplyVal = new Date(autoReplyTime)
  //   if (autoReplyTime != null && (autoReplyVal <= currentTime) && autoReplyTime != undefined) {
  //     let sendSReply = await sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId)
  //   }
  //   if (autoReplyTime == null || autoReplyTime == undefined) {
      let sendSReply = await sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId)
  //   }
  // }
}


async function sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId) {
  console.log("____Send SMART REPLIESS______" + replystatus)
  const currentTime = new Date();
  const replystatus1 = new Date(replystatus);
  if (replystatus != null && (replystatus1 <= currentTime) && replystatus != undefined) {
    var response = await getSmartReplies(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId);
    console.log("____Send SMART REPLIESS______" + response);
  }
  if (replystatus == null || replystatus == undefined || replystatus == "") {
    console.log("replystatus == null" + message_text)
    var response = await getSmartReplies(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId);
    console.log("____Send SMART REPLIESS______" + response);
  }
}

async function getSmartReplies(message_text, phone_number_id, contactname, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId) {
  try {
    console.log("in side getSmartReplies method")
    // console.log("message_text")
    // console.log(message_text)
    // console.log("_________process.env.insertMessage__________")

    //let defautWlcMsg = await getWelcomeGreetingData(sid, msg_id, newlyInteractionId, phone_number_id, from);
   // var replymessage = await db.excuteQuery(process.env.sreplyQuery, [[message_text], sid]);
   // let defultOutOfOfficeMsg = await workingHoursDetails(sid, phone_number_id, from, msg_id, newId, newlyInteractionId);

    console.log("defultOutOfOfficeMsg")
    // console.log(defautWlcMsg)
    // console.log(replymessage)
    // console.log(defultOutOfOfficeMsg)
    //var autoReply = replymessage[0].Message
    // console.log(replymessage.length)
    // console.log(" replymessage.length " + replymessage.length)
    // if (replymessage.length > 0) {
      console.log("replymessage.length")
      iterateSmartReplies('replymessage', phone_number_id, from, sid, custid, agid, replystatus, newId)
    // } else if (defultOutOfOfficeMsg === false) {

    //   console.log("getOutOfOfficeResult")
    //   let getOutOfOfficeResult = await getOutOfOfficeMsg(sid, phone_number_id, from, msg_id, newlyInteractionId);
    //   console.log(getOutOfOfficeResult)
    // }
    // else if (defautWlcMsg.length > 0 && defautWlcMsg[0].Is_disable == 1) {
    //   console.log("defaut msg")
    //   let messageInterval = await db.excuteQuery(process.env.msgBetweenOneHourQuery, [newId, 1])
    //   if (messageInterval.length <= 0) {
    //    // sendDefultMsg(wlcMessage[0].link, wlcMessage[0].value, wlcMessage[0].message_type, phone_number_id, from);
    //     let sendMessages=await webJs.sendMessages(sid,from,wlcMessage[0].message_type, wlcMessage[0].value,wlcMessage[0].link);
    //     let updateSmsRes = await db.excuteQuery(process.env.updateSms, [1, new Date(), msg_id]);
    //   }

    // }


  } catch (err) {
    console.log("____getSmartReplies method err______")
    console.log(err)
  }
}

async function iterateSmartReplies(replymessage, phone_number_id, from, sid, custid, agid, replystatus, newId) {
  // Loop over the messages array and send each message
  // replymessage.forEach(async (message) => {
  //   console.log("===================================")
  //   console.log("***********************************")

  //   var value = message.Value;
  //   var testMessage = message.Message;                  // Assuming the 'Message' property contains the message content
  //   var actionId = message.ActionID;                 // Assuming the 'ActionID' property contains the action ID
  //   console.log(testMessage + "____________" + value + "_________" + actionId)

   // let PerformingActions = await PerformingSReplyActions(actionId, value, sid, custid, agid, replystatus, newId);
   let sendMessages=await webJs.sendMessages(sid,from,'text','testMessage','link');
console.log("sendMessages")
console.log(sendMessages)
 // });

}

async function PerformingSReplyActions(actionId, value, sid, custid, agid, replystatus, newId) {
  // Perform actions based on the Action ID
  switch (actionId) {
    case 1:
      let assignActionRes = await assignAction(value, agid, newId)
      break;
    case 2:
      let AddTagRes = await addTag(value, sid, custid);
      break;
    case 3:
      let removedTagRes = await removeTag(value, custid);
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
}



async function assignAction(value, agid, newId) {
  console.log(`Performing action 1 for  Assign Conversation: ${value}`);
  is_active = 1
  var values = [[is_active, newId, agid, value]]
  var assignCon = await db.excuteQuery(process.env.updateInteractionMapping, [values])
  console.log(assignCon)
}



async function addTag(value, sid, custid) {
  console.log(`Performing action 2 for Add Contact Tag: ${value}`);
  var addConRes = await db.excuteQuery(process.env.addTagQuery, [value, custid, sid])
  console.log(addConRes)
}


async function removeTag(value, custid) {
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
}



async function getWelcomeGreetingData(sid, msg_id, newlyInteractionId, phone_number_id, from) {
  try {
    // let selectQuery = `SELECT * FROM defaultmessages where SP_ID=? AND title='Welcome Greeting'`
    var wlcMessage = await db.excuteQuery(process.env.defaultMessageQuery, [sid, 'Welcome Greeting']);
    if (newlyInteractionId != null && newlyInteractionId != undefined && newlyInteractionId != "" && wlcMessage.length > 0 && wlcMessage[0].Is_disable == 1) {
      // console.log("defaut msg")
     // sendDefultMsg(wlcMessage[0].link, wlcMessage[0].value, wlcMessage[0].message_type, phone_number_id, from);
      let sendMessages=await webJs.sendMessages(sid,from,wlcMessage[0].message_type, wlcMessage[0].value,wlcMessage[0].link);
      let updateSmsRes = await db.excuteQuery(process.env.updateSms, [1, new Date(), msg_id]);
    }
    // console.log(wlcMessage);
    return wlcMessage;
  } catch (err) {
    console.log(err);
  }
}


async function getOutOfOfficeMsg(sid, phone_number_id, from, msg_id) {
  try {
    // let outOfOfficeQuery = `SELECT * FROM defaultmessages where SP_ID=? AND title='Out of Office'`
    var outOfOfficeMessage = await db.excuteQuery(outOfOfficeQuery, [process.env.defaultMessageQuery, 'Out of Office']);
    if (outOfOfficeMessage.length > 0 && outOfOfficeMessage[0].Is_disable == 1) {

      let messageInterval = await db.excuteQuery(process.env.msgBetweenOneHourQuery, [newId, 2])
      if (messageInterval.length <= 0) {
        //sendDefultMsg(outOfOfficeMessage[0].link, outOfOfficeMessage[0].value, outOfOfficeMessage[0].message_type, phone_number_id, from)
       let sendDefaultMessage=await webJs.sendMessages(sid,from,outOfOfficeMessage[0].message_type,outOfOfficeMessage[0].value,outOfOfficeMessage[0].link)
        let updateSmsRes = await db.excuteQuery(process.env.updateSms, [2, new Date(), msg_id]);
      }
    }

  } catch (err) {
    console.log(err);
  }
}


async function workingHoursDetails(sid, phone_number_id, from, msg_id, newId) {
  const currentTime = new Date();
  let workingHourQuery = `select * from WorkingTimeDetails where SP_ID=? and isDeleted !=1`;
  var workingData = await db.excuteQuery(workingHourQuery, [sid]);
  if ((isWorkingTime(workingData, currentTime))) {
    AllAgentsOffline(sid, phone_number_id, from, msg_id, newId);
    console.log('It is currently  within working hours.' + msg_id);
    return true;
  }
  console.log('It is currently not within working hours.');
  return false;
}


function isWorkingTime(data, currentTime) {
  console.log(data)
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const currentTimeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  console.log(currentDay)
  const time = new Date()

  for (const item of data) {
    const workingDays = item.working_days.split(',');
    const date = new Date().getHours();
    const getMin = new Date().getMinutes();
    console.log(date + " :::::::" + getMin)

    const startTime = item.start_time.split(':');
    const endTime = item.end_time.split(':');
    console.log(startTime + " " + endTime + workingDays.includes(currentDay))
    console.log(endTime[0] + " " + date + endTime[1] + "| " + getMin)
    if (workingDays.includes(currentDay) && (((startTime[0] < date) || (date === startTime[0] && startTime[1] <= getMin)) && ((endTime[0] > date) || ((endTime[1] === getMin) && (endTime[1] >= getMin))))) {
      console.log("data===========")
      return true;
    }



  }

  return false;
}



async function sendDefultMsg(link, caption, typeOfmsg, phone_number_id, from) {
  
  console.log("messageData===")
  try {

    const messageData = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: from,
      type: typeOfmsg,
    };

    if (typeOfmsg === 'video' || typeOfmsg === 'image' || typeOfmsg === 'document') {
      messageData[typeOfmsg] = {
        link: link,
        caption: caption
      };
    }
    if (typeOfmsg === 'text') {
      messageData[typeOfmsg] = {
        "preview_url": true,
        "body": caption
      };
    }
    console.log(messageData)
    // Send the video message using Axios
    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages?access_token=${token}`,
      data: messageData, // Use the video message structure
      headers: { "Content-Type": "application/json" },
    });

    console.log("****META APIS****", response.data);
  } catch (err) {
    console.error("______META ERR_____", err);
  }

}



async function AllAgentsOffline(sid, phone_number_id, from, msg_id, newId) {
  console.log("msg_id");
  var activeAgentQuery = "select *from user where  IsActive=1 and SP_ID=?";
  let activeAgent = await db.excuteQuery(activeAgentQuery, [sid]);

  if (activeAgent.length <= 0) {

    console.log(msg_id + " " + newId);
    // let AgentsOfflineQuery = `SELECT * FROM defaultmessages where SP_ID=? AND title='All Agents Offline'`
    var AgentsOfflineMessage = await db.excuteQuery(process.env.defaultMessageQuery, [sid, 'All Agents Offline']);
    if (AgentsOfflineMessage.length > 0 && AgentsOfflineMessage[0].Is_disable == 1) {
      let messageInterval = await db.excuteQuery(process.env.msgBetweenOneHourQuery, [newId, 3])
      if (messageInterval.length <= 0) {
       // sendDefultMsg(AgentsOfflineMessage[0].link, AgentsOfflineMessage[0].value, AgentsOfflineMessage[0].message_type, phone_number_id, from)
        let sendMessages=await webJs.sendMessages(sid,from,AgentsOfflineMessage[0].message_type, AgentsOfflineMessage[0].value,AgentsOfflineMessage[0].link);
        // let updateSms = `UPDATE Message set system_message_type_id=3 where Message_id=${msg_id}`
        let updateSmsRes = await db.excuteQuery(process.env.updateSms, [3, new Date(), msg_id]);
      }
    }

  }
}

module.exports = { saveIncommingMessages, getDetatilsOfSavedMessage }