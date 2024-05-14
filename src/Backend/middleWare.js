const teamboxController = require('./Authentication/TeamBoxController');
const removeTags = require('./removeTagsFromRichTextEditor')
const http = require("https");
const axios = require('axios');
const token = 'EAAU0g9iuku4BOzSD75ynSUzKSsYrIWv3qkEa9QPAnUNTUzPwN5aTjGxoAHxsXF4Nlrw8UxbMGqZBxqarODf2sY20MvFfTQm0umq4ZBKCpFAJdcPtbcYSZBsHMqYVwjfFPiQwFk1Rmadl4ctoncnxczMGJZALoVfZBpqoQ0lYHzOwbRb1nvImzhL4ex53c9HKVyzl2viy4EhLy9g0K';

function postDataToAPI(spid, phoneNo, type, text, link,interaction_id, msg_id,spNumber) {
 
    return new Promise(async (resolve, reject) => {
        try {
            var phoneNumber = removePlusFromPhoneNumber(phoneNo)
            const apiUrl = 'https://waweb-staging.stacknize.com/sendMessage'; // Replace with your API endpoint
            const dataToSend = {
                spid: spid,
                type: type,
                link: link,
                text: text,
                phoneNo: phoneNumber,
                interaction_id:interaction_id,
                msg_id:msg_id,
                spNumber:spNumber
            };

            const response = await axios.post(apiUrl, dataToSend);
            resolve(response.data); // Resolve with the response data
        } catch (error) {
            console.error('Error:', error.message);
            reject(error.message); // Reject with the error
        }
    });

}


function removePlusFromPhoneNumber(phoneNumber) {
    if (phoneNumber.includes("+")) {
        return phoneNumber.replace(/\+/g, "");
    }
    return phoneNumber;
}

async function channelssetUp(spid, channelType, mediaType, messageTo, message_body, media,interaction_id,msg_id,spNumber) {
    try {
        var phoneNumber = removePlusFromPhoneNumber(messageTo)
       // console.log(spid, channelType, mediaType, messageTo, message_body, media)
        if (channelType == 'WhatsApp Official' || channelType == 1) {

            let WhatsAppOfficialMessage = await sendMessagesThroughWhatsAppOfficial(phoneNumber, mediaType, message_body,media)
            // console.log("WhatsAppOfficialMessage")
            // console.log(WhatsAppOfficialMessage)
            return WhatsAppOfficialMessage;
        } else if (channelType == 'WhatsApp Web' || channelType == 2) {

           // let content = await removeTags.removeTagsFromMessages(message_body);

           // console.log("content middleware" ,content ,"-00098")
            let messages = await postDataToAPI(spid, phoneNumber, mediaType, message_body, media,interaction_id,msg_id,spNumber)
             console.log(messages)
            return messages;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

async function sendMessagesThroughWhatsAppOfficial(phoneNumber, mediaType, message_body,media) {
    try {

        if (mediaType == 'text') {
            // console.log("text______" + message_body);
          let response= await sendTextOnWhatsApp(phoneNumber, message_body,media);
          return response;
        } else if (mediaType == 'image') {
            // console.log("image______" + message_body)
            let response= await sendMediaOnWhatsApp(phoneNumber, message_body,media);
            return response;
        }
    } catch (err) {
        console.log(" Err sendMessagesThroughWhatsAppOfficial ");
        return err;
    }
}

async function sendDefultMsg(link, caption, typeOfmsg, phone_number_id, from) {
    //console.log("messageData===")
    //console.log(caption)
    try {

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
            url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages?access_token=${token}`,
            data: messageData, // Use the video message structure
            headers: { "Content-Type": "application/json" },
        })
        return response.data
        //console.log("****META APIS****", caption);
    } catch (err) {
        //  console.error("______META ERR_____", err);
        return err.message;
    }

}




async function sendTextOnWhatsApp(messageTo, messateText) {
    let content = await removeTags.removeTagsFromMessages(messateText);


    var reqBH = http.request(WHATSAPPOptions, (resBH) => {
        var chunks = [];
        resBH.on("data", function (chunk) {
            chunks.push(chunk);
        });
        resBH.on("end", function () {
            const body = Buffer.concat(chunks);
        });
    });

    reqBH.write(JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": messageTo,
        "type": "text",
        "text": {
            "body": content
        }
    }));
    reqBH.end();

}


async function sendMediaOnWhatsApp(messageTo, mediaFile,media) {
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
            resolve('Message Sent'); // Resolve with the response body
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
            "caption":mediaFile
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
    "path": "/v16.0/101714466262650/messages",
    "headers": {
        "Authorization": 'Bearer EAAU0g9iuku4BOzSD75ynSUzKSsYrIWv3qkEa9QPAnUNTUzPwN5aTjGxoAHxsXF4Nlrw8UxbMGqZBxqarODf2sY20MvFfTQm0umq4ZBKCpFAJdcPtbcYSZBsHMqYVwjfFPiQwFk1Rmadl4ctoncnxczMGJZALoVfZBpqoQ0lYHzOwbRb1nvImzhL4ex53c9HKVyzl2viy4EhLy9g0K',
        "Content-Type": "application/json",
    }

};



module.exports = { channelssetUp, postDataToAPI, sendDefultMsg }