const express = require('express')
const web = require('./web')
const Whapi = require("./whapi");

// const path = require('path');
//const InMessage = require('../IncommingMessages')
var app = express();
const cors = require('cors')
app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
const fs = require('fs')
const path = require('path');
const { exec } = require('child_process');
const logger = require('../common/logger.log');
var processSet = new Set();
const variables = require('../common/constant')
const { getUrl, env } = require('../config');
const ProviderService = require('../Services/ProviderService'); 


// const { MessageMedia, Location, Contact } = require('whatsapp-web.js');
/**
 * @swagger
 * tags:
 *   - name: webJS
 */
app.get('/get', (req, res) => {
    res.send("webjs is working")
})
/**
 * @swagger
 * /createQRcode:
 *   post:
 *     tags:
 *       - webJS
 *     summary: Create a QR Code for a client
 *     description: Generates a QR Code for the given SPID and phone number. If a process is already running for the SPID, the request will be rejected until the previous request is processed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spid:
 *                 type: string
 *                 description: The SPID of the client.
 *               phoneNo:
 *                 type: string
 *                 description: The phone number associated with the client.
 *             required:
 *               - spid
 *               - phoneNo
 *     responses:
 *       200:
 *         description: QR Code successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 QRcode:
 *                   type: string
 *                   example: "https://example.com/qrcode123"
 *       409:
 *         description: A process is already running for the given SPID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 value:
 *                   type: string
 *                   example: "Please wait for 60 seconds as the previous request is closing down"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 err:
 *                   type: string
 *                   example: "Error message here"
 */
app.post('/craeteQRcode', async (req, res) => {

    try {
        
        spid = req.body.spid;
        phoneNo = req.body.phoneNo

        let isProcessing = processStart(spid); // To check Process for SPID 
        const {isDisable = 0, isPaused = 0, isPlanExpired = 0} = await web.getUserStatus(spid);
            const _isDisable = Number(isDisable);
            const _isPaused = Number(isPaused);
            const _isPlanExpired = Number(isPlanExpired);

            const messages = [];

            if (_isDisable) messages.push('Disabled');
            if (_isPaused) messages.push('Paused');
            if (_isPlanExpired) messages.push('Plan Expired');

            if (messages.length > 0) {
              throw new Error(`Service Provider is ${messages.join(', ')}`);
            }

        console.log(`current: ${spid}, current processSet:`, processSet);
        if(!isProcessing){
            return res.status(409).json({ value: 'Please wait for 60 seconds as the previous request is closing down' });
        }
       //const provider = ProviderFactory.getProvider();
        let response
        // if(variables.provider == "whapi" || variables.SPID == spid){
        if(await ProviderService.isValidSPID(variables?.providers.whapi, spid)){
        response = await Whapi.createClientInstance(spid, phoneNo);
        Whapi.handleWhatsAppReady(spid, phoneNo, response.channelToken); //todo need to check
        }else{
        response = await web.createClientInstance(spid, phoneNo);
        }
        if(response?.status != 200){
            processSet.delete(spid);
            console.log(`Deleted spid: ${spid}, current processSet:`, processSet);
        }
     
      
        logger.info(`response of create QR CODE  ${JSON.stringify(response.status)}`)
        if(response.status == 409 && response.message == "Channel already authenticated"){
            return res.send({ status: 409, value: 'Channel already authenticated' })
        }
        res. send({
            status: 200,
            QRcode: response.value
        })

    } catch (err) {
        processSet.delete(spid);
        logger.error(`err while Creating QR CODE for SPID ${req?.body?.spid}, error: ${err}`)
         res.send({
            status: 500,
            err: err?.message ?? err
        })

    }
})

function processStart(spId) {
    if (processSet.has(spId)) {
      console.error(`Error: Process already running for spId: ${spId}`);
      return false; 
    }
      processSet.add(spId);
      console.log(`Process started for spId: ${spId}`);
      const timeoutId = setTimeout(() => {
        processSet.delete(spId);
        console.log(`Process timed out for spId: ${spId}`);
       // processTimeouts.delete(spId); // if any case the try and catch block dont get triggered 
    }, 60000); 
    return true;
  }
