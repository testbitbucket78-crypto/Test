var express = require("express");
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "10000kb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10000kb", extended: true }));
const removeTags = require('./removeTagsFromRichTextEditor')
const db = require('./dbhelper')
const axios = require('axios');
const middleWare = require('./middleWare')
const token = 'EAAU0g9iuku4BOzSD75ynSUzKSsYrIWv3qkEa9QPAnUNTUzPwN5aTjGxoAHxsXF4Nlrw8UxbMGqZBxqarODf2sY20MvFfTQm0umq4ZBKCpFAJdcPtbcYSZBsHMqYVwjfFPiQwFk1Rmadl4ctoncnxczMGJZALoVfZBpqoQ0lYHzOwbRb1nvImzhL4ex53c9HKVyzl2viy4EhLy9g0K';
let defaultMessageQuery = `SELECT * FROM defaultmessages where SP_ID=? AND title=?`
let updateSms = `UPDATE Message set system_message_type_id=?,updated_at=? where Message_id=?`
let updateInteractionMapping = "INSERT INTO InteractionMapping (is_active,InteractionId,AgentId,MappedBy) VALUES ?"
addTagQuery = "UPDATE EndCustomer SET tag =?  WHERE customerId =? and SP_ID=?"
selectTagQuery = "select tag from EndCustomer where customerId= ?"
msgBetweenOneHourQuery = `SELECT *
FROM Message
WHERE interaction_id = ? and system_message_type_id=?
  AND TIMESTAMPDIFF(Minute, updated_at, NOW()) <= 60  
ORDER BY updated_at DESC 
LIMIT 1`;
var insertMessageQuery = "INSERT INTO Message (SPID,Type,ExternalMessageId, interaction_id, Agent_id, message_direction,message_text,message_media,media_type,Message_template_id,Quick_reply_id,created_at,updated_at,system_message_type_id,assignAgent) VALUES ?";

async function autoReplyDefaultAction(isAutoReply, autoReplyTime, isAutoReplyDisable, message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType) {
  if (isAutoReplyDisable != 1) {

    const currentTime = new Date();
    const autoReplyVal = new Date(autoReplyTime)
    console.log(autoReplyVal ,autoReplyTime)
    if (autoReplyTime != null && (autoReplyVal <= currentTime) && autoReplyTime != undefined) { 
      let sendSReply = await sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType)
    }
    if (autoReplyTime == null || autoReplyTime == undefined || autoReplyTime =='') { 
      let sendSReply = await sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType)
    }
  }
}

async function sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType) {
//   console.log("____Send SMART REPLIESS______" + replystatus)
  const currentTime = new Date();
  const replystatus1 = new Date(replystatus);
  if (replystatus != null && (replystatus1 <= currentTime) && replystatus != undefined) {
    var response = await getSmartReplies(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType);
  //   console.log("____Send SMART REPLIESS______NOT  NULLL" + response);
  }
  if (replystatus == null || replystatus == undefined || replystatus == "") {
  //   console.log("replystatus == null" + message_text)
    var response = await getSmartReplies(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType);
    // console.log("____Send SMART REPLIESS______" + response);
  }
}


