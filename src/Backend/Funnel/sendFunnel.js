const cron = require('node-cron');
const db = require('../dbhelper');
var express = require("express");
var app = express();
const val = require('./constant');
const webjs = require('../webJS/web')
const middleWare = require('./funnelMiddleWare')
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));



async function ScheduledFunnels(spid, phoneNo, OptInStatus, created_at, updated_at, IsAddFunnel) {
    try {
        var funnelData = await db.excuteQuery(`select * from Funnel where status=1 and is_deleted != 1 and sp_id=?`, [spid])

        for (const funnel of funnelData) {
            console.log("funnel.new_contact != ", funnel.new_contact)
            if ((((funnel.new_contact != "") || (funnel.attribute_update != "")) && IsAddFunnel == 0) || IsAddFunnel == 1) {
                funnelMessages(funnel, phoneNo, OptInStatus, created_at, updated_at)
            }
        }

    } catch (err) {
        console.log(err)
    }

}

// this is for funnel conditions
async function funnelSuccessCondition(success, phoneNo) {
    try {
        let succesQuery = success + ` and  Phone_number = ${phoneNo}`;
        let result = await db.excuteQuery(succesQuery, []);
        if (result?.length) {
            return true;
        }
        return false;
    } catch (err) {
        console.log("funnelSuccessCondition")
    }
}

async function funnelFailureConditions(fail, phoneNo) {
    try {
        let failQuery = fail + ` and  Phone_number = ${phoneNo}`;
        let result = await db.excuteQuery(failQuery, []);
        if (result?.length) {
            return true;
        }
        return false;
    } catch (err) {
        console.log("funnelFailureConditions")
    }
}

async function updateFunnel(funnel,status) {
    try {
        let updatedStatus = await db.excuteQuery(`UPDATE FunnelSendedMessage SET status =${status} where id=${funnel.id}`, [])
      

    } catch (err) {
        console.log("updateFunnel")
    }
}

async function funnelMessages(funnel, phoneNo, OptInStatus, created_at, updated_at) {
    try {
        let messageQuery = 'select * from FunnelMessages where  FunnelId=?  and sp_id=? and isDeleted !=1';

        let messages = await db.excuteQuery(messageQuery, [funnel.FunnelId, funnel.sp_id]);
        let nextTime = new Date(updated_at);   // created_at = updated_at in addition time

        const ScheduledMinutes = parseInt(messages[0]?.scheduled_min, 10);
        const secondNextTime = new Date(nextTime.getTime() + ScheduledMinutes * 60 * 1000);

        // Set the next timestamp for sending the second message
        const secondNextTimestamp = secondNextTime.getTime();
        let next_messageTime = new Date(secondNextTimestamp);
        //console.log(OptInStatus == funnel.optIn, funnel.multipleEntry != 1, "979****07", OptInStatus, funnel.optIn)
        if (funnel.multipleEntry != 1) {
            console.log("IF____________________________")
            let existingMessage = await track_sendedFunnel(funnel, phone_number)
            if (!(existingMessage?.length)) {

                saveFunnelSendedMessage(messages[0], phoneNo, '-1', next_messageTime, '1')
            }
        } else {
            console.log("else___________________________")
            if (OptInStatus == funnel.optIn) {

                saveFunnelSendedMessage(messages[0], phoneNo, '-1', next_messageTime, '1', funnel.channel_id)
            }
        }

    } catch (err) {
        console.log(err)
    }
}


async function saveFunnelSendedMessage(msg, phoneNo, status, next_messageTime, messageNo, channel) {
    try {

        let funnalQuery = 'Insert into FunnelSendedMessage(Message_id,FunnelId,phone_number,message_content,message_media,message_heading,button_yes,button_exp,button_no,status,next_messageTime,messageNo,sp_id,created_at,channel) values ?';
        let values = [[msg.Message_id, msg.FunnelId, phoneNo, msg.message_content, msg.message_media, msg.message_heading, msg.button_yes, msg.button_exp, msg.button_no, status, next_messageTime, messageNo, msg.sp_id, new Date(), channel]]
        let savemessage = await db.excuteQuery(funnalQuery, [values])

    } catch (err) {

        console.log(err)
    }

}


async function track_sendedFunnel(funnel, phone_number) {
    try {
        let sendedmsgQuery = 'SELECT * FROM FunnelSendedMessage where Message_id=? and FunnelId=? and phone_number=? and sp_id=?';
        let maxMessage = await db.excuteQuery(sendedmsgQuery, [funnel.Message_id, funnel.FunnelId, phone_number, funnel.sp_id]);

        return maxMessage;

    } catch (err) {
        console.log(err);
    }

}


module.exports = { ScheduledFunnels }