const express = require('express');
const app = express();
const { Client, LocalAuth, MessageMedia, Location, Buttons } = require('whatsapp-web.js');
const puppeteer = require('puppeteer')
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
const moment = require('moment');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "5mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
const Routing = require('../RoutingRules')
const db = require('../dbhelper')
const awsHelper = require('../awsHelper');
let incommingmsg = require('../IncommingMessages')
const notify = require('../whatsApp/PushNotifications')
const mapCountryCode = require('../Contact/utils.js');
const logger = require('../common/logger.log');
const commonFun = require('../common/resuableFunctions.js')
const { exec } = require('child_process');
const fs = require('fs')
const path = require("path");
const { EmailConfigurations } =  require('../Authentication/constant');
const { MessagingName, channelName }= require('../enum');
let clientSpidMapping = {};
let clientPidMapping = {};
let undefinedCount = 0;
let updateUserQuery = `update user set mobile_number=? , isAutoScanOnce =? where SP_ID=? and ParentId is null and isDeleted !=1 and IsActive !=2`
let notifyInteraction = `SELECT InteractionId FROM Interaction WHERE customerId IN (SELECT customerId FROM EndCustomer WHERE Phone_number = ? and SP_ID=? ) and is_deleted !=1   order by created_at desc`

// new imports 
const { whapiService }= require('../webJS/whapiService');
const { CreateChannelRequest,  
        CreateChannelResponse, 
        extendChannelValidity, 
        WhapiIncomingMessage,
        WhapiMessageRequest,
        WhapiMessageResponse,
        WhapiInteractiveButtons
      } = require('../webJS/model/whapiModel');

async function createClientInstance(spid, phoneNo) {
    try {
        var channel;
        //Instead of making client Instance We are making channel here
        let checkIfChannelExist = await CreateChannelResponse.getBySpid(spid);
        channel = checkIfChannelExist;
        if (!checkIfChannelExist) {
            
            const projectId = await whapiService.getProjectId();
            let channelReqPayload = new CreateChannelRequest({
                name: `SPID-${spid}`,
                projectId: projectId,
            });

            const channelResponse = await whapiService.createChannel(
                channelReqPayload.name,
                channelReqPayload.projectId
            );

            channel = new CreateChannelResponse(channelResponse, spid, phoneNo);
            await channel.saveToDatabase();

            //todo need to uncomment this after Business Team come back to this
            const extendValidity = new extendChannelValidity();
            const extendChannel = await whapiService.extendChannel(
                channel.id,
                extendValidity
            );
            // const response = await whapiService.startChannel(channel.token, channel.id);

            await whapiService.setupWebhook(channel.token);
        }

        return await whapiService.getLoginQRCode(channel.token);

        //setting up webhook
    } catch (err) {
      if (err.response?.data?.error?.code === 409 && err.response?.data?.error?.message === "channel already authenticated") {
        try {
          await CreateChannelResponse.setChannelAlreadyAuthenticated(spid);
          return {
            status: 409,
            message: "Channel already authenticated",
            channelToken: channel.token,
          }
        } catch (dbError) {
            console.error('Error updating database:', dbError.message);
        }
    }
        return err;
    }
}

process.on('uncaughtException', function (err) {
  try {
    console.log("uncaught exception was trying to close this. THe expectation is that it is coming from pupeeter hence ignoring.")
    console.log(err)
    logger.info(`uncaught exception was trying to close this web js *********`)
    let getAllclient = getAllWidData(clientSpidMapping)
    logger.error(`Uncaught exception Data of getAllClient: ${getAllclient}`);
    if (err.message.includes('Puppeteer')) {
      console.log("Ignoring Puppeteer-related error");
      // Perform any necessary cleanup or handling specific to Puppeteer errors
    } else {
      // Handle other types of errors
      console.log("Handling other types of errors");
    }
    //Need spid in this process for delete client from mapping
  } catch (err) {
    logger.error(`Uncaught exception for error: ${err}`);
    let getAllclient = getAllWidData(clientSpidMapping)
    console.log(err);
  }
});







// Function to kill Chrome or related processes
const os = require('os');

function killChromeProcesses(spid, callback) {
  const platform = os.platform(); // Detect the operating system
  logger.info(`Killing Chrome processes for spid: ${spid}`);
  let command;
  //console.log("platform------",platform)
  if (platform === 'win32') {
    // Windows: Use PowerShell to find and kill Chrome processes by spid
    command = `
      $chromeProcesses = Get-Process chrome | Where-Object { $_.Id -eq ${spid} }
      if ($chromeProcesses) {
        $chromeProcesses | ForEach-Object { Stop-Process -Id $_.Id -Force }
      }
    `;
    exec(`powershell -command "${command}"`, (err, stdout, stderr) => {
      if (err) {
        console.error('Error terminating Chrome processes:', stderr);
      } else {
        console.log('Terminated Chrome processes for spid:', spid);
      }
      callback(); // Proceed to the next operation
    });

  } else if (platform === 'linux') {
    // Linux: Use the 'kill' command to terminate the process by spid
    command = `kill -9 ${spid}`;
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('Error terminating Chrome processes:', stderr);
      } else {
        console.log('Terminated Chrome processes for spid:', spid);
      }
      callback(); // Proceed to the next operation
    });

  } else {
    console.error(`Unsupported platform: ${platform}`);
    callback(); // Still proceed to the next operation even if unsupported platform
  }
}

//todo below 3 functions used in on.ready function
async function isPhoneAlreadyInUsed(mobile_number, spid) {
  try {
    logger.info(`Checking isPhoneAlreadyInUsed for spid: ${spid}, and mobile_number: ${mobile_number}`);
    let isExist = await db.excuteQuery('select * from user where mobile_number=? and ParentId is null and  isDeleted !=1 and IsActive !=2', [mobile_number, 1]);
    //console.log("is Exist",isExist)
    if (isExist?.length > 0 && isExist[0].SP_ID != spid) {
      return true;
    }
    return false;
  } catch (err) {
    logger.error(`error in, phone is already in use for spid: ${spid}, mobile_number: ${mobile_number}, error: ${err}`);
    console.log("check existing phone error", err);
    return err;
  }
}

async function isWrongNumberScanned(spid, scannedPhone) {
  try {
    logger.info(`isWrongNumberScanned for spid: ${spid}, and scannedPhone: ${scannedPhone}`);
    let isExist = await db.excuteQuery('select * from user where SP_ID=? and isAutoScanOnce =? and ParentId is null and isDeleted !=1 and IsActive !=2', [spid, 1]);
    //console.log("isWrongNumberScanned",isExist)
    if (isExist?.length > 0 && (isExist[0]?.mobile_number != scannedPhone)) {

      return true;
    }
    return false;
  } catch (err) {
    logger.error(`error in, phone is already in use for spid: ${spid}, scannedPhone: ${scannedPhone}, error: ${err}`);
    console.log("check existing phone error", err);
    return err;
  }
}

async function destroyWrongScan(spid) {
  try { 
    logger.info(`distroying Wrong Scan for spid: ${spid}`);
    if (clientSpidMapping.hasOwnProperty(spid)) {
      delete clientSpidMapping[spid];
      try {
        // kill the cycle with pid and sign = 'SIGINT' 
        process.kill(clientPidMapping[spid]);
        delete clientPidMapping[spid];

        let dir = path.join(__dirname, '.wwebjs_auth');
        let sessionDir = path.join(dir, `session-${spid}`);

        if (fs.existsSync(sessionDir)) {
          console.log(`wrong Deleting directory: ${sessionDir}`);

          // First, attempt to kill related processes (e.g., Chrome) that may be locking files
          killChromeProcesses(spid, () => {
            setTimeout(() => {
              try {
                // Use fs-extra's removeSync for better handling of recursive deletes
                fs.rmdirSync(sessionDir, { recursive: true });
                console.log(`Successfully deleted directory: ${sessionDir}`);
              } catch (err) {
                console.error(`Error deleting directory ${sessionDir}:`, err);
              }
            }, 2000); // Adjust the delay as necessary
          });

        } else {
          console.log(`disconnected Directory not found: ${sessionDir}`);
        }

      } catch (err) {
        console.log("Delete clientPidMapping issues in wrong scan")
        logger.error(`Delete clientPidMapping issues in wrong scan for spid : ${spid}, error: ${err}`);
      }

      console.log(`destroy wrong no. ${spid} from clientSpidMapping.`);

    }
  } catch (err) {
    logger.error(`Destroying wrong scan for spid: ${spid}, error: ${err}`);
    console.log("destroyWrongScan catch error", err);
    return err;
  }
}

