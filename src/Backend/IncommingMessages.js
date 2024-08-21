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
const moment = require('moment');
const token = 'EAAQTkLZBFFR8BOxmMdkw15j53ZCZBhwSL6FafG1PCR0pyp11EZCP5EO8o1HNderfZCzbZBZBNXiEFWgIrwslwoSXjQ6CfvIdTgEyOxCazf0lWTLBGJsOqXnQcURJxpnz3i7fsNbao0R8tc3NlfNXyN9RdDAm8s6CxUDSZCJW9I5kSmJun0Prq21QeOWqxoZAZC0ObXSOxM3pK0KfffXZC5S';
let defaultMessageQuery = `SELECT * FROM defaultmessages where SP_ID=? AND title=? and isDeleted !=1`
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

async function autoReplyDefaultAction(isAutoReply, autoReplyTime, isAutoReplyDisable, message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted, inactiveAgent, inactiveTimeOut,newiN) {
  console.log("isAutoReply, autoReplyTime, isAutoReplyDisable")
  console.log(isAutoReply, autoReplyTime, isAutoReplyDisable)
  let assignAgent = await db.excuteQuery('select * from InteractionMapping where InteractionId =?', [newId]);
  let interactionStatus = await db.excuteQuery('select * from Interaction where InteractionId = ? and is_deleted !=1 ', [newId])

  const timeoutDuration = inactiveTimeOut * 60 * 1000; // Convert minutes to milliseconds
  console.log(timeoutDuration,inactiveTimeOut)
  // Set timeout to trigger inactivity check after the specified period
  setTimeout(() => {
    inActiveAgentTimeOut(inactiveAgent, inactiveTimeOut, sid, newId, agid);
  }, timeoutDuration)

  if (isAutoReplyDisable != 1) {

    let currentTime = new Date();
    
    let autoReplyVal = new Date(currentTime);
    if(autoReplyTime !=0){
    autoReplyVal.setMinutes(autoReplyVal.getMinutes() + autoReplyTime);
    }
    //const autoReplyVal = new Date(currentTime)   // autoReplyTime when auto reply start
    console.log("currentTime,autoReplyVal ,autoReplyTime",currentTime,autoReplyVal ,autoReplyTime)
    if (autoReplyTime != null && (autoReplyVal <= currentTime) && autoReplyTime != undefined) {
      let sendSReply = await sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted,newiN)
      return sendSReply;
    }
    if (autoReplyTime == null || autoReplyTime == undefined || autoReplyTime == '') {
      let sendSReply = await sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted,newiN)
      return sendSReply;
    }
  } else if (isAutoReplyDisable == 1 && (assignAgent?.length == 0 || (assignAgent?.length != 0 && interactionStatus[0]?.interaction_status == 'Resolved'))) {

    const currentTime = new Date();
    const autoReplyVal = new Date(autoReplyTime)   // autoReplyTime when auto reply start
    //console.log(autoReplyVal ,autoReplyTime)
    if (autoReplyTime != null && (autoReplyVal <= currentTime) && autoReplyTime != undefined) {
      let sendSReply = await sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted)
      return sendSReply;
    }
    if (autoReplyTime == null || autoReplyTime == undefined || autoReplyTime == '') {
      let sendSReply = await sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted)
      return sendSReply;
    }
  }

 


}


async function inActiveAgentTimeOut(inactiveAgent, inactiveTimeOut, sid, newId,agid) {
  try {
    if (inactiveAgent == 1) {
      let isChatAssign = await db.excuteQuery('select * from InteractionMapping where InteractionId =? and (AgentId != -1 OR AgentId !=?)  order by created_at desc limit 1', [newId,agid]);
     console.log("isChatAssign",isChatAssign)
      if (isChatAssign?.length > 0) {
        let isReplySended = await db.excuteQuery(`SELECT * FROM Message WHERE interaction_id = ? and SPID=?  AND message_direction = 'out'  AND created_at >= NOW() - INTERVAL ? MINUTE; `, [newId, sid, inactiveTimeOut]);
        if (isReplySended?.length <= 0) {
          let inactiveUser = await db.excuteQuery('update user set IsActive =0 where uid =? and SP_ID=?', [isChatAssign[0]?.AgentId, sid]);
          let updateMapping = await db.excuteQuery('Update InteractionMapping set AgentId = -1 where MappingId =?',[isChatAssign[0]?.MappingId])
        }
      }
    }
  } catch (err) {
    console.log("inActiveAgentTimeOut ERR", err)
  }
}

