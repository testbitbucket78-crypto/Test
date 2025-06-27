const express = require('express');
const { request } = require('http');
const app = express();
const { Client, LocalAuth, MessageMedia, Location, Buttons } = require('whatsapp-web.js');
const puppeteer = require('puppeteer')
// const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const val = require('../settings/constant.js')
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
const incommingmsg = require('../IncommingMessages')
const notify = require('../whatsApp/PushNotifications')
const mapCountryCode = require('../Contact/utils.js');
const logger = require('../common/logger.log');
const commonFun = require('../common/resuableFunctions.js')
const { exec } = require('child_process');
const fs = require('fs')
const path = require("path");
const { EmailConfigurations } =  require('../Authentication/constant');
const { MessagingName, channelName }= require('../enum');

const { sendEmail } = require('../Services/EmailService');
let clientSpidMapping = {};
let clientPidMapping = {};
let clientSpidInprogress = {};
let isQRstack;
let undefinedCount = 0;
let updateUserQuery = `update user set mobile_number=? , isAutoScanOnce =? where SP_ID=? and ParentId is null and isDeleted !=1 and IsActive !=2`
let notifyInteraction = `SELECT InteractionId FROM Interaction WHERE customerId IN (SELECT customerId FROM EndCustomer WHERE Phone_number = ? and SP_ID=? ) and is_deleted !=1   order by created_at desc`
let isSessionAlreadyExistMap = {};
const { messageRecieved, messageStatus, conversationStatus } = require('../common/webhookEvents.js');
const { ConversationStatusMap } = require('../enum')

