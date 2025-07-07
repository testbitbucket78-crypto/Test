const variables = {
    ENV_URL: {
        auth: 'https://authapi.stacknize.com', //http://localhost:3003 https://authapi.stacknize.com
        waweb: 'https://waweb.stacknize.com',//https://waweb.stacknize.com  http://localhost:3009
        contacts: 'https://contactapi.stacknize.com', // https://contactapi.stacknize.com
        settings: 'https://settings.stacknize.com', // https://settings.stacknize.com http://localhost:3003
    },
    WHAPI_URL:{
        gate_api: 'https://gate.whapi.cloud'
    },
    webhookRegisterPayload: {
        callback_url: 'https://call.stacknize.com/webhook',
        verify_token: 'raunak',
    },
    registerWhatsAppPayload: {
        messaging_product: 'whatsapp',
        pin: '123456',
    },
    webhookPayload : {
        webhooks: [
            {
                events: [
                    { type: "users", method: "post" },
                    { type: "channel", method: "post" }
                ],
                mode: "body",
                url: ""
            }
        ],
        callback_persist: true
    },
    provider: "webJS", // webJS or whapi
    SPID : "847",
    webhookSPIDs : ['847','91','159','55','163','1055','1068']
};


module.exports = variables;