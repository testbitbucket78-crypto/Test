const { WebhookLog, logData } = require('./ServiceModel')
const { Webhooks } = require('../settings/model/accountModel');
var axios = require('axios');

async function dispatchWebhookEvent(spid, eventType, payload) {
    try{
        const webhook = new Webhooks({spid}); 
        let webhookDetails = await webhook.getWebhookDetails();
        webhookDetails.forEach(details => {
            if (details?.isEnabled){
            details?.eventType.forEach(async(e) => {
             if(e == eventType){ 

                    const logDataInstance = new logData({
                        spid,
                        eventType,
                        url: details.url,
                        payload
                      });

                try {
                    const response = await axios.post(details.url, payload, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    logDataInstance.statusCode = response.status;
                    logDataInstance.responseBody = response.data;
                    logDataInstance.success = true;
                    console.log(response);

                } catch (err) {
                    logDataInstance.error = err?.message;
                    logDataInstance.success = false;
                    console.log(err, "Not able to ping webhook url") 
                }

                const log = new WebhookLog(logDataInstance);
                await log.saveToDatabase();

                }
            })
        }
        });
    } catch(err){
       console.log(err, "While sending the webhook response we got an error")
    }
   
}

module.exports = { dispatchWebhookEvent };
  