async function createClientInstance(spid, phoneNo) {
  const sessionId = spid;
  const baseDir = path.resolve(__dirname, ".wwebjs_auth");
  const sessionPath = path.join(baseDir, `session-${sessionId}`);
  
  isSessionAlreadyExistMap[spid] = fs.existsSync(sessionPath);

  if (isSessionAlreadyExistMap[spid]) {
    console.log(`Session session-${sessionId} already exists.`);
  } else {
    console.log(`Session not already made for session-${sessionId}.`);
  }

  logger.info(`Creating client instance for spid: ${spid}, phoneNo: ${phoneNo}`);
  console.log(spid, phoneNo, new Date().toUTCString());
  console.log(clientPidMapping.hasOwnProperty(spid))

  let isConnected = await isActiveSpidClient(spid);
  if (isConnected.isActiveSpidClient) {

    console.log("Client found in memory map and is ready");
    return { status: 201, value: 'Client is ready!' };
  }
  // if (isInProgressSpidQR(spid)) {
  //   try{
  //   console.log("Client qr generation inprogress");
  //   var inPclient = clientSpidInprogress[spid];

  //   inPclient.destroy();

  //   if (clientSpidInprogress.hasOwnProperty(spid)) {
  //     console.log("clear mapping __________")
  //     delete clientSpidInprogress[spid];
  //   }
  // }catch(err){
  //   console.log("ERR isInProgressSpidQR");
  //   console.log(err)
  // }
  // }

  // delete chrome process
  if (clientPidMapping.hasOwnProperty(spid)) {
    try {
      // kill the cycle with pid and sign = 'SIGINT' 
      // process.kill(clientPidMapping[spid], 'SIGINT');
      logger.info(`Process killed for spid: ${spid}, phoneNo: ${phoneNo}`);
      process.kill(clientPidMapping[spid])
      console.log("process killed", new Date().toUTCString())
      delete clientPidMapping[spid];
    } catch (err) {
      logger.error(`Delete clientPidMapping issues in wrong scan for spid: ${spid}, phoneNo: ${phoneNo}`);
      console.log("Delete clientPidMapping issues in wrong scan", err)
    }
  }

  var authStr = new LocalAuth({
    clientId: spid
  });

  console.log("client created call after verify", new Date().toUTCString())
  logger.info(`Client created call after verify for spid: ${spid}, phoneNo: ${phoneNo}`);
  return await ClientInstance(spid, authStr, phoneNo);
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

async function isPhoneAlreadyInUsed(mobile_number, spid) {
  try {
    logger.info(`Checking isPhoneAlreadyInUsed for spid: ${spid}, and mobile_number: ${mobile_number}`);
    let isExist = await db.excuteQuery('select * from user where mobile_number=? and isAutoScanOnce =? and ParentId is null and  isDeleted !=1 and IsActive !=2', [mobile_number, 1]);
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


function ClientInstance(spid, authStr, phoneNo) {
  return new Promise(async (resolve, reject) => {
    try {
      if(clientSpidMapping.hasOwnProperty(spid)){
        delete clientSpidMapping[spid];
        process.kill(clientPidMapping[spid]);
        delete clientPidMapping[spid];

        // delete session of the spid 

        let dir = path.join(__dirname, '.wwebjs_auth');
        let sessionDir = path.join(dir, `session-${spid}`);

        if (fs.existsSync(sessionDir)) {
          console.log(`disconnected  Deleting directory: ${sessionDir}`);

          // First, attempt to kill related processes (e.g., Chrome) that may be locking files
          killChromeProcesses(spid, () => {
            setTimeout(() => {
              try {
                // Use fs-extra's removeSync for better handling of recursive deletes
                fs.rmdirSync(sessionDir, { recursive: true });
                console.log(`Successfully deleted directory on disconnected: ${sessionDir}`);
              } catch (err) {
                console.error(`Error deleting directory on disconnected ${sessionDir}:`, err);
              }
            }, 2000); // Adjust the delay as necessary
          });

        } else {
          console.log(`disconnected Directory not found: ${sessionDir}`);
        }
      }
      const client = new Client({
        puppeteer: {
          headless: true,
          executablePath: "/usr/bin/google-chrome-stable",
          // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
          // executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",

          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage', // <-- add this one
          ],

          takeoverOnConflict: true,
          takeoverTimeoutMs: 10,
        },
        authStrategy: authStr,
        webVersionCache: {
          type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2410.1.html',
        }
      });
      console.log("client created", new Date().toUTCString());
      logger.info(`Creating ClientInstance for spid: ${spid}, phoneNo: ${phoneNo}`);
      // Handle client creation errors
      client.on('error', (error) => {
        logger.error(`error Creating Client for spid: ${spid}, error: ${error}`);
        console.error('Client error:', error);
        notify.NotifyServer(phoneNo, false, 'Client creation failed')
        reject({ status: 500, value: 'Client creation failed' });
      });

      client.on('auth_failure', () => {
        logger.error(`error Client is auth_failure! for spid: ${spid}`);
        console.log('Client is auth_failure!');
      });

      client.on("loading_screen", (percent, message) => {
        console.log("loading_screen", percent, message)
      })
      let inc = 0;
      client.on("qr", async (qr) => {
        try {
          // Generate and scan this code with your phone
          //clientSpidInprogress[[spid]] = client;
          logger.info(`Generate QR Code for SPID: ${spid}, and phoneNo: ${phoneNo}`);
          console.log("QR CODE top", new Date().toUTCString())
          console.log("QR RECEIVED", qr);
          inc++;
          console.log("inc: " + inc);
           var isChannelExist = await db.excuteQuery('SELECT * FROM user WHERE mobile_number=? and isDeleted !=1 and ParentId IS NULL and SP_ID != ?', [phoneNo, spid])
           if(isChannelExist.length > 0){
            notify.NotifyServer(phoneNo, false, 'This number is already used as an SP number. Please use a different one.')
            resolve({ status: 400, value: 'QR cannot be generated because the same SP is already in use.' });
           }
          if (qr.startsWith(undefined)) {
            undefinedCount = undefinedCount + 1;
          }
          if (inc > 5) {
            console.log("Destroying client..." + client.authStrategy.userDataDir);
            client.destroy();
            notify.NotifyServer(phoneNo, false, 'QR generation timed out. Plese re-open account settings and generate QR code')
            resolve({ status: 400, value: 'QR is expired' });
          }
          if (!qr.startsWith(undefined)) {
            console.log("Above notify of QR", new Date().toUTCString())
            notify.NotifyServer(phoneNo, false, qr)
            console.log("Below notifyof QR", new Date().toUTCString())
          } else {
            qr = qr.replace('undefined,', '');
            notify.NotifyServer(phoneNo, false, qr)
            console.log("Else undefined QR", new Date().toUTCString())
          }
          resolve({ status: 200, value: qr });
        } catch (err) {
          logger.error(`error while generating QR Code for spid: ${spid}, error: ${err}`);
          console.log("err QR ............");
          console.log(err)
        }
      });
      client.on('ready', async () => {

        try {
          logger.info(`Client on Ready for SPID: ${spid}`);
          console.log("Above client ready", new Date().toUTCString())
          let isPhoneAlreadyUsed = await isPhoneAlreadyInUsed(client.info.wid.user, spid)
          if (!isPhoneAlreadyUsed) {
            let wrongNumber = await isWrongNumberScanned(spid, client.info.wid.user)

            var isChannelExist = await db.excuteQuery('SELECT * FROM user WHERE mobile_number=? and isDeleted !=1 and ParentId IS NULL and SP_ID != ?', [client.info.wid.user, spid])
            if(isChannelExist.length > 0){
             notify.NotifyServer(client.info.wid.user, false, 'This number is already used as an SP number. Please use a different one.')
             resolve({ status: 400, value: 'QR cannot be generated because the same SP is already in use.' });
            }

            if (wrongNumber) {       //phoneNo != client.info.wid.user
              console.log("wrong Number Scanned")
              notify.NotifyServer(phoneNo, false, 'Wrong Number')
              client.destroy();
              await destroyWrongScan(spid)
              return resolve({ status: 404, value: 'Wrong Number ,Please use logged in User Phone Number !' });


            } else {
              console.log('Client is ready!');
              notify.NotifyServer(phoneNo, false, 'Client is ready!')
              let updateScannedNumber = await db.excuteQuery(updateUserQuery, [client.info.wid.user, 1, spid])
              console.log(client.info.wid.user, 1, spid, 'updateScannedNumber', updateScannedNumber);
              let allChats = await client.getChats();
              let chat_activos = allChats.splice(0, 10);
              logger.info(`Client is Ready and SaveLostChats will be triggered for SPID: ${spid}, and phoneNo: ${phoneNo}`);
              for (const chat of chat_activos) {
                if (!chat.isGroup) {
                  let mensajes_verificar = await chat.fetchMessages({ limit: 30 });
                  // Sort messages by timestamp
                  mensajes_verificar.sort((a, b) => a.timestamp - b.timestamp);

                  let lastIndex = mensajes_verificar.length - 1;


                  for (let currentIndex = 0; currentIndex <= lastIndex; currentIndex++) {
                    let n_chat_mensaje = mensajes_verificar[currentIndex];

                    if (isSessionAlreadyExistMap[spid]) {
                      console.log(`isSessionAlreadyExist-${isSessionAlreadyExistMap[spid]}.`);
                      let getmessages = savelostChats(n_chat_mensaje, phoneNo, spid, currentIndex, lastIndex);
                    }
                  // let getmessages = savelostChats(n_chat_mensaje, phoneNo, spid, currentIndex, lastIndex);

                  }



                  // apply rauting rules and sreply 
                }
              }
              console.log("resolve client ready", new Date().toUTCString())
              return resolve({ status: 201, value: 'Client is ready!' });
            }
          } else {
            console.log("Already used by another SPID")
            notify.NotifyServer(phoneNo, false, 'This Phone is already used in EngageKart !');
            client.destroy();
            await destroyWrongScan(spid)
            return resolve({ status: 410, value: 'This Phone is already used in EngageKart !' });
          }
        } catch (readyerr) {
          logger.error(`client ready err for SPID: ${spid}, error: ${readyerr}`);
          console.log("client ready err", readyerr)
        }
        // }
      });

      client.on('message', async message => {
        try {
          console.log("client message event -----------------------------------")
          const contact = await message.getContact();
          logger.info(`New Message Incomming for SPID: ${spid}`);
          if(!message.from.includes('@g.us')){
           
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
              let d = new Date(message.timestamp * 1000).toUTCString();

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
      });
      client.on('authenticated', async (session) => {
        try {
          logger.info(`client authenticated for spid: ${spid}`);
          console.log("client authenticated", new Date().toUTCString());
          clientSpidMapping[[spid]] = client;

          try {
            clientPidMapping[[spid]] = client.pupBrowser.process().pid;
            console.log("clientPidMapping[spid]", clientPidMapping[spid]);
          } catch (err) {
            logger.error(`Set clientPidMapping issues in Authentication for SPID: ${spid}, error: ${err}`);
            console.log("Set clientPidMapping issues in Authentication", err);
          }

          notify.NotifyServer(phoneNo, false, 'Client Authenticated');

          // Set an interval to click #pane-side every 30 minutes
          setInterval(async () => {
            try {
              await client.pupPage.click("#pane-side");
              console.log("Clicked #pane-side at", new Date().toUTCString());
            } catch (intervalError) {
              console.log("Error clicking #pane-side:", intervalError);
            }
          }, 30 * 60 * 1000); // 30 minutes in milliseconds

        } catch (authenticatederr) {
          logger.error(`error authenticated client for spid: ${spid}, error: ${authenticatederr}`);
          console.log(authenticatederr);
        }
      });
      client.on('disconnected', (reason) => {
        setTimeout(async () => {
          try {
            logger.info(`channel initiated for disconnection for spid: ${spid}, and phone number: ${phoneNo}`);
            sendMailOnDisconnection(phoneNo, spid);
            console.log("disconnected", new Date().toUTCString());

            if (clientSpidMapping.hasOwnProperty(spid)) {
              try {
                delete clientSpidMapping[spid];

                let myUTCString = new Date().toUTCString();
                const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
                let updateConnection = await db.excuteQuery('update WhatsAppWeb set updated_at = ? where connected_id =? and spid=? and is_deleted !=1', [updated_at, phoneNo, spid])
                // kill the cycle with pid and sign = 'SIGINT' 
                console.log("Kill[spid]", clientPidMapping[spid])
                process.kill(clientPidMapping[spid]);
                delete clientPidMapping[spid];

                // delete session of the spid 

                let dir = path.join(__dirname, '.wwebjs_auth');
                let sessionDir = path.join(dir, `session-${spid}`);

                if (fs.existsSync(sessionDir)) {
                  console.log(`disconnected  Deleting directory: ${sessionDir}`);

                  // First, attempt to kill related processes (e.g., Chrome) that may be locking files
                  killChromeProcesses(spid, () => {
                    setTimeout(() => {
                      try {
                        // Use fs-extra's removeSync for better handling of recursive deletes
                        fs.rmdirSync(sessionDir, { recursive: true });
                        console.log(`Successfully deleted directory on disconnected: ${sessionDir}`);
                      } catch (err) {
                        console.error(`Error deleting directory on disconnected ${sessionDir}:`, err);
                      }
                    }, 2000); // Adjust the delay as necessary
                  });

                } else {
                  console.log(`disconnected Directory not found: ${sessionDir}`);
                }

                //______________________________________//
                let updateWebdetails = await db.excuteQuery('update WhatsAppWeb set channel_status=0 where connected_id =? and spid=?', [phoneNo, spid]);
              } catch (err) {
                logger.error(`Error while Sending mail on disconnection for spid:: ${spid}, mobile_number: ${phoneNo}, error: ${err}`);
                console.log("Delete clientPidMapping issues in disconnected", err)
              }
              console.log(`Removed ${spid} from clientSpidMapping.`);

            }
            notify.NotifyServer(phoneNo, false, 'Client is disconnected!')

          } catch (error) {
            logger.error(`Error while Sending mail on disconnection for spid:: ${spid}, mobile_number: ${phoneNo}, error: ${error}`);
            console.log("disconnect error")

          }
        }, 3000);

      })
      client.on('message_ack', async (message, ack) => {

        try {
          let phoneNumber = (message.to).replace(/@c\.us$/, "");
          messageStatus(message, ack, spid);
          if (ack == '1') {
            let d = new Date(message.timestamp * 1000).toUTCString();
            
            const message_time = moment.utc(d).format('YYYY-MM-DD HH:mm:ss');
            logger.info(`send message ${d} ,${message_time}`)
            let campaignDeliveredQuery = 'UPDATE CampaignMessages set status=1 , SentTime=? where phone_number =?  and messageTemptateId =?'
            let campaignDelivered = await db.excuteQuery(campaignDeliveredQuery, [message_time, phoneNumber, message._data.id.id])
            if (message._data.id.id) {
              let updateMessageTime = await db.excuteQuery('UPDATE Message set created_at=? where Message_template_id=?', [message_time, message._data.id.id])
            }

            const smsdelupdate = `UPDATE Message
SET msg_status = 1 
WHERE interaction_id IN (
SELECT InteractionId FROM Interaction 
WHERE customerId IN (SELECT customerId FROM EndCustomer WHERE Phone_number = ? and SP_ID=? and isDeleted !=1 AND isBlocked !=1 )) and is_deleted !=1  AND (msg_status IS NULL); `

            let ack1InId = await db.excuteQuery(notifyInteraction, [phoneNumber, spid])
            // console.log(smsdelupdate)
            let sended = await db.excuteQuery(smsdelupdate, [phoneNumber, spid])
            //  console.log("send", sended?.affectedRows)
            logger.info(`send ============== ${sended?.affectedRows}`)
            notify.NotifyServer(phoneNo, false, ack1InId[0]?.InteractionId, 'Out', 1, 0, message?.id?.id ? message?.id?.id : 0)


          } else if (ack == '2') {
            let d = new Date(message.timestamp * 1000).toUTCString();

            const message_time = moment.utc(d).format('YYYY-MM-DD HH:mm:ss');
            let myUTCString = new Date().toUTCString();
            const LastModifiedDate = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');  // update with utc time because message json gives same time for each ack
            logger.info(`delivered message  ${d} ,${message_time} ,${LastModifiedDate}`)
            let campaignDeliveredQuery = 'UPDATE CampaignMessages set status=2, DeliveredTime=? where phone_number =? and messageTemptateId=?'
            let campaignDelivered = await db.excuteQuery(campaignDeliveredQuery, [LastModifiedDate, phoneNumber, message?._data?.id?.id])
            const smsdelupdate = `UPDATE Message
SET msg_status = 2 
WHERE interaction_id IN (
SELECT InteractionId FROM Interaction 
WHERE customerId IN (SELECT customerId FROM EndCustomer WHERE Phone_number = ? and SP_ID=? and isDeleted !=1 AND isBlocked !=1 )) and is_deleted !=1 AND (msg_status IS NULL OR msg_status = 1); `
            //console.log(smsdelupdate)
            let deded = await db.excuteQuery(smsdelupdate, [phoneNumber, spid])
            //  console.log("deliver", deded?.affectedRows)
            // notify.NotifyServer(phoneNo, true)
            logger.info(`deliver ============== ${deded?.affectedRows}`)
            let ack2InId = await db.excuteQuery(notifyInteraction, [phoneNumber, spid])
            notify.NotifyServer(phoneNo, false, ack2InId[0]?.InteractionId, 'Out', 2, 0, message?.id?.id ? message?.id?.id : 0)
          } else if (ack == '3') {
            //  console.log("read")
            let d = new Date(message.timestamp * 1000).toUTCString();

            const message_time = moment.utc(d).format('YYYY-MM-DD HH:mm:ss');
            let myUTCString = new Date().toUTCString();
            const LastModifiedDate = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
            logger.info(`read message ${d} ,${message_time} ,${LastModifiedDate}`)
            let campaignReadQuery = 'UPDATE CampaignMessages set status=3 , SeenTime=? where phone_number =? and messageTemptateId=?';
            let campaignRead = await db.excuteQuery(campaignReadQuery, [LastModifiedDate, phoneNumber, message?._data?.id?.id])
            const smsupdate = `UPDATE Message
SET msg_status = 3 
WHERE interaction_id IN (
SELECT InteractionId FROM Interaction 
WHERE customerId IN (SELECT customerId FROM EndCustomer WHERE Phone_number =? and SP_ID=? and isDeleted !=1 AND isBlocked !=1)) and is_deleted !=1  AND (msg_status =2 OR msg_status = 1);`
            //  console.log(smsupdate)
            let resd = await db.excuteQuery(smsupdate, [phoneNumber, spid])
            //   console.log("read", resd?.affectedRows)
            // notify.NotifyServer(phoneNo, true)
            logger.info(`Read ============== ${resd?.affectedRows}`)
            let ack3InId = await db.excuteQuery(notifyInteraction, [phoneNumber, spid])
            notify.NotifyServer(phoneNo, false, ack3InId[0]?.InteractionId, 'Out', 3, 0, message?.id?.id ? message?.id?.id : 0)
          }


        } catch (message_ackErr) {
          logger.error(`error message_ack for SPID: ${spid}, error: ${message_ackErr}`);
          console.log(message_ackErr)
        }
      });

      const timeOut = setTimeout(() => {
        //  client.initialize().catch(_ => _);
        client.initialize().catch((error) => {
          logger.error(`Web Js Client Initialization error caught --- ${error}`);
          console.log("intilize_________________")
          console.error(error);
        });
      }, 5000)

    } catch (err) {
      console.log("createClientInstance err");
      console.log(err);
      return ({ status: 500, value: err });
    }
  })
}

// let transporter = nodemailer.createTransport({
//   // service: 'SMTP',
//   host: val.emailHost,
//   port: val.port,
//   secure: true,
//   auth: {
//     user: val.email,
//     pass: val.appPassword
//   },
//   port: val.port,
//   host: val.emailHost
// });
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

function getCircularReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };
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
  if (clientSpidMapping[spid]) {
    console.log("if client ready")
    let WAwebdetails = await db.excuteQuery('select channel_id,connected_id,channel_status from  WhatsAppWeb where spid=? and is_deleted !=1', [spid]);
    return { "isActiveSpidClient": true, "WAweb": WAwebdetails };
  } else {
    let disconnectWAweb = await db.excuteQuery('update WhatsAppWeb set channel_status=0 where spid=? and channel_id =? ', [spid, 'WA Web']);
    let WAwebdetails = await db.excuteQuery('select channel_id,connected_id,channel_status from  WhatsAppWeb where spid=? and is_deleted !=1', [spid]);
    return { "isActiveSpidClient": false, "WAweb": WAwebdetails };
  }
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

function isInProgressSpidQR(spid) {

  if (clientSpidInprogress[spid]) {
    return true;
  } else {
    return false;
  }
}

async function saveSendedMessageStatus(messageStatus, timestamp, to, id) {
  console.log(timestamp, to, id)
  const phoneNumber = to.replace(/@c\.us$/, "");
  console.log("phoneNumber", phoneNumber)
  // Create a new Date object and multiply the Unix timestamp by 1000 to convert it to milliseconds
  const dateObject = new Date(timestamp * 1000);

  // Format the date as 'YYYY-MM-DD HH:mm:ss'
  const formattedDate = `${dateObject.getFullYear()}-${String(dateObject.getMonth() + 1).padStart(2, '0')}-${String(dateObject.getDate()).padStart(2, '0')} ${String(dateObject.getHours()).padStart(2, '0')}:${String(dateObject.getMinutes()).padStart(2, '0')}:${String(dateObject.getSeconds()).padStart(2, '0')}`;

  console.log(formattedDate);

  let msgIdQuery = `SELECT m.Message_id
  FROM Message m
  LEFT JOIN Interaction i ON m.interaction_id = i.InteractionId
  WHERE m.updated_at = ?`
  //AND i.customerId = (SELECT customerId FROM EndCustomer WHERE Phone_number = ? and isDeleted !=1)`;

  let getMessageId = await db.excuteQuery(msgIdQuery, [formattedDate]);
  console.log("saveSendedMessageStatus", getMessageId)
  if (getMessageId.length > 0) {
    var message_id = getMessageId[0].Message_id;
  }
  console.log(message_id)
  let saveStatus = await db.excuteQuery(`UPDATE Message set msg_status=? ,ExternalMessageId=? where Message_id=?`, [messageStatus, id, message_id])
}

async function sendMessages(spid, endCust, type, text, link, interaction_id, msg_id, spNumber) {
  try {
    logger.info(`Sending Messages for spid: ${spid}, and spNumber: ${spNumber}`);
    let client = clientSpidMapping[[spid]];
    if (client) {
      let contactId = `${endCust}@c.us`
      try {
        let isRegistered = await client.isRegisteredUser(contactId);
        if (type != 'unknown') {
          if (isRegistered) {
            let msg = await sendDifferentMessagesTypes(client, endCust, type, text, link, interaction_id, msg_id, spNumber);
            if (msg?.status == 500) {                               // Just try 2nd time in case of fail 
              msg = await sendDifferentMessagesTypes(client, endCust, type, text, link, interaction_id, msg_id, spNumber);
            }
            return msg;
          }
          return { status: 404, msgId: 'Phone no is not registered on whatsApp' }
        } else {
          return { status: 204, msgId: 'Content not found for this type' }
        }

      } catch (error) {
        logger.error(`Error checking registration for SPID: ${spid}, spNumber: ${spNumber}, error: ${error}`);
        return { status: 401, msgId: 'Error checking registration' }
      }

    } else {
      console.log("else");
      //logger.error(`Error Channel is disconnected for SPID: ${spid}, spNumber: ${spNumber}`);
      return { status: 400, msgId: 'Channel is disconnected' }
    }
  } catch (err) {
    console.log(err);
    logger.error(`Error Channel is disconnected for SPID: ${spid}, spNumber: ${spNumber}, error ${err}`);
    return { status: 500, msgId: 'Channel is disconnected' }
  }
}

async function sendDifferentMessagesTypes(client, endCust, type, text, link, interaction_id, msg_id, spNumber) {
  try {

    //  console.log("messagesTypes", interaction_id, msg_id)
    if (client.info) {
      // console.log("client info avilable")
    } else {
      console.log("not avilable")
    }
    if (type === 'text') {

      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      let sendId = await client.sendMessage(endCust + '@c.us', text);
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id])
      return { status: 200, msgId: sendId?._data?.id?.id }
      // notify.NotifyServer(spNumber, false, interaction_id)
    }
    if (type === 'image' || type === 'image/jpeg') {
      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      const media = await MessageMedia.fromUrl(link);
      let sendId = await client.sendMessage(endCust + '@c.us', media, { caption: text });
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id])
      return { status: 200, msgId: sendId?._data?.id?.id }
    }
    if (type === 'video' || type === 'video/mp4') {
      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      const media = await MessageMedia.fromUrl(link);
      // console.log(media.mimetype)
      let sendId = await client.sendMessage(endCust + '@c.us', media, { caption: text });
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id])
      return { status: 200, msgId: sendId?._data?.id?.id }

    }
    if (type === 'attachment' || type === 'document' || type === 'application/pdf') {
      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      const media = await MessageMedia.fromUrl(link)//MessageMedia('pdf', link);
      let sendId = await client.sendMessage(endCust + '@c.us', media, { caption: text });
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id])
      return { status: 200, msgId: sendId?._data?.id?.id }

    } if (type === 'location') {
      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      const location = new Location(37.422, -122.084, 'Sampana Digital Private limited');
      let sendId = await client.sendMessage(endCust + '@c.us', location);
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id])
      return { status: 200, msgId: sendId?._data?.id?.id }
    }
    if (type === 'vcard') {
      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      let firstName = 'CIP'
      let lastName = 'TEAM'
      let phoneNumber = '917017683064'
      let sendId = await client.sendMessage(endCust + '@c.us',
        'BEGIN:VCARD\n' +
        'VERSION:3.0\n' +
        'N:' + firstName + ';' + lastName + ';;;\n' +
        'FN:' + firstName + lastName + '\n' +
        'TEL;type=Mobile;waid=' + phoneNumber + ':+' + phoneNumber + '\n' +
        'END:VCARD', {
        parseVCards: false
      }


      );
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id])
      return { status: 200, msgId: sendId?._data?.id?.id }
    }
    // New block: Sending button messages
    if (type === 'buttons') {
      const buttons = [
        { buttonId: 'btn1', buttonText: { displayText: 'Visit Website' }, type: 1 },
        { buttonId: 'btn2', buttonText: { displayText: 'Call Now' }, type: 1 }
      ];

      let button = new Buttons(
        "Button body",
        [{ body: "bt1" }, { body: "bt2" }, { body: "bt3" }],
        "title",
        "footer"
      );
      //console.log("butttospf",buttonMessage)
      let myUTCString = new Date().toUTCString();
      const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
      let sendId = await client.sendMessage(endCust + '@c.us', button);
      //console.log(endCust,"sendId",sendId)
      let updateMessageTime = await db.excuteQuery(`UPDATE Message set updated_at=? , Message_template_id =? where Message_id=?`, [updated_at, sendId?._data?.id?.id, msg_id]);
      return { status: 200, msgId: sendId?._data?.id?.id };
    }
  } catch (err) {
    console.log("++++++++++++++++++++++++++++++++++++++++++++")
    logger.error(`Error sendDifferentMessagesTypes msg_id: ${msg_id}, spNumber: ${spNumber}, error: ${err}`);
    console.log(err)
    return { status: 500, msgId: "error on send message" }
  }
}

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




