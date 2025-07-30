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
                    // const response = await axios.post(details.url, payload, { todo deprecated 
                    //     headers: {
                    //         'Content-Type': 'application/json',
                    //     },
                    // });

                    const { response, retryCount } = await postWithRetry(details.url, payload, {
                        'Content-Type': 'application/json'
                    });

                    logDataInstance.statusCode = response.status;
                    logDataInstance.responseBody = response.data;
                    logDataInstance.success = true;
                    logDataInstance.retryCount = retryCount;

                } catch (err) {
                    logDataInstance.error = err?.message;
                    logDataInstance.success = false;
                    logDataInstance.retryCount = retryCount;
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


async function postWithRetry(url, payload, headers, maxRetries = 3, delay = 1000) {
  let attempt = 0;
  let lastError;

  while (attempt < maxRetries) {
    try {
      const response = await axios.post(url, payload, { headers });
      return { response, retryCount: attempt };
    } catch (error) {
      lastError = error;
      attempt++;
      if (attempt < maxRetries) {
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }

  throw { error: lastError, retryCount: attempt };
}


module.exports = { dispatchWebhookEvent };
  