//todo client.on('ready') functionality will be added here

/**
 * Saves an incoming message.
 * @param {WhapiIncomingMessage} message - The message object from the model.
 */
async function Message(message, incommingMessageDependency){
    try {
        incommingmsg = incommingMessageDependency;
        console.log("WHAPI event here -----------------------------------")
        if(!message.messages[0]?.chat_id?.includes('@g.us')){ 
         
        saveInMessages(message);

        // Check if the received message is a reply
        if (message.hasQuotedMsg) {
          // Check if the replied message is sent by your application
          const repliedMessage = await message.getQuotedMessage();
          // Notify about the reply
          //logger.info(`replied sms  ${JSON.stringify(repliedMessage)}`)
          // console.log("reply message status ========", (repliedMessage && repliedMessage.fromMe), repliedMessage.fromMe)
          if (repliedMessage && repliedMessage.fromMe) {
            // Notify about the reply
            const repliedNumber = (message.from).replace(/@c\.us$/, "");
            let d = new Date(message?.messages[0]?.timestamp * 1000).toUTCString();
            
            const message_time = moment.utc(d).format('YYYY-MM-DD HH:mm:ss');
            console.log(repliedMessage?._data?.id?.id, "reply ___________________", message.body)
            let campaignRepliedQuery = `UPDATE CampaignMessages set status=4 ,RepliedTime ='${message_time}' where phone_number =${repliedNumber} and (status = 3 OR status =2) and SP_ID = ${spid} AND messageTemptateId = '${repliedMessage?._data?.id?.id}'`
            console.log(campaignRepliedQuery)
            let campaignReplied = await db.excuteQuery(campaignRepliedQuery, [])
            console.log(repliedNumber, spid, "campaignReplied*******", campaignReplied?.affectedRows)
          }
        }
      }



      } catch (messageerr) {
        logger.error(`error Creating Client for spid: ${spid}, error: ${messageerr}`);
        console.log("client message err")
      }
}
const { messageStatus, messageRecieved } = require('../common/webhookEvents.js');

/**
 * Update the statuses
 * @param {WhapiIncomingMessage} statuses
 */
async function messageAck(statuses) {
  let r1 = await CreateChannelResponse.getByChannelId(statuses.channel_id);
  let spid = r1?.spid;
  let spsPhoneNo = r1?.phone;
  
    for (const status of statuses.statuses) {
        let phoneNumber = status.recipient_id.replace(/@s\.whatsapp\.net$/, "");
       // let ack = status.code;
        let messageId = status.id;

    let ack;
    if (status.status === 'sent') ack = 1;
    else if (status.status === 'delivered') ack = 2;
    else if (status.status === 'read') ack = 3;
    else continue;

    const message = {
      to: status.recipient_id.replace(/@s\.whatsapp\.net$/, '') + "@c.us",
      from: spsPhoneNo + "@c.us",
      _data: {
        id: {
          id: status.id
        }
      },
      timestamp: parseInt(status.timestamp)
    };

    // Calling this with correct structure
    await messageStatus(message, ack, spid);

        try {
            let d = new Date(status.timestamp * 1000).toUTCString();
            const message_time = moment.utc(d).format('YYYY-MM-DD HH:mm:ss');

            // Map status codes to appropriate states
            if (status.status === 'sent') {
                logger.info(`Sent message ${d}, ${message_time}`);
                await db.excuteQuery('UPDATE CampaignMessages SET status=1, SentTime=? WHERE phone_number=? AND messageTemptateId=?', [message_time, phoneNumber, messageId]);
                await db.excuteQuery('UPDATE Message SET created_at=? WHERE Message_template_id=?', [message_time, messageId]);

                let ack1InId = await db.excuteQuery(notifyInteraction, [phoneNumber, spid]);
                let sended = await db.excuteQuery(`UPDATE Message
                    SET msg_status = 1 
                    WHERE interaction_id IN (
                        SELECT InteractionId FROM Interaction 
                        WHERE customerId IN (
                            SELECT customerId FROM EndCustomer WHERE Phone_number = ? AND SP_ID=? AND isDeleted !=1 AND isBlocked !=1 
                        )
                    ) AND is_deleted !=1  AND (msg_status IS NULL);`, [phoneNumber, spid]);

                logger.info(`Send ============== ${sended?.affectedRows}`);
                notify.NotifyServer(spsPhoneNo, false, ack1InId[0]?.InteractionId, 'Out', 1, 0, messageId);

            } else if (status.status === 'delivered') {
                const LastModifiedDate = moment.utc(new Date().toUTCString()).format('YYYY-MM-DD HH:mm:ss');
                logger.info(`Delivered message ${d}, ${message_time}, ${LastModifiedDate}`);

                await db.excuteQuery('UPDATE CampaignMessages SET status=2, DeliveredTime=? WHERE phone_number=? AND messageTemptateId=?', [LastModifiedDate, phoneNumber, messageId]);

                let deded = await db.excuteQuery(`UPDATE Message
                    SET msg_status = 2 
                    WHERE interaction_id IN (
                        SELECT InteractionId FROM Interaction 
                        WHERE customerId IN (
                            SELECT customerId FROM EndCustomer WHERE Phone_number = ? AND SP_ID=? AND isDeleted !=1 AND isBlocked !=1
                        )
                    ) AND is_deleted !=1 AND (msg_status IS NULL OR msg_status = 1);`, [phoneNumber, spid]);

                logger.info(`Deliver ============== ${deded?.affectedRows}`);
                let ack2InId = await db.excuteQuery(notifyInteraction, [phoneNumber, spid]);
                notify.NotifyServer(spsPhoneNo, false, ack2InId[0]?.InteractionId, 'Out', 2, 0, messageId);

            } else if (status.status === 'read') {
                const LastModifiedDate = moment.utc(new Date().toUTCString()).format('YYYY-MM-DD HH:mm:ss');
                logger.info(`Read message ${d}, ${message_time}, ${LastModifiedDate}`);

                await db.excuteQuery('UPDATE CampaignMessages SET status=3, SeenTime=? WHERE phone_number=? AND messageTemptateId=?', [LastModifiedDate, phoneNumber, messageId]);

                let resd = await db.excuteQuery(`UPDATE Message
                    SET msg_status = 3 
                    WHERE interaction_id IN (
                        SELECT InteractionId FROM Interaction 
                        WHERE customerId IN (
                            SELECT customerId FROM EndCustomer WHERE Phone_number =? AND SP_ID=? AND isDeleted !=1 AND isBlocked !=1
                        )
                    ) AND is_deleted !=1`, [phoneNumber, spid]);

                logger.info(`Read ============== ${resd?.affectedRows}`);
                let ack3InId = await db.excuteQuery(notifyInteraction, [phoneNumber, spid]);
                notify.NotifyServer(spsPhoneNo, false, ack3InId[0]?.InteractionId, 'Out', 3, 0, messageId);
            }
        } catch (error) {
            logger.error(`Error processing message_ack for SPID: ${spid}, error: ${error}`);
            console.log(error);
        }
    }
}

