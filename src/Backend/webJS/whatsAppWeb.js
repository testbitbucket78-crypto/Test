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
const { exec } = require('child_process');
// const { MessageMedia, Location, Contact } = require('whatsapp-web.js');
app.get('/get', (req, res) => {
    res.send("webjs is working")
})

app.post('/craeteQRcode', async (req, res) => {

    try {
        console.log("get")
        spid = req.body.spid;
        phoneNo = req.body.phoneNo


        let response = await web.createClientInstance(spid, phoneNo);
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
        interaction_id = req.body.interaction_id,
            msg_id = req.body.msg_id
            spNumber = req.body?.spNumber
        let response = await web.sendMessages(spid, phoneNo, type, text, link, interaction_id, msg_id,spNumber);
        return res.send({ status: response })

    } catch (err) {
        console.log(err);
        return res.send({ status: 500 })
    }
})


app.post('/IsClientReady', (req, res) => {
    try {
        spid = req.body.spid

        console.log(web.isActiveSpidClient(spid))
        if (web.isActiveSpidClient(spid)) {
            res.send({ status: 200, message: "Client is ready !" })
        } else {
            res.send({ status: 404, message: "Please go to settings and Scan the QR Code !" })
        }


    } catch (err) {
        res.send({ status: 500, err: err })
    }
})

app.listen(3009, () => {
     console.log("Server is Running on Port : : 3009");
    //     // Replace 'chrome' with the actual process name if needed
    //     const processName = 'chrome';

    //     // Command to kill all processes with the given name
    //     const killCommand = `killall ${processName}`;
        
    //     exec(killCommand, (error, stdout, stderr) => {
    //       if (error) {
    //         console.error(`Error killing processes: ${error.message}`);
    //         return;
    //       }
        
    //       if (stderr) {
    //         console.error(`Error output: ${stderr}`);
    //         return;
    //       }
        
    //       console.log(`Successfully killed Chromium processes:\n${stdout}`);
    //     });
        
    // console.log(path.join(__dirname, '.wwebjs_auth'))
    // var dir = path.join(__dirname, '.wwebjs_auth');
    // try {
    //     if (fs.existsSync(dir)) {
    //         console.log("dir found");
    //         fs.readdirSync(dir).forEach(f => {
    //             if(f.indexOf("session-") >-1 && fs.existsSync(path.join(dir,f,"Default/Service Worker")))
    //             {
    //                 console.log("Deleting : "+ path.join(dir,f,"Default/Service Worker"));
    //                 fs.rmdirSync(path.join(dir,f,"Default/Service Worker"), { recursive: true });
    //             }});
    //     }
    // }
    // catch (err) {
    //     console.log(err);
    //     console.log("error while deleting cached sessions. Please delete manually from within " + dir + " and restart the server")
    // }

})

//server.timeOut = 180000; // 3 minute 3*60*1000 min*sec*millisec