async function sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted,newiN) {
  console.log("***********", replystatus, "____Send SMART REPLIESS______")
  const currentTime = new Date();
  const replystatus1 = new Date(replystatus);  //replystatus  is pauseTill 
  console.log(replystatus1, "(replystatus1 <= currentTime)", currentTime, (replystatus1 <= currentTime))
  if (replystatus != null && (replystatus1 <= currentTime) && replystatus != undefined) {
    var response = await getSmartReplies(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted,newiN);
    console.log("____Send SMART REPLIESS______NOT  NULLL" + response);
    return response;
  }
  if (replystatus == null || replystatus == undefined || replystatus == "") {
    console.log("replystatus == null" + message_text)
    var response = await getSmartReplies(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted,newiN);
    console.log("____Send SMART REPLIESS______" + response);
    return response;
  }
}


async function matchSmartReplies(message_text, sid, channelType) {
  var allSmartReplies = await db.excuteQuery(`select * from SmartReply where SP_ID =? and (isDeleted is null || isDeleted = 0 )`, [sid]);
  var reply;
  // console.log(sid,"allSmartReplies",allSmartReplies)
  for (let i = 0; i < allSmartReplies.length; i++) {
    // console.log(allSmartReplies[i])
    const storedValue = allSmartReplies[i].MatchingCriteria;
    let id = allSmartReplies[i].ID
    // console.log("storedValue",storedValue)
    // console.log(storedValue =='contains' || storedValue == 'Fuzzy Matching' || storedValue=='Exact matching')

    if (storedValue == 'contains') {

      sreplyQuery = `SELECT DISTINCT  t2.* 
 FROM SmartReply t1
JOIN SmartReplyAction t2 ON t1.ID = t2.SmartReplyID and t2.isDeleted !=1
JOIN SmartReplyKeywords t3 ON t1.ID = t3.SmartReplyId and t3.isDeleted !=1
WHERE ? LIKE CONCAT('%', t3.Keyword , '%')AND t1.SP_ID=? and t1.ID=?  and (t1.isDeleted is null  || t1.isDeleted =0) and t1.channel=?`

      reply = await db.excuteQuery(sreplyQuery, [[message_text], sid, id, channelType]);


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
      reply = await db.excuteQuery(FuzzyQuery, [[message_text], sid, id, channelType]);
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
      reply = await db.excuteQuery(exactQuery, [[message_text], sid, id, channelType]);
      //console.log(reply)
      if (reply.length > 0) {

        break;
      }

      //break;

    }

  }
  // console.log(reply,sid, channelType)
  return reply;
}