/**
 * @swagger
 * /sendMessage:
 *   post:
 *     tags:
 *       - webJS
 *     summary: Send a message to a client
 *     description: Sends a message of a specified type (text, link, etc.) to a client's phone number using the provided SPID and other optional parameters.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spid:
 *                 type: string
 *                 description: The SPID of the sender.
 *               type:
 *                 type: string
 *                 description: The type of the message (e.g., text, link).
 *               link:
 *                 type: string
 *                 description: A link to be included in the message, if applicable.
 *               text:
 *                 type: string
 *                 description: The text content of the message.
 *               phoneNo:
 *                 type: string
 *                 description: The recipient's phone number.
 *               interaction_id:
 *                 type: string
 *                 description: Optional interaction ID for tracking purposes.
 *               msg_id:
 *                 type: string
 *                 description: Optional message ID for tracking purposes.
 *               spNumber:
 *                 type: string
 *                 description: The service provider's number, if applicable.
 *             required:
 *               - spid
 *               - type
 *               - phoneNo
 *     responses:
 *       200:
 *         description: Message sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 msgId:
 *                   type: string
 *                   example: "msg12345"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 */
app.post('/sendMessage', async (req, res) => {
    try {
        spid = req.body.spid
        type = req.body.type
        link = req.body.link
        text = req.body.text
        phoneNo = req.body.phoneNo
        interaction_id = req.body?.interaction_id,
        msg_id = req.body?.msg_id
        spNumber = req.body?.spNumber
        let response
        // if(variables.provider == "whapi" || variables.SPID == spid){
        if(await ProviderService.isValidSPID(variables?.providers.whapi, spid)){
            response = await Whapi.sendMessageViaWhapi(spid, phoneNo, type, text, link, interaction_id, msg_id, spNumber);
        }else{
            response = await web.sendMessages(spid, phoneNo, type, text, link, interaction_id, msg_id, spNumber);
        }
        
        logger.info(`Response of webjs sendMessage API ${response,spid, phoneNo, type, text, link}`)
        return res.send({ status: response.status , msgId : response.msgId })

    } catch (err) {
        logger.error(`err while /sendMessage is triggered for SPID: ${req?.body?.spid}, error: ${err}`)
        console.log(err);
        return res.send({ status: 500 })
    }
})


app.post('/sendFunnelMessage', async (req, res) => {
    try {
        spid = req.body.spid
        type = req.body.type
        link = req.body.link
        text = req.body.text
        phoneNo = req.body.phoneNo
        let response;
        // if(variables.provider == "whapi" || variables.SPID == spid){
        if(await ProviderService.isValidSPID(variables?.providers.whapi, spid)){
            response = await Whapi.sendFunnel(spid, phoneNo, type, text, link);
        }else{
            response = await web.sendFunnel(spid, phoneNo, type, text, link);
        }
        console.log(response)
        return res.send({ status: response })

    } catch (err) {
        console.log(err);
        return res.send({ status: 500 })
    }
})
/**
 * @swagger
 * /IsClientReady:
 *   post:
 *     tags:
 *       - webJS
 *     summary: Check if the client is ready
 *     description: Validates the SPID and checks if the client is ready to use the WA API.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spid:
 *                 type: string
 *                 description: The SPID of the client to check.
 *             required:
 *               - spid
 *     responses:
 *       200:
 *         description: Client is ready.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Client is ready !"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       channel_id:
 *                         type: string
 *                         example: "WA API"
 *       404:
 *         description: Client is not ready.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Please go to settings and Scan the QR Code !"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       channel_id:
 *                         type: string
 *                         example: "WA API"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 err:
 *                   type: string
 *                   example: "Error message here"
 */

