const teamboxController = require('./Authentication/TeamBoxController');
const http = require("https");
const axios = require('axios');
const token = 'EAAU0g9iuku4BOzSD75ynSUzKSsYrIWv3qkEa9QPAnUNTUzPwN5aTjGxoAHxsXF4Nlrw8UxbMGqZBxqarODf2sY20MvFfTQm0umq4ZBKCpFAJdcPtbcYSZBsHMqYVwjfFPiQwFk1Rmadl4ctoncnxczMGJZALoVfZBpqoQ0lYHzOwbRb1nvImzhL4ex53c9HKVyzl2viy4EhLy9g0K';

async function postDataToAPI(spid,phoneNo,type,text,link) {
    try {
        
      const apiUrl = 'https://waweb.sampanatechnologies.com/craeteQRcode'; // Replace with your API endpoint
      const dataToSend = {
        spid : spid,
        type : type,
        link : link,
        text : text,
        phoneNo :phoneNo
      };
  console.log("dataToSend")
  console.log("")
  console.log(dataToSend)
      const response = await axios.post(apiUrl, dataToSend);
  
   
      console.log('Response from API:', response.data);
    } catch (error) {
    
      console.error('Error:', error.message);
    }
  }


function removePlusFromPhoneNumber(phoneNumber) {
    if (phoneNumber.includes("+")) {
        return phoneNumber.replace(/\+/g, "");
    }
    return phoneNumber;
}

async function channelssetUp(spid,channelType, mediaType, messageTo, message_body,media) {
    try{
    var phoneNumber=removePlusFromPhoneNumber(messageTo)
    console.log(phoneNumber)
    if (channelType == 'WhatsApp Official') {
       
        let WhatsAppOfficialMessage=await sendMessagesThroughWhatsAppOfficial(phoneNumber,mediaType,message_body)
console.log("WhatsAppOfficialMessage")
console.log(WhatsAppOfficialMessage)
    } else if (channelType == 'WhatsApp Web') {
      
      let content = await removeTagsFromMessages(message_body);
   
    let messages=await postDataToAPI(spid,phoneNumber,mediaType,content,media) 
    console.log(messages)
    }
}catch(err){
    console.log(err);
}
}

async function sendMessagesThroughWhatsAppOfficial(phoneNumber,mediaType,message_body){
    try{
       
    if (mediaType == 'text') {
        console.log("text______" + message_body);
        sendTextOnWhatsApp(phoneNumber, message_body);
    } else if (mediaType == 'image') {
        console.log("image______" + message_body)
        sendMediaOnWhatsApp(phoneNumber, message_body)
    }
}catch(err){
        console.log(err);
    }
}

async function sendDefultMsg(link, caption, typeOfmsg, phone_number_id, from) {
    //console.log("messageData===")
    console.log(caption)
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
      });
  
     //console.log("****META APIS****", caption);
    } catch (err) {
    //  console.error("______META ERR_____", err);
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



module.exports = { channelssetUp,postDataToAPI,removeTagsFromMessages ,sendDefultMsg}