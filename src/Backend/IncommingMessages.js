var express = require("express");
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "10000kb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10000kb", extended: true }));
const notify = require('./whatsApp/PushNotifications');
const removeTags = require('./removeTagsFromRichTextEditor')
const db = require('./dbhelper')
const axios = require('axios');
const middleWare = require('./middleWare')
const moment = require('moment');
const Routing = require('./RoutingRules');
const { Console } = require("console");
const commonFun = require('./common/resuableFunctions')
const { userStatus } = require('./enum.js')
const token = 'EAAQTkLZBFFR8BOxmMdkw15j53ZCZBhwSL6FafG1PCR0pyp11EZCP5EO8o1HNderfZCzbZBZBNXiEFWgIrwslwoSXjQ6CfvIdTgEyOxCazf0lWTLBGJsOqXnQcURJxpnz3i7fsNbao0R8tc3NlfNXyN9RdDAm8s6CxUDSZCJW9I5kSmJun0Prq21QeOWqxoZAZC0ObXSOxM3pK0KfffXZC5S';
let defaultMessageQuery = `SELECT * FROM defaultmessages where SP_ID=? AND title=? and isDeleted !=1`
let updateSms = `UPDATE Message set system_message_type_id=?,updated_at=? where Message_id=?`
let updateInteractionMapping = "INSERT INTO InteractionMapping (is_active,InteractionId,AgentId,MappedBy) VALUES ?"
addTagQuery = "UPDATE EndCustomer SET tag =?  WHERE customerId =? and SP_ID=?"
selectTagQuery = "select tag from EndCustomer where customerId= ?"
msgBetweenOneHourQuery = `SELECT M.*,
I.updated_at  as updateTime
FROM Message M
JOIN Interaction I ON I.InteractionId = M.interaction_id
WHERE M.interaction_id = ?
  AND M.system_message_type_id = ?
  AND I.interaction_status = 'Open'
  AND I.is_deleted != 1 order by M.updated_at desc limit 1`;

checkResolve = `select * from Interaction where  InteractionId = ? and SP_ID=? and IsTemporary !=1 and is_deleted !=1 `
var insertMessageQuery = "INSERT INTO Message (SPID,Type,ExternalMessageId, interaction_id, Agent_id, message_direction,message_text,message_media,media_type,Message_template_id,Quick_reply_id,created_at,updated_at,system_message_type_id,assignAgent,msg_status,button,interactive_buttons) VALUES ?";

async function sReplyActionOnlostMessage(message_text, sid, channelType, phone_number_id, from, custid, agid, newId, display_phone_number) {
  try {
    var replymessage = await matchSmartReplies(message_text, sid, channelType)
    if (replymessage?.length > 0) {
      console.log("replymessage", replymessage)
      let isSReply = await iterateSmartReplies(replymessage, phone_number_id, from, sid, custid, agid, newId, channelType, display_phone_number);
      console.log("iterateSmartReplies replymessage.length", isSReply)
      return isSReply;
    }
  } catch (err) {
    console.log("err sReplyActionOnlostMessage", err);
    return err;
  }
}

async function getOutMessageAfterIn(newId, sid) {
  try {
    let isAgentReplyQuery = `SELECT * 
FROM Message m
JOIN Interaction i ON m.interaction_id = i.InteractionId
WHERE m.interaction_id = ?
  AND m.SPID = ?
  AND m.message_direction = 'Out' and m.msg_status != 9 AND m.msg_status != 10
  AND m.created_at >= i.updated_at;`

    let isAgentReply = await db.excuteQuery(isAgentReplyQuery, [newId, sid]);
    if (isAgentReply?.length) {
      return false;
    }
    return true;

  } catch (err) {
    console.log("Err getOutMessageAfterIn", err)
  }
}



