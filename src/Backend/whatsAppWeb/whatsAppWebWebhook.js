var express = require("express");
var app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/sendMedia', (req, res) => {
    try {
        console.log("Send Media Post API's Running");
        res.send(200).status({
            msg: "Check webhook is working or not",
            status: 200
        })
    } catch (err) {
        console.log(err)
    }
})

app.listen(3006, () => {
    console.log("Server is Running on Port : : 3006")
})