async function getSmartReplies(message_text, phone_number_id, contactname, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted,newiN) {
  try {
    console.log("in side getSmartReplies method", message_text, phone_number_id, contactname, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType)
    // console.log("message_text")
    // console.log(message_text)
    // console.log("_________process.env.insertMessage__________")


    var replymessage = await matchSmartReplies(message_text, sid, channelType)

    let defultOutOfOfficeMsg = await workingHoursDetails(sid, phone_number_id, from, msg_id, newId, channelType, agid);

    //console.log("defautWlcMsg========" ,defautWlcMsg)
    //console.log(defautWlcMsg)
    //console.log(replymessage)
    // console.log(defultOutOfOfficeMsg)
    //var autoReply = replymessage[0].Message
    //console.log(replymessage.length)

    //console.log("defultOutOfOfficeMsg",defultOutOfOfficeMsg,replymessage, " SMARTREPLY.length " + replymessage?.length)
    if (replymessage?.length > 0) {

      let isSReply = await iterateSmartReplies(replymessage, phone_number_id, from, sid, custid, agid, replystatus, newId, channelType);
      console.log("iterateSmartReplies replymessage.length", isSReply)
      return isSReply;
    } else if (replymessage?.length <= 0 && newiN == 'If not exist') {
      let defautWlcMsg = await getWelcomeGreetingData(sid, msg_id, newId, phone_number_id, from, channelType, agid, isContactPreviousDeleted);
       if(defautWlcMsg == false && defultOutOfOfficeMsg === false){
        console.log("getOutOfOfficeResult")
         defautWlcMsg = await getOutOfOfficeMsg(sid, phone_number_id, from, msg_id, newId, channelType, agid);
       }
       return defautWlcMsg;
    }
    else if (defultOutOfOfficeMsg === false) {

      console.log("getOutOfOfficeResult")
      let getOutOfOfficeResult = await getOutOfOfficeMsg(sid, phone_number_id, from, msg_id, newId, channelType, agid);

      return getOutOfOfficeResult;
    }
    // else if (defautWlcMsg.length > 0 && defautWlcMsg[0].Is_disable == 1) {

    //   let messageInterval = await db.excuteQuery(msgBetweenOneHourQuery, [newId, 1])
    //   console.log(messageInterval,"above if else defautWlcMsg msg", messageInterval.length)
    //   if (messageInterval.length <= 0) {
    //     // sendDefultMsg(wlcMessage[0].link, wlcMessage[0].value, wlcMessage[0].message_type, phone_number_id, from);
    //     let message_text = await getExtraxtedMessage(defautWlcMsg[0]?.value)
    //     let result = await messageThroughselectedchannel(sid, from, defautWlcMsg[0].message_type, message_text, defautWlcMsg[0].link, phone_number_id, channelType, agid, newId)
    //     console.log("main welcome", result)
    //     let myUTCString = new Date().toUTCString();
    //     const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
    //     let updateSmsRes = await db.excuteQuery(updateSms, [1, time, msg_id]);
    //     return false;
    //   }

    // }


  } catch (err) {
    console.log("____getSmartReplies method err______")
    console.log(err)
  }
}

async function iterateSmartReplies(replymessage, phone_number_id, from, sid, custid, agid, replystatus, newId, channelType) {
  try {
    var messageToSend = [];
     var isActionAddded = 0;
    for (let message of replymessage) {
      var media = message.Media;
      var value = message.ValueUuid;
      var testMessage = message.Message;  // Assuming the 'Message' property contains the message content
      var actionId = message.ActionID;  // Assuming the 'ActionID' property contains the action ID
      var msgVar = message.message_variables;
      var media_type = message.media_type;
      let PerformingActions = await PerformingSReplyActions(actionId, value, sid, custid, agid, replystatus, newId);
      let content = await removeTags.removeTagsFromMessages(testMessage);
      if(actionId == 2){
        isActionAddded = isActionAddded +1;
      }
      //console.log("content",content)
      // Parse the message template to get placeholders
      const placeholders = parseMessageTemplate(testMessage);
      //console.log(testMessage)
      if (placeholders.length > 0) {
        // Construct a dynamic SQL query based on the placeholders

        let results;
        //S console.log("msgVar",msgVar)
        if (msgVar != null) {

          results = await removeTags.getDefaultAttribue(msgVar, sid, custid);
          //console.log("atribute result ")
          placeholders.forEach(placeholder => {
            const result = results.find(result => result.hasOwnProperty(placeholder));
            //  console.log(placeholder,"place foreach",results)
            const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
            content = content.replace(`{{${placeholder}}}`, replacement);
          });
        } else {

          results = await removeTags.getDefaultAttribueWithoutFallback(placeholders, sid, custid);
        }

        // console.log("results", results);

        placeholders.forEach(placeholder => {
          const result = results.find(result => result.hasOwnProperty(placeholder));
          const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
          content = content.replace(`{{${placeholder}}}`, replacement);
        });
      }

      var type = determineMediaType(media_type);;
      

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
        "testMessage": testMessage
      };
      console.log(message.replyId, "replysms");
      messageToSend.push(relyMsg);
    }

    console.log("Before sort");
    messageToSend.forEach((message) => {
      console.log(message.replyId);
    });
    messageToSend = messageToSend.sort((a, b) => (a.replyId - b.replyId));
    console.log("After sort");
    messageToSend.forEach((message) => {
      console.log(message.replyId);
    });

    for (let message of messageToSend) {
      if (message.content?.length) {
        let respose = await SreplyThroughselectedchannel(
          message.sid,
          message.from,
          message.type,
          message.content,
          message.media,
          message.phone_number_id,
          message.channelType,
          message.agentId,
          message.interactionId,
          message.testMessage
        );
        //console.log("SreplyThroughselectedchannel response:", respose);
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before sending the next message
    }

    console.log("iterateSmartReplies completed");
    return isActionAddded;

  } catch (err) {
    console.log(err);
    return false;
  }
}