async function autoReplyDefaultAction(isAutoReply, autoReplyTime, isAutoReplyDisable, message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted, inactiveAgent, inactiveTimeOut, newiN, display_phone_number) {
  console.log("isAutoReply, autoReplyTime, isAutoReplyDisable")
  console.log(isAutoReply, autoReplyTime, isAutoReplyDisable)
  let assignAgent = await db.excuteQuery('select * from InteractionMapping where InteractionId =? order by created_at desc limit 1', [newId]);
  let interactionStatus = await db.excuteQuery('select * from Interaction where InteractionId = ? and is_deleted !=1 ', [newId])
  if(assignAgent.length > 0) {
    if( assignAgent[0].AgentId == -3) {
      botOperations();
      return false;
    }
  }
  const timeoutDuration = inactiveTimeOut * 60 * 1000; // Convert minutes to milliseconds
  console.log(timeoutDuration, inactiveTimeOut)
  // Set timeout to trigger inactivity check after the specified period

  let isChatReplied = await getOutMessageAfterIn(newId, sid);
  if (isChatReplied == true) {
    setTimeout(() => {
      inActiveAgentTimeOut(inactiveAgent, inactiveTimeOut, sid, newId, agid);
    }, timeoutDuration)
  }

  if (newiN == 'If not exist') {
    let defautWlcMsg = await getWelcomeGreetingData(sid, msg_id, newId, phone_number_id, from, channelType, agid, isContactPreviousDeleted, custid);
    console.log("defautWlcMsg", defautWlcMsg)
  }
  if (isAutoReply != 1) {
    let sendSReply = await sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted, newiN, display_phone_number)
    return sendSReply;
  }
  else {

    let currentTime = new Date(); // new Date(new Date().toUTCString().replace('GMT',''))


    //const autoReplyVal = new Date(currentTime)   // autoReplyTime when auto reply start
    console.log("currentTime,autoReplyVal ,autoReplyTime", currentTime, autoReplyTime)
    console.log((autoReplyTime <= currentTime), "(autoReplyTime != null && (autoReplyTime <= currentTime) && autoReplyTime != undefined ", (autoReplyTime != null && (autoReplyTime <= currentTime) && autoReplyTime != undefined))
    if (autoReplyTime != null && (autoReplyTime <= currentTime) && autoReplyTime != undefined && autoReplyTime != 0 && isAutoReplyDisable != 1) {
      let sendSReply = await sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted, newiN, display_phone_number)
      return sendSReply;
    }
    else if (isAutoReplyDisable == 1 && ((assignAgent?.length == 0 || (assignAgent[0].AgentId == -1 && interactionStatus[0]?.interaction_status == 'Resolved')) || (assignAgent[0].AgentId == -1 && interactionStatus[0]?.interaction_status == 'Open'))) {

      const currentTime = new Date();
      const autoReplyVal = new Date(autoReplyTime)   // autoReplyTime when auto reply start
      let sendSReply = await sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted, newiN, display_phone_number)
      return sendSReply;

    } else if (autoReplyTime == '0000-00-00 00:00:00' && isAutoReplyDisable != 1) {
      let sendSReply = await sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted, newiN, display_phone_number)
      return sendSReply;
    }

    return false;

  }
}


async function inActiveAgentTimeOut(inactiveAgent, inactiveTimeOut, sid, newId, agid) {
  try {
    if (inactiveAgent == 1) {
      let isChatAssign = await db.excuteQuery('select * from InteractionMapping where InteractionId =? and (AgentId != -1 OR AgentId !=?)  order by created_at desc limit 1', [newId, agid]);
      console.log("isChatAssign", isChatAssign.length)
      if (isChatAssign?.length > 0) {
        let isReplySended = await db.excuteQuery(`SELECT * FROM Message WHERE interaction_id = ? and SPID=?  AND message_direction = 'Out'  AND created_at >= NOW() - INTERVAL ? MINUTE; `, [newId, sid, inactiveTimeOut]);
        //  console.log("isReplySended",isReplySended)
        if (isReplySended?.length <= 0) {
          let inactiveUser = await db.excuteQuery('update user set IsActive =0 where uid =? and SP_ID=?', [isChatAssign[0]?.AgentId, sid]);
          let updateMapping = await db.excuteQuery('Update InteractionMapping set AgentId = -1 ,isAgentInactiveTimeOut=1 where MappingId =?', [isChatAssign[0]?.MappingId]);
          console.log("inactiveUser", inactiveUser?.affectedRows, "updateMapping", updateMapping?.affectedRows)
        }
      }
    }
  } catch (err) {
    console.log("inActiveAgentTimeOut ERR", err)
  }
}