async function matchSmartReplies(message_text, sid,channelType) {
  var allSmartReplies = await db.excuteQuery(`select * from SmartReply where SP_ID =? and (isDeleted is null || isDeleted = 0 )`, [sid]);
  var reply;

  for (let i = 0; i < allSmartReplies.length; i++) {
    // console.log(allSmartReplies[i])
    const storedValue = allSmartReplies[i].MatchingCriteria;
    let id = allSmartReplies[i].ID
    //console.log(storedValue)
    // console.log(storedValue =='contains' || storedValue == 'Fuzzy Matching' || storedValue=='Exact matching')

    if (storedValue == 'contains') {

      sreplyQuery = `SELECT DISTINCT  t2.* 
 FROM SmartReply t1
JOIN SmartReplyAction t2 ON t1.ID = t2.SmartReplyID and t2.isDeleted !=1
JOIN SmartReplyKeywords t3 ON t1.ID = t3.SmartReplyId and t3.isDeleted !=1
WHERE ? LIKE CONCAT('%', t3.Keyword , '%')AND t1.SP_ID=? and t1.ID=?  and (t1.isDeleted is null  || t1.isDeleted =0) and t1.channel=?`

      reply = await db.excuteQuery(sreplyQuery, [[message_text], sid, id,channelType]);


      if (reply.length > 0) {
        // console.log(allSmartReplies.length, "break contains i ==", i)
        // console.log(" reply abc")
        break;
      }
      // break;

    } else if (storedValue == 'Fuzzy matching') {
      //  console.log("Fuzzy Matching");
      let FuzzyQuery = `SELECT t2.* 
      FROM SmartReply t1 JOIN SmartReplyAction t2 ON t1.ID = t2.SmartReplyID and t2.isDeleted !=1
      JOIN SmartReplyKeywords t3 ON t1.ID = t3.SmartReplyId and t3.isDeleted !=1
      WHERE  SOUNDEX(t3.Keyword) = SOUNDEX(?)
      AND t1.SP_ID=? and t1.ID=? and (t1.isDeleted is null  || t1.isDeleted =0) and t1.channel=?`
      reply = await db.excuteQuery(FuzzyQuery, [[message_text], sid, id,channelType]);
      // console.log(reply)
      if (reply.length > 0) {

        break;
      }

      //break;

    } else if (storedValue == 'Exact matching') {
      //  console.log("exact match")
      let exactQuery = `SELECT t2.* 
      FROM SmartReply t1
     JOIN SmartReplyAction t2 ON t1.ID = t2.SmartReplyID and t2.isDeleted !=1
     JOIN SmartReplyKeywords t3 ON t1.ID = t3.SmartReplyId and t3.isDeleted !=1
     WHERE t3.Keyword=? AND t1.SP_ID=? and t1.ID=? and (t1.isDeleted is null  || t1.isDeleted =0) and t1.channel=?`
      reply = await db.excuteQuery(exactQuery, [[message_text], sid, id,channelType]);
      //console.log(reply)
      if (reply.length > 0) {

        break;
      }

      //break;

    }

  }
  //console.log(reply)
  return reply;
}

async function getSmartReplies(message_text, phone_number_id, contactname, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType) {
  try {
    // console.log("in side getSmartReplies method")
    // console.log("message_text")
    // console.log(message_text)
    // console.log("_________process.env.insertMessage__________")

    let defautWlcMsg = await getWelcomeGreetingData(sid, msg_id, newlyInteractionId, phone_number_id, from, channelType,agid);
    var replymessage = await matchSmartReplies(message_text, sid,channelType)
    let defultOutOfOfficeMsg = await workingHoursDetails(sid, phone_number_id, from, msg_id, newId, newlyInteractionId, channelType,agid);

    //console.log("defultOutOfOfficeMsg")
    //console.log(defautWlcMsg)
    //console.log(replymessage)
    //console.log(defultOutOfOfficeMsg)
    //var autoReply = replymessage[0].Message
    //console.log(replymessage.length)

    //console.log(" replymessage.length " + replymessage.length)
    if (replymessage?.length > 0) {
      //console.log("replymessage.length")
      iterateSmartReplies(replymessage, phone_number_id, from, sid, custid, agid, replystatus, newId, channelType)
    } else if (defultOutOfOfficeMsg === false) {

      // console.log("getOutOfOfficeResult")
      let getOutOfOfficeResult = await getOutOfOfficeMsg(sid, phone_number_id, from, msg_id, newlyInteractionId, channelType,agid);
      // console.log(getOutOfOfficeResult)
    }
    else if (defautWlcMsg.length > 0 && defautWlcMsg[0].Is_disable == 1) {
      // console.log("defaut msg")
      let messageInterval = await db.excuteQuery(msgBetweenOneHourQuery, [newId, 1])
      if (messageInterval.length < 0) {
        // sendDefultMsg(wlcMessage[0].link, wlcMessage[0].value, wlcMessage[0].message_type, phone_number_id, from);
        messageThroughselectedchannel(sid, from, wlcMessage[0].message_type, wlcMessage[0].value, wlcMessage[0].link, phone_number_id, channelType,agid,newId)
        let updateSmsRes = await db.excuteQuery(updateSms, [1, new Date(), msg_id]);
      }

    }


  } catch (err) {
    console.log("____getSmartReplies method err______")
    console.log(err)
  }
}