const handleDisconnection = async (channel_id) => {
    try {
        let r1 = await CreateChannelResponse.getByChannelId(channel_id);
        const phoneNo = r1?.phone;
        const spid = r1?.spid;

        logger.info(`Channel initiated for disconnection for spid: ${spid}, and phone number: ${phoneNo}`);
        sendMailOnDisconnection(phoneNo, spid);
        console.log("Disconnected", new Date().toUTCString());
        await db.excuteQuery('UPDATE WhatsAppWeb SET channel_status = 0 WHERE connected_id = ? AND spid = ?', [phoneNo, spid]);
        // if (clientSpidMapping.hasOwnProperty(spid)) {
        //     try {
        //         delete clientSpidMapping[spid];
                
        //         let myUTCString = new Date().toUTCString();
        //         const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        //         await db.excuteQuery('UPDATE WhatsAppWeb SET updated_at = ? WHERE connected_id = ? AND spid = ? AND is_deleted != 1', [updated_at, phoneNo, spid]);
                
        //         console.log("Kill[spid]", clientPidMapping[spid]);
        //         process.kill(clientPidMapping[spid]);
        //         delete clientPidMapping[spid];
                
        //         let dir = path.join(__dirname, '.wwebjs_auth');
        //         let sessionDir = path.join(dir, `session-${spid}`);

        //         if (fs.existsSync(sessionDir)) {
        //             console.log(`Disconnected - Deleting directory: ${sessionDir}`);
        //             killChromeProcesses(spid, () => {
        //                 setTimeout(() => {
        //                     try {
        //                         fs.rmdirSync(sessionDir, { recursive: true });
        //                         console.log(`Successfully deleted directory on disconnection: ${sessionDir}`);
        //                     } catch (err) {
        //                         console.error(`Error deleting directory on disconnection ${sessionDir}:`, err);
        //                     }
        //                 }, 2000);
        //             });
        //         } else {
        //             console.log(`Disconnected - Directory not found: ${sessionDir}`);
        //         }

        //         await db.excuteQuery('UPDATE WhatsAppWeb SET channel_status = 0 WHERE connected_id = ? AND spid = ?', [phoneNo, spid]);
        //     } catch (err) {
        //         logger.error(`Error while handling disconnection for spid: ${spid}, mobile_number: ${phoneNo}, error: ${err}`);
        //         console.log("Error deleting clientPidMapping in disconnected", err);
        //     }
        //     console.log(`Removed ${spid} from clientSpidMapping.`);
        // }
        notify.NotifyServer(phoneNo, false, 'Client is disconnected!');
    } catch (error) {
        logger.error(`Error while handling disconnection for spid: ${spid}, mobile_number: ${phoneNo}, error: ${error}`);
        console.log("Disconnection error");
    }
};

const handleAuthentication = async (channel_id) => {
    try {
        // Fetch details using channel_id
        let channelData = await CreateChannelResponse.getByChannelId(channel_id);

        if (!channelData) {
            console.error(`No data found for channel_id: ${channel_id}`);
            return;
        }

        const phoneNo = channelData.phoneNo;
        const spid = channelData.spid;

        console.log(`Authenticated spid: ${spid}, phoneNo: ${phoneNo}`);

        let Data = await whapiService.getQRScannedPhoneNo(channel_id);
        let channel = new CreateChannelResponse(Data, spid, phoneNo);
        let wrongNumber = await isWrongNumberScanned(channel.spid, channel.phone);
        if (wrongNumber) {
         let isClientLogout = await whapiService.logoutClient(channel.token);

          const message = isClientLogout
          ? 'Wrong Number Scanned. Destroying session.'
          : 'Wrong Number Scanned. Unable to destroy session.';

          notify.NotifyServer(phoneNo, false, message);
          return;
        }
        if(await checkifSPAlreadyExist(channel.phone, channel.spid)){
          notify.NotifyServer(channel.phone, false, 'This number is already used as an SP number. Please use a different one.');
          whapiService.deleteChannelById(channel.id);
          channel.deleteFromDatabase();
          return;
        }
        await channel.saveToDatabase();
        updateConnectedChannelNo(channel.phone, channel.spid);
        await CreateChannelResponse.setChannelAlreadyAuthenticated(spid);
        notify.NotifyServer(channel.phone, false, 'Client is ready!');

    } catch (error) {
        console.error(`Error handling authentication for channel_id: ${channel_id}`, error);
    }
};

async function updateConnectedChannelNo(phoneNo, spid){
  await db.excuteQuery('UPDATE WhatsAppWeb SET connected_id = ? WHERE spid = ?', [phoneNo, spid]);
  await db.excuteQuery('UPDATE user SET mobile_number = ? WHERE spid = ?', [phoneNo, spid]);
  await db.excuteQuery('UPDATE whapi_channels SET phone = ? WHERE  spid = ?', [phoneNo, spid]);
}
async function checkifSPAlreadyExist(phoneNo, spid) {
  try {
    let isExist = await db.excuteQuery('select * from user where mobile_number=? and ParentId is null and  isDeleted !=1 and IsActive !=2', [phoneNo, 1]);
    if (isExist?.length > 0 && isExist[0].SP_ID != spid) {
      return true;
    }
    return false;
  } catch (error) {
      console.error('Error in checkifSPAlreadyExist:', error);
      return false;
  }
  
}
async function handleWhatsAppReady(spid, phoneNo, token) {
  try {
      let sessionData = await whapiService.getSessionStatus(token);

      let isPhoneAlreadyUsed = await isPhoneAlreadyInUsed(phoneNo, spid);
      if (isPhoneAlreadyUsed) {
          console.log('Phone is already in use by another SPID.');
          await destroyWrongScan(spid);
          return;
      }

      let wrongNumber = await isWrongNumberScanned(spid, phoneNo);
      if (wrongNumber) {
          console.log('Wrong Number Scanned. Destroying session...');
          await destroyWrongScan(spid);
          return;
      }

      let isChannelExist = await db.excuteQuery(
          'SELECT * FROM user WHERE mobile_number=? AND isDeleted !=1 AND ParentId IS NULL AND SP_ID != ?', 
          [sessionData.user, spid]
      );

      if (isChannelExist.length > 0) {
          console.log('Number is already used as an SP number.');
          return;
      }


      let updateScannedNumber = await db.excuteQuery(
          'UPDATE user SET mobile_number=?, status=1 WHERE sp_id=?', 
          [sessionData.user, spid]
      );
      console.log('Updated scanned number:', updateScannedNumber);

      console.log(`Fetching recent chats for SPID: ${spid}`);
      const chat_activos = await whapiService.getChats(token);

      if (!chat_activos?.chats?.length) {
          console.log("No active chats found.");
          return;
      }

      const recentChats = chat_activos.chats.slice(0, 30);
      for (const chat of recentChats) {
        if (chat.type !== 'group') {
            let chatId = chat?.last_message?.chat_id || chat?.id;
            if(chatId == 'stories') continue;
            console.log(`Processing chat ID: ${chatId}`);
    
            let chatMessages = await whapiService.getChatMessagesByChatId(token, chatId);
   
            if (!chatMessages?.messages || chatMessages.messages.length === 0) {
                console.log(`No messages found for chat ID: ${chatId}`);
                continue;
            }
            const messages = chatMessages.messages;
            for (let i = messages.length - 1; i >= 0; i--) {
                const message = messages[i];
                
                // Skip stories
                if (message?.chat_id === 'stories') continue;
                
                if (!message) {
                    console.log(`Invalid message at index ${i}`);
                    continue;
                }
    
                await savelostChats(message, phoneNo, spid, i, messages.length - 1);
            }
        }
    }

      console.log('Client is ready!');
  } catch (error) {
      console.error('Error handling WhatsApp readiness:', error);
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
async function sendMailOnDisconnection(phoneNo, spid) {
  try {
    const userData = await db.excuteQuery('SELECT name, mobile_number, email_id, Channel FROM user WHERE SP_ID = ? AND mobile_number = ? AND isDeleted != 1', [spid, phoneNo]);
    if (userData.length > 0) {
      const userName = userData[0].name;
      const number = userData[0].mobile_number;
      const email_id = userData[0].email_id;
      const Channel = userData[0].Channel;
      let emailSender = MessagingName[Channel];
      const channel_name = channelName[Channel];
      const transporter = getTransporter(emailSender);
      const senderConfig = EmailConfigurations[emailSender];

      var mailOptions = {
        from: senderConfig.email,
        to: email_id,
        subject: `Alert! ${emailSender} Channel Disconnected`,
        text: `Dear ${userName},
Urgent Warning!
Your ${emailSender} Channel ${channel_name}, ${number} is logged out. Your immediate action is required to ensure seamless flow of services and that messages from customers are received.

Please login to your ${emailSender} Account > Settings > Account Settings > Channels and connect your channel again to ensure no interruption to your scheduled campaigns, automated customer replies, or other automations.

Best regards,
Team ${emailSender}`
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error encountered while sending mail:', error);
        } else {
          console.log('Mail sent successfully:', info);
        }
      });

    } else {
      console.error('No user data found for the given spid and number --------------------------------------------------------------');
    }

  } catch (err) {
    logger.error(`Error encountered while sending mail during the process for SPID: ${spid}, phoneNo: ${phoneNo}, error: ${err}`);
    console.error('Error encountered while sending mail during the process:', err);
  }
}


