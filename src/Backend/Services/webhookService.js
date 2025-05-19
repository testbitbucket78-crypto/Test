//const ServiceModel = require('../Services/ServiceModel') //  todo need to make a model if needed.
const { Webhooks } = require('../settings/model/accountModel');
var axios = require('axios');

async function webhookService(spid, eventType, payload) {
    try{
        const webhook = new Webhooks({spid}); 
        let webhookDetails = await webhook.getWebhookDetails();
        webhookDetails.forEach(details => {
            details?.eventType.forEach(async(e) => {
                if(e == eventType){ 
                try {
                    const response = await axios.post(details.url, payload, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    console.log(response);

                } catch (err) {
                  console.log(err, "Not able to ping webhook url") 
                }
                }
            })
        });
    } catch(err){
       console.log(err, "While sending the webhook response we got an error")
    }
   
}

module.exports = { webhookService }
  