async function iterateSmartReplies(replymessage, phone_number_id, from, sid, custid, agid, replystatus, newId, channelType) {
  try {
    var messageToSend = [];

    // Loop over the messages array and send each message
    var rm = new Promise((resolve, reject) => {
      replymessage.forEach(async (message, index) => {

        var media = message.Media
        var value = message.Value;
        var testMessage = message.Message;                  // Assuming the 'Message' property contains the message content
        var actionId = message.ActionID;                 // Assuming the 'ActionID' property contains the action ID
        // console.log("actionId", actionId)
        let PerformingActions = await PerformingSReplyActions(actionId, value, sid, custid, agid, replystatus, newId);

        // Parse the message template to get placeholders
        const placeholders = parseMessageTemplate(testMessage);
        if (placeholders.length > 0) {
          // Construct a dynamic SQL query based on the placeholders
      
          const results = await removeTags.getDefaultAttribue(placeholders, spid, custid);
          console.log("results", results)

          placeholders.forEach(placeholder => {
              const result = results.find(result => result.hasOwnProperty(placeholder));
              const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
              content = content.replace(`{{${placeholder}}}`, replacement);
          });

        }

        var type = 'image';
        if (media == null || media == "") {
          var type = 'text';
        }

        let content = await removeTags.removeTagsFromMessages(testMessage);
        var relyMsg = {
          "replyId": message.ID,
          "sid": sid,
          "from": from,
          "type": type,
          "content": content,
          "media": media,
          "phone_number_id": phone_number_id,
          "channelType": channelType,
          "agentId": agid,
          "interactionId": newId,
          "testMessage":testMessage
        }
        console.log(index, "replysms")
        messageToSend.push(relyMsg)

        if (messageToSend.length === replymessage.length) {//once everything is iterated resolve the promois
          console.log("*****************")
          resolve();
        }
      });

    });

    rm.then(() => {
      console.log("Before sort");
      messageToSend.forEach((message) => {
        console.log(message.replyId);
      });
      messageToSend = messageToSend.sort((a, b) => (a.replyId - b.replyId));
      console.log("After sort");
      messageToSend.forEach((message) => {
        console.log(message.replyId);
      });

      var i = 1;
      function myLoop(i) {
        setTimeout(function () {
          // console.log(message.content ,i); //  your code here 
          var message = messageToSend[i - 1]
          if (message.content?.length) {
            SreplyThroughselectedchannel(message.sid, message.from, message.type, message.content, message.media, message.phone_number_id, message.channelType, message.agentId, message.interactionId,message.testMessage);
          }
          i++;
          if (i <= (messageToSend.length)) {
            myLoop(i);   //  decrement i and call myLoop again if i > 0
          }
        }, 500)
      };
      myLoop(i);
      // messageToSend.forEach((message)=>{





      // })
    });

  } catch (err) {
    console.log(err)
  }


}

// Common Function to parse the message template and retrieve {{}} placeholders
function parseMessageTemplate(template) {
  const placeholderRegex = /{{(.*?)}}/g;
  const placeholders = [];
  let match;
  while ((match = placeholderRegex.exec(template))) {
    placeholders.push(match[1]);
  }
  return placeholders;
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
      // console.log(`Performing action 4 for Trigger Flow: ${value}`);
      break;
    case 5:
      // console.log(`Performing action 5 for Name Update: ${value}`);
      break;
    case 6:
      //console.log(`Performing action 6 for Resolve Conversation: ${value}`);
      break;
    default:
    // Handle any other Action IDs
    // console.log(`Unknown action ID: ${actionId}`);
  }
}