function whatsappWebStatus() {
  console.log("undefinedCount", undefinedCount)
  if (undefinedCount >= 2) {
    return false;
  } else {
    return true;
  }

}

async function isActiveSpidClient(spid) {
  // console.log("clientSpidMapping[spid]", spid, clientSpidMapping[spid]?.info?.wid)

  //logger.info( `CLIENT ============== ${clientSpidMapping[spid].info.wid}`)
  if (spid) {
    console.log("if client ready")
    let WAwebdetails = await db.excuteQuery('select channel_id,connected_id,channel_status from  WhatsAppWeb where spid=? and is_deleted !=1', [spid]);
    if (WAwebdetails.length > 0) {
      if(WAwebdetails[0].channel_status == 0){
        return { "isActiveSpidClient": false, "WAweb": WAwebdetails };
      }
      else{
        return { "isActiveSpidClient": true, "WAweb": WAwebdetails };
      }
    }
    
  } 
  //else {
  //   let disconnectWAweb = await db.excuteQuery('update WhatsAppWeb set channel_status=0 where spid=? and channel_id =? ', [spid, 'WA Web']);
  //   let WAwebdetails = await db.excuteQuery('select channel_id,connected_id,channel_status from  WhatsAppWeb where spid=? and is_deleted !=1', [spid]);
  //   return { "isActiveSpidClient": false, "WAweb": WAwebdetails };
  // }
}


function getAllWidData(clientSpidMapping) {
  const widDataMap = {}; // Initialize an empty object to store wid data
  console.log("getAllWidData-------------")
  for (const spid in clientSpidMapping) {  // Iterate over each spid in the clientSpidMapping object
    if (clientSpidMapping.hasOwnProperty(spid)) { // Check if the property is actually part of the object
      const widData = clientSpidMapping[spid]?.info?.wid; // Safely access wid data using optional chaining
      console.log("spid------------", spid)
      if (widData) { // If wid data exists
        widDataMap[spid] = widData; // Add wid data to widDataMap with spid as the key
        let phoneNo = clientSpidMapping[spid]?.info?.wid.user;
        console.log("phoneNo", phoneNo)
        let reConnectClient = createClientInstance(spid, phoneNo)
      }
    }
  }


  return widDataMap; // Return the object containing wid data for all spids
}

// todo : async function sendMessages( : no need as whapi has a new function named sendMessageViaWhapi to send message directly
// async function sendMessages(spid, endCust, type, text, link, interaction_id, msg_id, spNumber) {
//   try {
//     logger.info(`Sending Messages for spid: ${spid}, and spNumber: ${spNumber}`);
//     let client = clientSpidMapping[[spid]];
//     if (client) {
//       let contactId = `${endCust}@c.us`
//       try {
//         let isRegistered = await client.isRegisteredUser(contactId);
//         if (type != 'unknown') {
//           if (isRegistered) {
//             let msg = await sendDifferentMessagesTypes(client, endCust, type, text, link, interaction_id, msg_id, spNumber);
//             if (msg?.status == 500) {                               // Just try 2nd time in case of fail 
//               msg = await sendDifferentMessagesTypes(client, endCust, type, text, link, interaction_id, msg_id, spNumber);
//             }
//             return msg;
//           }
//           return { status: 404, msgId: 'Phone no is not registered on whatsApp' }
//         } else {
//           return { status: 204, msgId: 'Content not found for this type' }
//         }

//       } catch (error) {
//         logger.error(`Error checking registration for SPID: ${spid}, spNumber: ${spNumber}, error: ${error}`);
//         return { status: 401, msgId: 'Error checking registration' }
//       }

//     } else {
//       console.log("else");
//       //logger.error(`Error Channel is disconnected for SPID: ${spid}, spNumber: ${spNumber}`);
//       return { status: 400, msgId: 'Channel is disconnected' }
//     }
//   } catch (err) {
//     console.log(err);
//     logger.error(`Error Channel is disconnected for SPID: ${spid}, spNumber: ${spNumber}, error ${err}`);
//     return { status: 500, msgId: 'Channel is disconnected' }
//   }
// } 

// todo is called under the sendMessages function need to check what this function is doing
// async function sendDifferentMessagesTypes(client, endCust, type, text, link, interaction_id, msg_id, spNumber) {
//   try {

//     //  console.log("messagesTypes", interaction_id, msg_id)
//     if (client.info) {
//       // console.log("client info avilable")
//     } else {
//       console.log("not avilable")
//     }
//     if (type === 'text') {

//       let myUTCString = new Date().toUTCString();
//       const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
//       let sendId = await client.sendMessage(endCust + '@c.us', text);
//       let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id])
//       return { status: 200, msgId: sendId?._data?.id?.id }
//       // notify.NotifyServer(spNumber, false, interaction_id)
//     }
//     if (type === 'image' || type === 'image/jpeg') {
//       let myUTCString = new Date().toUTCString();
//       const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
//       const media = await MessageMedia.fromUrl(link);
//       let sendId = await client.sendMessage(endCust + '@c.us', media, { caption: text });
//       let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id])
//       return { status: 200, msgId: sendId?._data?.id?.id }
//     }
//     if (type === 'video' || type === 'video/mp4') {
//       let myUTCString = new Date().toUTCString();
//       const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
//       const media = await MessageMedia.fromUrl(link);
//       // console.log(media.mimetype)
//       let sendId = await client.sendMessage(endCust + '@c.us', media, { caption: text });
//       let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id])
//       return { status: 200, msgId: sendId?._data?.id?.id }

//     }
//     if (type === 'attachment' || type === 'document' || type === 'application/pdf') {
//       let myUTCString = new Date().toUTCString();
//       const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
//       const media = await MessageMedia.fromUrl(link)//MessageMedia('pdf', link);
//       let sendId = await client.sendMessage(endCust + '@c.us', media, { caption: text });
//       let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id])
//       return { status: 200, msgId: sendId?._data?.id?.id }