async function sendSmartReply(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted, newiN, display_phone_number) {
  console.log("***********", replystatus, "____Send SMART REPLIESS______")
  const currentTime = new Date();
  const replystatus1 = new Date(replystatus);  //replystatus  is pauseTill 
  console.log(replystatus, replystatus1, "(replystatus1 <= currentTime)", currentTime, (replystatus1 <= currentTime))
  // if (replystatus != null && (replystatus1 <= currentTime) && replystatus != undefined) {
  //   var response = await getSmartReplies(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted,newiN);
  //   console.log("____Send SMART REPLIESS______NOT  NULLL" + response);
  //   return response;
  // }
  // if (replystatus == null || replystatus == undefined || replystatus == "") {
  // console.log("replystatus == null" + message_text)

 
  var response = await getSmartReplies(message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted, newiN, display_phone_number);
  console.log("____Send SMART REPLIESS______" + response);
  return response;
  // }
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

async function getSmartReplies(message_text, phone_number_id, contactname, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType, isContactPreviousDeleted, newiN, display_phone_number) {
  try {
    console.log("in side getSmartReplies method", message_text, phone_number_id, contactname, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, channelType)


    var replymessage = await matchSmartReplies(message_text, sid, channelType)

    let defultOutOfOfficeMsg = await workingHoursDetails(sid, phone_number_id, from, msg_id, newId, channelType, agid, custid, replymessage);
    console.log("defultOutOfOfficeMsg", defultOutOfOfficeMsg)
    if (replymessage?.length > 0) {

      let isSReply = await iterateSmartReplies(replymessage, phone_number_id, from, sid, custid, agid, newId, channelType, display_phone_number);
      console.log("iterateSmartReplies replymessage.length", isSReply)
      return isSReply;
    } else if (defultOutOfOfficeMsg === false && replymessage?.length <= 0) {
      let getOutOfOfficeResult = await getOutOfOfficeMsg(sid, phone_number_id, from, msg_id, newId, channelType, agid, custid);
      console.log("getOutOfOfficeResult", defultOutOfOfficeMsg, "getOutOfOfficeResult", getOutOfOfficeResult)
      return 'false' // getOutOfOfficeResult;  comment this is because routing rules only disable for smartreply or flow
    } else if ((defultOutOfOfficeMsg === 'Agents Offline' || defultOutOfOfficeMsg === 'working hour and holidays') && replymessage?.length <= 0) {
      return 'false';    //changed this is because routing rules only disable for smartreply or flow
    } else if (defultOutOfOfficeMsg === true && replymessage?.length <= 0) {
      return 'false';
    }


  } catch (err) {
    console.log("____getSmartReplies method err______")
    console.log(err)
  }
}

function extractPlainValues(message_variable) {
  let data = [];

  // Convert string to JSON if necessary
  if (typeof message_variable === 'string') {
    try {
      data = JSON.parse(message_variable);
    } catch (error) {
      console.error('Invalid JSON string:', error.message);
      return [];
    }
  } else if (Array.isArray(message_variable)) {
    data = message_variable;
  } else {
    console.error('Input must be a string or an array');
    return [];
  }

  // Filter out values that are NOT wrapped in {{ }}
  const plainValues = [];

  for (const item of data) {
    if (item?.value && !/^\{\{.*\}\}$/.test(item.value)) {
      plainValues.push(item.value);
    }
  }

  return plainValues;
}

async function iterateSmartReplies(replymessage, phone_number_id, from, sid, custid, agid, newId, channelType, display_phone_number) {
  try {
    var messageToSend = [];
    var isActionAddded = -1;
    for (let message of replymessage) {
      var media = message.Media;
      var value = message.ValueUuid;
      var testMessage = message.Message;  // Assuming the 'Message' property contains the message content
      var actionId = message.ActionID;  // Assuming the 'ActionID' property contains the action ID
      var msgVar = message.message_variables;
      var media_type = message.media_type;

      var isTemplate = message?.isTemplate
      var laungage = message?.laungage
      var templateName = message?.templateName
      var header = message?.headerText
      var body = message?.bodyText
      var buttons = message?.buttons
      //get header and body variable 
      let headerVar = await commonFun.getTemplateVariables(msgVar, header, sid, custid);
      let bodyVar = await commonFun.getTemplateVariables(msgVar, body, sid, custid);
      let buttonsVariable;
      let buttonsVar = typeof message?.buttonsVariable === 'string' ? JSON.parse(message?.buttonsVariable) : message?.buttonsVariable;
      let interactive_buttons = message?.interactive_buttons;
      if(!commonFun.isInvalidParam(buttonsVar) && buttonsVar.length > 0) {
        buttonsVariable = await removeTags.getDynamicURLToBESent(buttonsVar, sid, custid);
      }
      let PerformingActions = await PerformingSReplyActions(actionId, value, sid, custid, agid, newId, display_phone_number);
      let content = await removeTags.removeTagsFromMessages(testMessage);
      if (actionId == 2) {
        isActionAddded = isActionAddded + 1;
      }
      //console.log("content",content)
      // Parse the message template to get placeholders
      const placeholders = parseMessageTemplate(testMessage);
      //console.log(testMessage)
      if (placeholders.length > 0) {
        // Construct a dynamic SQL query based on the placeholders

        let results;
        // console.log(msgVar !='',"msgVar",msgVar != null ,msgVar,msgVar != null || msgVar !='')
        if (msgVar != null && msgVar != '') {

          results = await removeTags.getDefaultAttribue(msgVar, sid, custid);
          //console.log("atribute result ")
          placeholders.forEach((placeholder, index) => {
            //const result = results.find(result => result.hasOwnProperty(placeholder));
            const result = results[index];
            //  console.log(placeholder,"place foreach",results)
            const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
            content = content.replace(`{{${placeholder}}}`, replacement);
          });
        } else {

          results = await removeTags.getDefaultAttribueWithoutFallback(placeholders, sid, custid);
        }

        // console.log("results", results);

        placeholders.forEach((placeholder, index) => {
          //const result = results.find(result => result.hasOwnProperty(placeholder));
          const result = results[index];
          const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
          content = content.replace(`{{${placeholder}}}`, replacement);
        });

      
      }

      var type = determineMediaType(media_type);
      var delay = 3000;
      if (type == 'video') {
        delay = 7000
      }
      if(message?.isTemplate == 'true'){
        bodyVar = extractPlainValues(msgVar);
      }

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
        "testMessage": testMessage,
        "media_type": media_type,
        "isTemplate": isTemplate,
        "laungage": laungage,
        "templateName": templateName,
        "headerVar": headerVar,
        "bodyVar": bodyVar,
        "buttons" : buttons,
        "buttonsVariable" : buttonsVariable,
        "interactive_buttons" : interactive_buttons
      };
      console.log(message.replyId, "replysms", relyMsg);
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
      if (message.content?.length || message.media?.length) {
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
          message.testMessage,
          message.media_type,
          display_phone_number,
          message.isTemplate,
          message.laungage,
          message.templateName,
          message.headerVar,
          message.bodyVar,
          message.buttons,
          message.buttonsVariable,
          message.interactive_buttons
        );
        // console.log(type,"SreplyThroughselectedchannel response:", respose);
      }
      await new Promise(resolve => setTimeout(resolve, delay)); // Wait 500ms before sending the next message
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
    case 'image/jpg':
    case 'image/png':
      return 'image';
    case '':
      return 'text';
    case 'text':
      return 'text';
    default:
      return 'unknown'; // Optional: handle other cases
  }
}