async function saveInMessages(message) {
  try {
    let message_text = message.body   //firstMessage
    if (message_text) {
      message_text = message_text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
      message_text = message_text.replace(/_(.*?)_/g, '<em>$1</em>');
      message_text = message_text.replace(/~(.*?)~/g, '<del>$1</del>');
      message_text = message_text.replace(/\n/g, '<br>');
    }
    let message_direction = 'IN'
    var from = (message.from).replace(/@c\.us$/, '')   //phoneNo
    logger.info(`Saving Message Incomming spid: ${from}`);
    let phone_number_id = message.id.id
    let display_phone_number = (message.to).replace(/@c\.us$/, '')
    let message_media = "text"           //Type
    let Type = message.type
    let contactName = message._data.notifyName      //contactName
    let countryCodeObj;
    if (from) {
      countryCodeObj = mapCountryCode.mapCountryCode(from); //Country Code abstraction `countryCode` = '91', `country` = 'IN', `localNumber` = '8130818921'
    }

    let countryCode = countryCodeObj.country + " +" + countryCodeObj.countryCode
    if (message.hasMedia) {
      const media = await message.downloadMedia();
      console.log("media", message.type)
      message_media = media.data
      //  console.log(media.data)
    }

    if (from != 'status@broadcast' && from !== '0' && Type !== 'e2e_notification') {

      // let myUTCString = new Date().toUTCString();
      // const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

      var d = new Date(message.timestamp * 1000).toUTCString();

      const message_time = moment.utc(d).format('YYYY-MM-DD HH:mm:ss');
      let saveMessage = await saveIncommingMessages(message_direction, from, message_text, phone_number_id, display_phone_number, from, message_text, message_media, "Message_template_id", "Quick_reply_id", Type, "ExternalMessageId", contactName, 'null', message_time, countryCode);
      //console.log("saveMessage" ,)
      // console.log(saveMessage)

      var SavedMessageDetails = await getDetatilsOfSavedMessage(saveMessage, message_text, phone_number_id, contactName, from, display_phone_number)
    }
  } catch (err) {
    logger.error(`Saving incoming message for from:: ${from}, error: ${err}`);
    console.log(err);

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
    let message_text = message.body   //firstMessage

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
    let phone_number_id = message.id.id
    let display_phone_number = (message.to).replace(/@c\.us$/, '')
    let message_direction = 'IN'
    let endCustomer = (message.from).replace(/@c\.us$/, '');  // for handle out messages of a chat
    if (from == spPhone) {
      message_direction = 'Out'
      endCustomer = (message.to).replace(/@c\.us$/, '');
      display_phone_number = spPhone;
    }
    let getLastScannedTime = await db.excuteQuery(messageQuery, [endCustomer, spid]);
    // logger.info(`Message -----------Text   ${message_text}`)
    //logger.info(`getLastScannedTime",${getLastScannedTime[0]?.latest_message_created_date.toUTCString()}`)

    var d = new Date(message.timestamp * 1000).toUTCString();
    //logger.info(`lost message timestamp d",${d}`)

    const message_time = moment.utc(d).format('YYYY-MM-DD HH:mm:ss');

    //logger.info(`new Date().toUTCString()",${new Date().toUTCString()}`)
    // logger.info(`if condition1 of lost sms",${(d > getLastScannedTime[0]?.latest_message_created_date && d < new Date().toUTCString()) }`)
    // logger.info(`if condition---2 of lost sms",${(getLastScannedTime[0]?.latest_message_created_date == null) }`)
    // logger.info(`all if condition ${(d > getLastScannedTime[0]?.latest_message_created_date && d < new Date().toUTCString()) || (getLastScannedTime[0]?.latest_message_created_date == null)}`)

    // logger.info(`d > getLastScannedTime[0]?.latest_message_created_date.toUTCString() ${d > getLastScannedTime[0]?.latest_message_created_date.toUTCString()}`)
    //logger.info(`d < new Date().toUTCString()  ${d < new Date().toUTCString()}`)
    // logger.info(`d >== getLastScannedTime[0]?.latest_message_created_date.toUTCString() ${d >= getLastScannedTime[0]?.latest_message_created_date.toUTCString()}`)
    // logger.info(`d <== new Date().toUTCString()  ${d <= new Date().toUTCString()}`)

    let latestMessageTime = getLastScannedTime[0]?.latest_message_created_date;
    if (latestMessageTime) {
      latestMessageTime = getLastScannedTime[0]?.latest_message_created_date.toUTCString();
    }
    //logger.info(`latestMessageTime============================================== ${latestMessageTime}`)
    if ((d > latestMessageTime && d < new Date().toUTCString()) || (getLastScannedTime[0]?.latest_message_created_date == null)) {



      let message_media = "text"           //Type
      let Type = message.type
      let contactName = message._data.notifyName !== '' ? message._data.notifyName : endCustomer; //contactName

      if (message.hasMedia) {
        console.log("media", Type)
        const media = await message.downloadMedia();

        message_media = media?.data
      }





      if (from != 'status@broadcast' && from !== '0' && Type !== 'e2e_notification') {
        console.log("endCustomer", endCustomer, "Type", Type, "message_text", message_text, "****************", currentIndex, lastIndex, message.timestamp)
        //  console.log("lost messages time", d)
        let saveMessage = await saveIncommingMessages(message_direction, from, message_text, phone_number_id, display_phone_number, endCustomer, message_text, message_media, "Message_template_id", "Quick_reply_id", Type, "ExternalMessageId", contactName, ackStatus, message_time, countryCode);
        //console.log(saveMessage)
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
          conversationStatus(sid, ConversationStatusMap.Resolved, newId);
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
            conversationStatus(sid, ConversationStatusMap.Resolved, newId);
            console.log("ResolveOpenChat -----", ResolveOpenChat)
            let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=? WHERE InteractionId=?', ['Open', newId])
            conversationStatus(sid, ConversationStatusMap.Open, newId);
            if (isEmptyInteraction == 1) {
              updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', ['Open', updated_at, newId])
              conversationStatus(sid, ConversationStatusMap.Open, newId);
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
        conversationStatus(sid, ConversationStatusMap.Resolved, newId);
        console.log("ResolveOpenChat -----", ResolveOpenChat)
        let updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=? WHERE InteractionId=?', ['Open', newId])
        conversationStatus(sid, ConversationStatusMap.Open, newId);
        if (isEmptyInteraction == 1) {
          updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', ['Open', updated_at, newId])
          conversationStatus(sid, ConversationStatusMap.Open, newId);
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

async function saveIncommingMessages(message_direction, from, firstMessage, phone_number_id, display_phone_number, phoneNo, message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, contactName, ackStatus, timestramp, countryCode) {
  // console.log("saveIncommingMessages")

  if (Type == "image") {
    console.log("lets check the image");

    var imageurl = await saveImageFromReceivedMessage(from, message_media, phone_number_id, display_phone_number, Type);

    message_media = imageurl.value;
    // console.log(message_media)
    // message_text = " "
    var media_type = 'image/jpg'
  }
  if (Type == "video") {
    console.log("lets check the video");

    var imageurl = await saveImageFromReceivedMessage(from, message_media, phone_number_id, display_phone_number, Type);

    message_media = imageurl.value;
    //  console.log(message_media)
    //message_text = " "
    var media_type = 'video/mp4'
  }
  if (Type == "document") {
    console.log("lets check the document");

    var imageurl = await saveImageFromReceivedMessage(from, message_media, phone_number_id, display_phone_number, Type);

    message_media = imageurl.value;
    //  console.log(message_media)
    // message_text = " "
    var media_type = 'application/pdf'
  }

  let countryCodeObj;
  if (phoneNo) {
    countryCodeObj = mapCountryCode.mapCountryCode(phoneNo);
  }
  let EcPhonewithoutcountryCode = countryCodeObj?.localNumber;
  countryCode = countryCodeObj?.country + " +" + countryCodeObj?.countryCode;

  if ((message_text.length > 0 || (message_media != 'text' && message_media.length > 0)) && Type != 'e2e_notification') {
    let query = "CALL webhook_2(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    // console.log([phoneNo, message_direction, message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, display_phone_number, contactName, media_type, ackStatus, 'WA Web', timestramp, countryCode])
    var saveMessage = await db.excuteQuery(query, [phoneNo, message_direction, message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, display_phone_number, contactName, media_type, ackStatus, 'WA Web', timestramp, countryCode, EcPhonewithoutcountryCode,'','',0]);
    messageRecieved(saveMessage[0][0]['@sid'], phoneNo, message_direction, message_text, message_media, Message_template_id, Quick_reply_id, Type, ExternalMessageId, display_phone_number, contactName, media_type, ackStatus, 'WA Web', timestramp, countryCode, EcPhonewithoutcountryCode,'','',0 );
    notify.NotifyServer(display_phone_number, true);
    //console.log("====SAVED MESSAGE====" + " replyValue length  " + JSON.stringify(saveMessage), "****", phoneNo, phone_number_id);


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
        conversationStatus(sid, ConversationStatusMap.Open, newId);
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
          conversationStatus(sid, ConversationStatusMap.Resolved, newId);
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
            conversationStatus(sid, ConversationStatusMap.Open, newId);
            if (isEmptyInteraction == 1) {
              updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', ['Open', updated_at, newId])
              conversationStatus(sid, ConversationStatusMap.Open, newId);
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
        conversationStatus(sid, ConversationStatusMap.Open, newId);
        if (isEmptyInteraction == 1) {
          updateInteraction = await db.excuteQuery('UPDATE Interaction SET interaction_status=?,updated_at=? WHERE InteractionId=?', ['Open', updated_at, newId])
          conversationStatus(sid, ConversationStatusMap.Open, newId);
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
async function autoReconnectSessions() {
  // const baseDir = "/Users/ayush/Desktop/backend/.wwebjs_auth"
   const baseDir = path.resolve(__dirname, ".wwebjs_auth");
  if (!fs.existsSync(baseDir)) {
     console.log("No sessions to reconnect.");
    return;
  }

  const sessions = fs.readdirSync(baseDir)
    .filter(name => name.startsWith("session-"))
    .map(name => name.replace("session-", ""));

  if (sessions.length === 0) {
     console.log("No saved sessions found.");
    return;
  }

  for (const spid of sessions) {
    try {
      const result = await db.excuteQuery(
         'SELECT mobile_number FROM user WHERE SP_ID = ? AND isDeleted != 1 AND ParentId IS NULL',
        [spid]
      );

      if (!result || result.length === 0) {
        console.log(`No matching user found in DB for SP_ID: ${spid}`);
        continue;
      }

      const phoneNo = result[0].mobile_number;

      if (!phoneNo) {
        console.log(`Phone number missing for SP_ID: ${spid}`);
        continue;
      }
      let response = await createClientInstance(spid, phoneNo);
      if (response.value === 'Client is ready!') {    
         await db.excuteQuery('update WhatsAppWeb set channel_status = 1 where spid = ?', [spid]);
      }
    } catch (err) {
      console.log(`Failed to reconnect session ${spid}:`, err);
    }
  }
}

// if (sessions.length > 0) {
//   const placeholders = sessions.map(() => '?').join(', ');
//   const sql = `
//     SELECT * FROM user 
//     WHERE SP_ID IN (${placeholders}) 
//     AND isDeleted != 1 
//     AND ParentId IS NULL
//   `;

//   const userlist = await db.excuteQuery(sql, sessions);
//   console.log(result);
// } else {
//   console.log('No sessions to query.');
// }


async function sendMail() {
  const baseDir = path.resolve(__dirname, ".wwebjs_auth");
  const sessions = fs.readdirSync(baseDir)
    .filter(name => name.startsWith("session-"))
    .map(name => name.replace("session-", ""));

  if (sessions.length === 0) {
    console.log("No saved sessions found.");
    return;
  }
  //const sessions = ['1065', '1071'];

  try {
    const placeholders = sessions.map(() => '?').join(', ');
    const sql = `
      SELECT * FROM user 
      WHERE SP_ID IN (${placeholders}) 
      AND isDeleted != 1 
      AND ParentId IS NULL
    `;

    const results = await db.excuteQuery(sql, sessions);

    if (!results || results.length === 0) {
      console.log("No matching users found in DB for the given SP_IDs.");
      return;
    }

    for (const user of results) {
      const spid = user.SP_ID;
      const phoneNo = user?.mobile_number;

      if (!phoneNo) {
        console.log(`Phone number missing for SP_ID: ${spid}`);
        continue;
      }

      let emailSender = MessagingName[user?.Channel];
      const subject = `Your ${emailSender} Channel might got disconnected`;
      const body = `
        <p>Hello <strong>${user?.name}</strong>,</p>

        <p>Your channel might got disconnected please check the channel.</p>
        
        <p>We are here to assist you with any questions or concerns you may have.</p>
        <p>For a more detailed report and insights, please log in to your account.</p>
          
        <p>Best regards,<br>Team ${emailSender}</p>
      `;

      const emailOptions = {
        to: user?.email_id,
        subject,
        html: body,
        fromChannel: emailSender,
      };

      if (body) {
        let emailSent = sendEmail(emailOptions);
      }
    }
  } catch (err) {
    console.log(`Failed to send emails:`, err);
  }
}




module.exports = { createClientInstance, sendMessages, isActiveSpidClient, sendFunnel, whatsappWebStatus, autoReconnectSessions,sendMail }