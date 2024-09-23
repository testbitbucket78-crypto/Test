var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const notification = async (req, res) => {
    try {
        let notifications = await db.excuteQuery(val.selectNotification, [req.params.spid, req.params.uid]);
        res.status(200).send({
            notifications: notifications,
            status: 200
        })

    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}
 const update = async (req, res) => {
    const spId = req.params.spid;
    const uid = req.params.uid;
    try {
        let notifications = await db.excuteQuery(
            val.updateNotifications,
            [spId, uid]
        );
        res.status(200).send({
            notifications: notifications,
            status: 200
        });

    } catch (err) {
        console.log(err);
        db.errlog(err);
        res.status(500).send(err);
    }

 }

module.exports = { notification, update }