//     } if (type === 'location') {
//       let myUTCString = new Date().toUTCString();
//       const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
//       const location = new Location(37.422, -122.084, 'Sampana Digital Private limited');
//       let sendId = await client.sendMessage(endCust + '@c.us', location);
//       let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id])
//       return { status: 200, msgId: sendId?._data?.id?.id }
//     }
//     if (type === 'vcard') {
//       let myUTCString = new Date().toUTCString();
//       const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
//       let firstName = 'CIP'
//       let lastName = 'TEAM'
//       let phoneNumber = '917017683064'
//       let sendId = await client.sendMessage(endCust + '@c.us',
//         'BEGIN:VCARD\n' +
//         'VERSION:3.0\n' +
//         'N:' + firstName + ';' + lastName + ';;;\n' +
//         'FN:' + firstName + lastName + '\n' +
//         'TEL;type=Mobile;waid=' + phoneNumber + ':+' + phoneNumber + '\n' +
//         'END:VCARD', {
//         parseVCards: false
//       }


//       );
//       let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id])
//       return { status: 200, msgId: sendId?._data?.id?.id }
//     }
//     // New block: Sending button messages
//     if (type === 'buttons') {
//       const buttons = [
//         { buttonId: 'btn1', buttonText: { displayText: 'Visit Website' }, type: 1 },
//         { buttonId: 'btn2', buttonText: { displayText: 'Call Now' }, type: 1 }
//       ];

//       let button = new Buttons(
//         "Button body",
//         [{ body: "bt1" }, { body: "bt2" }, { body: "bt3" }],
//         "title",
//         "footer"
//       );
//       //console.log("butttospf",buttonMessage)
//       let myUTCString = new Date().toUTCString();
//       const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
//       let sendId = await client.sendMessage(endCust + '@c.us', button);
//       //console.log(endCust,"sendId",sendId)
//       let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id]);
//       return { status: 200, msgId: sendId?._data?.id?.id };
//     }
//   } catch (err) {
//     console.log("++++++++++++++++++++++++++++++++++++++++++++")
//     logger.error(`Error sendDifferentMessagesTypes msg_id: ${msg_id}, spNumber: ${spNumber}, error: ${err}`);
//     console.log(err)
//     return { status: 500, msgId: "error on send message" }
//   }
// }

// todo related to funnel need to know what it supposed to do
async function sendFunnel(spid, endCust, type, text, link) {
  try {
    let client = clientSpidMapping[[spid]];
    console.log(spid, endCust, type, text, link)
    if (client) {
      console.log("if");
      let msg = await sendDifferentFunnelTypes(client, endCust, type, text, link);
      console.log("return send msg status")
      return '200';
    } else {
      console.log("else");
      return '401'
    }
  } catch (err) {
    console.log(err)
  }
}

//todo is called under the sendFunnel function need to check what this function is doing
async function sendDifferentFunnelTypes(client, endCust, type, text, link) {
  try {

    //  console.log("messagesTypes", interaction_id, msg_id)
    if (client.info) {
      console.log("client info avilable")
    } else {
      console.log("not avilable")
    }
    if (type === 'text') {

      client.sendMessage(endCust + '@c.us', text);
    }
    if (type === 'image') {
      const media = await MessageMedia.fromUrl(link);

      client.sendMessage(endCust + '@c.us', media, { caption: text });
    }
    if (type === 'video') {
      const media = await MessageMedia.fromUrl(link);

      client.sendMessage(endCust + '@c.us', media, { caption: text });

    }
    if (type === 'attachment') {
      const media = new MessageMedia('pdf', link);

      client.sendMessage(endCust + '@c.us', media);

    }

  } catch (err) {
    console.log("++++++++++++++++++++++++++++++++++++++++++++")
    logger.error(`Error sendDifferentFunnelTypes for client: ${client}, error: ${err}`);
    console.log(err)
  }
}



/**
 * Saves an incoming message take param from model
 * @param {WhapiIncomingMessage} message
 */