// async function iterateSmartReplies(replymessage, phone_number_id, from, sid, custid, agid, replystatus, newId, channelType) {
//   try {
//     var messageToSend = [];
//     let respose;
//     // Loop over the messages array and send each message
//     var rm = new Promise((resolve, reject) => {
//       replymessage.forEach(async (message, index) => {

//         var media = message.Media
//         var value = message.Value;
//         var testMessage = message.Message;                  // Assuming the 'Message' property contains the message content
//         var actionId = message.ActionID;                 // Assuming the 'ActionID' property contains the action ID
//         // console.log("actionId", actionId)
//         let PerformingActions = await PerformingSReplyActions(actionId, value, sid, custid, agid, replystatus, newId);
//         let content = await removeTags.removeTagsFromMessages(testMessage);
//         // Parse the message template to get placeholders
//         const placeholders = parseMessageTemplate(testMessage);
//         if (placeholders.length > 0) {
//           // Construct a dynamic SQL query based on the placeholders

//           const results = await removeTags.getDefaultAttribue(placeholders, sid, custid);
//           console.log("results", results)

//           placeholders.forEach(placeholder => {
//             const result = results.find(result => result.hasOwnProperty(placeholder));
//             const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
//             content = content.replace(`{{${placeholder}}}`, replacement);
//           });

//         }

//         var type = 'image';
//         if (media == null || media == "") {
//           var type = 'text';
//         }


//         var relyMsg = {
//           "replyId": message.ID,
//           "sid": sid,
//           "from": from,
//           "type": type,
//           "content": content,
//           "media": media,
//           "phone_number_id": phone_number_id,
//           "channelType": channelType,
//           "agentId": agid,
//           "interactionId": newId,
//           "testMessage": testMessage
//         }
//         console.log(index, "replysms")
//         messageToSend.push(relyMsg)

//         if (messageToSend.length === replymessage.length) {//once everything is iterated resolve the promois
//           console.log("*****************")
//           resolve();
//         }
//       });

//     });

//     rm.then(() => {
//       console.log("Before sort");
//       messageToSend.forEach((message) => {
//         console.log(message.replyId);
//       });
//       messageToSend = messageToSend.sort((a, b) => (a.replyId - b.replyId));
//       console.log("After sort");
//       messageToSend.forEach((message) => {
//         console.log(message.replyId);
//       });

//       var i = 1;
//       function myLoop(i) {
//         setTimeout(function () {
//           // console.log(message.content ,i); //  your code here 
//           var message = messageToSend[i - 1]
//           if (message.content?.length) {
//           respose =  SreplyThroughselectedchannel(message.sid, message.from, message.type, message.content, message.media, message.phone_number_id, message.channelType, message.agentId, message.interactionId, message.testMessage);
//           }
//           i++;
//           if (i <= (messageToSend.length)) {
//             myLoop(i);   //  decrement i and call myLoop again if i > 0
//           }
//         }, 500)
//       };
//       myLoop(i);
//       // messageToSend.forEach((message)=>{