async function getExtraxtedMessage(message_text, SPID, customerId) {
  try {
    let content = await removeTags.removeTagsFromMessages(message_text);
    // Parse the message template to get placeholders
    const placeholders = parseMessageTemplate(content);
    if (placeholders.length > 0) {
      // Construct a dynamic SQL query based on the placeholders
      console.log(placeholders)
      const results = await commonFun.getDefaultAttribue(placeholders, SPID, customerId);
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

async function PerformingSReplyActions(actionId, value, sid, custid, agid, newId, display_phone_number) {
  // Perform actions based on the Action ID
  switch (actionId) {
    case 1:
      let AddTagRes = await addTag(value, sid, custid);

      break;
    case 2:
      let assignActionRes = await assignAction(value, agid, newId, custid, sid, display_phone_number)
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



async function assignAction(value, agid, newId, custid, sid, display_phone_number) {
  //console.log(`Performing action 1 for  Assign Conversation: ${value}`);
  is_active = 1
  var values = [[is_active, newId, value, agid]]
  let activeUser = await isAgentActive(value)
  console.log(activeUser, "activeUser")
  if (activeUser) {
    console.log("iffffffffff", "activeUser")
    var assignCon = await db.excuteQuery(updateInteractionMapping, [values])
  } else {
    defaultRoutingRules(sid, newId, agid, custid, display_phone_number)
  }

  // console.log("assignAction",assignCon)
}

async function defaultRoutingRules(sid, newId, agid, custid, display_phone_number) {
  console.log("RoutingRules ------", sid, newId, agid, custid)
  let RoutingRulesVaues = await Routing.AssignToContactOwner(sid, newId, agid, custid)  //CALL Default Routing Rules
  console.log("RoutingRulesVaues", RoutingRulesVaues)
  if (RoutingRulesVaues == 'broadcast' || RoutingRulesVaues == true) {
    notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Assign Agent')

    let myUTCString = new Date().toUTCString();
    const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
    const currentAssignedUser = await commonFun.currentlyAssigned(newId);
    const check = await commonFun.notifiactionsToBeSent(currentAssignedUser, 2);
    if (check) {
      let notifyvalues = [[sid, 'New Chat Assigned to You', 'A new Chat has been Assigned to you', agid, 'Routing rules', currentAssignedUser, utcTimestamp]];
      let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
    }
  }
}

async function isAgentActive(uid) {
  let userStatus = await db.excuteQuery('select * from user where uid=? and IsActive =? and isDeleted !=1', [uid, 1]);
  if (userStatus?.length > 0) {
    return true;
  }
  return false;
}

async function addTag(value, sid, custid) {
  //  console.log(`Performing action 2 for Add Contact Tag: ${value}`);
  let stringValue = ''
  if (value !== null && value !== undefined) {
    stringValue = value.replace(/[\[\]\s]/g, '');
  }

  const getTagQuery = `SELECT tag FROM EndCustomer WHERE customerId = ? AND SP_ID = ?`;
  const existingTagResult = await db.excuteQuery(getTagQuery, [custid, sid]);

  if (existingTagResult.length > 0 && existingTagResult[0].tag) {
    const existingTags = existingTagResult[0].tag.split(',');
    const newTags = stringValue.split(',');
    stringValue = [...new Set([...existingTags, ...newTags])].join(',');
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



async function getWelcomeGreetingData(sid, msg_id, newlyInteractionId, phone_number_id, from, channelType, agid, isContactPreviousDeleted, custid) {
  try {
    let response = false;
    var wlcMessage = await db.excuteQuery(defaultMessageQuery, [sid, 'Welcome Greeting']);
    if (newlyInteractionId != null && newlyInteractionId != undefined && newlyInteractionId != "" && wlcMessage.length > 0 && wlcMessage[0].Is_disable == 1 && isContactPreviousDeleted == null) {  // i have changed  isContactPreviousDeleted == null for only contacted added in ist time
      console.log(" welcome ist defaut msg")
      // sendDefultMsg(wlcMessage[0].link, wlcMessage[0].value, wlcMessage[0].message_type, phone_number_id, from); 
      let messageInterval = await db.excuteQuery('select * from Message where interaction_id=?', [newlyInteractionId])
      console.log("welcome messageInterval?.length", messageInterval?.length)
      if (messageInterval?.length <= 1) {
        // console.log("messageInterval" ,newId)
        let message_text = await getExtraxtedMessage(wlcMessage[0]?.value, sid, custid)
        let result = await messageThroughselectedchannel(sid, from, wlcMessage[0].message_type, message_text, wlcMessage[0].link, phone_number_id, channelType, agid, newlyInteractionId, wlcMessage[0].message_type, wlcMessage[0]?.value)
        // console.log("result---------", result)
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


async function getOutOfOfficeMsg(sid, phone_number_id, from, msg_id, newId, channelType, agid, custid) {
  try {
    let result = 'false';

    var outOfOfficeMessage = await db.excuteQuery(defaultMessageQuery, [sid, 'Out of Office']);
    //  console.log(outOfOfficeMessage)
    // resolve condition
    if (outOfOfficeMessage.length > 0 && outOfOfficeMessage[0].Is_disable == 1) {
      console.log("outOfOfficeMessage Is_disable")
      let messageInterval = await db.excuteQuery(msgBetweenOneHourQuery, [newId, 2])
      console.log(messageInterval.length, "messageInterval.length", messageInterval[0]?.updated_at >= messageInterval[0]?.updateTime, messageInterval[0]?.updated_at, messageInterval[0]?.updateTime)
      let resolvedInteraction = await db.excuteQuery(checkResolve, [newId, sid]);
      // if(resolvedInteraction[0]?.interaction_status != 'Resolved'){
      if (messageInterval.length <= 0 || !(messageInterval[0].updated_at >= messageInterval[0].updateTime)) {
        console.log("messageInterval", newId)
        //result = await sendDefultMsg(outOfOfficeMessage[0].link, outOfOfficeMessage[0].value, outOfOfficeMessage[0].message_type, phone_number_id, from)
        let message_text = await getExtraxtedMessage(outOfOfficeMessage[0]?.value, sid, custid)
        result = await messageThroughselectedchannel(sid, from, outOfOfficeMessage[0].message_type, message_text, outOfOfficeMessage[0].link, phone_number_id, channelType, agid, newId, outOfOfficeMessage[0].message_type, outOfOfficeMessage[0]?.value, sid, custid)
        // console.log(sid, from, outOfOfficeMessage[0].message_type, outOfOfficeMessage[0].value, outOfOfficeMessage[0].link, phone_number_id, channelType, agid, newId)

        let myUTCString = new Date().toUTCString();
        const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let updateSmsRes = await db.excuteQuery(updateSms, [2, time, msg_id]);
      }
      // }
    }
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
}


async function workingHoursDetails(sid, phone_number_id, from, msg_id, newId, channelType, agid, custid, smartReplyTrigger) {
  const currentTime = new Date();
  let workingHourQuery = `select * from WorkingTimeDetails where SP_ID=? and isDeleted !=1`;
  var workingData = await db.excuteQuery(workingHourQuery, [sid]);
  console.log(currentTime, "working", (isWorkingTime(workingData, currentTime)));
  let isWorkingHour = isWorkingTime(workingData, currentTime)
  let isTodayHoliday = await isHolidays(sid);
  // console.log(isTodayHoliday,"(isWorkingTime(workingData, currentTime)) && isTodayHoliday == true",(isWorkingTime(workingData, currentTime)) && isTodayHoliday == true)
  if ((isWorkingTime(workingData, currentTime)) && smartReplyTrigger?.length <= 0 && isTodayHoliday == false) {
    let agentofflinestatus = await AllAgentsOffline(sid, phone_number_id, from, msg_id, newId, channelType, agid, custid);
    console.log('It is currently  within working hours.' + msg_id);
    if (agentofflinestatus == true) {
      return 'Agents Offline'
    }
    //return true;
  }
  if ((isWorkingTime(workingData, currentTime)) && isTodayHoliday == true && smartReplyTrigger?.length <= 0) {
    console.log("else ******* ",)
    let getOutOfOfficeResult = await getOutOfOfficeMsg(sid, phone_number_id, from, msg_id, newId, channelType, agid, custid);
    return 'working hour and holidays';
  }
  // console.log('It is currently not within working hours.');
  return isWorkingHour;
}



async function isHolidays(spid) {
  // Execute the query to get holidays for the given SP_ID
  let getHolidays = await db.excuteQuery('SELECT id, SP_ID, month, DATE_FORMAT(holiday_date,"%Y-%m-%d") as holiday_date FROM holidays WHERE SP_ID = ? AND isDeleted != 1', [spid]);


  // Check if today is a holiday
  const isTodayHoliday = (getHolidays) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
    return getHolidays.some(holiday => {
      const holidayDate = holiday.holiday_date//.toISOString().split('T')[0]; // Extract 'YYYY-MM-DD' from the returned holiday date
      return holidayDate === today;
    });
  };

  if (isTodayHoliday(getHolidays)) {
    console.log("Today is a holiday!");
    return true;
  } else {
    console.log("Today is not a holiday.");
    return false;
  }
}


function isWorkingTime(data, currentTime) {
  //console.log(data)
  if(data.length == 0){
    return true;
  }
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
    console.log(startTime + " " + endTime + workingDays.includes(currentDay))
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



async function AllAgentsOffline(sid, phone_number_id, from, msg_id, newId, channelType, agid, custid) {
  //console.log("AllAgentsOffline");
  let response = false;
  var activeAgentQuery = "select *from user where  IsActive=1 and SP_ID=? and isDeleted !=1"; // comment this because now i have to take sp also (and UserType !=(select UserType from user where uid=?))
  let activeAgent = await db.excuteQuery(activeAgentQuery, [sid, agid]);
  //console.log("AllAgentsOffline",activeAgent?.length);
  if (activeAgent?.length <= 0) {

    console.log("activeAgent", msg_id + " " + newId);

    var AgentsOfflineMessage = await db.excuteQuery(defaultMessageQuery, [sid, 'All Agents Offline']);
    if (AgentsOfflineMessage.length > 0 && AgentsOfflineMessage[0].Is_disable == 1) {
      let messageInterval = await db.excuteQuery(msgBetweenOneHourQuery, [newId, 3])
      console.log("inactive above   length", messageInterval.length)
      console.log(messageInterval[0]?.updated_at <= messageInterval[0]?.updateTime, messageInterval[0]?.updated_at, messageInterval[0]?.updateTime)
      let resolvedInteraction = await db.excuteQuery(checkResolve, [newId, sid])
      //if(resolvedInteraction[0]?.interaction_status != 'Resolved'){
      if (messageInterval.length <= 0 || (messageInterval[0].updated_at <= messageInterval[0].updateTime)) {
        //sendDefultMsg(AgentsOfflineMessage[0].link, AgentsOfflineMessage[0].value, AgentsOfflineMessage[0].message_type, phone_number_id, from)
        let message_text = await getExtraxtedMessage(AgentsOfflineMessage[0]?.value, sid, custid)
        let allAgentsmessage = await messageThroughselectedchannel(sid, from, AgentsOfflineMessage[0].message_type, message_text, AgentsOfflineMessage[0].link, phone_number_id, channelType, agid, newId, AgentsOfflineMessage[0].message_type, AgentsOfflineMessage[0]?.value)
        response = allAgentsmessage
        // console.log("response",response)
        if (response == true) {
          let myUTCString = new Date().toUTCString();
          const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
          let getIntractionStatus = await db.excuteQuery('select * from Interaction WHERE InteractionId=? and SP_ID=?', [newId, sid]);
          let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=? WHERE InteractionId=?', [getIntractionStatus[0]?.interaction_status, newId]);
          // if(updateInteraction?.affectedRows >0){
          //   notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Status changed')  // when this mendatory to refresh then need to pull display_phone_number
          // }
        }
        console.log("allAgentsmessage", allAgentsmessage);
        let myUTCString = new Date().toUTCString();
        const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let updateSmsRes = await db.excuteQuery(updateSms, [3, time, msg_id]);
      }
      //}
    }

  }
  return response;
}


async function messageThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType, agentId, interactionId, media_type, Message_text) {
  let getMediaType = determineMediaType(media_type); //media_type  
  console.log("phone_number_id,channelType,spid, from, getMediaType, text")
  console.log(phone_number_id, channelType, spid, from, getMediaType, text)
  if (channelType == 'WhatsApp Official' || channelType == 1 || channelType == 'WA API') {
    let response = false;
    let myUTCString = new Date().toUTCString();
    const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
    let result = await middleWare.sendDefultMsg(media, text, getMediaType, phone_number_id, from, spid);
    // console.log("messageThroughselectedchannel", result?.status)
    if (result?.status == 200) {
      let messageValu = [[spid, 'text', "", interactionId, agentId, 'Out', Message_text, (media ? media : 'text'), media_type, result.message.messages[0].id, "", time, time, "", -2, 1,'']]
      let saveMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
      response = true;
    }
    return response;


  } if (channelType == 'WhatsApp Web' || channelType == 2 || channelType == 'WA Web') {
    console.log("message midddleware", interactionId)
    let result = await middleWare.postDataToAPI(spid, from, getMediaType, text, media);
    console.log("result", result)
    if (result?.status == 200) {

      let myUTCString = new Date().toUTCString();
      const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      let messageValu = [[spid, 'text', "", interactionId, agentId, 'Out', Message_text, (media ? media : 'text'), media_type, "", "", time, time, "", -2, 1,'']]
      let saveMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
      return true;
    }
    return false;
  }
}
const variable = require('./common/constant');
const { identity } = require("rxjs");
async function SreplyThroughselectedchannel(spid, from, type, text, media, phone_number_id, channelType, agentId, interactionId, testMessage, media_type, display_phone_number,
  isTemplate,
  laungage,
  templateName,
  headerVar,
  bodyVar,buttons,DynamicURLToBESent,interactive_buttons) {
    let buttonsArray = typeof buttons === 'string' ? JSON.parse(buttons) : buttons;
    interactive_buttons = typeof interactive_buttons === 'string' ? interactive_buttons : JSON.stringify(interactive_buttons);
    if(await commonFun.isPaused(spid) || await commonFun.isDisable(spid) || await commonFun.isDeleted(spid)){
      let messageValu = [[spid, 'text', "", interactionId, agentId, 'Out', testMessage, (media ? media : 'text'), media_type, '', "", time, time, "", -2, 9,buttons]]
      let saveMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
      return
    }
  if (channelType == 'WhatsApp Official' || channelType == 1 || channelType == 'WA API') {
    let response = false;
    let myUTCString = new Date().toUTCString();
    const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
    let sReply = '';

 

    if(isTemplate == 'true'){
       sReply = await middleWare.createWhatsAppPayload(type, from, templateName, laungage, headerVar, bodyVar, media, spid, buttonsArray, DynamicURLToBESent);
    }else{
      sReply = await middleWare.sendDefultMsg(media, text, type, phone_number_id, from, spid);
    }
   
    console.log(type, "sReply?.status ", sReply?.status, media_type)
    if (sReply?.status == 200) {


      let messageValu = [[spid, 'text', "", interactionId, agentId, 'Out', testMessage, (media ? media : 'text'), media_type, sReply.message.messages[0].id, "", time, time, "", -2, 1,buttons,interactive_buttons]]
      let saveMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
      notify.NotifyServer(display_phone_number, false, interactionId, 0, 'Out', 'Smartreply')
      response = true;
    }
    // console.log("sreply", response)
    return response;
  } if (channelType == 'WhatsApp Web' || channelType == 2 || channelType == 'WA Web'|| variable.SPID == spid || variable.provider == 'whapi') {
       let result
    if(isTemplate == 'true' && interactive_buttons){
        result = await middleWare.sendingTemplate(spid, from, headerVar, text, interactive_buttons);
      }
      else{
        result = await middleWare.postDataToAPI(spid, from, type, text, media)
      }


    if (result.status == 200) {
      let myUTCString = new Date().toUTCString();
      const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      let messageValu = [[spid, 'text', "", interactionId, agentId, 'Out', testMessage, (media ? media : 'text'), media_type, "", "", time, time, "", -2, 1,'',interactive_buttons]]
      let saveMessage = await db.excuteQuery(insertMessageQuery, [messageValu]);
      notify.NotifyServer(display_phone_number, false, interactionId, 0, 'Out', 'Smartreply')
      return true;
    }
    return false;
  }
}


async function AssignToContactOwner(sid, newId, custid) {
  try {
    let agid = -3;
    console.log("AssignToContactOwner", sid, newId, agid, custid);

    let contactOwner = await db.excuteQuery('SELECT * FROM EndCustomer WHERE customerId =? and SP_ID=?  and isDeleted !=1', [custid, sid]);
    let contactOwnerUid = contactOwner[0]?.uid;
      let isActiveStaus = await isAgentActive(sid, contactOwnerUid);
      if (contactOwnerUid != undefined && contactOwnerUid != null && isActiveStaus == true) {
        let updateInteractionMapQuery = `INSERT INTO InteractionMapping (InteractionId, AgentId, MappedBy, is_active) VALUES ?`;
        let values = [[newId, contactOwnerUid, agid, 1]]; // 2nd agid is MappedBy values in teambox uid is used here also
        let updateInteractionMap = await db.excuteQuery(updateInteractionMapQuery, [values]);
        console.log("AssignToContactOwner --- contact owner assign", updateInteractionMap);
        if (updateInteractionMap?.affectedRows > 0) {
          let myUTCString = new Date().toUTCString();
          const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
          const currentAssignedUser = await commonFun.currentlyAssigned(newId);
          const check = await commonFun.notifiactionsToBeSent(currentAssignedUser,2);
          if(check){
          let notifyvalues = [[sid, 'New Chat Assigned to You', 'A new Chat has been Assigned to you', agid, 'Routing rules', currentAssignedUser, utcTimestamp]];
          let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
          }
          return true; // Return true if insertion is successful
        } else {
          return { message: "Insertion into InteractionMapping failed" };
        }
      } 
  } catch (err) {
    console.log("ERR _ _ _ AssignToContactOwner", err);
    return { error: err.message }; // Return the error message
  }
}



async function botOperations(data){
  const createBotSession = `INSERT INTO BotSessions (spid,customerId,botId, status, current_nodeId) VALUES (?, ?, ?)`;
  await db.excuteQuery(createBotSession, [data?.spid,data?.custid,data?.botId,2, 1]);
 // const updateBotSession = `UPDATE BotSessions SET status = ?, current_nodeId = ? WHERE botId = ?`;
 data['nodeId'] = 1;
  await identifyNode(1);
}

async function isWorkingHour(){
  const currentTime = new Date();
  let workingHourQuery = `select * from WorkingTimeDetails where SP_ID=? and isDeleted !=1`;
  var workingData = await db.excuteQuery(workingHourQuery, [sid]);
  console.log(currentTime, "working", (isWorkingTime(workingData, currentTime)));
  let isWorkingHour = isWorkingTime(workingData, currentTime)
  let isTodayHoliday = await isHolidays(sid);
  return ((isWorkingTime(workingData, currentTime)) && isTodayHoliday == false) ? true : false;
}


async function botExit(){
  var updateBotSessionQuery = "update BotSessions set status=3 where botId =? and status=2";
  let updateBotSession = await db.excuteQuery(updateBotSessionQuery, [botId]);
  botAdvanceAction();
}

async function botAdvanceAction(botId,custid,interactionId,spid,display_phone_number){  
  let advanceQuery = "select * from Bots where id =? and isDeleted !=1";
  let advanceAction = await db.excuteQuery(advanceQuery, [botId]);
  //let actions= [{"actionTypeId":1,"Value":["Radio","Ola"],"ValueUuid":[274,275],"actionType":"Add_Tag"},{"actionTypeId":3,"Value":["loop one","Two"],"ValueUuid":[283,278],"actionType":"Remove_Tag"}]
  if(advanceAction.length > 0 && advanceAction[0].isAdvanceAction == 1){
    let action = advanceAction[0].action;
    if(action && action.length > 0){
      for(let i=0; i<action.length; i++){
        let actionType = action[i].actionType;
        let value = action[i].value;
        if(actionType == 'Add_Tag'){
          await addTag(action[i]?.ValueUuid, spid, custid);
        }else if(actionType == 'Remove_Tag'){
          await removeTag(action[i]?.ValueUuid, custid);
        }else if(actionType == 'Assign_Agent'){
          await assignAction(action[i]?.agentId, -3, interactionId, custid, spid, display_phone_number);
        }else if(actionType == 'assign_owner'){
          let assignOwner = await AssignToContactOwner(spid,interactionId ,custid);
          if(assignOwner){
            console.log("assignOwner", assignOwner)
          }
      }else if(actionType =='conversationStatus'){
        let ResolveOpenChat = await db.excuteQuery('UPDATE Interaction SET interaction_status =? WHERE InteractionId !=? and customerId=?', [value[0], interactionId, custid]);        
      }
    }
    
  }
}

async function getrunningNode(){
  var currentNodeQuery = "select current_nodeId from BotSessions where botId =? and status=2";
  let currentNode = await db.excuteQuery(currentNodeQuery, [botId]);
  if(currentNode.length > 0){
    return currentNode[0].current_nodeId;
  }
}

async function identifyNode(data){
  var identityNodeQuery = "select * from BotNodes where tempNodeId =? and botId=? and isDeleted !=1";
  let identityNode = await db.excuteQuery(identityNodeQuery, [data?.nodeId]);
  if(identityNode.length > 0){
    let type = identityNode[0].type;
    let json = JSON.parse(identityNode[0].payload_json);
    let nextNodeId = identityNode[0].connectedId;
    if(type == 'sendText'|| type == 'sendImage' || type == 'sendVideo'|| type == 'sendDocument'){ 
      let messageType = type == 'sendImage' ? 'image' : type == 'sendVideo' ? 'video' : type == 'sendDocument' ? 'document' : 'text';
      let message_text = await getExtraxtedMessage(json?.data?.textMessage, data.sid, data.custid)
      result = await messageThroughselectedchannel(data.sid, data?.from, 'text', message_text, json?.data?.link, phone_number_id, channelType, -4, data.interactionId, 'text', message_text)
      data.nodeId = json?.connectedId;
      identifyNode(data);
    }else if(type == 'assignAgentModal'){
      await assignAction(json.data?.uid, -4, data.interactionId, data.custid, data.sid, data.display_phone_number);
      botExit();
    } else if(type == 'UnassignConversation'){
      await assignAction(-1, -4, data.interactionId, data.custid, data.sid, data.display_phone_number);
      botExit();
    } else if(type == 'assigntoContactOwner'){
      let assignOwner = await AssignToContactOwner(data.sid, data.interactionId, data.custid);      
      botExit();
    }
    else if(type == 'addTag'){
      await addTag(value,spid, custid);
      data.nodeId = json?.connectedId;
      identifyNode(data);
    }else if(type == 'removeTag'){
      await removeTag(value, custid);
      data.nodeId = json?.connectedId;
      identifyNode(data);
    }
    // else if(type == 'updateAttribute'){
    //   updateAttribute();
    //   data.nodeId = json?.connectedId;
    //   identifyNode(data);
    // }
    else if(type == 'question' || type == 'openoption' || type =='buttonOptions'){ 
      if(data.isWating == true){        
        let selectedOption = json.option.filter((item) => (item.name)  == (data?.message));
        if(selectedOption.length > 0){
          let connectNodeId = selectedOption[0].optionConnectedId;
          data.nodeId = connectNodeId;
          identifyNode(data);
        }
      }
      else{    
        sendQuestion(); 
        var updateBotSessionQuery = "update BotSessions set isWaiting=1,current_nodeId=? where botId =? and status=2";
        let updateBotSession = await db.excuteQuery(updateBotSessionQuery, [json?.connectedId,botId]);
      }
    }else if(type == 'conversationStatus'){
      let ResolveOpenChat = await db.excuteQuery('UPDATE Interaction SET interaction_status =? WHERE InteractionId !=? and customerId=?', [json?.data?.status, req.body.InteractionId, req.body?.customerId]);
      botExit();
    }else if(type == 'Notify'){
       let notifyvalues = [[SPID, '@Mention in the Notes', 'You have a been mentioned in the Notes', uid, 'teambox', uid, utcTimestamp]];
      let mentionRes = await db.excuteQuery('INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?', [notifyvalues]);
      data.nodeId = json?.connectedId;
      identifyNode(data);
    }else if(type == 'MessageOptin'){
      let optInQuery = 'UPDATE EndCustomer SET OptInStatus = ? where customerId = ? and SP_ID = ?';
      await db.excuteQuery(optInQuery, [json?.data?.status, data.custid, data.sid]);
      data.nodeId = json?.connectedId;
      identifyNode(data);
    }else if(type == 'WorkingHoursModal'){
      if(isWorkingHour()){
        let selectedOption = json.option.filter((item) => (item.name)  == 'open');
        let connectNodeId = selectedOption[0].optionConnectedId;
          data.nodeId = connectNodeId;
          identifyNode(data);
      }else{
        let selectedOption = json.option.filter((item) => (item.name)  == 'close');
        let connectNodeId = selectedOption[0].optionConnectedId;
          data.nodeId = connectNodeId;
          identifyNode(data);
      }
    }
  }
}

}

module.exports = { autoReplyDefaultAction, sReplyActionOnlostMessage,identifyNode }