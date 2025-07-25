var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const cors = require('cors');
const { type } = require("os");
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));


const XLSX = require('xlsx');
const { EmailConfigurations } =  require('../Authentication/constant');
const { MessagingName }= require('../enum');
const commonFun = require('../common/resuableFunctions.js')


const getGallery = async (req, res) => {
    try {
      
        let Gallery = await db.excuteQuery(val.getGalleryQuery, [])
        res.send({
            msg: Gallery,
            status: 200
        })
    } catch (err) {
        res.send({
            err: err,
            status: 500
        })
    }
}

const addBot = async (request, res) => {
    try {       
    //    let myUTCString = new Date().toUTCString();
    //     const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');   
    let req = request.body;  
      const values = [
        req.spid,
        req.name,
        req.description,
        req.channel_id,
        req.status,
        req.timeout_value,
        req.timeout_message,
        req.created_by,
        JSON.stringify(req.advanceAction),
        req.keyword
      ];
      console.log("values", values);
        let bot = await db.excuteQuery(val.insertBot, [[values]])
        res.send({
            msg: bot,
            status: 200
        })
    } catch (err) {
        res.send({
            err: err,
            status: 500
        })
    }
}


const submitBots = async (request, res) => {
    try {       
       //let myUTCString = new Date().toUTCString();
        const created_at = null;//moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');    
        let req = request.body; 
    let nodes = req.nodes; 
    let nodeJson = req.node_FE_Json;
    let published_at = req.status =='publish' ? created_at :null;
    let bot = await db.excuteQuery(val.updateBotStatus, [req.status, nodeJson, published_at, req.botId]);
    // let deleteBotNode = await db.excuteQuery(val.deleteBotsNode, [req.botId]); 
      nodes.forEach((node) => {
        let node_Json = JSON.stringify(node);
        node.spid = req.spid;
        let Node =[
            req.botId,
             node?.nodeType || '', 
             node?.message || '',
             node_Json,
             node.nodeId,
             node?.previous_Node_Id,
        ]
        let nods =  db.excuteQuery(val.insertNode, [[Node]])
      })
        res.send({
            msg: bot,
            status: 200
        })
    } catch (err) {
        res.send({
            err: err,
            status: 500
        })
    }
}



const updateBotDetails = async (request, res) => {
    try {       
        let req = request.body;
        console.log("req", req);
        let vals = req.advanceAction ? req?.advanceAction?.length >0 ?JSON.stringify(req.advanceAction): null : null;
        console.log("req.advanceAction", req.advanceAction);
    let bot = await db.excuteQuery(val.updateBots, [req.name,req.description,req.channel_id,req.timeout_value,req.timeout_message,vals,
        req.keyword,req.status, req.botId]); 
    
        res.send({
            msg: bot,
            status: 200
        })
    } catch (err) {
        console.log("err", err);
        res.send({
            err: err,
            status: 500
        })
    }
}

// const addNode = async (req, res) => {
//     try {       
//     //    let myUTCString = new Date().toUTCString();
//     //     const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
//       const values = [
//         req.spid,
//         req.name,
//         req.description,
//         req.channel_id,
//         req.status,
//         req.timeout_value,
//         req.timeout_message,
//         req.created_by
//       ];
//         let bot = await db.excuteQuery(val.insertBot, [[values]])
//         res.send({
//             msg: bot,
//             status: 200
//         })
//     } catch (err) {
//         res.send({
//             err: err,
//             status: 500
//         })
//     }
// }


const checkExistingBot = async (req, res) => {
    try {
        console.log("req", req);
        console.log("req.body", req.body);
        let selectBot = await db.excuteQuery(val.isBotExist, [req.body.spid, req.body.name]);
        console.log("selectBot", selectBot);
        if (selectBot?.length == 0) {

            res.send({
                "status": 200,
                "message": "Bot ready to add",
            })
        } else {
            res.send({
                "status": 409,
                "message": "Bot Name already exist"
            })
        }
    } catch (err) {
        res.send({
            "status": 500,
            "message": err
        })
    }
}



const checkExistingKeyword = async (req, res) => {
    try {
        let botKeyword = await db.excuteQuery(val.isKeywordUsed, [req.body.spid, req.body.keyword]);
        let smartReplyKeyword = await db.excuteQuery(val.isKeywordUsedSmartReply, [req.body.spid, req.body.keyword]);
        if (botKeyword?.length == 0 && smartReplyKeyword?.length == 0) {
            res.send({
                "status": 200,
                "message": "No keyword Matched",
            })
        } else if( botKeyword?.length > 0) {
            res.send({
                "status": 409,
                "message": "Keyword already used in Bot"
            })
        }
        else if( smartReplyKeyword?.length > 0) {
            res.send({
                "status": 409,
                "message": "Keyword already used in Smart Reply"
            })
        }
    
    } catch (err) {
        res.send({
            "status": 500,
            "message": err
        })
    }
}


