const removeTags = require('./removeTagsFromRichTextEditor')
const http = require("https");
const axios = require('axios');
const commonFun = require('./common/resuableFunctions')
const token = 'EAAQTkLZBFFR8BOxmMdkw15j53ZCZBhwSL6FafG1PCR0pyp11EZCP5EO8o1HNderfZCzbZBZBNXiEFWgIrwslwoSXjQ6CfvIdTgEyOxCazf0lWTLBGJsOqXnQcURJxpnz3i7fsNbao0R8tc3NlfNXyN9RdDAm8s6CxUDSZCJW9I5kSmJun0Prq21QeOWqxoZAZC0ObXSOxM3pK0KfffXZC5S';
const db = require("./dbhelper");
const variables = require('./common/constant');
const Whapi = require("./webJS/whapi");
function postDataToAPI(spid, phoneNo, type, text, link, interaction_id, msg_id, spNumber) {

    return new Promise(async (resolve, reject) => {
        try {
            var phoneNumber = removePlusFromPhoneNumber(phoneNo)
            const apiUrl = 'https://waweb.stacknize.com/sendMessage'; // Replace with your API endpoint 
            const dataToSend = {
                spid: spid,
                type: type,
                link: link,
                text: text,
                phoneNo: phoneNumber,
                interaction_id: interaction_id,
                msg_id: msg_id,
                spNumber: spNumber
            };

            const response = await axios.post(apiUrl, dataToSend);
            //console.log(response)
            resolve(response.data); // Resolve with the response data
        } catch (error) {
            //console.error('Error:', error.message);
            reject(error.message); // Reject with the error
        }
    });

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

async function channelssetUp(spid, channelType, mediaType, messageTo, message_body, media, interaction_id, msg_id, spNumber) {
    try {
        var phoneNumber = removePlusFromPhoneNumber(messageTo)
        // console.log(spid, channelType, mediaType, messageTo, message_body, media)
        if (channelType == 'WhatsApp Official' || channelType == 1 || channelType == 'WA API') {

            // let WhatsAppOfficialMessage = await sendMessagesThroughWhatsAppOfficial(phoneNumber, mediaType, message_body,media)
            let WhatsAppOfficialMessage = await sendDefultMsg(media, message_body, mediaType, 211544555367892, phoneNumber, spid)
            // let NotSendedMessage = await db.excuteQuery('UPDATE Message set Message_template_id=? where Message_id=?', [WhatsAppOfficialMessage?.message?.messages[0]?.id,msg_id]); // comment due to campaign send message error have to change in Message table store place then use this
            // console.log("WhatsAppOfficialMessage")
            // console.log(WhatsAppOfficialMessage)
            return WhatsAppOfficialMessage;
        } else if (channelType == 'WhatsApp Web' || channelType == 2 || channelType == 'WA Web') {

            // let content = await removeTags.removeTagsFromMessages(message_body);

            // console.log("content middleware" ,content ,"-00098")
            let messages
            if(variables.provider === 'whapi' || variables.SPID == spid){
              messages = await Whapi.sendMessageViaWhapi(spid, phoneNumber, mediaType, message_body, media, interaction_id, msg_id, spNumber)
            }else{
              messages = await postDataToAPI(spid, phoneNumber, mediaType, message_body, media, interaction_id, msg_id, spNumber)
            }
            console.log(messages)
            return messages;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

async function sendMessagesThroughWhatsAppOfficial(phoneNumber, mediaType, message_body, media) {
    try {

        if (mediaType == 'text') {
            // console.log("text______" + message_body);
            let response = await sendTextOnWhatsApp(phoneNumber, message_body, media);
            return response;
        } else if (mediaType == 'image') {
            // console.log("image______" + message_body)
            let response = await sendMediaOnWhatsApp(phoneNumber, message_body, media);
            return response;
        }
    } catch (err) {
        console.log(" Err sendMessagesThroughWhatsAppOfficial ");
        return err;
    }
}

async function getWAdetails(spid) {
    try {
        let details = await db.excuteQuery('select * from WA_API_Details where spid=? and isDeleted !=1', [spid]);
        if (details?.length == 1) {
            return details;
        }
        return 'not exist';
    } catch (err) {
        return 'not exist';
    }
}

async function sendDefultMsg(link, caption, typeOfmsg, phone_number_id, from, spid) {  // need to get spid
    //console.log("messageData===")
    //console.log(caption)
    try {

        let WAdetails = await getWAdetails(spid);
        if(WAdetails != 'not exist'){
        const messageData = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: from,
            type: typeOfmsg,
        };

        if (typeOfmsg === 'video' || typeOfmsg === 'image' || typeOfmsg === 'document') {
            messageData[typeOfmsg] = {
                link: link,
                caption: caption
            };
        }
        if (typeOfmsg === 'text') {
            messageData[typeOfmsg] = {
                "preview_url": true,
                "body": caption
            };
        }
        //console.log(messageData)
        // Send the video message using Axios
        const response = await axios({
            method: "POST",
            url: `https://graph.facebook.com/v19.0/${WAdetails[0].phoneNumber_id}/messages?access_token=${WAdetails[0].token}`,
            data: messageData, // Use the video message structure
            headers: { "Content-Type": "application/json" },
        })
        //console.log("****META APIS****", response.data);
        return {
            status: 200,
            message: response.data
        };
    }else{
        return {
            status: 400,
            message: 'channel not found for this sp'
        };
    }
        //console.log("****META APIS****", caption);
    } catch (err) {
        // console.error("______META ERR_____", err.message);
        // return err.message;
        return {
            status:500,
            message: err.message
        };
    }

}
async function getQualityRating(phoneNumberId, spid) {
    try {
        const getDetails = await getWAdetails(spid);
        const token = getDetails?.[0]?.token;

        if (!token) {
            console.log("Error fetching business verification status")
        }

        const response = await axios.get(`https://graph.facebook.com/v18.0/${phoneNumberId}?fields=display_phone_number,quality_rating,messaging_limit_tier`, {
            headers: {
                'Authorization': `Bearer ${token}`
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
async function getVerificationStatus(WABA_ID, spid){
    try {
        const getDetails = await getWAdetails(spid);
        const token = getDetails?.[0]?.token;
        if (!token) {
            console.log("Error fetching business verification status")
        }

        const response = await axios.get(`https://graph.facebook.com/v18.0/${WABA_ID}?fields=business_verification_status`, {
            headers: {
                'Authorization': `Bearer ${token}`
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

async function registerWebhook(WABA_ID, spid) {
    try {
        const getDetails = await getWAdetails(spid);
        const token = getDetails?.[0]?.token;
        
        if (!token) {
            console.log("Error fetching business verification status");
            return { status: 400, message: "Token not found" };
        }

        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${WABA_ID}/subscribed_apps`, 
            variables.webhookRegisterPayload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            status: response?.status,
            response: response.data,
        };
    } catch (err) {
        return {
            status: err?.response?.status || 500,
            message: err?.response?.data?.error?.message || err?.message || 'An error occurred',
        };
    }
}

async function registerWhatsApp(metaPhoneNumberID, spid) {
    try {

        const getDetails = await getWAdetails(spid);
        const token =  getDetails?.[0]?.token;
        
        if (!token) {
            console.log("Error fetching business verification status");
            return { status: 400, message: "Token not found" };
        }

        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${metaPhoneNumberID}/register`, 
            variables.registerWhatsAppPayload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            status: response?.status,
            response: response.data,
        };
    } catch (err) {
        return {
            status: err?.response?.status || 500,
            message: err?.response?.data?.error?.message || err?.message || 'An error occurred',
        };
    }
}


async function sendTextOnWhatsApp(messageTo, messageText) {
    try {
        const content = await removeTags.removeTagsFromMessages(messageText);

        return new Promise((resolve, reject) => {
            const req = http.request(WHATSAPPOptions, (res) => {
                let chunks = [];

                // Collect data chunks
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                // On end of the response, process the complete body
                res.on('end', () => {
                    const body = Buffer.concat(chunks);
                    const bodyString = body.toString();

                    try {
                        const jsonResponse = JSON.parse(bodyString);
                        resolve({ status: 200, data: jsonResponse }); // Resolve with status 200
                    } catch (error) {
                        reject({ status: 500, error: `Error parsing JSON: ${error.message}` });
                    }
                });

                // Handle response errors
                res.on('error', (error) => {
                    reject({ status: 500, error: `Response error: ${error.message}` });
                });
            });

            // Handle request errors
            req.on('error', (error) => {
                reject({ status: 500, error: `Request error: ${error.message}` });
            });

            // Write the request body and end the request
            const requestBody = JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: messageTo,
                type: "text",
                text: { body: content }
            });
            req.write(requestBody);
            req.end();
        });
    } catch (error) {
        // Return error with status 500
        return { status: 500, error: `Error in sendTextOnWhatsApp: ${error.message}` };
    }


}


async function sendMediaOnWhatsApp(messageTo, mediaFile, media) {
    // var reqBH = http.request(WHATSAPPOptions, (resBH) => {
    //     var chunks = [];
    //     resBH.on("data", function (chunk) {
    //         chunks.push(chunk);
    //     });
    //     resBH.on("end", function () {
    //         const body = Buffer.concat(chunks);

    //     });
    // });

    // reqBH.write(JSON.stringify({
    //     "messaging_product": "whatsapp",
    //     "recipient_type": "individual",
    //     "to": messageTo,
    //     "type": "image",
    //     "image": {
    //         "link": mediaFile
    //     }
    // }));
    // reqBH.end();

    return new Promise((resolve, reject) => {
        const reqBH = http.request(WHATSAPPOptions, (resBH) => {
            let chunks = [];

            resBH.on('data', (chunk) => {
                chunks.push(chunk);
            });

            resBH.on('end', () => {
                const body = Buffer.concat(chunks);
                const bodyString = body.toString();

                try {
                    const jsonResponse = JSON.parse(bodyString);
                    resolve({ status: 200, data: jsonResponse }); // Resolve with status 200
                } catch (error) {
                    reject({ status: 500, error: `Error parsing JSON: ${error.message}` });
                }
            });

            resBH.on('error', (error) => {
                reject(error); // Reject with the error if there's an issue
            });
        });

        reqBH.write(JSON.stringify({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": messageTo,
            "type": "image",
            "image": {
                "link": media,
                "caption": mediaFile
            }
        }));
        reqBH.end();

        reqBH.on('error', (error) => {
            reject(error); // Handle errors with the request itself
        });
    });


}

const WHATSAPPOptions = {
    "method": "POST",
    "hostname": 'graph.facebook.com',
    "path": "/v19.0/211544555367892/messages",
    "headers": {
        "Authorization": 'Bearer EAAQTkLZBFFR8BOxmMdkw15j53ZCZBhwSL6FafG1PCR0pyp11EZCP5EO8o1HNderfZCzbZBZBNXiEFWgIrwslwoSXjQ6CfvIdTgEyOxCazf0lWTLBGJsOqXnQcURJxpnz3i7fsNbao0R8tc3NlfNXyN9RdDAm8s6CxUDSZCJW9I5kSmJun0Prq21QeOWqxoZAZC0ObXSOxM3pK0KfffXZC5S',
        "Content-Type": "application/json",
    }

};



async function createWhatsAppPayload(type, to, templateName, languageCode, headerVariables = [], bodyVariables, mediaLink, spid, button = [], DynamicURLToBESent = []) {
    try{
    let WAdetails = await getWAdetails(spid);
    let Ln_code = commonFun.getCodeByLabel(languageCode);
    let payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: Ln_code
            },
            components: []
        }
    };

    if (type === 'text') {
        let components = [];

        if (headerVariables.length > 0) {
            components.push({
                type: "header",
                parameters: headerVariables.map(variable => ({
                    type: "text",
                    text: variable
                }))
            });
        }

        if (bodyVariables.length > 0) {
            components.push({
                type: "body",
                parameters: bodyVariables.map(variable => ({
                    type: "text",
                    text: variable
                }))
            });
        }

        payload.template.components = components;
    } else if (['image', 'video', 'document'].includes(type)) {
        let headerComponent = {
            type: "header",
            parameters: [{
                type: type,
                [type]: { link: mediaLink }
            }]
        };

        if (bodyVariables.length > 0) {
            payload.template.components = [
                headerComponent,
                {
                    type: "body",
                    parameters: bodyVariables.map(variable => ({
                        type: "text",
                        text: variable
                    }))
                }
            ];
        } else {
            payload.template.components = [headerComponent];
        }
    }
    if (button.length > 0) {
        let buttonComponents = button.map((btn,idx) => {
            if (btn?.type === 'Copy offer Code') {
                return {
                    type: "button",
                    sub_type: "copy_code",
                    index: idx,
                    parameters: [
                        {
                            type: "coupon_code",
                            coupon_code: btn.code
                        }
                    ]
                };
            }
            if (btn.webType === 'Dynamic' && DynamicURLToBESent[idx]) {
                return {
                    type: "button",
                    sub_type: "url",
                    index: idx,
                    parameters: [
                        {
                            type: "text",
                            text: DynamicURLToBESent[idx].trim()
                        }
                    ]
                };
            }
            if (btn.type === 'Complete Flow') {
                let flowToken = {                    
                    custom_info:btn.flowId
                }
                console.log("payload-------3   -------------", flowToken);
                return {
                    type: "button",
                    sub_type: "flow",
                    index: idx,
                    parameters: [
                        {
                            type: "action",
                            action: {
                                flow_token: JSON.stringify(flowToken)
                            }
                        }
                    ]
                };
            }
        }).filter(Boolean);

        if (buttonComponents.length > 0) {
            if (!payload.template.components) {
                payload.template.components = [];
            }
            payload.template.components = [...payload.template.components, ...buttonComponents];
            
        }
    }
console.log("payload", payload.template.components);

    const response = await axios({
        method: "POST",
        url: `https://graph.facebook.com/v19.0/${WAdetails[0].phoneNumber_id}/messages?access_token=${WAdetails[0].token}`,
        data: payload, // Use the video message structure
        headers: { "Content-Type": "application/json" },
    })
    console.log("****META APIS****",payload );
    return {
        status: 200,
        message: response.data
    };
   // return payload;
}catch(err){
    console.log("error", err.response ? err.response.data : err.message);
    return {
        status: 500,
        message: err.message
    };
}
}

function simpleEncrypt(number, key = 12345) {
    const numStr = String(number);
    const masked = Array.from(numStr).map((digit) => {
      return String(parseInt(digit) ^ (key % 10));
    }).join('');
    console.log(numStr,'numStr');
    console.log(masked,'masked');
    const obfuscated = Array.from(masked).map(char => {
      return String(char.charCodeAt(0) + 10); // shift char codes
    }).join('-'); // simple delimiter
    return obfuscated;
  }

// const headerVariables = ['Header Text']; // Variables for header in 'text' type
// const bodyVariables = ['Body Text 1', 'Body Text 2'];

// const payload = createWhatsAppPayload('text', '918130818921', 'cip_attribute', 'en', headerVariables, bodyVariables, 'https://picsum.photos/id/1/200/300');
// console.log(JSON.stringify(payload, null, 2));

module.exports = { channelssetUp, postDataToAPI, sendDefultMsg, createWhatsAppPayload,getQualityRating,getVerificationStatus, registerWebhook, registerWhatsApp }