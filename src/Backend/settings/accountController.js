var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const awsHelper = require('../awsHelper')
const cors = require('cors')
const moment = require('moment');
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
const fs = require('fs');
const path = require('path');
const axios = require('axios');



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
        console.log("testWebhook");
        res.status(200).send({
            msg: "testwebhook ! ",
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const addWAAPIDetails = async (req, res) => {
    try {
        const spid = req.body.spid
        const phoneNo = req.body?.phoneNo
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
                redirect_uri :`https://developers.facebook.com/es/oauth/callback/?business_id=${business_id}%26nonce=ZalyOc2m5QjeRKBMvqmEsEZlWn9gKb85`,
                grant_type :'authorization_code',
                code: code
            }
        });

        const { access_token } = response.data;
        // Store access_token for future API calls or redirect to your app
        if (response.data) {
            let myUTCString = new Date().toUTCString();
            const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
            let addToken = await db.excuteQuery('insert into WA_API_Details (token,spid,phoneNo,user_uid,phoneNumber_id,waba_id,created_at) VALUES(?,?,?)', [access_token, spid, phoneNo,user_uid,phoneNumber_id,waba_id, created_at])
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

module.exports = {
    insertAndEditWhatsAppWeb, selectDetails, addToken, deleteToken, enableToken, selectToken,
    createInstance, getQRcode, generateQRcode, editToken, testWebhook, addWAAPIDetails
}