const getAllBots = async (req, res) => {
    try {
        let bots = await db.excuteQuery(val.getAllBots, [req.params.spid])
        console.log('bots', bots);
        res.status(200).send({
            bots: bots,
            status: 200
        })
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}


const getBotDetailById = async (req, res) => {
    try {
        let bot = await db.excuteQuery(val.getBotById, [req.params.spid, req.params.botId])
        if( bot?.length == 0) {
            return res.status(404).send({
                message: "Bot not found",
                status: 409
            });
        } else{
            console.log('bot', bot);
        let nodeList = await db.excuteQuery(val.getBotDetailById, [req.params.spid, req.params.botId]);
        let session = await db.excuteQuery(val.getSessionsData, [req.params.botId, req.params.botId,req.params.botId]);
        bot[0]['nodes'] = nodeList; 
        bot[0]['invoked'] = session[0].invoked; 
        bot[0]['complete'] = session[0].complete; 
        bot[0]['dropped'] = session[0].dropped; 
        res.status(200).send({
            bots: bot,
            status: 200
        })
        }
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}


const deleteBotbyId = async (req, res) => {
    try {
        let botRunning = await db.excuteQuery(val.isBotRunning, [req.params.spid, req.params.botId]);
        if (botRunning?.length == 0) {
            let deleteBot = await db.excuteQuery(val.deleteBot, [req.params.botId]);
            res.send({
                "status": 200,
                "message": "Bot is deleted successfully",
            })
        } else {
            let deprecateBot = await db.excuteQuery(val.deprecateBot, [req.params.botId]);
            res.send({
                "status": 200,
                "message": "Bot is running, so it is deprecated",
            })
        }
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}


function executeNextNode(){

}

async function sendMessageNode(){
    let response = await messageThroughselectedchannel(
        message.SPID,
        message.customer_phone_number,
        message.message_type,
        message_text,
        message.link,
        metaPhoneNumberID,
        message.channel,
        message.message_type
      );

      if (response?.status == 200) {
            let myUTCString = new Date().toUTCString();
            const currenttime = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');      
            // Update message status and insert new message
             await db.excuteQuery(settingVal.systemMsgQuery, [5, currenttime, message.MaxMessageId]);
            let messageValu = [
            [message.SPID, 'text', metaPhoneNumberID, message.interaction_id, message.Agent_id, 'Out', message.value, (message.link ? message.link : 'text'), message.message_type,  response?.message?.messages[0]?.id, "", currenttime, currenttime, 5, -3, 1]
            ];
            await db.excuteQuery(insertMessageQuery, [messageValu]);
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


const exportFlowData = async (req, res) => {
    try {
      console.log(req.body)
      let SP_ID = req.body.spId
      let botId = req.body.botId
      let startDate = req.body.startDate
      let endDate = req.body.endDate
      let Channel = req?.body?.Channel
      let data;
      let emailSender = MessagingName[Channel];
      const transporter = getTransporter(emailSender);
      const senderConfig = EmailConfigurations[emailSender];
      let botRunning = await db.excuteQuery(val.geBotSession, [botId, SP_ID, startDate, endDate]);
        if (botRunning?.length > 0) {
            data = botRunning;
        }else{
            return res.status(200).send({ message: "No data found for the given criteria." });
        }
  
      let isDateTime = await processData(data)
      if (data.length > 0 && isDateTime) {
        let result = await formatterDateTime(data, SP_ID);
        if (result) {
          data = result
        }
      }
      // Create a unique directory for temporary files
      const uniqueDir = path.join(__dirname, `temp_${Date.now()}`);
      if (!fs.existsSync(uniqueDir)) {
        fs.mkdirSync(uniqueDir);
      }
  
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(data);
      const filePath = path.join(uniqueDir, 'data.csv'); 
      fs.writeFileSync(filePath, csv, function (err) {
        if (err) {
          res.send(err);
        }
        console.log('File Saved')
      })
      const xlsxPath = await convertCsvToXlsx(csv, path.join(uniqueDir, 'data.xlsx'));
      res.attachment("data.csv")
      const timestamp = Date.now();
      const randomNumber = Math.floor(Math.random() * 10000);
      var mailOptions = {
        from: senderConfig.email,
        to: req.body.loginData,
        subject: `${emailSender} - Bot Usages export report`,
        html: `
          <p>Dear ${req.body?.Name},</p>
          <p>Please find attached here the file containing your exported Bot usage from your ${emailSender} account.</p>
          <p>Thank you,</p>
          <p>Team ${emailSender}</p>
        `,
        attachments: [
          {
            filename: `${timestamp}-${randomNumber}.xlsx`,
            path: xlsxPath,
          },
        ]
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          logger.error(`export contact email send error ${error}`)
          fs.rmSync(uniqueDir, { recursive: true, force: true });
          // res.send(error);
        } else {
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          logger.info(`Message sent: %s, ${info.messageId}`)
          fs.rmSync(uniqueDir, { recursive: true, force: true });
          // res.status(200).send({ msg: "data has been sent" });
        }
  
      });
  
      return res.status(200).send({ msg: "Contacts exported sucessfully!" });
    } catch (err) {
        console.log(err)
      res.send(err);
    }  
  }
  function convertCsvToXlsx(fileBuffer, outputFileName = 'Converted_File.xlsx') {
    // using utf-8 encodign to avoid edge cases of CSV
    return new Promise((resolve, reject) => {
      try {
        const csvString = typeof fileBuffer === 'string' ? fileBuffer : fileBuffer.toString('utf-8');
        if (!csvString.trim()) {
          return reject(new Error('Input CSV is empty.'));
        }
  
        const workbook = XLSX.read(csvString, { type: 'string', codepage: 65001 });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]] || XLSX.utils.aoa_to_sheet([]);
        for (const cell in worksheet) {
          if (cell[0] === "!") continue;
          let value = worksheet[cell].v;
          if (typeof value === 'number') {
            worksheet[cell].v = value.toString();
            worksheet[cell].z = '0'; 
          }
  
          if (typeof value !== 'number') {
            worksheet[cell].z = '@'; 
          }
        }
        
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'Sheet1');
        XLSX.writeFile(newWorkbook, outputFileName);
  
        console.log(`XLSX file created successfully: ${outputFileName}`);
        resolve(outputFileName);
      } catch (error) {
        console.error(`Error during conversion: ${error.message}`);
        reject(error);
      }
    });
  }
  

  async function processData(data) {
    if (data.length > 0) {
      let containsDateOrTime = false;
  
      const datePatterns = [
        /\b\d{4}-\d{2}-\d{2}\b/,       // YYYY-MM-DD
        /\b\d{2}\/\d{2}\/\d{4}\b/,     // DD/MM/YYYY
        /\b\d{2}-\d{2}-\d{4}\b/,       // DD-MM-YYYY
        /\b\d{4}\/\d{2}\/\d{2}\b/      // YYYY/MM/DD
      ];
  
      const timePatterns = [
        /\b([01]?\d|2[0-3]):[0-5]\d:[0-5]\d\b/,         // HH:MM:SS in 24-hour format
        /\b([01]?\d|2[0-3]):[0-5]\d\b/,                 // HH:MM in 24-hour format
        /\b(1[0-2]|0?[1-9]):[0-5]\d\s?(AM|PM)\b/i,      // HH:MM AM/PM in 12-hour format
        /\b(1[0-2]|0?[1-9]):[0-5]\d:[0-5]\d\s?(AM|PM)\b/i // HH:MM:SS AM/PM in 12-hour format
      ];
  
      for (const item of data) {
        // Loop through each key-value pair in the object
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const value = item[key];
            const isDate = datePatterns.some(pattern => pattern.test(value));
            const isTime = timePatterns.some(pattern => pattern.test(value));
  
            if (isDate || isTime) {
              containsDateOrTime = true;
              break; // Exit inner loop if a date or time value is found
            }
          }
        }
        if (containsDateOrTime) break; // Exit outer loop if a date or time value is found
      }
    }
  }

  function getTransporter(channel) {
    const senderConfig = EmailConfigurations[channel];
    if (!senderConfig) {
        throw new Error(`Invalid channel: ${channel}`);
    }
  
    return nodemailer.createTransport({
        host: senderConfig.emailHost,
        port: senderConfig.port,
        secure: true,
        auth: {
            user: senderConfig.email,
            pass: senderConfig.appPassword,
        },
    });
  }
  

  async function formatterDateTime(data, sp_id) {
    const select = 'SELECT * FROM localDetails WHERE SP_ID = ?';
    const formatSettings = await db.excuteQuery(select, [sp_id]);
  
    if (!formatSettings || formatSettings.length === 0) {
       return data;
    }
  
    let { Date_Format, Time_Format } = formatSettings[0];
    for (let i = 0; i < data.length; i++) {
        const record = data[i];
        const { Date: originalDate, Time: originalTime } = record;
  
        try {
            const date = moment(originalDate);
            const time = moment(originalTime, 'HH:mm'); 
            if(Date_Format) Date_Format = convertToUppercaseFormat(Date_Format)
            let formattedDate = date.format(Date_Format || 'MM/DD/YYYY');
            if(formattedDate == 'Invalid date'){formattedDate = originalDate};
            let formattedTime = time.format(Time_Format === '12' ? 'h:mm A' : 'HH:mm');
            if(formattedTime == 'Invalid date') {formattedTime = originalTime};
            
            data[i] = {
                ...record,
                Date: formattedDate,
                Time: formattedTime
            };
        } catch (error) {
            console.error('Error formatting record:', error);
        }
    }
  
    return data;
  }

  function convertToUppercaseFormat(format) {
    const formatMapping = {
        'd': 'D', 
        'dd': 'DD', 
        'm': 'M', 
        'mm': 'MM',
        'yy': 'YY', 
        'yyyy': 'YYYY'
    };
  
    return format.replace(/d{1,2}|m{1,2}|y{2,4}/gi, match => formatMapping[match.toLowerCase()] || match);
  }

  const healthCheck = (req, res) => {
    try {
            res.status(200).send({ status: 'ok', message: 'Service is running'});
    } catch (err) {
        res.status(500).send({ error: 'Internal server error' });
    }
};

module.exports = { getGallery , addBot,  checkExistingBot, getAllBots, getBotDetailById, deleteBotbyId, submitBots,checkExistingKeyword,updateBotDetails,exportFlowData, healthCheck };