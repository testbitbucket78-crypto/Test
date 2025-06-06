const variables = {
    ENV_URL: {
        auth: 'https://authapi.stacknize.com',
        waweb: 'https://waweb.stacknize.com',
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
    webhookSPIDs : ['847','91','159','55','163','1055']
};


module.exports = variables;