async function assignAction(value, agid, newId) {
  //console.log(`Performing action 1 for  Assign Conversation: ${value}`);
  is_active = 1
  var values = [[is_active, newId, agid, value]]
  var assignCon = await db.excuteQuery(updateInteractionMapping, [values])
  //console.log(assignCon)
}



async function addTag(value, sid, custid) {
  //  console.log(`Performing action 2 for Add Contact Tag: ${value}`);
  var addConRes = await db.excuteQuery(addTagQuery, [value, custid, sid])
  // console.log(addConRes)
}


async function removeTag(value, custid) {
  //  console.log(`Performing action 3 for Remove Contact Tag: ${value}`);
  var maptag = value;
  var maptagItems = maptag.split(',')
  // console.log("maptag " + maptag)
  var result = await db.excuteQuery(selectTagQuery, [custid])
  //console.log(result)
  var removetagQuery = ""
  if (result.length > 0) {

    const tagValue = result[0].tag
    // console.log("tagValue" + tagValue)
    if (tagValue != ' ' && tagValue != null) {
      // Split the tag value into an array of tag items
      const tagItems = tagValue.split(',');

      var itemmap = '';

      //console.log(itemmap == maptag)
      // Get the count of tag items
      const tagItemCount = tagItems.length;
      //console.log("tagItemCount" + tagItemCount)
      for (var i = 0; i < tagItems.length; i++) {

        if (!(maptagItems.includes(tagItems[i]))) {
          var itemmap = itemmap + (itemmap ? ',' : '') + tagItems[i]

        }


      }
      //console.log("for loop end" + itemmap)
      removetagQuery = "UPDATE EndCustomer SET tag ='" + itemmap + "' WHERE customerId = " + custid + "";

    }
  }
  //console.log(removetagQuery)
  var remTagCon = await db.excuteQuery(removetagQuery, [])
  //console.log(remTagCon)
}



async function getWelcomeGreetingData(sid, msg_id, newlyInteractionId, phone_number_id, from, channelType,agid) {
  try {

    var wlcMessage = await db.excuteQuery(defaultMessageQuery, [sid, 'Welcome Greeting']);
    if (newlyInteractionId != null && newlyInteractionId != undefined && newlyInteractionId != "" && wlcMessage.length > 0 && wlcMessage[0].Is_disable == 1) {
      // console.log("defaut msg")
      // sendDefultMsg(wlcMessage[0].link, wlcMessage[0].value, wlcMessage[0].message_type, phone_number_id, from);
      messageThroughselectedchannel(sid, from, wlcMessage[0].message_type, wlcMessage[0].value, wlcMessage[0].link, phone_number_id, channelType,agid,newlyInteractionId)
      let updateSmsRes = await db.excuteQuery(updateSms, [1, new Date(), msg_id]);
    }
    // console.log(wlcMessage);
    return wlcMessage;
  } catch (err) {
    console.log(err);
  }
}


