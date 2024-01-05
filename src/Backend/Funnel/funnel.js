var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
const middleware = require('./funnelMiddleWare')

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


        var inserQuery = "INSERT INTO Funnel (sp_id,title,description,channel_id,message_heading,message_content,message_media,message_variables,button_yes,button_no,button_exp,category,start_datetime,end_datetime,csv_contacts,segments_contacts,success,fail,multipleEntry,optIn,new_contact,attribute_update,category_id,timeInterval,allTime,allDays,status) ";
        inserQuery += "VALUES (" + req.body.sp_id + ",'" + req.body.title + "','" + req.body.description + "','" + req.body.channel_id + "','" + req.body.message_heading + "','" + req.body.message_content + "','" + req.body.message_media + "','" + req.body.message_variables + "','" + req.body.button_yes + "','" + req.body.button_no + "','" + req.body.button_exp + "','" + req.body.category + "','" + req.body.start_datetime + "','" + req.body.end_datetime + "','" + req.body.csv_contacts + "','" + req.body.segments_contacts + "','" + req.body.success + "','" + req.body.fail + "','" + req.body.multipleEntry + "','" + req.body.optIn + "','" + req.body.new_contact + "','" + req.body.attribute_update + "','" + req.body.category_id + "','" + req.body.timeInterval + "','" + req.body.allTime + "','" + req.body.allDays + "','" + req.body.status + "')";
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
        updateQuery += " timeInterval= '" + req.body.timeInterval + "',";
        updateQuery += " status= '" + req.body.status + "'";

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
            console.log(message.days, message.scheduled_min);

            messageResult = await db.excuteQuery(
                val.addMessages,
                [[[sp_id, fnlId, message.Message, message.message_media, message.schedule_datetime, message.allTime, message.allDays, message.isEnable, message.start_time, message.end_time, new Date(), message.scheduled_min]]]
            );

            messageId = messageResult.insertId;

            // Insert days into the `days` table
            for (const day of message.days) {
                await db.excuteQuery(
                    val.addFunnelDaysQuery,
                    [[[sp_id, day, messageId, fnlId, new Date(), message.scheduled_min]]]
                );
            }
        }
    } catch (err) {
        console.log(err)
    }
}