//         console.log("iterateSmartReplies   iterateSmartReplies *********** " ,respose)

//         return respose; 

//       // })
//     });


//   } catch (err) {
//     console.log(err)
//   }


// }

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

function determineMediaType(mediaType) {
  switch (mediaType) {
      case 'video/mp4':
          return 'video';
      case 'application/pdf':
          return 'document';
      case 'image/jpeg':
          return 'image';
      case '':
          return 'text';
      case 'text':
        return 'text';
      default:
          return 'unknown'; // Optional: handle other cases
  }
}

async function getExtraxtedMessage(message_text) {
  try {
    let content = await removeTags.removeTagsFromMessages(message_text);
    // Parse the message template to get placeholders
    const placeholders = parseMessageTemplate(content);
    if (placeholders.length > 0) {
      // Construct a dynamic SQL query based on the placeholders
      console.log(placeholders)
      const results = await removeTags.getDefaultAttribue(placeholders, SPID, customerId);
      console.log("results", results)

      placeholders.forEach(placeholder => {
        const result = results.find(result => result.hasOwnProperty(placeholder));
        const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
        content = content.replace(`{{${placeholder}}}`, replacement);
      });
    }
    return content;
  } catch (err) {
    console.log("ERR getExtractedMessage---", err)
  }
}