async function getOutOfOfficeMsg(sid, phone_number_id, from, msg_id, newId, channelType,agid) {
  try {
    let result = '';

    var outOfOfficeMessage = await db.excuteQuery(defaultMessageQuery, [sid, 'Out of Office']);
    // console.log(outOfOfficeMessage)
    if (outOfOfficeMessage.length > 0 && outOfOfficeMessage[0].Is_disable == 1) {
      // console.log("outOfOfficeMessage Is_disable")
      let messageInterval = await db.excuteQuery(msgBetweenOneHourQuery, [newId, 2])
      //  console.log(messageInterval.length)
      if (messageInterval.length <= 0) {
        // console.log("messageInterval")
        //result = await sendDefultMsg(outOfOfficeMessage[0].link, outOfOfficeMessage[0].value, outOfOfficeMessage[0].message_type, phone_number_id, from)
        result = await messageThroughselectedchannel(sid, from, outOfOfficeMessage[0].message_type, outOfOfficeMessage[0].value, outOfOfficeMessage[0].link, phone_number_id, channelType,agid,newId)
        let updateSmsRes = await db.excuteQuery(updateSms, [2, new Date(), msg_id]);
      }
    }
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
}


async function workingHoursDetails(sid, phone_number_id, from, msg_id, newId, channelType,agid) {
  const currentTime = new Date();
  let workingHourQuery = `select * from WorkingTimeDetails where SP_ID=? and isDeleted !=1`;
  var workingData = await db.excuteQuery(workingHourQuery, [sid]);
  if ((isWorkingTime(workingData, currentTime))) {
    AllAgentsOffline(sid, phone_number_id, from, msg_id, newId, channelType,agid);
    // console.log('It is currently  within working hours.' + msg_id);
    return true;
  }
  // console.log('It is currently not within working hours.');
  return false;
}


function isWorkingTime(data, currentTime) {
  //console.log(data)
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const currentTimeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  // console.log(currentDay)
  const time = new Date()

  for (const item of data) {
    const workingDays = item.working_days.split(',');
    const date = new Date().getHours();
    const getMin = new Date().getMinutes();
    // console.log(date + " :::::::" + getMin)

    const startTime = item.start_time.split(':');
    const endTime = item.end_time.split(':');
    // console.log(startTime + " " + endTime + workingDays.includes(currentDay))
    // console.log(endTime[0] + " " + date + endTime[1] + "| " + getMin)
    if (workingDays.includes(currentDay) && (((startTime[0] < date) || (date === startTime[0] && startTime[1] <= getMin)) && ((endTime[0] > date) || ((endTime[1] === getMin) && (endTime[1] >= getMin))))) {
      // console.log("data===========")
      return true;
    }



  }

  return false;
}



async function AllAgentsOffline(sid, phone_number_id, from, msg_id, newId, channelType,agid) {
  //console.log("msg_id");
  var activeAgentQuery = "select *from user where  IsActive=1 and SP_ID=?";
  let activeAgent = await db.excuteQuery(activeAgentQuery, [sid]);

  if (activeAgent.length <= 0) {

    //console.log(msg_id + " " + newId);

    var AgentsOfflineMessage = await db.excuteQuery(defaultMessageQuery, [sid, 'All Agents Offline']);
    if (AgentsOfflineMessage.length > 0 && AgentsOfflineMessage[0].Is_disable == 1) {
      let messageInterval = await db.excuteQuery(msgBetweenOneHourQuery, [newId, 3])
      if (messageInterval.length <= 0) {
        //sendDefultMsg(AgentsOfflineMessage[0].link, AgentsOfflineMessage[0].value, AgentsOfflineMessage[0].message_type, phone_number_id, from)
        messageThroughselectedchannel(sid, from, AgentsOfflineMessage[0].message_type, AgentsOfflineMessage[0].value, AgentsOfflineMessage[0].link, phone_number_id, channelType,agid,newId)

        let updateSmsRes = await db.excuteQuery(updateSms, [3, new Date(), msg_id]);
      }
    }

  }
}


async function messageThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType,agentId,interactionId) {
  if (channelType == 'WhatsApp Official') {

    middleWare.sendDefultMsg(media, text, type, phone_number_id, from);
  } if (channelType == 'WhatsApp Web') {

    let result = await middleWare.postDataToAPI(spid, from, type, text, media)
    if (result.status == 200) {
      let messageValu = [[spid, type, "", interactionId, agentId, 'Out', text, media, "", "", "", new Date(), new Date(), "",-2]]
      let saveMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
    }
  }
}

async function SreplyThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType, agentId, interactionId ,testMessage) {
  if (channelType == 'WhatsApp Official') {

    middleWare.sendDefultMsg(media, text, type, phone_number_id, from);
  } if (channelType == 'WhatsApp Web') {

    let result = await middleWare.postDataToAPI(spid, from, type, text, media)
    if (result.status == 200) {
      let messageValu = [[spid, type, "", interactionId, agentId, 'Out', testMessage, media, "", "", "", new Date(), new Date(), "",-2]]
      let saveMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
    }
  }
}

module.exports = { autoReplyDefaultAction }