const express = require('express')
const web = require('./web')
// const path = require('path');
//const InMessage = require('../IncommingMessages')
var app = express();
const cors = require('cors')
app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
const fs = require('fs')
const path = require('path');
// const { MessageMedia, Location, Contact } = require('whatsapp-web.js');
app.get('/get', (req, res) => {
    res.send("webjs is working")
})

app.post('/craeteQRcode', async (req, res) => {

    try {
        console.log("get")
        spid = req.body.spid;
        phoneNo = req.body.phoneNo
        onevent=req.body.onevent
   
            let response = await web.createClientInstance(spid, phoneNo,onevent);
            res.send({
                status: response.status,
                QRcode: response.value
            })

    } catch (err) {
        console.log(err);

    }
})

app.post('/sendMessage', async (req, res) => {
    try {
        spid = req.body.spid
        type = req.body.type
        link = req.body.link
        text = req.body.text
        phoneNo = req.body.phoneNo
        interaction_id=req.body.interaction_id,
        msg_id=req.body.msg_id
        let response = await web.sendMessages(spid, phoneNo, type, text, link,interaction_id,msg_id);
        console.log(response)
        return res.send({ status: response })

    } catch (err) {
        console.log(err);
        return res.send({ status: 500 })
    }
})




app.listen(3009, () => {
    console.log("Server is Running on Port : : 3009")
    console.log( path.join(__dirname, '.wwebjs_auth'))
    //fs.unlinkSync(path.join(__dirname, '.wwebjs_auth'))
    fs.rmdirSync( path.join(__dirname, '.wwebjs_auth\\session-10'), { recursive: true })
})