async function PerformingSReplyActions(actionId, value, sid, custid, agid, replystatus, newId) {
  // Perform actions based on the Action ID
  switch (actionId) {
    case 1:
      let AddTagRes = await addTag(value, sid, custid);

      break;
    case 2:
      let assignActionRes = await assignAction(value, agid, newId)
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
  var values = [[is_active, newId, value, agid]]
  var assignCon = await db.excuteQuery(updateInteractionMapping, [values])
  // console.log("assignAction",assignCon)
}



async function addTag(value, sid, custid) {
  //  console.log(`Performing action 2 for Add Contact Tag: ${value}`);
  let stringValue = ''
  if (value !== null && value !== undefined) {
    stringValue = value.replace(/[\[\]\s]/g, '');
  }
  var addConRes = await db.excuteQuery(addTagQuery, [stringValue, custid, sid])
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



async function getWelcomeGreetingData(sid, msg_id, newlyInteractionId, phone_number_id, from, channelType, agid, isContactPreviousDeleted) {
  try {
    let response = false;
    var wlcMessage = await db.excuteQuery(defaultMessageQuery, [sid, 'Welcome Greeting']);
    if (newlyInteractionId != null && newlyInteractionId != undefined && newlyInteractionId != "" && wlcMessage.length > 0 && wlcMessage[0].Is_disable == 1 && isContactPreviousDeleted != 0) {
      console.log(" welcome ist defaut msg")
      // sendDefultMsg(wlcMessage[0].link, wlcMessage[0].value, wlcMessage[0].message_type, phone_number_id, from);
      let messageInterval = await db.excuteQuery('select * from Message where interaction_id=?', [newlyInteractionId])
      console.log("welcome messageInterval?.length", messageInterval?.length)
      if (messageInterval?.length <= 0) {
        // console.log("messageInterval" ,newId)
        let message_text = await getExtraxtedMessage(wlcMessage[0]?.value)
        let result = await messageThroughselectedchannel(sid, from, wlcMessage[0].message_type, message_text, wlcMessage[0].link, phone_number_id, channelType, agid, newlyInteractionId)
        console.log("result---------", result)
        response = result
        let myUTCString = new Date().toUTCString();
        const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let updateSmsRes = await db.excuteQuery(updateSms, [1, time, msg_id]);
      }
    }
    // console.log(wlcMessage);
    return response;
  } catch (err) {
    console.log(err);
  }
}


async function getOutOfOfficeMsg(sid, phone_number_id, from, msg_id, newId, channelType, agid) {
  try {
    let result = '';

    var outOfOfficeMessage = await db.excuteQuery(defaultMessageQuery, [sid, 'Out of Office']);
    //  console.log(outOfOfficeMessage)
    if (outOfOfficeMessage.length > 0 && outOfOfficeMessage[0].Is_disable == 1) {
      console.log("outOfOfficeMessage Is_disable")
      let messageInterval = await db.excuteQuery(msgBetweenOneHourQuery, [newId, 2])
      console.log(messageInterval)
      if (messageInterval.length <= 0) {
        console.log("messageInterval", newId)
        //result = await sendDefultMsg(outOfOfficeMessage[0].link, outOfOfficeMessage[0].value, outOfOfficeMessage[0].message_type, phone_number_id, from)
        let message_text = await getExtraxtedMessage(outOfOfficeMessage[0]?.value)
        result = await messageThroughselectedchannel(sid, from, outOfOfficeMessage[0].message_type, message_text, outOfOfficeMessage[0].link, phone_number_id, channelType, agid, newId)
        console.log(sid, from, outOfOfficeMessage[0].message_type, outOfOfficeMessage[0].value, outOfOfficeMessage[0].link, phone_number_id, channelType, agid, newId)

        let myUTCString = new Date().toUTCString();
        const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let updateSmsRes = await db.excuteQuery(updateSms, [2, time, msg_id]);
      }
    }
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
}


async function workingHoursDetails(sid, phone_number_id, from, msg_id, newId, channelType, agid) {
  const currentTime = new Date();
  let workingHourQuery = `select * from WorkingTimeDetails where SP_ID=? and isDeleted !=1`;
  var workingData = await db.excuteQuery(workingHourQuery, [sid]);
  console.log("working")
  if ((isWorkingTime(workingData, currentTime))) {
    AllAgentsOffline(sid, phone_number_id, from, msg_id, newId, channelType, agid);
    console.log('It is currently  within working hours.' + msg_id);
    return true;
  }
  // console.log('It is currently not within working hours.');
  return false;
}


function isWorkingTime(data, currentTime) {
  //console.log(data)
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const currentTimeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  let datetime = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
  // console.log(currentDay)
  const time = new Date()

  for (const item of data) {
    const workingDays = item.working_days.split(',');
    const date = new Date(datetime).getHours();
    const getMin = new Date(datetime).getMinutes();
    // console.log(date + " :::::::" + getMin)
    const start_time = (item.start_time).replace(/\s*(AM|PM)/, "");
    const end_time = (item.end_time).replace(/\s*(AM|PM)/, "");
    const startTime = start_time.split(':');
    const endTime = end_time.split(':');
    // console.log(startTime + " " + endTime + workingDays.includes(currentDay))
    // console.log(endTime[0] + " " + date + endTime[1] + "| " + getMin)
    if (workingDays.includes(currentDay) && (((startTime[0] < date) || (date === startTime[0] && startTime[1] <= getMin)) && ((endTime[0] > date) || ((endTime[1] === getMin) && (endTime[1] >= getMin))))) {
      console.log("data===========")
      return true;
    }
    // if ((((startTime[0] < date) || (date === startTime[0] && startTime[1] <= getMin)) && ((endTime[0] > date) || ((endTime[1] === getMin) && (endTime[1] >= getMin))))) {
    //   return true;
    // }


  }

  return false;
}



async function AllAgentsOffline(sid, phone_number_id, from, msg_id, newId, channelType, agid) {
  //console.log("AllAgentsOffline");
 let response = false;
  var activeAgentQuery = "select *from user where  IsActive=1 and SP_ID=? and isDeleted !=1  and UserType !=(select UserType from user where uid=?) ";
  let activeAgent = await db.excuteQuery(activeAgentQuery, [sid, agid]);

  if (activeAgent?.length <= 0) {

    console.log("activeAgent", msg_id + " " + newId);

    var AgentsOfflineMessage = await db.excuteQuery(defaultMessageQuery, [sid, 'All Agents Offline']);
    if (AgentsOfflineMessage.length > 0 && AgentsOfflineMessage[0].Is_disable == 1) {
      let messageInterval = await db.excuteQuery(msgBetweenOneHourQuery, [newId, 3])
      console.log("inactive above   length", messageInterval.length)
      if (messageInterval.length <= 0) {
        //sendDefultMsg(AgentsOfflineMessage[0].link, AgentsOfflineMessage[0].value, AgentsOfflineMessage[0].message_type, phone_number_id, from)
        let message_text = await getExtraxtedMessage(AgentsOfflineMessage[0]?.value)
        let allAgentsmessage = await messageThroughselectedchannel(sid, from, AgentsOfflineMessage[0].message_type, message_text, AgentsOfflineMessage[0].link, phone_number_id, channelType, agid, newId)
        response = allAgentsmessage
        if(response == true){
          let getIntractionStatus = await db.excuteQuery('select * from Interaction WHERE InteractionId=? and SP_ID=?', [newId, sid]);
          let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', [getIntractionStatus[0]?.interaction_status, updated_at, newId])
        }
        console.log("allAgentsmessage", allAgentsmessage);
        let myUTCString = new Date().toUTCString();
        const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let updateSmsRes = await db.excuteQuery(updateSms, [3, time, msg_id]);
      }
    }

  }
  return response;
}


async function messageThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType, agentId, interactionId) {
  console.log("phone_number_id,channelType,spid, from, type, text")
  console.log(phone_number_id, channelType, spid, from, type, text)
  if (channelType == 'WhatsApp Official' || channelType == 1 || channelType == 'WA API') {
    let response = false;
    let myUTCString = new Date().toUTCString();
    const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
    let result = await middleWare.sendDefultMsg(media, text, type, phone_number_id, from);
    console.log("messageThroughselectedchannel", result?.status)
    if (result?.status == 200) {
      let messageValu = [[spid, type, "", interactionId, agentId, 'Out', text, (media?media:'text'), "", result.message.messages[0].id, "", time, time, "", -2]]
      let saveMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
      response = true;
    }
return response;


  } if (channelType == 'WhatsApp Web' || channelType == 2 || channelType == 'WA Web') {
    console.log("message midddleware", interactionId)
    let result = await middleWare.postDataToAPI(spid, from, type, text, media)
    if (result.status == 200) {

      let myUTCString = new Date().toUTCString();
      const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      let messageValu = [[spid, type, "", interactionId, agentId, 'Out', text, (media?media:'text'), "", "", "", time, time, "", -2]]
      let saveMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
      return true;
    }
    return false;
  }
}

async function SreplyThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType, agentId, interactionId, testMessage) {
  if (channelType == 'WhatsApp Official' || channelType == 1 || channelType == 'WA API') {
    let response = false;
    let myUTCString = new Date().toUTCString();
    const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

    let sReply = await middleWare.sendDefultMsg(media, text, type, phone_number_id, from);
    //console.log("sReply?.status ", sReply?.status)
    if (sReply?.status == 200) {

     
      let messageValu = [[spid, type, "", interactionId, agentId, 'Out', testMessage, (media?media:'text'), "", sReply.message.messages[0].id, "", time, time, "", -2]]
      let saveMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
      response = true;
    }
    // console.log("sreply", response)
    return response;
  } if (channelType == 'WhatsApp Web' || channelType == 2 || channelType == 'WA Web') {

    let result = await middleWare.postDataToAPI(spid, from, type, text, media)
    if (result.status == 200) {

      let myUTCString = new Date().toUTCString();
      const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      let messageValu = [[spid, type, "", interactionId, agentId, 'Out', testMessage, (media?media:'text'), "", "", "", time, time, "", -2]]
      let saveMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
      return true;
    }
    return false;
  }
}

module.exports = { autoReplyDefaultAction }