async function saveInMessages(message) {
    try {
      let message_direction = 'IN';
      let phone_number_id = ''; // Not found in the incoming message
      let r1 = await CreateChannelResponse.getByChannelId(message.channel_id);
      let display_phone_number = r1?.phone;
      
      for (const msg of message.messages || []) {
        let from = msg?.from;
        if(display_phone_number == msg?.from){
          return
        }
        let message_text = msg?.text?.body;
        let Type = msg?.type;
        let contactName = msg?.from_name;
        let Message_template_id = msg?.id;
        let repliedMessage_id = 0;
        let repliedMessageText = '';
        let repliedMessageTo = 'You';
        
        if(msg?.context.quoted_id){
          const LastModifiedDate = moment.utc(new Date().toUTCString()).format('YYYY-MM-DD HH:mm:ss');
          repliedMessage_id = msg?.context.quoted_id;
          repliedMessageText = msg?.context?.quoted_content?.body || '';
          db.excuteQuery('UPDATE CampaignMessages SET status=4, DeliveredTime=? WHERE  messageTemptateId=?', [LastModifiedDate, msg?.context?.quoted_id]);

        }

        console.log(r1,display_phone_number, from, message_text, Type, contactName, Message_template_id);
        // Format message text (bold, italic, strikethrough, and new lines)
          if (Type === 'reply' && msg?.reply?.type === 'buttons_reply') {
            Type = 'text';
            message_text = msg.reply?.buttons_reply?.title || message_text;
          }
          if(Type == 'reply' && msg?.reply?.type === 'list_reply'){
            Type = 'text';
            message_text = msg.reply?.list_reply?.title || message_text;
          }
        if (message_text) {
          message_text = message_text
            .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/~(.*?)~/g, '<del>$1</del>')
            .replace(/\n/g, '<br>');
        }
  
        let countryCodeObj;
        if (from) {
          countryCodeObj = mapCountryCode.mapCountryCode(from);
        }
        let countryCode = countryCodeObj ? `${countryCodeObj.country} +${countryCodeObj.countryCode}` : '';
  
        let message_media = "text";
        if (Type === 'image' || Type === 'video' || Type === 'audio' || Type === 'document') {
          let media
          if( msg?.image?.preview){
            //media = await uploadBase64ToAws(msg?.image?.preview, r1?.spid, r1?.phone, Type);
            const { buffer, contentType } = await whapiService.fetchBinaryFromUrl(msg.image.id, r1?.token);
            //media = await uploadBase64ToAws(buffer, r1?.spid, r1?.phone, Type);
            const key = `${r1.spid}/forWhapi/${r1.phone}/whatsAppWeb-${Date.now()}.jpeg`;
            media = (await awsHelper.uploadVideoToAws(key, buffer, contentType)).value?.Location;
          } else if (msg?.video?.preview) {
            message_text = msg?.video?.caption || message_text;
            //media = await uploadBase64ToAws(msg?.video?.preview, r1?.spid, r1?.phone, Type);
            const { buffer, contentType } = await whapiService.fetchBinaryFromUrl(msg.video.id, r1?.token);
            const key = `${r1.spid}/forWhapi/${r1.phone}/whatsAppWeb-${Date.now()}.mp4`;
            media = (await awsHelper.uploadVideoToAws(key, buffer, contentType)).value?.Location;
          } else if (Type === 'document' && msg?.document?.id) {
            message_text = msg?.document?.caption || message_text;
            const { buffer, contentType } = await whapiService.fetchBinaryFromUrl(msg.document.id, r1?.token);
            const extension = msg.document.filename?.split('.').pop() || 'doc';
            const key = `${r1.spid}/forWhapi/${r1.phone}/whatsAppWeb-${Date.now()}.${extension}`;
            media = (await awsHelper.uploadVideoToAws(key, buffer, contentType)).value?.Location;
          }else{ 
              media = msg?.image?.link
          }
          message_text = msg?.image?.caption || message_text;
          message_media = media
        }
  
        let message_time = moment.utc(new Date(msg.timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
        let saveMessage = await saveIncommingMessages(
          message_direction, from, message_text, phone_number_id, 
          display_phone_number, from, message_text, message_media, 
          Message_template_id, "Quick_reply_id", Type, 
          "ExternalMessageId", contactName, 'null', message_time, countryCode,
          repliedMessageTo,repliedMessage_id,repliedMessageText
        );
  
        let SavedMessageDetails = await getDetatilsOfSavedMessage(
          saveMessage, message_text, phone_number_id, contactName, from, display_phone_number
        );
      }
    } catch (error) {
      console.error("Error saving messages:", error);
    }
  }

async function uploadBase64ToAws(base64, spid, phoneNumberId, type) {
  try {
    const base64Data = base64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    let key = '';
    let contentType = '';
    let awsDetails;
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  if (type === 'image') {
    key = `${spid}/teambox/${phoneNumberId}/whatsAppWeb-${uniqueSuffix}.jpeg`;
    contentType = 'image/jpeg';
    awsDetails = await awsHelper.uploadVideoToAws(key, buffer, contentType);
  } else if (type === 'video') {
      key = `${spid}/teambox/${phoneNumberId}/whatsAppWeb-${uniqueSuffix}.mp4`;
      contentType = 'video/mp4';
      awsDetails = await awsHelper.uploadVideoToAws(key, buffer, contentType);
    } else if (type === 'document') {
      key = `${spid}/teambox/${phoneNumberId}/whatsAppWeb.pdf`;
      contentType = 'application/pdf';
      awsDetails = await awsHelper.uploadVideoToAws(key, buffer, contentType);
    } else if (type === 'audio') {
      key = `${spid}/teambox/${phoneNumberId}/whatsAppWeb.mp3`;
      contentType = 'audio/mpeg';
      awsDetails = await awsHelper.uploadVideoToAws(key, buffer, contentType);
    } else {
      throw new Error(`Unsupported media type: ${type}`);
    }

    return awsDetails?.value?.Location;
  } catch (error) {
    console.error(`Error in uploadBase64ToAws: ${error.message}`);
    throw error;
  }
}

let messageQuery = `SELECT 
ec.customerId,
i.InteractionId,
MAX(i.created_at) AS latest_interaction_date,
MAX(m.created_at) AS latest_message_created_date
FROM 
EndCustomer ec
JOIN 
Interaction i ON ec.customerId = i.customerId
LEFT JOIN
Message m ON i.interactionId = m.interaction_id
WHERE 
ec.Phone_number = ?
AND ec.isDeleted != 1 
AND ec.SP_ID = ? 
GROUP BY 
ec.customerId;`

async function savelostChats(message, spPhone, spid, currentIndex, lastIndex) {
  try {
      if(!message.from.includes('@g.us')){
    let message_text = message?.text?.body   //firstMessage

    if (message_text) {
      message_text = message_text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
      message_text = message_text.replace(/_(.*?)_/g, '<em>$1</em>');
      message_text = message_text.replace(/~(.*?)~/g, '<del>$1</del>');
      message_text = message_text.replace(/\n/g, '<br>');
    }
    let ackStatus = message.ack;
    var from = (message.from).replace(/@c\.us$/, '')   //phoneNo
    let countryCodeObj;
    if (from) {
      countryCodeObj = mapCountryCode.mapCountryCode(from); //Country Code abstraction `countryCode` = '91', `country` = 'IN', `localNumber` = '8130818921'
    }
    let countryCode = countryCodeObj?.country + " +" + countryCodeObj?.countryCode;
    let phone_number_id = message?.id
    let display_phone_number = spPhone
    let message_direction = 'IN'
    let endCustomer = (message.from).replace(/@c\.us$/, '');  // for handle out messages of a chat
    if (from == spPhone) {
      message_direction = 'Out'
      endCustomer = spPhone
      display_phone_number = spPhone;
    }
    let getLastScannedTime = await db.excuteQuery(messageQuery, [endCustomer, spid]);

    var d = new Date(message.timestamp * 1000).toUTCString();

    const message_time = moment.utc(d).format('YYYY-MM-DD HH:mm:ss');

    let latestMessageTime = getLastScannedTime[0]?.latest_message_created_date;
    if (latestMessageTime) {
      latestMessageTime = getLastScannedTime[0]?.latest_message_created_date.toUTCString();
    }

    if ((d > latestMessageTime && d < new Date().toUTCString()) || (getLastScannedTime[0]?.latest_message_created_date == null)) {



      let message_media = "text"         
      let Type = message.type
      let contactName = message.from_name !== '' ? message.from_name : endCustomer; 

      if (message.hasMedia) {
        console.log("media", Type)
        const media = await message.downloadMedia();

        message_media = media?.data
      }





      if (from != 'status@broadcast' && from !== '0' && Type !== 'e2e_notification') {
        console.log("endCustomer", endCustomer, "Type", Type, "message_text", message_text, "****************", currentIndex, lastIndex, message.timestamp)

        let saveMessage = await saveIncommingMessages(message_direction, from, message_text, phone_number_id, display_phone_number, endCustomer, message_text, message_media, "Message_template_id", "Quick_reply_id", Type, "ExternalMessageId", contactName, ackStatus, message_time, countryCode);

        if (currentIndex == lastIndex) {
          console.log(message_text, "mett indec=======================", currentIndex, lastIndex)

          var SavedMessageDetails = await actionsOflatestLostMessage(message_text, phone_number_id, from, display_phone_number, saveMessage)
        }
      }
    }
    }
  } catch (err) {
    logger.error(`error in, savelostChats : ${from}, error: ${err}`);
    console.log(err);

  }
}


async function actionsOflatestLostMessage(message_text, phone_number_id, from, display_phone_number, saveMessage) {
  try {
    if (saveMessage?.length > 0) {

      const data = saveMessage;
      // Extracting the values
      const extractedData = {
        sid: data[0][0]['@sid'],
        custid: data[2][0]['@custid'],
        agid: data[1][0]['@agid'],
        newId: data[3][0]['@newId'],
        msg_id: data[5][0]['@msg_id'],
        ifgot: data[12][0]['@ifgot'],
        replystatus: data[4][0]['@replystatus']
      };


      var sid = extractedData.sid
      var custid = extractedData.custid
      var agid = extractedData.agid
      var newId = extractedData.newId
      var msg_id = extractedData.msg_id
      var ifgot = extractedData.ifgot
      var replystatus = extractedData.replystatus
      let latestSms = await db.excuteQuery('select * from Message where interaction_id=?  and is_deleted !=1 order by created_at desc', [newId])
      notify.NotifyServer(display_phone_number, false, newId, 'IN', 0, msg_id)
      let smartReplyActions = await incommingmsg.sReplyActionOnlostMessage(latestSms[0]?.message_text, sid, 'WA Web', phone_number_id, from, custid, agid, newId, display_phone_number);
      //console.log("smartReplyActions" ,smartReplyActions,custid,agid,latestSms)
      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      if (smartReplyActions >= -1) {
        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        if (ifgot == 'If not exist') {

          let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', ['Resolved', updated_at, newId]);
          if (updateInteraction?.affectedRows > 0) {
            console.log(newId, "ist time and triggere smart reply")
            notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Status changed')
            let updateMapping = await db.excuteQuery(`update InteractionMapping set AgentId='-1' where InteractionId =?`, [newId]);
            if (updateMapping?.affectedRows > 0) {
              notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Assign Agent')
            }
          }
        } else {

          //check if assignment trigger from smart reply and chat is ressolve then open 
          if (smartReplyActions >= 0) {
            let isEmptyInteraction = await commonFun.isStatusEmpty(newId, sid, custid)
            let ResolveOpenChat = await db.excuteQuery('UPDATE Interaction SET interaction_status =? WHERE InteractionId !=? and customerId=?', ['Resolved', newId, custid]);
            console.log("ResolveOpenChat -----", ResolveOpenChat)
            let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=? WHERE InteractionId=?', ['Open', newId])
            if (isEmptyInteraction == 1) {
              updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', ['Open', updated_at, newId])
            }
            if (updateInteraction?.affectedRows > 0) {
              console.log(newId, "assign conversation triggere smart reply")
              notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Status changed')
            }
            notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Assign Agent')
          }


        }
      } else if (replystatus != "Open") {
        // let getIntractionStatus = await db.excuteQuery('select * from Interaction WHERE InteractionId=? and SP_ID=?', [newId, sid]);

        let isEmptyInteraction = await commonFun.isStatusEmpty(newId, sid, custid)
        let ResolveOpenChat = await db.excuteQuery('UPDATE Interaction SET interaction_status =? WHERE InteractionId !=? and customerId=?', ['Resolved', newId, custid]);
        console.log("ResolveOpenChat -----", ResolveOpenChat)
        let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=? WHERE InteractionId=?', ['Open', newId])
        if (isEmptyInteraction == 1) {
          updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', ['Open', updated_at, newId])
        }

        if (updateInteraction?.affectedRows > 0) {
          console.log(newId, "------------in case of smart reply not trigger")
          notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Status changed')
        }

        let RoutingRulesVaues = await Routing.AssignToContactOwner(sid, newId, agid, custid)  //CALL Default Routing Rules
        if (RoutingRulesVaues == 'broadcast' || RoutingRulesVaues == true) {
          notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Assign Agent')

          let myUTCString = new Date().toUTCString();
          const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
          const currentAssignedUser = await currentlyAssigned(newId);
          const check = await commonFun.notifiactionsToBeSent(currentAssignedUser, 2);
          // if (check) {
          //   let notifyvalues = [[sid, 'New Chat Assigned to You', 'A new Chat has been Assigned to you', agid, 'Routing rules', currentAssignedUser, utcTimestamp]];
          //   let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
          // }
        }
      }
    }
  } catch (err) {
    logger.error(`error in, phone is already in use for spid: ${sid}, error: ${err}`);
    console.log("err actionsOflatestLostMessage", err)
  }
}

async function saveIncommingMessages(message_direction, from, firstMessage, phone_number_id, display_phone_number, phoneNo, message_text='', message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, contactName, ackStatus, timestramp, countryCode, repliedMessageTo,repliedMessage_id,repliedMessageText) {
  // console.log("saveIncommingMessages")

  if (Type == 'image') {
      console.log('lets check the image');
      message_media = message_media;
      var media_type = 'image/jpg';
  }
  if (Type == 'video') {
      console.log('lets check the video');
      message_media = message_media;
      var media_type = 'video/mp4';
  }
  if (Type == 'document') {
      console.log('lets check the document');
      message_media = message_media;
      var media_type = 'application/pdf';
  }

  let countryCodeObj;
  if (phoneNo) {
      countryCodeObj = mapCountryCode.mapCountryCode(phoneNo);
  }
  let EcPhonewithoutcountryCode = countryCodeObj?.localNumber;
  countryCode = countryCodeObj?.country + ' +' + countryCodeObj?.countryCode;

  if ((message_text.length > 0 || message_media.length > 0) && Type != 'e2e_notification') {
    let query = "CALL webhook_2(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    var saveMessage = await db.excuteQuery(query, [phoneNo, message_direction, message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, display_phone_number, contactName, media_type, ackStatus, 'WA Web', timestramp, countryCode, EcPhonewithoutcountryCode,repliedMessageTo, repliedMessageText, repliedMessage_id]);
    messageRecieved(saveMessage[0][0]['@sid'], phoneNo, message_direction, message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, display_phone_number, contactName, media_type, ackStatus, 'WA Web', timestramp, countryCode, EcPhonewithoutcountryCode,'','',0 );
    notify.NotifyServer(display_phone_number, true);
  }

  return saveMessage;
}


async function saveImageFromReceivedMessage(from, message, phone_number_id, display_phone_number, type) {
  // console.log("saveImageFromReceivedMessage")

  return new Promise(async (resolve, reject) => {
    try {
      //  console.log(from, phone_number_id, display_phone_number, type)


      let findSpid = 'select SP_ID from user where mobile_number=?'
      let sid = await db.excuteQuery(findSpid, [display_phone_number])
      let awsDetails = ""

      if (type == 'image') {
        awsDetails = await awsHelper.uploadStreamToAws(sid[0]?.SP_ID + "/teambox/" + phone_number_id + "/" + 'whatsAppWeb.jpeg', message)
        // console.log("awsDetails image");
        // console.log(awsDetails)
      }
      if (type == 'video') {
        awsDetails = await awsHelper.uploadVideoToAws(sid[0]?.SP_ID + "/teambox/" + phone_number_id + "/" + "whatsAppWeb.mp4", message, 'video/mp4')
        // console.log("awsDetails video");

        // console.log(awsDetails)
      }
      if (type == 'document') {
        awsDetails = await awsHelper.uploadVideoToAws(sid[0]?.SP_ID + "/teambox/" + phone_number_id + "/" + "whatsAppWeb.pdf", message, 'application/pdf')
        // console.log("awsDetails video");

        // console.log(awsDetails)
      }
      //TODO: Save the AWS url to DB in messages table using SP similar to webhook_2 SP. 

      notify.NotifyServer(display_phone_number, true);

      resolve({ value: awsDetails.value.Location });

      console.log("****image API****", awsDetails.value.Location)
    }
    catch (err) {
      logger.error(`Error saveImageFromReceivedMessage for from: ${from}, phone_number_id: ${phone_number_id}, error: ${err}`);
      console.log("______image api ERR_____" + err)
    }

  })
}


async function currentlyAssigned(interactionId) {
  const query = `SELECT user.uid 
                 FROM InteractionMapping 
                 JOIN user ON user.uid = InteractionMapping.AgentId 
                 WHERE is_active = 1 
                 AND InteractionMapping.InteractionId = ? 
                 ORDER BY InteractionMapping.MappingId DESC 
                 LIMIT 1`;

  try {
    let result = await db.excuteQuery(query, [interactionId]);
    return result.length > 0 ? result[0].uid : null;
  } catch (error) {
    logger.error(`Error Channel is disconnected for interactionId: ${interactionId}, error: ${error}`);
    console.error('Error executing query:', error);
    throw error;
  }
}



async function getDetatilsOfSavedMessage(saveMessage, message_text, phone_number_id, contactName, from, display_phone_number) {
  if (saveMessage?.length > 0) {

    const data = saveMessage;
    // Extracting the values
    const extractedData = {
      sid: data[0][0]['@sid'],
      custid: data[2][0]['@custid'],
      agid: data[1][0]['@agid'],
      newId: data[3][0]['@newId'],
      replystatus: data[4][0]['@replystatus'],
      msg_id: data[5][0]['@msg_id'],
      newlyInteractionId: data[7]?.[0]?.['@newlyInteractionId'],
      isContactPreviousDeleted: data[10][0]['@isContactPreviousDeleted'],
      ifgot: data[12][0]['@ifgot']
    };


    var sid = extractedData.sid
    var custid = extractedData.custid
    var agid = extractedData.agid
    var replystatus = extractedData.replystatus
    var newId = extractedData.newId
    var msg_id = extractedData.msg_id
    var newlyInteractionId = extractedData?.newlyInteractionId
    var isContactPreviousDeleted = extractedData.isContactPreviousDeleted
    var ifgot = extractedData.ifgot
    console.log("in messages", from, false, "interaction id", newId, display_phone_number)
    notify.NotifyServer(display_phone_number, false, newId, 'IN', 0, msg_id)

    let myUTCString = new Date().toUTCString();
    const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

     //need to check if this current interaction has first insertion only
     let checkIfFirstMessage = await db.excuteQuery(`
      SELECT COUNT(*) AS totalMessages
      FROM Message
      WHERE interaction_id IN (
          SELECT interactionId
          FROM Interaction
          WHERE customerId = (
              SELECT customerId
              FROM Interaction
              WHERE interactionId = ?
          )
      )
  `, [newId]);
    let messageCount = checkIfFirstMessage[0]?.totalMessages || 0;
    if (messageCount == 1 && newId) {
        let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=? WHERE InteractionId=?', ['Open', newId])
    }

    const currentAssignedUser = await currentlyAssigned(newId);
    const check = await commonFun.notifiactionsToBeSent(currentAssignedUser, 3);
    if (check) {
      let notifyvalues = [[sid, 'New Message in your Chat', 'You have a new message in you current Open Chat', agid, 'WA Web', currentAssignedUser, utcTimestamp]];
      let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
    }
    let contactDefaultPauseTime = await db.excuteQuery('select * from EndCustomer where customerId=? and SP_ID=?', [custid, sid])
    if (contactDefaultPauseTime[0]?.isBlocked != 1) {
      let defaultQuery = 'select * from defaultActions where spid=?';
      let defaultAction = await db.excuteQuery(defaultQuery, [sid]);
      //console.log(defaultAction)You have a new message in you current Open Chat
      if (defaultAction.length > 0) {
        //console.log(defaultAction[0].isAutoReply + " isAutoReply " + defaultAction[0].autoReplyTime + " autoReplyTime " + defaultAction[0].isAutoReplyDisable + " isAutoReplyDisable ")
        var isAutoReply = defaultAction[0].isAutoReply
        var autoReplyTime = contactDefaultPauseTime[0].defaultAction_PauseTime
        var isAutoReplyDisable = defaultAction[0].isAutoReplyDisable
        var pausedTill = defaultAction[0]?.pausedTill
        var inactiveAgent = defaultAction[0].isAgentActive
        var inactiveTimeOut = defaultAction[0].pauseAgentActiveTime
      }
      let defaultReplyAction = await incommingmsg.autoReplyDefaultAction(isAutoReply, autoReplyTime, isAutoReplyDisable, message_text, phone_number_id, contactName, from, sid, custid, agid, replystatus, newId, msg_id, newlyInteractionId, 'WA Web', isContactPreviousDeleted, inactiveAgent, inactiveTimeOut, ifgot, display_phone_number)


      console.log("defaultReplyAction-->>> boolean", defaultReplyAction)
      if (defaultReplyAction >= -1) {
        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        if (ifgot == 'If not exist') {

          let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', ['Resolved', updated_at, newId]);
          if (updateInteraction?.affectedRows > 0) {
            notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Status changed')
            let updateMapping = await db.excuteQuery(`update InteractionMapping set AgentId='-1' where InteractionId =?`, [newId]);
            if (updateMapping?.affectedRows > 0) {
              notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Assign Agent')
            }
          }
        } else {
          let getIntractionStatus = await db.excuteQuery('select * from Interaction WHERE InteractionId=? and SP_ID=?', [newId, sid]);
          //check if assignment trigger and chat is ressolve then open 
          if (defaultReplyAction >= 0) {
            let isEmptyInteraction = await commonFun.isStatusEmpty(newId, sid, custid)
            let ResolveOpenChat = await db.excuteQuery('UPDATE Interaction SET interaction_status =? WHERE InteractionId !=? and customerId=?', ['Resolved', newId, custid]);
            console.log("ResolveOpenChat (((((((((((", ResolveOpenChat)
            let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=? WHERE InteractionId=?', ['Open', newId])
            if (isEmptyInteraction == 1) {
              updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', ['Open', updated_at, newId])
            }

            if (updateInteraction?.affectedRows > 0) {
              notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Status changed')
            }
            notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Assign Agent')
          } else {
            let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', [getIntractionStatus[0]?.interaction_status, updated_at, newId])
            if (updateInteraction?.affectedRows > 0) {
              notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Status changed')
            }
          }


        }
      }
      if (defaultReplyAction == 'false' && replystatus != "Open") {
        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let isEmptyInteraction = await commonFun.isStatusEmpty(newId, sid, custid)
        let ResolveOpenChat = await db.excuteQuery('UPDATE Interaction SET interaction_status =? WHERE InteractionId !=? and customerId=?', ['Resolved', newId, custid]);
        console.log("ResolveOpenChat *********************", ResolveOpenChat)
        let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=? WHERE InteractionId=?', ['Open', newId])
        if (isEmptyInteraction == 1) {
          updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', ['Open', updated_at, newId])
        }
        if (updateInteraction?.affectedRows > 0) {
          logger.info(`Status changed notify gone *********************`)
          notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Status changed')
        }
        let RoutingRulesVaues = await Routing.AssignToContactOwner(sid, newId, agid, custid)  //CALL Default Routing Rules
        logger.info(`RoutingRulesVaues ________________ ${RoutingRulesVaues}`)
        if (RoutingRulesVaues == 'broadcast' || RoutingRulesVaues == true) {
          notify.NotifyServer(display_phone_number, false, newId, 0, 'IN', 'Assign Agent')

          let myUTCString = new Date().toUTCString();
          const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
          const currentAssignedUser = await currentlyAssigned(newId);
          const check = await commonFun.notifiactionsToBeSent(currentAssignedUser, 2);
          // if (check) {
          //   let notifyvalues = [[sid, 'New Chat Assigned to You', 'A new Chat has been Assigned to you', agid, 'Routing rules', currentAssignedUser, utcTimestamp]];
          //   let mentionRes = await db.excuteQuery(`INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`, [notifyvalues]);
          // }
        }
        //Here i have to check if any routing rules addded then send websocket
      }
    }
  }
}



async function sendMessageViaWhapi(spid, phoneNo, type, message_body, media, interaction_id, msg_id, spNumber) {
    try {
        let r1 = await CreateChannelResponse.getBySpid(spid);
        //r1.token = "I3yX5PYIVRJsLsdMlojaN4VxufeGJb5N"
        if (!r1 || !r1.token) {
            throw new Error("Invalid SPID or token not found.");
        }
        media = media == 'text' ? '' : media;
        const phoneNumber = removePlusFromPhoneNumber(phoneNo);
        const apiUrl = getWhapiEndpoint(type); 

        const dataToSend = new WhapiMessageRequest({
            to: phoneNumber,
            body: message_body,
            media,
        });

    const response = await whapiService.SendMessage(
            apiUrl,
            r1.token,
            dataToSend
        );

        return WhapiMessageResponse.successResponse(response);
    } catch (error) {
        console.error('Error sending message via Whapi:', error.message);
        throw error.message;
    }
}

async function sendTemplateViaWhapi(spid, to, headerText, bodyText, interactiveButtons){
  let r1 = await CreateChannelResponse.getBySpid(spid);

  if (!r1 || !r1.token) {
      throw new Error("Invalid SPID or token not found.");
  }

  
  const template = new WhapiInteractiveButtons(to, interactiveButtons, bodyText);
  const payload = template.buildPayload();
  let response = await whapiService.interactiveButtons(payload, r1.token);
  if(response){
    return {
      status : 200,
      msgId : response?.message?.id || '',

    }
  }else{
    return {
      status : 400
    }
  }
}

function removePlusFromPhoneNumber(phoneNumber) {
    if (typeof phoneNumber !== "string") {
        return phoneNumber;
    }
    if (phoneNumber.includes("+")) {
        return phoneNumber.replace(/\+/g, "");
    }
    return phoneNumber;
}
/**
 * Determines the correct Whapi API endpoint based on message type.
 */
function getWhapiEndpoint(type) {
    const baseURL = 'https://gate.whapi.cloud/messages';
    switch (type) {
        case 'text': return `${baseURL}/text`;
        case 'image': return `${baseURL}/image`;
        case 'video': return `${baseURL}/video`;
        case 'document': return `${baseURL}/document`;
        default: throw new Error('Invalid message type');
    }
}


module.exports = { createClientInstance, isActiveSpidClient, sendFunnel, whatsappWebStatus,sendMessageViaWhapi, Message, messageAck, handleDisconnection, handleAuthentication, handleWhatsAppReady, sendTemplateViaWhapi }