async function editDays(sp_id, fnlId, messages, messageId, scheduled_min) {
    try {
        console.log(sp_id, fnlId, messages, messageId)
        let deleteFunnelDays = await db.excuteQuery(val.deleteFunnelDaysQuery, [new Date(), sp_id, fnlId, messageId])
        console.log(deleteFunnelDays)
        // Insert days into the `days` table
        for (const day of messages) {
            await db.excuteQuery(
                val.addFunnelDaysQuery,
                [[[sp_id, day, messageId, fnlId, new Date(), scheduled_min]]]
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
                [[[sp_id, fnlId, message.Message, message.message_media, message.schedule_datetime, message.allTime, message.allDays, message.isEnable, message.start_time, message.end_time, new Date(), message.scheduled_min]]]
            );

            messageId = messageResult.insertId;

            // Insert days into the `days` table
            for (const day of message.days) {
                await db.excuteQuery(
                    val.addFunnelDaysQuery,
                    [[[sp_id, day, messageId, fnlId, new Date(), message.scheduled_min]]]
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

app.get('/getSubscriberCount/:sp_id/:id', async (req, res) => {
    try {

        let result = await db.excuteQuery(val.funnelById, [req.params.id, req.params.sp_id]);
        // console.log(result)
        let newContact = await db.excuteQuery(result[0]?.new_contact, [])

        let subscriberCount = 0
        let attribute_update = 0;
        if (result[0]?.attribute_update.length != 0) {
            attribute_update = await db.excuteQuery(result[0]?.attribute_update, [])
        }
        subscriberCount += JSON.parse(result[0]?.segments_contacts).length

        subscriberCount += newContact?.length;

        subscriberCount += attribute_update;

        res.send({
            status: 200,
            subscriberCount: subscriberCount
        })
    } catch (err) {
        res.send({
            status: 500,
            err: err
        })
    }
})

app.get('/getFunnelByID/:sp_id/:id', async (req, res) => {
    try {
        let result = await db.excuteQuery(val.funnelById, [req.params.id, req.params.sp_id]);
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
        let message = req.body
        let savedMessage = await db.excuteQuery(
            val.addMessages,
            [[[message.sp_id, message.funnelId, message.Message, message.message_media, message.schedule_datetime, message.allTime, message.allDays, message.isEnable, message.start_time, message.end_time, new Date(), message.scheduled_min]]]
        );

        let messageId = savedMessage.insertId;

        // Insert days into the `days` table
        for (const day of message.days) {
            await db.excuteQuery(
                val.addFunnelDaysQuery,
                [[[message.sp_id, day, messageId, message.fnlId, new Date(), message.scheduled_min]]]
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
        let editMsg = await db.excuteQuery(val.editMessage, [req.body.Message, req.body.message_media, req.body.schedule_datetime, req.body.allTime, req.body.allDays, req.body.isEnable, req.body.start_time, req.body.end_time, new Date(), req.body.scheduled_min, req.body.Message_id, req.body.funnelId])
        editDays(req.body.sp_id, req.body.funnelId, req.body.days, req.body.Message_id, req.body.scheduled_min)
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

app.post('/sendFunnel', async (req, res) => {
    try {
        let sendFunnel = await db.excuteQuery(val.funnelById, [req.body.FunnelId, req.body.sp_id])
        let csvContact = [];
        if (sendFunnel[0]?.csv_contacts?.length > 0) {
            const dataArray = JSON.parse(sendFunnel[0].csv_contacts);
            const phoneNumbersArray = dataArray.map(dataObject => dataObject.Phone_number);
            csvContact = csvContact.concat(phoneNumbersArray);
        }

        if (sendFunnel[0]?.segments_contacts?.length > 0) {
            let listnumber = await infoOfcontactList(sendFunnel[0].segments_contacts);
            csvContact = csvContact.concat(listnumber.map(rowDataPacket => rowDataPacket.Phone_number));

        }


        if (sendFunnel[0]?.new_contact?.length > 0) {
            console.log("new_contact")
            let newContactNumber = await infoOfNewContact(sendFunnel[0].new_contact);
            csvContact = csvContact.concat(newContactNumber.map(rowDataPacket => rowDataPacket.Phone_number));
            let uniqueArray = [...new Set(csvContact)];
            // console.log(uniqueArray);
        }
        if (sendFunnel[0]?.attribute_update?.length > 0) {
            console.log("attribute_update")
            let updateContactNumber = await infoOfUpdatedContact(sendFunnel[0].attribute_update);
        }

        let scheduledTime = await isScheduledTime([...new Set(csvContact)])
        //  let  middlewareresult = await middleware.channelssetUp(sendFunnel[0].sp_id, sendFunnel[0].channel_id, 'text', req.body.messageTo, message_text, message_media, interaction_id, msg_id.insertId)
        res.status(200).send({
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})

async function infoOfcontactList(contactList) {
    try {
        let query = 'Select Phone_number from EndCustomer where customerId IN (?)'

        let listedPhone = await db.excuteQuery(query, [JSON.parse(contactList)]);

        return listedPhone;
    } catch (err) {
        contactList
        console.log(err);
    }
}
async function infoOfNewContact(contactList) {
    try {
        let newContactPhone = await db.excuteQuery(contactList, []);
        return newContactPhone;
    } catch (err) {
        console.log(err);
    }
}
async function infoOfUpdatedContact(contactList) {
    try {
        let newContactPhone = await db.excuteQuery(contactList, []);
        return newContactPhone;
    } catch (err) {
        console.log(err);
    }
}

// async function isScheduledTime(contactArray) {
//     try {

//         let daysQuery = 'select day from FunnelDays where  FunnelId=1 and Message_id=17 and isDeleted !=1 and sp_id=3'
//         let scheduledDays = await db.excuteQuery(daysQuery, []);
//         console.log(scheduledDays)
//         // Extract values of the 'day' property and store in a new array
//         const extractedDays = scheduledDays.map(row => row.day);

//         console.log(extractedDays);

//         console.log(areWorkingDays(extractedDays))
//         let messageQuery = 'select scheduled_min from FunnelMessages where  FunnelId=1 and Message_id=18 and isDeleted !=1 and sp_id=3';
//         let scheduledTime = await db.excuteQuery(messageQuery, []);

//         for (let i = 0; i < contactArray.length; i++) {
//             let query = 'Select  created_at from EndCustomer where Phone_number =? and isDeleted != 1 and SP_ID=3'
//             let createdTime = await db.excuteQuery(query, [contactArray[i]]);


//             // Assuming createdTime is an array with a property scheduled_min
//             const scheduledMinutes = parseInt(scheduledTime[0]?.scheduled_min, 10); // Parse the string to an integer

//             // Assuming Message is an array with a property created_at
//             const messageCreatedAtString = createdTime[0]?.created_at;

//             // Convert the string to a Date object
//             const messageCreatedAt = new Date(messageCreatedAtString);

//             // Find the next time (e.g., scheduledMinutes minutes later)
//             const nextTime = new Date(messageCreatedAt.getTime() + 1450 * 60 * 1000); // Add scheduledMinutes minutes in milliseconds

//             // Get the timestamp of the next time
//             const nextTimestamp = nextTime.getTime();

//             console.log(nextTimestamp <= new Date(), i, new Date(nextTimestamp));
//         }
//     } catch (err) {
//         console.log(err);
//     }
// }

// function areWorkingDays(days) {
//     // Assuming 'days' is an array of strings, e.g., ['Monday', 'Tuesday', 'Wednesday']
//     const workingDays = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
//     // Convert the input days to lowercase for case-insensitive comparison
//     const normalizedDays = days.map(day => day.toLowerCase());
  
//     // Check if all normalized days are in the array of working days
//     return normalizedDays.every(day => workingDays.includes(day));
//   }

app.listen(3011, function () {
    console.log("Node is running");

});