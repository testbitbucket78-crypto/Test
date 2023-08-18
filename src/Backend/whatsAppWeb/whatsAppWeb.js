var express = require("express");
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const axios = require('axios');
const val = require('./constant')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));





app.post('/create_webhook', async (req, res) => {
    try {
        console.log("web_webhook")
        let response = await axios.get('https://staging.engageflo.com/api/set_webhook?webhook_url=https://settings.sampanatechnologies.com/testwebhook&enable=true&instance_id=64C8B2ED4B951&access_token=64c4bcc7c05b1')

        const responseData = response.data;
        console.log(JSON.stringify(responseData))
        console.log(req.body)
        console.log(req.params)

    } catch (err) {
        console.log(err);
    }
})



// Create the API URL with access token as a query parameter
const apiWithAccessToken = `${val.apiUrl}?webhook_url=${encodeURIComponent(val.webhookUrl)}&enable=true&instance_id=${val.instanceId}&access_token=${val.accessToken}`;

//Make a Get request to the API endpoint using axios

axios.get(apiWithAccessToken)
    .then(response => {
        console.log('Webhook registration successful:', response.data);

    })
    .catch(error => {
        console.error('Error registering webhook:', error.message);
    });



app.get('/CreateInstance', async (req, res) => {
    try {
        let InstanceIDapi = val.baseURL + `create_instance?access_token=${val.accessToken}`
        const Instance = await axios.get(InstanceIDapi);

        // Extract the data you need from the response
        const InstanceData = Instance.data;


        res.json(InstanceData);
    } catch (err) {
        console.log(err);
        res.send(err);
    }

})

app.post('/GetQRCode', async (req, res) => {
    try {
        let QRcodeAPI = val.baseURL + `get_qrcode?instance_id=` + req.body.instance_id + `&access_token=${val.accessToken}`

        const QRcode = await axios.get(QRcodeAPI);

        const QRcodeData = QRcode.data;

        res.json(QRcodeData);
    } catch (err) {
        console.log(err);
        res.send(err);
    }
})

app.post('/SendText', async (req, res) => {
    try {
     
       
        let textAPI = val.baseURL + `send?number=` + req.body.number + `&type=text&message=` + req.body.message +`&instance_id=` + req.body.instance_id + `&access_token=${val.accessToken}`
        console.log(textAPI)
        const text = await axios.get(textAPI);
        const textData = text.data;
        console.log(textData)
        res.json(textData)

    } catch (err) {
        console.log(err);
        res.send(err);
    }
})

app.post('/SendMediaAndFile', async (req, res) => {
    try {
     

        let mediaURL=val.baseURL +`send?number=`+req.body.number +`&type=media&message=`+req.body.message+`&media_url=`+req.body.media_url+ `&filename=`+req.body.filename+`&instance_id=`+req.body.instance_id+`&access_token=${val.accessToken}`

        console.log(mediaURL)
        const media = await axios.get(mediaURL);
        const mediaData = media.data;
        console.log(mediaData)
        res.json(mediaData)


    } catch (err) {
        console.log(err);
        res.send(err);
    }
})

app.post('/SendTextMessageGroup', async (req, res) => {
    try {

        let groupTextURL=val.baseURL+`send_group?group_id=`+req.body.group_id+`&type=text&message=`+req.body.message+`&instance_id=`+req.body.instance_id+`&access_token=${val.accessToken}`;
        console.log(groupTextURL)
        let groupRes=await axios.get(groupTextURL)
        const groupData = groupRes.data;
        console.log(groupData)
        res.json(groupData)
    } catch (err) {
        console.log(err);
        res.send(err);
    }
})


app.post('/SendMediaAndFileMessageGroup', async (req, res) => {
    try {
        let groupMediaURL=val.baseURL+`send_group?group_id=`+req.body.group_id +`&type=media&message=`+req.body.message+`&media_url=`+req.body.media_url+`&filename=`+req.body.filename+`&instance_id=`+req.body.instance_id+`&access_token=${val.accessToken}`
        console.log(groupMediaURL)
        let groupMediaRes=await axios.get(groupMediaURL)
        const groupMediaData = groupMediaRes.data;
        console.log(groupMediaData)
        res.json(groupMediaData)

    } catch (err) {
        console.log(err);
        res.send(err);
    }
})


app.post('/RebootInstance', async (req, res) => {
    try {
        let rebootURL=val.baseURL+`reboot?instance_id=`+req.body.instance_id+`&access_token=${val.accessToken}`
        console.log(rebootURL)
        let rebootRes=await axios.get(rebootURL)
        const rebootData = rebootRes.data;
        console.log(rebootData)
        res.json(rebootData)
    } catch (err) {
        console.log(err);
        res.send(err);
    }
})

app.post('/ResetInstance', async (req, res) => {
    try {
     
        let resetURL=val.baseURL+`reset_instance?instance_id=`+req.body.instance_id+`&access_token=${val.accessToken}`
        console.log(resetURL)
        let resetRes=await axios.get(resetURL)
        const resetData = resetRes.data;
        console.log(resetData)
        res.json(resetData)

    } catch (err) {
        console.log(err);
        res.send(err);
    }
})

app.post('/Reconnect', async (req, res) => {
    try {
        let reconnectURL=val.baseURL+`reconnect?instance_id=`+req.body.instance_id+`&access_token=${val.accessToken}`
        console.log(reconnectURL)
        let reconnectRes=await axios.get(reconnectURL)
        const reconnectData = reconnectRes.data;
        console.log(reconnectData)
        res.json(reconnectData)

    } catch (err) {
        console.log(err);
        res.send(err);
    }
})


app.listen(3007, () => {
    console.log("Server is Running on Port : : 3007")

})


