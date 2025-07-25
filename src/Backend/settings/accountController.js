var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const awsHelper = require('../awsHelper')
const cors = require('cors')
app.use(cors());
const moment = require('moment');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const middleWare = require('../middleWare')
const commonFun = require('../common/resuableFunctions');
const { APIKeyManager, sendMessageBody, spPhoneNumber, ApiResponse, Webhooks, 
    textMessageBody, mediaMessageBody, TemplateStatus, SessionStatus, 
    TemplateAPI, TemplateWHAPI, TemplateWEB, Template, sendTemplateBody, 
    spCreadential, sendTemplateBodyAPI, getMessage }= require('./model/accountModel');
const { WebSocketManager } = require("../whatsApp/PushNotifications")
const {mapCountryCode} = require('../Contact/utils')
const variables = require('../common/constant')
const { exportLog, BrandConfigRequest } = require('../Services/ServiceModel');
const { makeXLSXFileOfData } = require('../Contact/utils');
const { sendEmail }= require('../Services/EmailService');
const { MessagingName }= require('../enum');

const insertAndEditWhatsAppWeb = async (req, res) => {
    try {
        // Extracting request body parameters
        const {
            id,
            channel_id,
            connected_id,
            channel_status,
            spid,
            phone_type,
            import_conversation,
            QueueMessageCount,
            connection_date,
            WAVersion,
            InMessageStatus,
            OutMessageStatus,
            QueueLimit,
            delay_Time,
            INGrMessage,
            OutGrMessage,
            online_status,
            serviceMonetringTool,
            syncContact,
            DisconnAlertEmail,
            roboot,
            restart,
            reset
        } = req.body;

        const is_deleted = 0;  // default value
        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');


        console.log("id-------", id);

        // Prepare the call to the stored procedure
        const procedureCall = `
            CALL AddUpdateWhatsappDetails(
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;

        // Parameters for the stored procedure
        const params = [
            id,
            channel_id,
            connected_id,
            channel_status,
            is_deleted,
            spid,
            phone_type,
            import_conversation,
            QueueMessageCount,
            connection_date,
            WAVersion,
            InMessageStatus,
            OutMessageStatus,
            QueueLimit,
            delay_Time,
            INGrMessage,
            OutGrMessage,
            online_status,
            serviceMonetringTool,
            syncContact,
            DisconnAlertEmail,
            roboot,
            restart,
            reset,
            updated_at
        ];

        // Execute the stored procedure
        let result = await db.excuteQuery(procedureCall, params);

        res.status(200).send({
            result: result,
            status: 200
        });

    } catch (err) {
        console.log(err);
        db.errlog(err);
        res.status(500).send(err);
    }
}


const selectDetails = async (req, res) => {
    try {
        let channelCounts = await db.excuteQuery(val.selectChannelCount, [req.params.spid]);
        let whatsAppDetails = await db.excuteQuery(val.Whatsappdetails, [req.params.spid]);
        res.status(200).send({
            channelCounts: channelCounts,
            whatsAppDetails: whatsAppDetails,
            status: 200
        })

    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}
const isInvalidParam = (value) => value === null || value === undefined || value === 0 || value === '0' || value === 'undefined';

const mapResponseData = (data) => {
    const status = data ? 200 : 500;
    return {
        response: {
            balance_limit_today: data.balance_limit_today,
            quality_rating: data.quality_rating,
            fb_verification: data.fb_verification,
            channel_id: data.phone_number_id
        },
        status: status,
    };
};

const getQualityRating = async (req, res) => {
    try {
        const phoneNo = req?.params?.phoneNo
        const WABA_Id = req?.params?.WABA_ID;
        const metaPhoneNumberID = req?.params?.phone_number_id;
        const spid = req?.params?.spid;


        if (isInvalidParam(phoneNo) || isInvalidParam(WABA_Id) || isInvalidParam(metaPhoneNumberID) || isInvalidParam(spid)) {
            return res?.status(200).json({
                response : {
                    message: 'Missing or invalid required parameters: phoneNo, WABA_ID, and/or phone_number_id',
                    status: 400
                }
            });
        }

        let check = await db.excuteQuery(val.selectHealthStatus, [metaPhoneNumberID, spid]);
        let result;
        let result2;
        if (check.length > 0) {
            var lastUpdatedDate = new Date(check[0].updated_at).toISOString().split('T')[0];
            var currentDate = new Date().toISOString().split('T')[0];
        }
        if (!check.length) {
            let result4 = await middleWare.registerWhatsApp(metaPhoneNumberID, spid);
            let result = await middleWare.getQualityRating(metaPhoneNumberID, spid);
            let result2 = await middleWare.getVerificationStatus(WABA_Id, spid);
            let result3 = await middleWare.registerWebhook(WABA_Id, spid);
            //let result4 = await middleWare.registerWhatsApp(metaPhoneNumberID, spid);
            const quality_rating = result?.response?.quality_rating;
            const phone_number_id = result?.response?.id;
            const messaging_limit_tier = commonFun.convertMessagingLimitTier(result?.response?.messaging_limit_tier);
            const fbVerification = result2?.response?.business_verification_status;
            const isWebhookRegistered = result3?.response?.success ?? false;
            const isWhatsAppRegistered = result4?.response?.success ?? false;
            if (quality_rating && phone_number_id && messaging_limit_tier) {
                result = await db.excuteQuery(val.insertHealthStatus, [phone_number_id, phoneNo, messaging_limit_tier, quality_rating, new Date(), fbVerification, spid, isWebhookRegistered, isWhatsAppRegistered]);
            }

        }
        else if (lastUpdatedDate !== currentDate) {
            result = await middleWare.getQualityRating(metaPhoneNumberID,spid);
            result2 = await middleWare.getVerificationStatus(WABA_Id, spid);

            const quality_rating = result?.response?.quality_rating;
            const phone_number_id = result?.response?.id;
            const messaging_limit_tier = commonFun.convertMessagingLimitTier(result?.response?.messaging_limit_tier);
            const fbVerification = result2?.response?.business_verification_status;

            if (quality_rating && phone_number_id && messaging_limit_tier) {
                await commonFun.updateHealthStatus(phone_number_id, quality_rating, 'Scheduler', fbVerification, spid);
            }

        }

        let response;
        let healthStatus = await db.excuteQuery(val.selectHealthStatus, [metaPhoneNumberID, spid]);
        if (healthStatus.length) response = mapResponseData(healthStatus[0]);
        return res?.status(200).json(response);
    } catch (err) {
        console.log(err)
        res.send(err)
    }
}

const addGetAPIKey = async (req, res) => {
    try {
        const APIKeyManagerInstance = new APIKeyManager(req?.body);
        APIKeyManagerInstance.validate();

        if (!APIKeyManagerInstance.isSave) {
            let result = await SaveOrUpdate(APIKeyManagerInstance);
            let resResult = await GetAPIKeyData(APIKeyManagerInstance);
            if (resResult && resResult.length > 0) {
                const response = resResult.map((item) => APIKeyManagerInstance.mapResponse(item));
                return res?.status(200).json(response);
            }
        } else {
            let result = await GetAPIKeyData(APIKeyManagerInstance);
            if (result && result.length > 0) {
                const response = result.map((item) => APIKeyManagerInstance.mapResponse(item));
                return res?.status(200).json(response);
            }
        }
    } catch (err) {
          const statusCode = err.statusCode || 500;
          const message = err.message || "Internal Server Error";
          return res.status(statusCode).json({
            success: false,
            message
          });
   }
}
async function SaveOrUpdate(APIKeyManagerInstance) {
  try{
    const keyGenerated = APIKeyManagerInstance.generateKey();
    const api_token = APIKeyManagerInstance.generateKey2();
    let checkIfAlreadyExists = await GetAPIKeyData(APIKeyManagerInstance);
    let ips = APIKeyManagerInstance.ip;
    if (typeof ips !== 'string') {
        ips = JSON.stringify(ips);
    }
    if (!APIKeyManagerInstance.isNew) {
        if(APIKeyManagerInstance.isRegenerate){
            await db.excuteQuery(val.updateUserAPIKeysAndKeyGenerate, [keyGenerated, ips, APIKeyManagerInstance.id]);
        } else{
            await db.excuteQuery(val.updateUserAPIKeysAndTokenName, [APIKeyManagerInstance.tokenName ,ips, APIKeyManagerInstance.id]);
        }
        return { success: true, data: { spid: APIKeyManagerInstance.spId, ips } };
    } else {
      let query = `SELECT * FROM UserAPIKeys WHERE spid = ?`;
      let result = await db.excuteQuery(query, [APIKeyManagerInstance.spId]);

      if (result && result.length > 0) {
        let tokenExists = result.some(item => item.tokenName === APIKeyManagerInstance.tokenName);
        
        if (tokenExists) {
           throw new Error("This name already exists");
        }
      }
        let checking = await db.excuteQuery(val.insertUserAPIKeys, [APIKeyManagerInstance.spId, keyGenerated, ips, APIKeyManagerInstance.tokenName, api_token, APIKeyManagerInstance.Channel]);
        return { success: true, data: { spid: APIKeyManagerInstance.spId, ips } };
    }
  }
  catch(err){ 
       throw err;
  }

}
async function GetAPIKeyData(APIKeyManagerInstance) {
    let result = await db.excuteQuery(val.getUserAPIKeys, [APIKeyManagerInstance.spId]);
    return result;
}


const APIkeysState = async (req, res) => {
    try {
        const APIKeyManagerInstance = new APIKeyManager(req?.body);
        let result = await db.excuteQuery(val.updateAPIkeysState, [APIKeyManagerInstance.isEnabled, APIKeyManagerInstance.spId]);
        return res?.status(200).json(result);

    } catch (err) {
        console.log(err)
        res.send(err)
    }
}

const saveWebhookUrl = async (req, res) => {
    try {
        const APIKeyManagerInstance = new APIKeyManager(req?.body);
        let result = await db.excuteQuery(val.updateWebhookUrl, [APIKeyManagerInstance.webhookURL, APIKeyManagerInstance.spId]);
        return res?.status(200).json(result);

    } catch (err) {
        console.log(err)
        res.send(err)
    }
}
const saveOrUpdateWebhook = async (req, res) => {
    try {
      const webhook = new Webhooks(req.body); 
      let webhookDetails = await webhook.getWebhookDetails();
      const urlExists = webhookDetails.some(w => w.url === webhook.url && w.id !== webhook.id);
      
      if (urlExists) {
        throw new Error("URL Already Exists. Please use a different one.");
      }
      await testWebhookUrl(webhook.url);

      await webhook.saveOrUpdateToDatabase();
      res.status(200).json({ message: 'Webhook saved successfully' });
    } catch (err) {
      console.log(err);
      res.status(500).json({ 
        error: 'Something went wrong',
        msg: err?.message ?  err?.message : ''
    });
    }
  };

const testWebhookUrl = async (url) => {
  if (!url) {
    throw new Error("Webhook URL is missing.");
  }
  if (!isValidUrl(url)) {
      throw new Error("Invalid webhook URL format.");
    }
  try {
    const response = await axios.post(url, 'Checking the Connection before saving', {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    return response?.data;
  } catch (err) {
    throw new Error('Error while trying to ping webhook! Please check the URL again.');
  }
};
const isValidUrl = (url) => {
  try {
    new URL(url); // will throw if invalid
    return true;
  } catch (e) {
    return false;
  }
};
  const getWebhooks = async (req, res) => {
    try {
      const webhook = new Webhooks(req.params);
      let res1 = await webhook.getWebhookDetails();
      res.status(200).json(res1);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Something went wrong' });
    }
  };
  
  const deleteWebhook = async (req, res) => {
    try {
      const webhook = new Webhooks(req.params); 
      let res1 = await webhook.deleteWebhook();
      res.status(200).json(res1);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Something went wrong' });
    }
  };
  

  const exportLogs = async (req, res) => {
    try {
        const exportLogsInstance = new exportLog(req.body);
        let logsData = await exportLogsInstance.getLogs();
        const XLSXFile = makeXLSXFileOfData(
            logsData,
            exportLogsInstance.spid,
            exportLogsInstance.fromDate,
            exportLogsInstance.toDate
          );
           const EmailChannel = MessagingName[exportLogsInstance.channel];
          await sendEmail({
            to: exportLogsInstance.email,
            subject: `Exported Webhook Logs`,
            html: `
              <p>Dear User,</p>
              <p>Attached is the exported webhook logs data between <b>${exportLogsInstance.fromDate}</b> and <b>${exportLogsInstance.toDate}</b>.</p>
              <p>Regards,<br>${EmailChannel}</p>
            `,
            fromChannel: EmailChannel,
            attachments: [
              {
                filename: `webhook-logs-${exportLogsInstance.spid}.xlsx`,
                content: XLSXFile,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              },
            ],
          });
      
          return res.status(200).json({ success: true, message: 'Email sent successfully' });
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Something went wrong' });
      }
  }

  const getBrandConfig = async (req, res) => {
    try {
        const brandRequest = new BrandConfigRequest(req.params);
        brandRequest.validate();

        const config = await brandRequest.fetch();

        if (!config) {
          return res.status(404).json({ message: 'Brand config not found' });
        }

        return res.status(200).json(config);
      } catch (error) {
        return res.status(500).json({ message: error.message || 'Internal Server Error' });
      }
  }
  


const addToken = async (req, res) => {
    try {
        id = req.body.id
        spid = req.body.spid
        APIName = req.body.APIName
        IPAddress = req.body.IPAddress

        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let tokenVal = [[spid, APIName, created_at]];
        let addedToken = await db.excuteQuery(val.addTokenQuery, [tokenVal])
        var newId = addedToken.insertId
        IPAddress.forEach(async (item) => {
            let ipVal = [[spid, newId, item, created_at, '0']];
            let addedIP = await db.excuteQuery(val.insertIPAddress, [ipVal])
        })
        res.status(200).send({
            addedToken: "addedToken",
            status: 200
        })


    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const editToken = async (req, res) => {
    try {

        id = req.body.id
        spid = req.body.spid
        APIName = req.body.APIName
        IPAddress = req.body.IPAddress

        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let deleteIP = await db.excuteQuery(val.deleteIPQuery, [updated_at, id])

        let updateTokenVal = [spid, APIName, updated_at, id];
        let updatedToken = await db.excuteQuery(val.updateTokenQuery, updateTokenVal)

        IPAddress.forEach(async (item) => {
            let ipVal = [[spid, id, item, updated_at, '0']];
            let addedIP = await db.excuteQuery(val.insertIPAddress, [ipVal])
        })
        res.status(200).send({
            updatedToken: updatedToken,
            status: 200
        })

    } catch {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}



const deleteToken = async (req, res) => {
    try {
        let myUTCString = new Date().toUTCString();
        const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let deleteIPs = await db.excuteQuery(val.deleteIPQuery, [time, req.params.id])
        let deletedToken = await db.excuteQuery(val.deleteTokenQuery, [time, req.params.id]);
        res.status(200).send({
            deletedToken: deletedToken,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

}

const enableToken = async (req, res) => {
    try {
        id = req.body.id
        isEnable = req.body.isEnable
        let myUTCString = new Date().toUTCString();
        const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let enabledVal = await db.excuteQuery(val.isEnableQuery, [isEnable, time, id]);
        res.status(200).send({
            enabledVal: enabledVal,
            status: 200
        })
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

}

const selectToken = async (req, res) => {
    try {
        let selectedToken = await db.excuteQuery(val.selectTokenQuery, [req.params.spid])
        res.status(200).send({
            selectedToken: selectedToken,
            status: 200
        })
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}







async function createImageFromBase64(base64Data, outputFilePath) {
    // Remove the data:image/png;base64 prefix to get only the base64 data
    const base64Image = base64Data.replace(/^data:image\/png;base64,/, '');

    // Convert the base64 data to binary format
    const binaryData = Buffer.from(base64Image, 'base64');

    // Write the binary data to a new image file
    fs.writeFile(outputFilePath, binaryData, { encoding: 'binary' }, (err) => {
        if (err) {
            console.error('Error creating the image:', err);
        } else {
            console.log('Image created successfully:', outputFilePath);
        }
    });
}





const createInstance = async (req, res) => {
    try {
        const response = await axios.get(val.baseURL + `create_instance?access_token=64c4bcc7c05b1`);
        // Extract the data you need from the response
        const responseData = response.data;

        // Send the API response as the Node.js API response
        res.json(responseData);
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

}


const getQRcode = async (req, res) => {
    try {
        const response = await axios.get(val.baseURL + `get_qrcode?instance_id=` + req.body.instance_id + `&access_token=64c4bcc7c05b1`);
        // Extract the data you need from the response
        const responseData = response.data;

        // Send the API response as the Node.js API response
        res.json(responseData);
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const generateQRcode = async (req, res) => {
    // const base64DataFromResponse = 'data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVkAAAFZCAAAAAAXmQMHAAAGaklEQVR42u3byU7tOhAFUP7\/p3nzJzB7l0NsdJdHiCaJV47k6vj4tH5nfSAgS9YiS5asRZYsWYssWbIWWbJkLbJkyVpkb5P9+Hl99Rc\/3Om7P\/vfRb+6x1e\/sv7l9Wa+usr6bpUGWbJkyZI9KhsQfbvDQHH9gMH+0ydYv4Y1ZaVBlixZsmRvkq3O1PXfVnsNjvb+bunTB48buJMlS5Ys2T8hG+xmSBSYBPlw8L1ql2TJkiVL9m\/LDo\/nICxIU+F1KXWnDDvUIEuWLFmyl8gOW4VVOzKwSy+Q9iTXl9rWIEuWLFmyR2XTk\/nf+Orl6SOyZMmSJTuTTVd\/gge9vHSmJa0Lp+3DNBiIcciSJUuW7PuywynP3jig7Iu0D+4oeCCyZMmSJXuTbFyCnG1zfalgr6lJUMLtG47x6yJLlixZsu\/Lpl244J79odw3CKvQY\/i5GIz5kCVLlizZk7LrHabzMFW8UP0bRJUPV4XlYURAlixZsmQvke0jh+AUDnZT5arrvDStAVcp+Cv\/p0CWLFmyZD+f+E+7Kjbo23M7\/3ow5E2\/SjNtsmTJkiV7XnZtnFZv0zAjbRo+mF\/vvPl0g2TJkiVL9qhsmrUO24xpnTQ4o4MDfSfQ6SvOZMmSJUv2gGw1WRnMgG73C4MqbzoZkwYh1TQPWbJkyZK9TjYArHSCp9xpQr7x0zhzJ0uWLFmyJ2WrAZNhfpjmpWnamzYc04Jx9WhkyZIlS\/a8bDBK2ZdD+zBjTVnNZz4d6JAlS5Ys2etkg2Q3PVOrpmFfGN057tP3ndZ7yZIlS5bsTbLriCAo5qa57zMZdPqD7V9OXghZsmTJkr1Ndoet6uoFcUoaSPzKfcmSJUuW7HWy\/UhjEDk8WF79DFcQyqTNxTSKIUuWLFmyR2V3dNIjdtiYTNPtKi3va8Vb9VmyZMmSJfuCbHCnfoSkGqXsO6BVULO+ZTqtSpYsWbJkL5HtW4DbKWl6+ldV1PX1hhXYrQ4jWbJkyZJ9QfazXkHfLo01Us8+BKgy7a0PFlmyZMmSfV82rcrubDjtYqb33ZnS6beaxBpkyZIlS\/aQ7LB82eeg6xiium9VJq6uN7goWbJkyZJ9XzY9y9db6g\/b6r476XaaVQc736\/PkiVLlizZ52TTLmGaH67J0zcaRCzpZGqfc1ffI0uWLFmyR2U\/mpUipBI7j9G\/mvRXHqobkCVLlizZF2TTVC5tFVZV2Wpz1XxN\/zFJDciSJUuW7HnZYMAkKG6m7cP+eP6VMZpqb\/v1WbJkyZIl+7BsVTvdmS2pWpQ\/lEPDQZ7gB1UCPJiRIUuWLFmy78tW1dYq3wwS6r5LWNWeqwuQJUuWLNk7ZYfjMX1\/L00hh6f1Tt013dt0RoYsWbJkyf6GbDp0MpwtSU\/\/9AnWbH1ckWbfD0VdZMmSJUv2OdngJunoY9p1DM7tqsmXXj690aBgTJYsWbJk35ftT+Z+fmWnrBu89GF9Ns2HgyItWbJkyZI9JZv8cVjSDDqMVatwOIvZNyarTJssWbJkyd4k+3QN82O5hg3HAKsa1enKsGTJkiVL9iLZNEDoK6ZpsbRKRIfvLB2e6bdKlixZsmTPy2612H4eoAyePGALgpXhaM0QlSxZsmTJnpLtn204uhL0H9OEelgwDqZqgk8IWbJkyZK9SbbvEqZPWWXLfUzS56rDERyyZMmSJfsnZKs0sIoX0v5jdTzvHPLDliJZsmTJkj0vm5ZSdzYXlHB78mrcpkra04YoWbJkyZI9Khvkr\/1RnM5TDqdbqpGZauAn7TqSJUuWLNnzshVROmqSpsc7+x8m48+0S8mSJUuW7HnZKqet8AOJNIb4trKaDtQ8E\/IMKt9kyZIlS\/Yt2WG3rgop+gx1J3ZJX036BGTJkiVL9hLZ6ugMiALK6smHPcn0b7e\/R5YsWbJkT8kOU9e+LZheYFiarXqS6w9MNXNDlixZsmSPyqZFy6rk+u0J3rf2ghAl4EjvEWyGLFmyZMneJFv1GqutV+47Xcw1UV8X3u8wkiVLlizZi2Sr5+3Hcj421rBZ2W+fLFmyZMn+bdlgNDNIDdMLpJM2QXo87GeSJUuWLNk7ZaufplXPNC9NtYNUM5WtsmCyZMmSJXunbDWBmR6d1WhmNRmTtg+rMvFwGpQsWbJkyZ6StR5YZMmStciSJWuRJUvWIkuWrEWWLFmLLFmyFtmT6z8m8xMx35GA6wAAAABJRU5ErkJggg=='; // Replace this with the actual base64 data
    const outputImagePath = path.join(__dirname, 'output.png');
    var qrcode = await createImageFromBase64(req.body.data, outputImagePath)
    console.log(qrcode);
    res.send(200)
}

const testWebhook = async (req, res) => {
    try {
        let resDiscription;
         const APIKeyManagerInstance = new APIKeyManager(req?.body);
        APIKeyManagerInstance.validate();

        // Fetch data from the database
        const Data = await db.excuteQuery(val.getUserAPIKeys, [APIKeyManagerInstance.spId]);
        if (Data && Data.length > 0) {
            const result = APIKeyManagerInstance.mapResponse(Data[0]);

            if (result.webhookURL) {
                        try {
                          const response = await axios.post(result.webhookURL, 'connecting webhook', {
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          });
                          resDiscription = response?.data;
                        } catch (err) {
                          throw new Error('error in webhook')
                        }
            } else {
                throw new Error("Webhook URL is missing for the given spId.");
            }
        } else {
            throw new Error("No data found for the given spId.");
        }
        res.status(200).send({
            msg: "Webhook tested successfully!",
            status: 200,
            Discription: resDiscription
        });
    } catch (err) {
        console.error(err);
        db.errlog(err);

        res.status(500).send({
            msg: "Error testing webhook",
            status: 500,
            error: err.message,
        });
    }
};

const testWebhooks = async (req, res) => {
    try {
        const webhook = new Webhooks(req.body);
        if (webhook) {
            if (webhook.url) {
                        try {
                          const response = await axios.post(webhook.url, 'Webhook Connected', {
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          });
                          resDiscription = response?.data;
                        } catch (err) {
                          throw new Error('Error while trying to ping webhook ! Please check the url again')
                        }
            } else {
                throw new Error("Webhook URL is missing.");
            }
        } else {
            throw new Error("No URL Found");
        }
        res.status(200).send({
            msg: "Webhook tested successfully!",
            status: 200,
            Discription: resDiscription
        });
    } catch (err) {
        console.error(err);
        db.errlog(err);

        res.status(500).send({
            msg: err?.message ? err?.message : "Internal server error! Please try after some time",
            status: 500,
            error: err.message,
        });
    }
};

const deleteAPIToken = async (req, res) => {
    try {
        let instanceOfkey = new APIKeyManager(req.body)
        let result = await db.excuteQuery(val.deleteAPIKey, [instanceOfkey.id]);
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        db.errlog(err);

        res.status(500).send({ 
            msg: err?.message ? err?.message : "Internal server error! Please try after some time",
            status: 500,
            error: err.message,
        });
    }
};


function wait(delay) {
    return new Promise(resolve => {
       setTimeout(() => {
                    resolve("done");
      }, delay);
    });
  }

const sendMessage = async (req, res) => {
    try {
        const randomdelay = Math.floor(Math.random() * (3000 - 500 + 1)) + 500;
        await wait(randomdelay)

    const spPhoneNumberInstance = new spPhoneNumber(req?.body);
    spPhoneNumberInstance.validate();

    const spId = await spPhoneNumberInstance.getSPIDFromSPNumber(spPhoneNumberInstance.spNumber);

    //const APIKeyManagerInstance = new APIKeyManager({ spId });
    const APIKeyManagerInstance = new APIKeyManager({ spId, ...req?.body});

    APIKeyManagerInstance.validate();
    const clientIp = req.headers['x-forwarded-for'] || req?.connection.remoteAddress;
    const ip = clientIp?.startsWith('::ffff:') ? clientIp?.substring(7) : clientIp;
    
    const Data = await db.excuteQuery(val.getUserAPIKeys, [APIKeyManagerInstance.spId]);
    if (Data && Data.length > 0) {
        const result = APIKeyManagerInstance.mapResponse(Data[0]);
        if(result?.ips.length > 0) {
            if (result?.ips.length === 0 || !result?.ips.includes(ip)) {
                throw new Error(`IP address ${ip} is not authorized.`);
            }
        }
        if(!result.isEnabled){
            throw new Error(`API is not Enabled, Please Enable it from settings.`);
        }
        if(result?.apiKey != APIKeyManagerInstance?.apiKey){
            throw new Error(`API Key is not authorized.`);
        }
        if(await commonFun.isDisable(spId)){
            throw new Error(`Attention! Your account has been DISABLED. Please contact your solution provider.`);
        }
        if(await commonFun.isPaused(spId)){
            throw new Error(`Attention! Your account has been PAUSED. Please contact your solution provider.`);
        }
        if(await commonFun.isDeleted(spId)){
            throw new Error(`Attention! Your account has been DELETED. Please contact your solution provider.`);
        }

        if(APIKeyManagerInstance.spId){
            try {
                const apiUrl = `${variables.ENV_URL.waweb}/IsClientReady`;
                const dataToSend = {
                  spid: APIKeyManagerInstance.spId
                };
          
                const response = await axios.post(apiUrl, dataToSend);
                if(response?.data?.message != 'Client is ready !'){
                    throw new Error(`Please go to settings and Scan the QR Code !`);
                }
              } catch (error) {
                throw new Error(`Error While Authenticating client !`);
              }
        }
        const countOfMessages = await db.excuteQuery(val.getRateLimit, [APIKeyManagerInstance.spId]);
        if( countOfMessages && countOfMessages.length > 0){
            const count = countOfMessages[0].Count;
            if(count > 30){
                throw new Error(`Rate limit exceeded. Please try again later.`);
            }
        }

    } else {
         throw new Error("No data found for the given spId.");
    }

  const sendMessageInstance = new sendMessageBody(req?.body);
  sendMessageInstance.SPID = APIKeyManagerInstance.spId;
  if(sendMessageInstance.isTemplate == true){
    const { Header, BodyText, FooterText } = await sendMessageBody.getBodyText(sendMessageInstance.name);
    sendMessageInstance.message_text = (Header ? Header + "\n" : "") + BodyText +'<p class="temp-footer">'+FooterText+'</p>';
    sendMessageInstance.bodyText = BodyText;
  }
   
  const channelData = await db.excuteQuery(val.getChannel, [APIKeyManagerInstance.spId]);
  let channel, AgentId;
  if (channelData && channelData.length > 0) {
      channel = channelData[0]?.channel_id;
  }

  let { InteractionId, custid } = await insertInteractionAndRetrieveId(sendMessageInstance.messageTo, sendMessageInstance.SPID, channel);
  const AgentIdData = await db.excuteQuery(val.getAgentId, [APIKeyManagerInstance.spId]);
  if(AgentIdData && AgentIdData.length > 0) AgentId = AgentIdData[0]?.uid;
  sendMessageInstance.InteractionId = InteractionId;
  sendMessageInstance.CustomerId = custid;
  sendMessageInstance.AgentId = AgentId;
        const apiUrl = `${variables.ENV_URL.auth}/newmessage`;
        const response = await axios.post(apiUrl, sendMessageInstance);
        const responseData = response?.data;
        if (responseData?.status >= 200 && responseData?.status < 300) {
            const structuredResponse = new ApiResponse(responseData);
            return res.status(200).json(structuredResponse);
          } else {
            return res.status(responseData?.status || 500).json(responseData);
        }
        

}catch (err) {
    db.errlog(err);
    res.status(403).send({
        msg: "Sending Message failed.",
        status: 403,
        error: err?.message,
    });
}
}

const textMessage = async (req, res) => { 
    try {
    const spId = req.spid
    const APIKeyManagerInstance = new APIKeyManager({ spId, ...req?.body});
    //const APIKeyManagerInstance = new APIKeyManager({ spId });
    // const APIKeyManagerInstance = new APIKeyManager({ spId, ...req?.body});

    APIKeyManagerInstance.validate();
    const clientIp = req.headers['x-forwarded-for'] || req?.connection.remoteAddress;
    const ip = clientIp?.startsWith('::ffff:') ? clientIp?.substring(7) : clientIp;
    
    const Data = await db.excuteQuery(val.getUserAPIKeys, [APIKeyManagerInstance.spId]);
    if (Data && Data.length > 0) {
        const result = APIKeyManagerInstance.mapResponse(Data[0]);

        if(APIKeyManagerInstance.spId){
            try {
                const apiUrl = `${variables.ENV_URL.waweb}/IsClientReady`;
                const dataToSend = {
                  spid: APIKeyManagerInstance.spId
                };
          
                const response = await axios.post(apiUrl, dataToSend);
                if(response?.data?.message != 'Client is ready !'){
                    throw new Error(`Please go to settings and Scan the QR Code !`);
                }
              } catch (error) {
                throw new Error(`Error While Authenticating client !`);
              }
        }
    } else {
         throw new Error("No data found for the given spId.");
    }

  const sendMessageInstance = new textMessageBody(req?.body);
  sendMessageInstance.SPID = APIKeyManagerInstance.spId;
  if(sendMessageInstance.isTemplate == true){
    const { Header, BodyText, FooterText } = await textMessageBody.getBodyText(sendMessageInstance.name);
    sendMessageInstance.message_text = (Header ? Header + "\n" : "") + BodyText +'<p class="temp-footer">'+FooterText+'</p>';
    sendMessageInstance.bodyText = BodyText;
  }
   
  const channelData = await db.excuteQuery(val.getChannel, [APIKeyManagerInstance.spId]);
  let channel, AgentId;
  if (channelData && channelData.length > 0) {
      channel = channelData[0]?.channel_id;
  }

  let { InteractionId, custid } = await insertInteractionAndRetrieveId(sendMessageInstance.messageTo, sendMessageInstance.SPID, channel);
  const AgentIdData = await db.excuteQuery(val.getAgentId, [APIKeyManagerInstance.spId]);
  if(AgentIdData && AgentIdData.length > 0) AgentId = AgentIdData[0]?.uid;
  sendMessageInstance.InteractionId = InteractionId;
  sendMessageInstance.CustomerId = custid;
  sendMessageInstance.AgentId = AgentId;
        const apiUrl = `${variables.ENV_URL.auth}/newmessage`;
        const response = await axios.post(apiUrl, sendMessageInstance);
        const responseData = response?.data;
        if (responseData?.status >= 200 && responseData?.status < 300) {
            const structuredResponse = new ApiResponse(responseData);
            return res.status(200).json(structuredResponse);
          } else {
            return res.status(responseData?.status || 500).json(responseData);
        }
        

}catch (err) {
    db.errlog(err);
    res.status(403).send({
        msg: "Sending Message failed.",
        status: 403,
        error: err?.message,
    });
}
}
const mediaMessage = async (req, res) => { 
    try {
    const spId = req.spid
    const APIKeyManagerInstance = new APIKeyManager({ spId, ...req?.body});
    //const APIKeyManagerInstance = new APIKeyManager({ spId });
    // const APIKeyManagerInstance = new APIKeyManager({ spId, ...req?.body});

    APIKeyManagerInstance.validate();
    const clientIp = req.headers['x-forwarded-for'] || req?.connection.remoteAddress;
    const ip = clientIp?.startsWith('::ffff:') ? clientIp?.substring(7) : clientIp;
    
    const Data = await db.excuteQuery(val.getUserAPIKeys, [APIKeyManagerInstance.spId]);
    if (Data && Data.length > 0) {
        const result = APIKeyManagerInstance.mapResponse(Data[0]);

        if(APIKeyManagerInstance.spId){
            try {
                const apiUrl = `${variables.ENV_URL.waweb}/IsClientReady`;
                const dataToSend = {
                  spid: APIKeyManagerInstance.spId
                };
          
                const response = await axios.post(apiUrl, dataToSend);
                if(response?.data?.message != 'Client is ready !'){
                    throw new Error(`Please go to settings and Scan the QR Code !`);
                }
              } catch (error) {
                throw new Error(`Error While Authenticating client !`);
              }
        }
    } else {
         throw new Error("No data found for the given spId.");
    }

  const sendMessageInstance = new mediaMessageBody(req?.body);
  sendMessageInstance.SPID = APIKeyManagerInstance.spId;
  if(sendMessageInstance.isTemplate == true){
    const { Header, BodyText, FooterText } = await mediaMessageBody.getBodyText(sendMessageInstance.name);
    sendMessageInstance.message_text = (Header ? Header + "\n" : "") + BodyText +'<p class="temp-footer">'+FooterText+'</p>';
    sendMessageInstance.bodyText = BodyText;
  }
   
  const channelData = await db.excuteQuery(val.getChannel, [APIKeyManagerInstance.spId]);
  let channel, AgentId;
  if (channelData && channelData.length > 0) {
      channel = channelData[0]?.channel_id;
  }

  let { InteractionId, custid } = await insertInteractionAndRetrieveId(sendMessageInstance.messageTo, sendMessageInstance.SPID, channel);
  const AgentIdData = await db.excuteQuery(val.getAgentId, [APIKeyManagerInstance.spId]);
  if(AgentIdData && AgentIdData.length > 0) AgentId = AgentIdData[0]?.uid;
  sendMessageInstance.InteractionId = InteractionId;
  sendMessageInstance.CustomerId = custid;
  sendMessageInstance.AgentId = AgentId;
  //sendMessageInstance.mediaType = true;
        const apiUrl = `${variables.ENV_URL.auth}/newmessage`;
        const response = await axios.post(apiUrl, sendMessageInstance);
        const responseData = response?.data;
        if (responseData?.status >= 200 && responseData?.status < 300) {
            const structuredResponse = new ApiResponse(responseData);
            return res.status(200).json(structuredResponse);
          } else {
            return res.status(responseData?.status || 500).json(responseData);
        }
        

}catch (err) {
    db.errlog(err);
    res.status(403).send({
        msg: "Sending Message failed.",
        status: 403,
        error: err?.message,
    });
}
}
const getTemplate = async (req, res) => {
  try {
    const spId = req.spid;

    const getTemplatesQuery = `
      SELECT * FROM templateMessages 
      WHERE spid = ? AND isDeleted != 1 AND isTemplate = 1
    `;

    const result = await db.excuteQuery(getTemplatesQuery, [spId]);

    if (!result || result.length === 0) {
      return res.status(404).send({
        status: 404,
        error: "Template not found"
      });
    }

    const mappedTemplates = result.map(row => ({
      name: row.TemplateName || '',
      language: (row.Language || '').toLowerCase(),
      status: row.status || 'UNKNOWN',
      category: (row.Category || '').toUpperCase()
    }));

    return res.status(200).send({
      templates: mappedTemplates
    });

  } catch (err) {
    db.errlog(err);
    return res.status(500).send({
      status: 500,
      error: err?.message || 'Internal Server Error'
    });
  }
};

const getTemplateStatus = async (req, res) => {
  try {
    const spId = req.spid
    const { templateName } = req.body;

    const templateStatus = new TemplateStatus(spId, templateName);
    const status = await templateStatus.getStatus();

    res.status(200).send({ status });
  } catch (err) {
    const statusCode = err?.message === "Template not found" ? 404 : 400;
    res.status(statusCode).send({ error: err?.message });
  }
};

const getSessionStatus = async (req, res) => {
  try {
    const spId = req?.spid
    const { customerId } = req.body;

    const Session = new SessionStatus(spId, customerId);
    const status = await Session.getSession();

    res.status(200).send({ status });
  } catch (err) {
    const statusCode = err?.message === "Template not found" ? 404 : 400;
    res.status(statusCode).send({ error: err?.message });
  }
};

const getContacts = async (req, res) => {
  try {
    const spId = req.spid 
    let querry = `SELECT 
                EC.*,
                IFNULL(GROUP_CONCAT(ECTM.TagName ORDER BY FIND_IN_SET(ECTM.ID, REPLACE(EC.tag, ' ', ''))), '') AS tag_names
                FROM 
                EndCustomer AS EC
                LEFT JOIN 
                EndCustomerTagMaster AS ECTM ON FIND_IN_SET(ECTM.ID, REPLACE(EC.tag, ' ', '')) AND (ECTM.isDeleted != 1)
                WHERE 
                EC.isDeleted != 1
                AND EC.SP_ID = ?
                AND EC.IsTemporary != 1
                GROUP BY 
                EC.customerId
                order by updated_at desc`;

    let contactList = await db.excuteQuery(querry, [spId]);
    if(!contactList || contactList.length === 0) {
      throw new Error("No contacts found !");
    }
    res.status(200).send({ contactList });

  } catch (err) {
    res.status(500).send({ error: "Error Occured while fetching the contacts" });
  }
};

const deleteContacts = async (req, res) => {
  try {
    const spId = req.spid;
    const { customerId } = req.body;

    const phoneNumbersRaw = req.body?.phoneNumbers;
    if (!phoneNumbersRaw || typeof phoneNumbersRaw !== 'string') {
      return res.status(400).send({ error: 'phoneNumbers field is required as a comma-separated string.' });
    }
    const phoneNumbers = phoneNumbersRaw
      .split(',')
      .map(num => num.trim())
      .filter(num => /^\d{10,15}$/.test(num));

    if (phoneNumbers.length === 0) {
      return res.status(400).send({ error: 'No valid phone numbers provided.' });
    }

    const placeholders = phoneNumbers.map(() => '?').join(', ');
    const sql = `
      SELECT customerId 
      FROM EndCustomer 
      WHERE Phone_number IN (${placeholders}) AND SP_ID = ? 
      ORDER BY 1 DESC
    `;

    const values = [...phoneNumbers, spId];
    const rows = await db.excuteQuery(sql, values);

    const customerIds = rows.map(row => row.customerId);

    if (customerIds.length === 0) {
      return res.status(404).send({ error: 'No matching contacts found for provided phone numbers.' });
    }


    const sendMessageInstance = {
      customerId: customerIds,
      SP_ID: spId
    };

    const apiUrl = `${variables.ENV_URL.contacts}/deletContactWrapperAPI`;
    const response = await axios.post(apiUrl, sendMessageInstance);
    const responseData = response?.data;
    res.status(200).send({ status: 'success', contactsDeleted: responseData?.affectedRows || "0", message: "Contact deleted successfully" });
  } catch (err) {
    const statusCode = err?.message === "Contact not found" ? 404 : 400;
    res.status(statusCode).send({ error: err?.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const spId = req.spid 
    selectAllQuery = `SELECT   r.RoleName,  u.*
                    FROM user u
                    JOIN roles r ON u.UserType = r.roleID
                    WHERE u.SP_ID =? AND u.isDeleted != 1` ;
    
    let getUser = await db.excuteQuery(val.selectAllQuery, [spId])               
    const users = getUser.map(user => ({
      userId: user.uid,
      name: user.name,
      status: user.IsActive == 1 ? 'online' : 'offline'
    }));

    res.status(200).send({ users });
  } catch (err) {
    res.status(500).send({ error: "Error while fetching Users List" });
  }
};

const getCustomFields = async (req, res) => {
  try {
    const spId = req.spid 
    const apiUrl = `${variables.ENV_URL.settings}/wrapperGetCustomField/${spId}`; 

    const response = await axios.get(apiUrl);
    const responseData = response?.data;

    if (!responseData || responseData.status !== 200) {
      return res.status(500).send({ error: 'Failed to fetch custom fields from wrapper API' });
    }

    res.status(200).send({
      status: 'success',
      data: responseData,
    });
  } catch (err) {
    res.status(500).send({ error: "Error while fetching Custom Fields" });
  }
};

const createContact = async (req, res) => {
  try {
    const spId = req.spid;

    const userPayload = req.body;

    if (!userPayload || typeof userPayload !== 'object') {
      return res.status(400).send({ error: "Invalid payload" });
    }
    
    const phone = req?.body?.Phone_number;

    if (!phone || typeof phone !== 'string' || !/^\d{10,15}$/.test(phone)) {
      return res.status(400).send({ error: 'Phone_number is required and must contain digits only.' });
    }

    const parsed = mapCountryCode(phone);
    if(parsed == 'Phone number length is incorrect') return res.status(400).send({ error: parsed });
    if (typeof parsed === 'string') {
      return res.status(400).send({ error: parsed });
    }

    userPayload.displayPhoneNumber = parsed.localNumber;
    userPayload.CountryCode = `${parsed.country} ${parsed.countryCode}`;

    // const result = [
    //   { displayName: spId, ActuallName: "SP_ID" },
    //   ...Object.entries(userPayload).map(([key, value]) => ({
    //     displayName: value,
    //     ActuallName: key
    //   }))
    // ];
    const result = [
      { displayName: spId, ActuallName: "SP_ID" },
      ...Object.entries(userPayload)
        .filter(([key]) => key !== 'apiKey' && key !== 'apiToken') // Exclude these keys
        .map(([key, value]) => ({
          displayName: value,
          ActuallName: key
        }))
    ];

    const apiUrl = `${variables.ENV_URL.contacts}/addCustomContact`;

    const response = await axios.post(apiUrl, {SP_ID: spId, result });
    const responseData = response?.data;

    if (responseData?.status === 409) {
      return res.status(409).json({
        status: 409,
        error: "Contact already exists"
      });
    }

    if (!responseData || responseData.status !== 200) {
      return res.status(500).send({ error: 'Failed to add contact to remote service' });
    }

    res.status(200).send({
      status: 'success',
      InsertId: responseData?.result?.insertId || null,
      message: "Contact created successfully",
    });
  } catch (err) {
    res.status(500).send({
      error: err?.message || "Internal server error"
    });
  }
};

const updateContact = async (req, res) => {
  try {
    const spId = req.spid
    const customerId = req.query.customerId;

    const userPayload = req.body;

    if (!userPayload || typeof userPayload !== 'object') {
      return res.status(400).send({ error: "Invalid payload" });
    }

    // Convert the payload into the required `req.body.result` structure
     const result = [
      { displayName: spId, ActuallName: "SP_ID" },
      ...Object.entries(userPayload)
        .filter(([key]) => key !== 'apiKey' && key !== 'apiToken') // Exclude these keys
        .map(([key, value]) => ({
          displayName: value,
          ActuallName: key
        }))
    ];

    const apiUrl = `${variables.ENV_URL.contacts}/editCustomContact?SP_ID=${spId}&customerId=${customerId}`;

    const response = await axios.post(apiUrl, { result });
    const responseData = response?.data;

    if (!responseData || responseData.status !== 200) {
      return res.status(500).send({ error: 'Failed to edit contact on remote service' });
    }

    res.status(200).send({
      status: 'success',
      data: responseData,
      message: "Contact updated successfully",
    });
  } catch (err) {
    res.status(500).send({
      error: err?.message || "Internal server error"
    });
  }
};

const createTemplatesAPI = async (req, res) => {
  try {
    const spId = req.spid

    let mediaId = null;
    if (req.body.isHeaderImage && req.body.Links?.trim() && !req.body.Header?.trim()) {
      mediaId = await uploadImageToMetaWrapper(spId, req.body.Links.trim());
    }
    const instanceAPI = new TemplateAPI(req.body, spId, mediaId);
    
    const apiUrl = `${variables.ENV_URL.settings}/addTemplateWrapper`;
    const response = await axios.post(apiUrl, instanceAPI);
    const responseData = response?.data;

    res.status(200).send({
      status: 'success',
      data: responseData,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send({
      error: err?.message || "Internal server error",
    });
  }
};

const FormData = require('form-data');
const { default: fetch } = require('node-fetch'); // Or you can use axios directly
const mime = require('mime-types');

const MAX_IMAGE_SIZE_MB = 5;
const MAX_DOC_VIDEO_SIZE_MB = 10;

const uploadImageToMetaWrapper = async (spId, imageUrl) => {
  try {
    // 1. Download the image from S3
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    const fileSize = parseInt(response.headers.get('content-length'), 10);

    const fileSizeInMB = fileSize / (1024 * 1024);

    // 2. Enforce size limits like the frontend
    if (
      (['video/mp4', 'application/pdf'].includes(contentType) && fileSizeInMB > MAX_DOC_VIDEO_SIZE_MB) ||
      (['image/jpg', 'image/jpeg', 'image/png'].includes(contentType) && fileSizeInMB > MAX_IMAGE_SIZE_MB)
    ) {
      throw new Error(`File size exceeds allowed limit for ${contentType}`);
    }

    const ext = mime.extension(contentType) || 'png';
    const filename = `upload.${ext}`;

    // 3. Prepare form-data
    const form = new FormData();
    form.append('dataFile', buffer, {
      filename,
      contentType,
    });
    form.append('mediaType', contentType);

    // 4. POST to Meta wrapper endpoint
    const uploadResponse = await axios.post(
      `${variables.ENV_URL.settings}/uploadfiletoMeta/${spId}/template-message`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    if (uploadResponse.status === 200 && uploadResponse.data?.metaUploadedId?.h) {
      return uploadResponse.data.metaUploadedId.h;
    } else {
      throw new Error('Meta media ID not found in response');
    }
  } catch (error) {
    console.error('Error uploading image to Meta:', error.message);
    throw error;
  }
};

const createTemplatesWHAPI = async (req, res) => {
  try {
    const spId = req.spid
    const instanceWHAPI = new TemplateWHAPI(req.body, spId);

    const apiUrl = `${variables.ENV_URL.settings}/addTemplateWrapper`;
    const response = await axios.post(apiUrl, instanceWHAPI);
    const responseData = response?.data;
    res.status(200).send({
      status: 'success',
      data: responseData,
    });
  } catch (err) {
    res.status(500).send({
      error: err?.message || "Internal server error"
    });
  }
};

const createTemplatesWEB = async (req, res) => {
  try {
    const spId = req.spid
    const instanceWEB = new TemplateWEB(req.body, spId);

    const apiUrl = `${variables.ENV_URL.settings}/addTemplateWrapper`;
    const response = await axios.post(apiUrl, instanceWEB);
    const responseData = response?.data;

    res.status(200).send({
      status: 'success',
      data: responseData,
    });
  } catch (err) {
    res.status(500).send({
      error: err?.message || "Internal server error"
    });
  }
};

const sendTemplates = async (req, res) => {
  try {
    const spId = req.spid
    const instanceWEB = new Template(req.body, spId);
    const detailsInstance = await instanceWEB.getTemplateDetails();
    const sendMessageInstance = new sendTemplateBody({
            spId: instanceWEB.spid, 
            PhoneNo: req.body.PhoneNo, 
            messageTo:req.body.messageTo, 
            templateDetails: detailsInstance
        }); 

  if(sendMessageInstance.isTemplate == true){
    const { Header, BodyText, FooterText } = await sendMessageBody.getBodyText(sendMessageInstance.name);
    sendMessageInstance.message_text = (Header ? Header + "\n" : "") + BodyText +'<p class="temp-footer">'+FooterText+'</p>';
    sendMessageInstance.bodyText = BodyText;
  }

  const channelData = await db.excuteQuery(val.getChannel, [instanceWEB.spid]);
  let channel, AgentId;
  if (channelData && channelData.length > 0) {
      channel = channelData[0]?.channel_id;
  }

  let { InteractionId, custid } = await insertInteractionAndRetrieveId(sendMessageInstance.messageTo, sendMessageInstance.SPID, channel);
  const AgentIdData = await db.excuteQuery(val.getAgentId, [instanceWEB.spid]);
  if(AgentIdData && AgentIdData.length > 0) AgentId = AgentIdData[0]?.uid;
  sendMessageInstance.InteractionId = InteractionId;
  sendMessageInstance.CustomerId = custid;
  sendMessageInstance.AgentId = AgentId;
        const apiUrl = `${variables.ENV_URL.auth}/newmessage`;
        const response = await axios.post(apiUrl, sendMessageInstance);
        const responseData = response?.data;
        if (responseData?.status >= 200 && responseData?.status < 300) {
            const structuredResponse = new ApiResponse(responseData);
            return res.status(200).json(structuredResponse);
          } else {
            return res.status(responseData?.status || 500).json(responseData);
        }
  } catch (err) {
    res.status(500).send({
      error: err?.message || "Internal server error"
    });
  }
};


const SendInteractiveButtons = async (req, res) => {
  try {
    const spId = req.spid;
    const query = `SELECT * FROM WA_API_Details WHERE spid = ?`;
    const result = await db.excuteQuery(query, [spId]);

    if (result.length === 0) {
      throw new Error("No WA API Details found for the given spId.");
    }

    const instance = new spCreadential(result[0], spId);
    const template = new sendTemplateBodyAPI(req.body, spId);

    // Now send WhatsApp API request
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${instance.phoneNumberId}/messages`,
      template.interactiveButtonsPayload,
      {
        headers: {
          Authorization: `Bearer ${instance.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).send({
      status: 'success',
      data: response?.data
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: err?.response?.data || err.message || "Internal server error"
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const spId = req.spid;
    const instanceWEB = new getMessage(req.body, spId);
    const messages = await instanceWEB.getMessages();

    res.status(200).send({
      status: 'success',
      data: messages,
    });
  } catch (err) {
    res.status(500).send({
      error: err?.message || "Internal server error"
    });
  }
};



async function insertInteractionAndRetrieveId(phoneNo, sid, channel) {
    try {
        let customerId = await db.excuteQuery(`select * from EndCustomer where Phone_Number =? AND SP_ID=?  ORDER BY created_at desc limit 1`, [phoneNo, sid]);

        let custid = customerId[0]?.customerId;
        if (!custid) {

            let countryCodeObj;
            if (phoneNo) {
                countryCodeObj = mapCountryCode(phoneNo);
            }
            let countryCode = countryCodeObj.country + " +" + countryCodeObj.countryCode
            let displayPhoneNumber = countryCodeObj.localNumber
            let addTempContact = await db.excuteQuery(`INSERT into EndCustomer(Phone_Number,SP_ID,channel,Name,OptInStatus,countryCode,displayPhoneNumber,IsTemporary) values (?,?,?,?,?,?,?,?)`, [phoneNo, sid, channel, phoneNo, 'Yes', countryCode, displayPhoneNumber, 1]);

            custid = addTempContact?.insertId
        } else if (customerId[0]?.channel == null) {
            let updateContactChannel = await db.excuteQuery(`update EndCustomer set channel=? where customerId=?`, [channel, custid])
        }
        console.log(phoneNo, sid, custid)
        let rows = await db.excuteQuery(
            'SELECT InteractionId FROM Interaction WHERE customerId = ? and is_deleted !=1 and SP_ID=? ',
            [custid, sid]
        );

        if (rows.length == 0) {

            await db.excuteQuery(
                'INSERT INTO Interaction (customerId, interaction_status, SP_ID, interaction_type) VALUES (?, ?, ?, ?)',
                [custid, 'Resolved', sid, 'User Initiated']
            );

        }

        let InteractionId = await db.excuteQuery(
            'SELECT InteractionId FROM Interaction WHERE customerId = ? and is_deleted !=1 and SP_ID=? ORDER BY created_at DESC LIMIT 1',
            [custid, sid]
        );


        return {
            InteractionId: InteractionId.length > 0 ? InteractionId[0]?.InteractionId : null,
            custid: custid
        };
    } catch (error) {
        console.error('Error:', error);
        return error;
    }
}
const addWAAPIDetails = async (req, res) => {
    try {
        const spid = req.body.spid
        let phoneNo = req.body?.phoneNo
        const code = req.body.Code;  // Get the authorization code from the query string
        const user_uid = req.body.user_uid
        const phoneNumber_id = req.body.phoneNumber_id
        const waba_id = req.body.waba_id
        const business_id = 329128366153270
     
        if (!code) {
            return res.status(400).send('Authorization code missing');
        }

        // Exchange the code for an access token

        const response = await axios({
            method: 'GET',
            url: `https://graph.facebook.com/v21.0/oauth/access_token`,
            params: {
                client_id: '1147412316230943', //app id
                client_secret: '44119ebcff7e1e62fb7d7e3175350aa9',
                //redirect_uri :`https://developers.facebook.com/es/oauth/callback/?business_id=${business_id}%26nonce=ZalyOc2m5QjeRKBMvqmEsEZlWn9gKb85`,
                grant_type :'authorization_code',
                code: code
            }
        });


        
        const { access_token } = response.data;
        // Store access_token for future API calls or redirect to your app
        if (response.data) {
            const isUpdated = await updateIfAlreadyExists(phoneNumber_id, waba_id);

            let result = await getQualityRatings(phoneNumber_id, access_token);
            if (result && result.response && result.response.display_phone_number) {
                const channelsMobileNumber = result.response.display_phone_number.replace(/\s+/g, '').replace('+', '');
                let querry = `UPDATE user SET mobile_number = ? WHERE uid = ?`
                await db.excuteQuery(querry, [channelsMobileNumber, user_uid]);

                let query2 = `UPDATE user SET mobile_number = 0 WHERE mobile_number = ? AND uid != ?`;
                await db.excuteQuery(query2, [channelsMobileNumber, user_uid]);

                phoneNo = channelsMobileNumber;
            }
            
            let myUTCString = new Date().toUTCString();
            const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
            let addToken = await db.excuteQuery('insert into WA_API_Details (token,spid,phoneNo,user_uid,phoneNumber_id,waba_id,created_at) VALUES(?,?,?,?,?,?,?)', [access_token, spid, phoneNo,user_uid,phoneNumber_id,waba_id, created_at])
            let addwhatsappDetails = await db.excuteQuery('insert into WhatsAppWeb (channel_id,channel_status,spid,WABA_ID,phone_number_id,is_deleted,connected_id) values(?,?,?,?,?,?,?)',['WA API',1,spid,waba_id,phoneNumber_id,0,phoneNo])
        }
        
        res.status(200).send({
            access_token: access_token,
            status: 200
        })
    } catch (err) {
        db.errlog(err);
        res.status(500).send({
            err: err,
            status: 500
        })
    }
}
async function checkIfAlreadyExist(phoneNumber_id, waba_id) {
    try {
        const query = `
            SELECT COUNT(*) AS count
            FROM WA_API_Details
            WHERE phoneNumber_id = ? AND waba_id = ?
        `;

        const result = await db.excuteQuery(query, [phoneNumber_id, waba_id]);
        return result[0]?.count > 0;
    } catch (error) {
        console.error("Error checking existence:", error);
        return false;
    }
}
async function updateIfAlreadyExists(phoneNumber_id, waba_id){
    try {
        const exists = await checkIfAlreadyExist(phoneNumber_id, waba_id);
        if (exists) {
            const query = `
                UPDATE WA_API_Details
                SET isDeleted = 1
                WHERE phoneNumber_id = ? AND waba_id = ? AND isDeleted = 0
            `;

            let r1 = await db.excuteQuery(query, [phoneNumber_id, waba_id]);
            
            const query2 = `
            UPDATE WhatsAppWeb
            SET is_deleted = 1
            WHERE phone_number_id = ? AND WABA_ID = ? AND is_deleted = 0
            `;
            let r2 = await db.excuteQuery(query2, [phoneNumber_id, waba_id]);
            return true; 
        } else {
            return false; 
        }
    } catch (error) {
        return false;
    }
}

async function getQualityRatings(phoneNumberId, access_token) {
    try {

        const response = await axios.get(`https://graph.facebook.com/v18.0/${phoneNumberId}?fields=display_phone_number,quality_rating,messaging_limit_tier`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        return {
            status: response?.status,
            response: response.data,
        };
    } catch (err) {
        return {
            status: err?.response?.status || 500,
            message: err?.message || 'An error occurred',
        };
    }
}


module.exports = {
    insertAndEditWhatsAppWeb, selectDetails, addToken, deleteToken, enableToken, selectToken,
    createInstance, getQRcode, generateQRcode, editToken, testWebhook,getQualityRating, addWAAPIDetails, addGetAPIKey, APIkeysState, saveWebhookUrl, sendMessage, saveOrUpdateWebhook, getWebhooks, deleteWebhook, testWebhooks, deleteAPIToken, exportLogs, textMessage, mediaMessage, getTemplate, getTemplateStatus
    , getSessionStatus, getContacts, deleteContacts, getUsers, getCustomFields, createContact, updateContact, createTemplatesAPI, createTemplatesWEB, createTemplatesWHAPI, sendTemplates, SendInteractiveButtons, getMessages, getBrandConfig
}