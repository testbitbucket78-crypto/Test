const teamboxController = require('./Authentication/TeamBoxController');
const http = require("https");
const accessToken = '64c4bcc7c05b1';
const baseURL='https://staging.engageflo.com/api/'


function removePlusFromPhoneNumber(phoneNumber) {
    if (phoneNumber.includes("+")) {
        return phoneNumber.replace(/\+/g, "");
    }
    return phoneNumber;
}

async function channelssetUp(channelType, mediaType, messageTo, message_body) {
    var phoneNumber=removePlusFromPhoneNumber(messageTo)
    console.log(phoneNumber)
    if (channelType == 'WhatsApp Official') {
        if (mediaType == 'text') {
            console.log("text______" + message_body);
            sendTextOnWhatsApp(phoneNumber, message_body);
        } else if (mediaType == 'image') {
            console.log("image______" + message_body)
            sendMediaOnWhatsApp(phoneNumber, message_body)
        }
       // let WhatsAppOfficialMessage=await sendMessagesThroughWhatsAppOfficial(phoneNumber,mediaType,message_body)

    } else if (channelType == 'WhatsApp Web') {
        if (mediaType == 'text') {
            console.log("text ........")
          let message= await removeTagsFromMessages(message_body)
            let textAPI = baseURL + `send?number=` + phoneNumber + `&type=text&message=` + message + `&instance_id=` + '64D1F60FA644B' + `&access_token=64c4bcc7c05b1`
            console.log(textAPI)
            const text = await axios.get(textAPI);
        } else if (mediaType == 'image') {
            console.log("image ........")
            let mediaURL = baseURL + `send?number=` + phoneNumber + `&type=media&message=` + 'message_body_img' + `&media_url=` + message_body + `&filename=` + 'req.body.filename' + `&instance_id=` + '64D1F60FA644B' + `&access_token=64c4bcc7c05b1`

            console.log(mediaURL)
            const media = await axios.get(mediaURL);
        }
     //   let whatsAppWeb=await sendMessagesThroughWhatsAppWeb(phoneNumber,mediaType,message_body);
    }
}

async function sendMessagesThroughWhatsAppOfficial(){
    if (mediaType == 'text') {
        console.log("text______" + message_body);
        sendTextOnWhatsApp(phoneNumber, message_body);
    } else if (mediaType == 'image') {
        console.log("image______" + message_body)
        sendMediaOnWhatsApp(phoneNumber, message_body)
    }
}



async function sendMessagesThroughWhatsAppWeb(){
    if (mediaType == 'text') {
        console.log("text ........")
      let message= await removeTagsFromMessages(message_body)
        let textAPI = baseURL + `send?number=` + phoneNumber + `&type=text&message=` + message + `&instance_id=` + '64D1F60FA644B' + `&access_token=64c4bcc7c05b1`
        console.log(textAPI)
        const text = await axios.get(textAPI);
    } else if (mediaType == 'image') {
        console.log("image ........")
        let mediaURL = baseURL + `send?number=` + phoneNumber + `&type=media&message=` + 'message_body_img' + `&media_url=` + message_body + `&filename=` + 'req.body.filename' + `&instance_id=` + '64D1F60FA644B' + `&access_token=64c4bcc7c05b1`

        console.log(mediaURL)
        const media = await axios.get(mediaURL);
    }
}


async function removeTagsFromMessages(message_body){
    let content = message_body;
    if (content) {
        content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
        content = content.replace(/<strong[^>]*>/g, '*').replace(/<\/strong>/g, '*');
        content = content.replace(/<em[^>]*>/g, '_').replace(/<\/em>/g, '_');
        content = content.replace(/<span*[^>]*>/g, '~').replace(/<\/span>/g, '~');
        content = content.replace('&nbsp;', '\n')
        content = content.replace(/<br[^>]*>/g, '\n')
        content = content.replace(/<\/?[^>]+(>|$)/g, "")

    }
    return content;
}

async function sendTextOnWhatsApp(messageTo, messateText) {
    let content = await removeTagsFromMessages(messateText);
 

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


function sendMediaOnWhatsApp(messageTo, mediaFile) {
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
        "type": "image",
        "image": {
            "link": mediaFile
        }
    }));
    reqBH.end();

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



module.exports = { channelssetUp }