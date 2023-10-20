const express = require('express')
 const web = require('./web')
// const path = require('path');
//const InMessage = require('../IncommingMessages')
var app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
// const { MessageMedia, Location, Contact } = require('whatsapp-web.js');
app.get('/get',(req,res)=>{
    res.send("webjs is working")
})

app.post('/craeteQRcode', async (req, res) => {

    try {
        console.log("get")
        spid = req.body.spid;
        let response = await web.createClientInstance(spid);
        res.send({
            status: 200,
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
        let response = await web.sendMessages(spid, phoneNo, type, text, link);
    
       return res.send({ status: 200})

    } catch (err) {
        console.log(err);
        return res.send({ status: 500})
    }
})





app.listen(3009, () => {
    console.log("Server is Running on Port : : 3009")

})