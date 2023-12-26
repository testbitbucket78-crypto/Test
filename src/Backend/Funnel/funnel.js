var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/createContactList', async (req, res) => {
    try {
        var inserQuery = "INSERT INTO ContactList (SP_id,created_by,filters,contact_id_list,list_name) VALUES  (" + req.body.SP_ID + "," + req.body.created_by + ",'" + req.body.filters + "','" + req.body.contact_id_list + "','" + req.body.list_name + "')";
        let ContactList = await db.excuteQuery(inserQuery, []);
        res.send({
            status: 200,
            ContactList: ContactList
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})

app.post('/editContactList', async (req, res) => {
    try {
        var updateQueryQuery = "UPDATE ContactList SET filters ='" + req.body.filters + "',";
        updateQueryQuery += " contact_id_list ='" + req.body.contact_id_list + "',"
        updateQueryQuery += " updated_at ='" + new Date().toISOString().slice(0, 19).replace('T', ' ') + "'"

        updateQueryQuery += " WHERE Id =" + req.body.Id
        let updatedContactList = await db.excuteQuery(updateQueryQuery, []);
        res.send({
            status: 200,
            updatedContactList: updatedContactList
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})

app.post('/getContactList', async (req, res) => {
    try {
        let Query = "SELECT ContactList.* ,user.name as owner from ContactList,user  where user.uid =ContactList.created_by and  ContactList.SP_id = " + req.body.SPID
        if (req.body.key) {
            Query += " and  ContactList.list_name like '%" + req.body.key + "%'"
        }
        console.log(Query);
        let contactList = await db.excuteQuery(Query, []);
        res.send({
            status: 200,
            contactList: contactList
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})

app.get('/getTemplates/:spid', async (req, res) => {
    try {
        console.log("getTemplates" + req.params.spid)
        let getTemplates = await db.excuteQuery(val.selectTemplate, [req.params.spid])
        console.log(getTemplates)
        res.send({
            status: 200,
            getTemplates: getTemplates
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})

app.get('/applyFilteronEndCustomer', async (req, res) => {
    try {
        let FilteredCustomer = await db.excuteQuery(req.body.Query, [])
        res.send({
            status: 200,
            FilteredCustomer: FilteredCustomer
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})
app.post('/addFunnel', async (req, res) => {
    try {


        created_at = new Date();


        var inserQuery = "INSERT INTO Funnel (sp_id,title,channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,start_datetime,end_datetime,csv_contacts,segments_contacts,success,fail,multipleEntry,optIn,new_contact,attribute_update,category_id,timeInterval,allTime,allDays,status) ";
        inserQuery += "VALUES (" + req.body.sp_id + ",'" + req.body.title + "','" + req.body.channel_id + "','" + req.body.message_heading + "','" + req.body.message_content + "','" + req.body.message_media + "','" + req.body.message_variables + "','" + req.body.button_yes + "','" + req.body.button_no + "','" + req.body.button_exp + "','" + req.body.category + "','" + req.body.start_datetime + "','" + req.body.end_datetime + "','" + req.body.csv_contacts + "','" + req.body.segments_contacts + "','" + req.body.success + "','" + req.body.fail + "','" + req.body.multipleEntry + "','" + req.body.optIn + "','" + req.body.new_contact + "','" + req.body.attribute_update + "','" + req.body.category_id + "','" + req.body.timeInterval + "','" + req.body.allTime + "','" + req.body.allDays + "','" + req.body.status + "')";
        let addedfunnel = await db.excuteQuery(inserQuery, [])

        saveMessagesAndDays(req.body.sp_id, addedfunnel.insertId, req.body.messages)


        res.send({
            status: 200,
            addedfunnel: addedfunnel
        })
    } catch (err) {
        console.log(err)
        res.send({
            status: 500,
            err: err
        })
    }
})

app.post('/editFunnel', async (req, res) => {
    try {
        let updated_at = new Date();
        var updateQuery = "UPDATE Funnel set";
        updateQuery += " title='" + req.body.title + "',";
        updateQuery += " channel_id='" + req.body.channel_id + "',";
        updateQuery += " message_heading='" + req.body.message_heading + "',";
        updateQuery += " message_content='" + req.body.message_content + "',";
        updateQuery += " message_media='" + req.body.message_media + "',";
        updateQuery += " message_variables='" + req.body.message_variables + "',";
        updateQuery += " button_yes='" + req.body.button_yes + "',";
        updateQuery += " button_no='" + req.body.button_no + "',";
        updateQuery += " button_exp='" + req.body.button_exp + "',";
        updateQuery += " category='" + req.body.category + "',";
        updateQuery += " start_datetime='" + req.body.start_datetime + "',";
        updateQuery += " end_datetime='" + req.body.end_datetime + "',";
        updateQuery += " csv_contacts='" + req.body.csv_contacts + "',";
        updateQuery += " segments_contacts='" + req.body.segments_contacts + "',";
        updateQuery += " success= '" + req.body.success + "',";
        updateQuery += " fail=' " + req.body.fail + "',";
        updateQuery += " multipleEntry= '" + req.body.multipleEntry + "',";
        updateQuery += " optIn= '" + req.body.optIn + "',";
        updateQuery += " new_contact= '" + req.body.new_contact + "',";
        updateQuery += " attribute_update= '" + req.body.attribute_update + "',";
        updateQuery += " category_id=' " + req.body.category_id + "',";
        updateQuery += " timeInterval= '" + req.body.timeInterval + "'";

        updateQuery += " WHERE FunnelId =" + req.body.FunnelId

        let updatedfunnel = await db.excuteQuery(updateQuery, []);
        editMessagesAndDays(req.body.sp_id, req.body.messages, req.body.FunnelId)
        res.send({
            status: 200,
            updatedfunnel: updatedfunnel
        })
    } catch (err) {
        console.log(err)
        res.send({
            status: 500,
            err: err
        })
    }
})

app.post('/deleteFunnel', async (req, res) => {
    try {
        sp_id = req.body.sp_id
        funnelId = req.body.funnelId
        created_at = new Date();
        let deleteFunnelDays = await db.excuteQuery(val.deleteAllFunnelDaysQuery, [created_at, sp_id, funnelId])
        let deleteFunnelMessages = await db.excuteQuery(val.deleteAllMessage, [created_at, funnelId])
        let deleteFunnel = await db.excuteQuery(val.deleteFunnel, [created_at, funnelId])
        res.send({
            status: 200,
            deleteFunnel: deleteFunnel
        })
    } catch (err) {
        console.log(err)
        res.send({
            status: 500,
            err: err
        })
    }
})

app.post('/enableFunnel', async (req, res) => {
    try {
        let enableFunnel = await db.excuteQuery(val.disableFunnel, [req.body.isEnable, new Date, req.body.funnelId]);

        res.send({
            status: 200,
            enableFunnel: enableFunnel
        })
    } catch (err) {
        console.log(err)
        res.send({
            status: 500,
            err: err
        })
    }
})

async function saveMessagesAndDays(sp_id, fnlId, messages) {
    try {
        let messageId;
        let messageResult;
        for (const message of messages) {
            console.log(message.days);

            messageResult = await db.excuteQuery(
                val.addMessages,
                [[[sp_id, fnlId, message.Message, message.message_media, message.schedule_datetime, message.allTime, message.allDays, message.isEnable, message.start_time, message.end_time, new Date()]]]
            );

            messageId = messageResult.insertId;

            // Insert days into the `days` table
            for (const day of message.days) {
                await db.excuteQuery(
                    val.addFunnelDaysQuery,
                    [[[sp_id, day, messageId, fnlId, new Date()]],message.scheduled_min]
                );
            }
        }
    } catch (err) {
        console.log(err)
    }
}

async function editDays(sp_id, fnlId, messages, messageId,scheduled_min) {
    try {
        console.log(sp_id, fnlId, messages, messageId)
        let deleteFunnelDays = await db.excuteQuery(val.deleteFunnelDaysQuery, [new Date(), sp_id, fnlId, messageId])
        console.log(deleteFunnelDays)
        // Insert days into the `days` table
        for (const day of messages) {
            await db.excuteQuery(
                val.addFunnelDaysQuery,
                [[[sp_id, day, messageId, fnlId, new Date(),scheduled_min]]]
            );
        }
    } catch (err) {
        console.log(err)
    }

}

async function editMessagesAndDays(sp_id, messages, fnlId) {
    try {
        let messageId;
        created_at = new Date();
        let deleteFunnelDays = await db.excuteQuery(val.deleteAllFunnelDaysQuery, [created_at, sp_id, fnlId])
        let deleteFunnelMessages = await db.excuteQuery(val.deleteAllMessage, [created_at, fnlId])
        for (const message of messages) {
            console.log(message.days);

            messageResult = await db.excuteQuery(
                val.addMessages,
                [[[sp_id, fnlId, message.Message, message.message_media, message.schedule_datetime, message.allTime, message.allDays, message.isEnable, message.start_time, message.end_time, new Date()]]]
            );

            messageId = messageResult.insertId;

            // Insert days into the `days` table
            for (const day of message.days) {
                await db.excuteQuery(
                    val.addFunnelDaysQuery,
                    [[[sp_id, day, messageId, fnlId, new Date(),message.scheduled_min]]]
                );
            }
        }
    } catch (err) {
        console.log(err)
    }
}

app.get('/getAllFunnel/:sp_id', async (req, res) => {
    try {
        let result = await db.excuteQuery(val.getfunnel, [req.params.sp_id]);
        console.log(result)
        res.send({
            status: 200,
            result: result
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})

app.post('/saveMessages', async (req, res) => {
    try {
        let message=req.body
      let  savedMessage = await db.excuteQuery(
            val.addMessages,
            [[[message.sp_id, message.funnelId, message.Message, message.message_media, message.schedule_datetime, message.allTime, message.allDays, message.isEnable, message.start_time, message.end_time, new Date()]]]
        );

      let  messageId = savedMessage.insertId;

        // Insert days into the `days` table
        for (const day of message.days) {
            await db.excuteQuery(
                val.addFunnelDaysQuery,
                [[[message.sp_id, day, messageId, message.fnlId, new Date(),message.scheduled_min]]]
            );
        }
        res.send({
            status: 200,
            savedMessage: savedMessage
        })
    } catch (err) {
        console.log(err)
        res.send({
            status: 500,
            err: err
        })
    }
})

app.post('/enableMessages', async (req, res) => {
    try {
        let enabledMsg = await db.excuteQuery(val.enableMessage, [req.body.isEnable, new Date(), req.body.Message_id]);
        res.send({
            status: 200,
            enabledMsg: enabledMsg
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})


app.post('/deleteMessages', async (req, res) => {
    try {
        let deleteFunnelDays = await db.excuteQuery(val.deleteFunnelDaysQuery, [new Date(), req.body.sp_id, req.body.funnelId, req.body.Message_id])
        let deletedMsg = await db.excuteQuery(val.deleteMessage, [new Date(), req.body.Message_id, req.body.funnelId])
        res.send({
            status: 200,
            deletedMsg: deletedMsg
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})


app.post('/editMessages', async (req, res) => {
    try {
        let editMsg = await db.excuteQuery(val.editMessage, [req.body.Message, req.body.message_media, req.body.schedule_datetime, req.body.allTime, req.body.allDays, req.body.isEnable, req.body.start_time, req.body.end_time, new Date(), req.body.Message_id, req.body.funnelId])
        editDays(req.body.sp_id, req.body.funnelId, req.body.days, req.body.Message_id,req.body.scheduled_min)
        res.send({
            status: 200,
            editMsg: editMsg
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})

app.post('/addAttributeUpdate', async (req, res) => {
    try {
        let updatedAttribute = await db.excuteQuery(req.body.Query, []);
        res.status({
            status: 200,
            updatedAttribute: updatedAttribute
        })
    } catch (err) {
        res.status({
            status: 500,
            err: err
        })
    }
})



app.post('/updateFunnelTimes', async (req, res) => {
    try {
        console.log(req.body)
        sp_id = req.body.sp_id
        days = req.body.days

        created_at = new Date();

        let deleteCampaignTimings = await db.excuteQuery(val.deleteFunnelDaysQuery, [created_at, sp_id])

        console.log(deleteCampaignTimings)
        console.log("deleteCampaignTimings")

        days.forEach(async (item) => {

            item.day.forEach(async (ele) => {
                const values = [sp_id, ele, created_at];
                result = await db.excuteQuery(val.addFunnelDaysQuery, [[values]])
            })

        })

        res.status(200).send({
            msg: "added successfully",
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})


app.post('/selectFunnelDays', async (req, res) => {
    try {
        let seletedCampaignTimings = await db.excuteQuery(val.selectFunnelDaysQuery, [req.params.sid])
        res.status(200).send({
            seletedCampaignTimings: seletedCampaignTimings,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})

app.post('/sendFunnel',(req,res)=>{

})

app.listen(3011, function () {
    console.log("Node is running");

});