app.post('/IsClientReady', async (req, res) => {
    try {
        spid = req.body.spid
        let result
        // if(variables.provider == "whapi" || variables.SPID == spid){
        if(await ProviderService.isValidSPID(variables?.providers.whapi, spid)){
           result = await Whapi.isActiveSpidClient(spid);
        }else{
           result = await web.isActiveSpidClient(spid);
        }
        logger.info(`IsClientReady ready api result  ${result.isActiveSpidClient}`)

        if(result.WAweb[0]?.channel_id == 'WA API' && result.WAweb[0]?.channel_status == 0){
         const planResult = await Whapi.isPlanActive(spid);
            if (!planResult?.isPlanActive) {
                return res.send({
                    status: 404,
                    message: planResult.message,
                    result: result.WAweb,
                    isPlanActive: false
                });
            }
        }
        
        if(result.WAweb[0]?.channel_id == 'WA API'){
            return res.send({ status: 200, message: "Client is ready !" ,result: result.WAweb})
        }
     
        if (result.isActiveSpidClient) {
            return res.send({ status: 200, message: "Client is ready !" ,result: result.WAweb})
        } else {
            return res.send({ status: 404, message: "Please go to settings and Scan the QR Code !" ,result: result.WAweb})
        }


    } catch (err) {
        logger.error(`IsClientReady error for SPID: ${req?.body?.spid}, error ${err}`)
        res.send({ status: 500, err: err })
    }
})

app.get('/webjsStatus', (req, res) => {
    try {
    let response
      if(variables.provider == "whapi"){
        response = Whapi.whatsappWebStatus();
      }
      else{
        response = web.whatsappWebStatus();
      }
      
      res.send({ status: 200, message: response })

    } catch (err) {
        logger.error(`Error in webjsStatus: error: ${err}`)
        res.send({ status: 500, err: err })
    }
})

app.get('/healthCheck', async (req, res) => {
    try {
      res.status(200).send({ status: 'ok', message: 'Service is running'});
  } catch (err) {
      res.status(500).send({ error: 'Internal server error' });
  }
});


// Admin API to pause and disable service provider
app.get('/pauseAndDisableSP', async (req, res) => {
    console.log("pauseAndDisableSP called", req.query.spid);
    try {
        const spid  =req.query.spid;
        console.log("spid to pause and disable: ", spid);
         response = await web.destroyWrongScan(spid);
            res.status(200).send({ status: 'ok', message: 'Service is paused and disabled for SPID: ' + spid });
  } catch (err) {
      res.status(500).send({ error: 'Internal server error' });
  }
});



app.listen(3009, () => {
    console.log("Server is Running on Port : : 3009");
    // Replace 'chrome' with the actual process name if needed
    logger.info('port 3003 restarted ');
    const processName = 'chrome';
    
    // Command to kill all processes with the given name
    
    const killCommand = `killall ${processName}`;
    
    exec(killCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error killing processes: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`Error output: ${stderr}`);
            return;
        }

        console.log(`Successfully killed Chromium processes:\n${stdout}`);
    });

    console.log(path.join(__dirname, '.wwebjs_auth'))
    var dir = path.join(__dirname, '.wwebjs_auth');
    try {
        if (fs.existsSync(dir)) {
            console.log("dir found");
            fs.readdirSync(dir).forEach((f,idx) => {
                if (f.indexOf("session-") > -1 && fs.existsSync(path.join(dir, f, "Default/Service Worker"))) {
                    console.log("Deleting : " + path.join(dir, f, "Default/Service Worker"));
                    fs.rmdirSync(path.join(dir, f, "Default/Service Worker"), { recursive: true });
                }
                if(idx == fs.readdirSync(dir).length - 1){
                    web.autoReconnectSessions();
                }
            });
        }
        if(getUrl('evoirnment') != 'staging'){
          web.sendMail();
        }
      //   web.autoReconnectSessions();
      
    }
    catch (err) {
        logger.error(`error while deleting cached sessions. Please delete manually and restart the server: ${err}`)
        console.log(err);
        console.log("error while deleting cached sessions. Please delete manually from within " + dir + " and restart the server")
        return;
    }
     // web.autoReconnectSessions(); 
})

//server.timeOut = 180000; // 3 minute 3*60*1000 min*sec*millisec