const express = require('express');
const db = require("../dbhelper");
const bodyParser = require('body-parser');
const val = require('./TeamBoxConstant')
const app = express();
const bcrypt = require('bcrypt');
const http = require("https");
const middleWare = require('../middleWare')
const multer = require('multer');
let fs = require('fs-extra');
const moment = require('moment');
const removeTags = require('../removeTagsFromRichTextEditor')

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


// handle storage using multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let path = `./uploads/`;
        fs.mkdirsSync(path);
        cb(null, path);

    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
var upload = multer({ storage: storage });

const uploadfile = (req, res) => {
    upload.single('dataFile')
    const file = req.file;

};

const getAllAgents = (req, res) => {
    db.runQuery(req, res, val.selectAllAgentsQuery, [req.params.spID]);
};



const getAllCustomer = async (req, res) => {
    // db.runQuery(req, res, val.selectAllQuery, [req.params.spID]);
    try {
        let RangeStart = parseInt(req.params.RangeStart);

        let RangeEnd = parseInt(req.params.RangeEnd - req.params.RangeStart);
        console.log(RangeStart, "RangeStart", RangeEnd)
        let contacts = await db.excuteQuery(val.selectAllQuery, [req.params.spID, req.params.spID, req.params.spID, req.params.spID, RangeStart, RangeEnd]);
        console.log("req.params.spID, req.params.spID, req.params.spID, req.params.spID, RangeStart, RangeEnd")
        console.log(req.params.spID, req.params.spID, req.params.spID, req.params.spID, RangeStart, RangeEnd)
        res.send({
            status: 200,
            results: contacts
        })
    } catch (err) {
        console.log(err)
        res.send({
            status: 500,
            err: err
        })
    }
};

const getCustomerById = (req, res) => {
    db.runQuery(req, res, val.selectByIdQuery, [req.params.id]);
}

const filterCustomers = (req, res) => {
    db.runQuery(req, res, val.filterQuery, [req.params.id]);
}

const searchCustomer = (req, res) => {
    var sQuery = "SELECT * from EndCustomer where channel = '" + req.params.Channel + "' and SP_ID=" + req.params.spID
    if (req.params.key) {
        sQuery = sQuery + " and (Phone_number like '%" + req.params.key + "%' or Name like '%" + req.params.key + "%')"
    }
    console.log(sQuery)
    db.runQuery(req, res, sQuery, [req.params.spID, req.params.key, req.params.key]);
}

const insertCustomers = async (req, res) => {
    let Name = req.body.Name;
    let Phone_number = req.body.Phone_number;
    let channel = req.body.Channel;
    let OptInStatus = req.body.OptedIn;
    let SP_ID = req.body.SP_ID;
    let countryCode = req.body.country_code;
    let displayPhoneNumber = req.body.displayPhoneNumber;
    let values = [[Name, Phone_number, channel, SP_ID, OptInStatus, countryCode, displayPhoneNumber]];

    try {
        // Check if contact with isTemporary = 1 exists
        let checkTempContactQuery = `SELECT * FROM EndCustomer WHERE Phone_number = ? AND (isDeleted = 1 or IsTemporary = 1) AND SP_ID = ?`;
        let tempContactResult = await db.excuteQuery(checkTempContactQuery, [Phone_number, SP_ID]);
console.log("tempContactResult",tempContactResult.length ,tempContactResult.length > 0)
        if (tempContactResult.length > 0) {
            // Update the temporary contact to make it permanent
            let updateTempContactQuery = `
                UPDATE EndCustomer
                SET Name = ?, channel = ?, OptInStatus = ?, countryCode = ?, displayPhoneNumber = ?, IsTemporary = 0, isDeleted = 0
                WHERE Phone_number = ? AND SP_ID = ?
            `;
            await db.excuteQuery(updateTempContactQuery, [Name, channel, OptInStatus, countryCode, displayPhoneNumber, Phone_number, SP_ID]);

            return res.status(200).send({
                msg: 'Temporary contact updated to permanent.',
                status: 200
            });
        }

        // Check if contact with isTemporary != 1 exists
        let existContactWithSameSpidQuery = `SELECT * FROM EndCustomer WHERE Phone_number = ? AND isDeleted != 1 AND IsTemporary != 1 AND SP_ID = ?`;
        let existingContactResult = await db.excuteQuery(existContactWithSameSpidQuery, [Phone_number, SP_ID]);

        if (existingContactResult.length > 0) {
            // Phone number already exists as a permanent contact, return an error response
            return res.status(409).send({
                msg: 'Phone number already exists!',
                status: 409
            });
        }

        // Insert new contact
        let insertQuery = `
            INSERT INTO EndCustomer (Name, Phone_number, channel, SP_ID, OptInStatus, countryCode, displayPhoneNumber)
            VALUES ?
        `;
        await db.excuteQuery(insertQuery, [values]);

        res.status(200).send({
            msg: 'Contact added successfully.',
            status: 200
        });
    } catch (error) {
        console.error("Error inserting/updating contact:", error);
        res.status(500).send({
            msg: 'Internal Server Error',
            status: 500
        });
    }
};


const updatedCustomer = async (req, res) => {
    try {
        var updateQueryQuery = "UPDATE EndCustomer SET Name ='" + req.body.Name + "',";
        updateQueryQuery += " OptInStatus ='" + req.body.OptInStatus + "',"
        updateQueryQuery += " Phone_number ='" + req.body.Phone_number + "',"
        updateQueryQuery += " channel ='" + req.body.channel + "',"
        updateQueryQuery += " countryCode ='" + req.body.countryCode + "',"
        updateQueryQuery += " displayPhoneNumber ='" + req.body.displayPhoneNumber + "',"
        updateQueryQuery += " emailId ='" + req.body.emailId + "',"
        updateQueryQuery += " ContactOwner ='" + req.body.ContactOwner + "'"


        updateQueryQuery += " WHERE customerId =" + req.body.customerId

        //console.log(updateQueryQuery)
        let updateCustomer = await db.excuteQuery(updateQueryQuery, [])
        res.send({
            status: 200,
            updateCustomer: updateCustomer
        })
    } catch (err) {
        console.log(err);
        res.send({
            status: 500,
            err: err
        })
    }



}

const updateTags = (req, res) => {
    var updateQueryQuery = "UPDATE EndCustomer SET tag ='" + req.body.tag + "'  WHERE customerId =" + req.body.customerId
    console.log(updateQueryQuery)
    db.runQuery(req, res, updateQueryQuery, [])


}
const blockCustomer = (req, res) => {
    customerId = req.body.customerId
    isBlocked = req.body.isBlocked
    let blockedQuery = val.blockCustomerQuery
    if (req.body.isBlocked == 1) {
        blockedQuery = `UPDATE EndCustomer SET isBlocked =? ,OptInStatus='No' WHERE customerId =?`
        UnassignedBlockedContact(customerId, req.body?.SP_ID)
    }

    var values = [[customerId, isBlocked]]
    db.runQuery(req, res, blockedQuery, [isBlocked, customerId])
}

async function UnassignedBlockedContact(customerId, spid) {
    try {
        let getInteraction = await db.excuteQuery(`SELECT  InteractionId FROM Interaction WHERE customerId = ? and SP_ID=? ORDER BY InteractionId DESC`, [customerId, spid])
        let findMappingQuery = `SELECT *
  FROM InteractionMapping
  WHERE InteractionId = (SELECT  InteractionId FROM Interaction WHERE customerId = ? and SP_ID=? ORDER BY InteractionId DESC);`

        let mapping = await db.excuteQuery(findMappingQuery, [customerId, spid]);

        if (mapping?.length > 0) {
            let updateMapping = await db.excuteQuery(`update InteractionMapping set AgentId = -1 where MappingId =?`, [mapping[0]?.MappingId])
        }

        let updateStatus = await db.excuteQuery(`update Interaction set interaction_status=? where InteractionId=? and SP_ID=? AND customerId=?`, ['empty', getInteraction[0]?.InteractionId, spid, customerId])
    } catch (err) {
        console.log("err", err)
    }
}

const createInteraction = async (req, res) => {
    try {
        customerId = req.body.customerId
        SP_ID = req.body.spid
        interaction_status = "empty"
        interaction_details = " "
        interaction_type = "Marketing"
        IsTemporary = req.body?.IsTemporary
        var values = [[customerId, interaction_status, interaction_details, SP_ID, interaction_type, IsTemporary]]
    
       let isExist = await db.excuteQuery('select * from Interaction where SP_ID=? and customerId=? and is_deleted!=1',[SP_ID,customerId])
       if(isExist?.length >0){
        res.status(409).send({
            msg: 'This customer interaction already exist !',
            status: 409
        })
       }else{
        let myUTCString = new Date().toUTCString();
        const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let createInteraction = await db.excuteQuery(val.createInteractionQuery, [values])
        let interactionData = await db.excuteQuery(val.interactionDataById,[SP_ID,createInteraction?.insertId])
        let currency_nameQuery = ` select Currency   from localDetails where SP_ID=?;`
        let currency_name = await db.excuteQuery(currency_nameQuery, [SP_ID])
        let country_nameQuery = `select Country  from companyDetails where SP_ID=?;`
        let country_name = await db.excuteQuery(country_nameQuery, [SP_ID])

        let template_costQuery = `select Marketing from whatsappPlanPricing where Market =?;`
        let template_cost = await db.excuteQuery(template_costQuery, [country_name[0]?.Country])
        let overall_cost = (-1 * template_cost[0]?.Marketing) ? (-1 * template_cost[0]?.Marketing) : '0';
        let SPTransationsQuery = `INSERT INTO SPTransations (sp_id,transation_date,amount,transation_type,description,interaction_id,currency) values ?`
        let SPTransationsvalues = [[SP_ID, time, overall_cost, 'Credited', 'Your Wallet amount is debited and credited to Marketing charges', createInteraction.insertId, currency_name[0]?.Currency]]

        let SPTransations = await db.excuteQuery(SPTransationsQuery, [SPTransationsvalues])

        res.status(200).send({
            SPTransations: SPTransations,
            interaction :interactionData,
            status: 200
        })
    }
    } catch (err) {
        console.log(err)
        res.send(err)
    }

}

const updateInteraction = async (req, res) => {
    if (req.body?.IsTemporary && req.body?.IsTemporary != '') {
        var updateQuery = "UPDATE Interaction SET IsTemporary ='" + req.body.IsTemporary + "' WHERE InteractionId =" + req.body.InteractionId
    }
    if (req.body.Status && req.body.Status != '') {
        let myUTCString = new Date().toUTCString();
        const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let actionQuery = `insert into InteractionEvents (interactionId,action,action_at,action_by,created_at,SP_ID,Type) values (?,?,?,?,?,?)`

        let actions = await db.excuteQuery(actionQuery, [req.body.InteractionId , req.body?.action, req.body?.action_at, req.body?.action_by, utcTimestamp, req.body?.SP_ID,'text'])
        var updateQuery = "UPDATE Interaction SET interaction_status ='" + req.body.Status + "' WHERE InteractionId =" + req.body.InteractionId
    }
    if (req.body.AutoReply && req.body.AutoReply != '') {
        var updateQuery = "UPDATE Interaction SET AutoReplyStatus ='" + req.body.AutoReply + "',paused_till ='" + req.body.paused_till + "' , AutoReplyUpdatedAt ='" + req.body.updated_at + "'  WHERE InteractionId =" + req.body.InteractionId
    }



    db.runQuery(req, res, updateQuery, [])
}

deleteInteraction = (req, res) => {
    var deleteQuery = "UPDATE Interaction SET deleted_by =" + req.body.AgentId + " ,is_deleted =1 WHERE InteractionId =" + req.body.InteractionId
    console.log(deleteQuery)
    db.runQuery(req, res, deleteQuery, [])
}

const getAllInteraction = (req, res) => {
    db.runQuery(req, res, val.getAllInteraction, [req.body.SPID])
}

const getAllFilteredInteraction = async (req, res) => {

    //let queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer where Interaction.is_deleted=0 and Interaction.customerId=EndCustomer.customerId";
    // let queryPath = "SELECT    ic.interaction_status,ic.InteractionId, ec.*             FROM       Interaction ic    JOIN        EndCustomer ec ON ic.customerId = ec.customerId     WHERE        ic.interactionId = (            SELECT MAX(interactionId)            FROM Interaction            WHERE customerId = ic.customerId        ) and ec.SP_ID=?  AND ec.isDeleted !=1    and ic.is_deleted=0 order by interactionId desc";
    try {

        let queryPath = val.interactions;
        let RangeStart = req.body.RangeStart
        let RangeEnd = (req.body.RangeEnd - req.body.RangeStart)
        if (req.body.FilterBy != 'All') {


            var filterBy = req.body.FilterBy
            if (filterBy == 'Open' || filterBy == 'Resolved') {
                queryPath += " and ic.interaction_status='" + filterBy + "'"
            } else if (filterBy == 'Unassigned') {
                queryPath += " and ic.InteractionId NOT IN (SELECT InteractionId FROM InteractionMapping where AgentId != -1)"
            } else if (filterBy == 'Mine') {
                queryPath += " and ic.InteractionId  IN (SELECT InteractionId FROM InteractionMapping where AgentId=" + req.body.AgentId + " and is_active=1)"
            } else if (filterBy == 'Mentioned') {
                queryPath += " and ic.InteractionId  IN (SELECT interaction_id FROM `Message` WHERE `message_text` LIKE '%@" + req.body.AgentName + "%')"
            } else if (filterBy == 'Pinned') {
                queryPath += " and ic.InteractionId  IN (SELECT InteractionId FROM PinnedInteraction where AgentId=" + req.body.AgentId + ")"
            }

        }

        if (req.body.SearchKey != '') {
            queryPath += " and EndCustomer.Name like '%" + req.body.SearchKey + "%'"

        }

        queryPath += ` ORDER BY 
        LastMessageDate DESC, 
        ic.InteractionId DESC
    LIMIT ?, ?`

        console.log("------------------")

        // console.log(queryPath)



        console.log("==================")
        let conversations = await db.excuteQuery(queryPath, [req.body.SPID, req.body.SPID, RangeStart, RangeEnd]);

        let isCompleted = false;
        if (conversations?.length == 0 || conversations?.length < RangeEnd) {
            isCompleted = true;
        }

        res.send({
            status: 200,
            conversations: conversations,
            isCompleted: isCompleted
        })
    } catch (err) {
        db.errlog(err);

        res.send({
            status: 500,
            err: err
        })
    }
}

const getInteractionById = (req, res) => {
    db.runQuery(req, res, val.selectInteractionByIdQuery, [req.params.InteractionId])
}
const checkInteractionPinned = (req, res) => {
    var queryPath = "SELECT Id FROM PinnedInteraction WHERE InteractionId=? and AgentId=?"
    db.runQuery(req, res, queryPath, [req.params.InteractionId, req.params.AgentId])
}

const updatePinnedStatus = (req, res) => {
    if (req.body.isPinned) {
        var updateQuery = "DELETE FROM PinnedInteraction WHERE AgentId =" + req.body.AgentId + " and InteractionId =" + req.body.InteractionId;
    } else {
        var updateQuery = "INSERT INTO PinnedInteraction (AgentId,InteractionId) VALUES ?";

    }
    var values = [[req.body.AgentId, req.body.InteractionId]]

    db.runQuery(req, res, updateQuery, [values])

}

// filter interactions
const getFilteredInteraction = (req, res) => {

    let filterQuery = "SELECT    ic.interaction_status,ic.InteractionId, ec.*             FROM       Interaction ic    JOIN        EndCustomer ec ON ic.customerId = ec.customerId     WHERE        ic.interactionId = (            SELECT MAX(interactionId)            FROM Interaction            WHERE customerId = ic.customerId        ) and ec.SP_ID=?  AND ec.isDeleted !=1    and ic.is_deleted=0";
    var filterBy = req.params.filterBy

    if (filterBy == 'Open' || filterBy == 'Resolved') {
        filterQuery += " and ic.interaction_status='" + filterBy + "'"
    } else if (filterBy == 'Unassigned') {
        filterQuery += " and ic.InteractionId NOT IN (SELECT InteractionId FROM InteractionMapping)"
    } else if (filterBy == 'Mine') {
        filterQuery += " and ic.InteractionId  IN (SELECT InteractionId FROM InteractionMapping where AgentId=" + req.params.AgentId + " and is_active=1)"
    } else if (filterBy == 'Mentioned') {
        filterQuery += " and ic.InteractionId  IN (SELECT interaction_id FROM `Message` WHERE `message_text` LIKE '%@" + req.params.AgentName + "%')"
    } else if (filterBy == 'Pinned') {
        filterQuery += " and ic.InteractionId  IN (SELECT InteractionId FROM PinnedInteraction where AgentId=" + req.params.AgentId + ")"
    }
    filterQuery += " order by interactionId desc"

    db.runQuery(req, res, filterQuery, [req.params.SPID])
}

const getSearchInteraction = async (req, res) => {
    try {

        var searchKey = req.params.searchKey
        var spid = req.params.spid
        // let queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer WHERE Interaction.is_deleted=0 and Interaction.customerId=EndCustomer.customerId and EndCustomer.Name like '%" + searchKey + "%' and EndCustomer.SP_ID ='" + spid + "' and EndCustomer.isDeleted !=1"

        // if (req.params.AgentId && req.params.AgentId != 0) {
        //     queryPath += " and Interaction.InteractionId IN (SELECT InteractionId FROM InteractionMapping where AgentId=" + req.params.AgentId
        //     queryPath += " )"
        // }


        var agentId = req.params.AgentId;

       let queryPath = val.searchWithAllData +` ${agentId != 0 ? 'AND im.AgentId = ?' : ''}`
//  console.log(queryPath)
        let queryParams = [spid, spid, `%${searchKey}%`];
        if (agentId != 0) {
            queryParams.push(agentId);
        }
        let result = await db.excuteQuery(queryPath, queryParams);
      //  console.log(result)
        res.send({
            result: result,
            status: 200
        })

    } catch (err) {
        console.log("err-------", err)
        res.send({
            err: err,
            status: 500
        })
    }
}



const getAllMessageByInteractionId = async (req, res) => {
    try {

        let result;
        let isCompleted = false
        let endRange = parseInt(req.params.RangeEnd - req.params.RangeStart)
        if (req.params.Type != 'media') {
            //var getAllMessagesByInteractionId = "SELECT Message.* ,Author.name As AgentName, DelAuthor.name As DeletedBy from Message LEFT JOIN user AS DelAuthor ON Message.Agent_id= DelAuthor.uid LEFT JOIN user AS Author ON Message.Agent_id= Author.uid where  Message.interaction_id=" + req.params.InteractionId + " and Type='" + req.params.Type + "'"
            //  var getAllMessagesByInteractionId = "SELECT Message.* ,Author.name As AgentName, DelAuthor.name As DeletedBy from Message LEFT JOIN user AS DelAuthor ON Message.Agent_id= DelAuthor.uid LEFT JOIN user AS Author ON Message.Agent_id= Author.uid where Message.interaction_id IN ( SELECT interactionId FROM Interaction Where customerid IN ( SELECT customerId FROM Interaction where interactionId = " + req.params.InteractionId + "))  and Type='" + req.params.Type + "'  AND Message.is_deleted != 1 AND (Message.msg_status IS NULL OR Message.msg_status != 10 )  order by interaction_id desc , Message.created_at DESC LIMIT " + req.params.RangeStart + "," + endRange;

            result = await db.excuteQuery(val.getallMessagesWithScripts, [req.params.InteractionId, req.params.Type, req.params.spid, req.params.InteractionId, req.params.Type, req.params.spid, parseInt(req.params.RangeStart), endRange])


        } else {
            //var getAllMessagesByInteractionId = "SELECT * from Message where message_media != '' and interaction_id=" + req.params.InteractionId + " ORDER BY Message_id DESC"
            //  var getAllMessagesByInteractionId = "SELECT * from Message where message_media != '' and interaction_id IN ( SELECT interactionId FROM Interaction Where customerid IN ( SELECT customerId FROM Interaction where interactionId = " + req.params.InteractionId + ")) and is_deleted !=1 AND (msg_status IS NULL OR msg_status !=10 ) ORDER BY Message_id DESC LIMIT " + req.params.RangeStart + "," + endRange;


            result = await db.excuteQuery(val.getMediaMessage, [req.params.InteractionId, req.params.InteractionId, req.params.spid, req.params.Type, parseInt(req.params.RangeStart), endRange])



        }
        if (result?.length == '0' || result?.length < endRange) {
            isCompleted = true;
        }
        res.send({
            result: result,
            isCompleted: isCompleted,
            status: 200
        })

    } catch (err) {
        res.send({
            err: err,
            status: 500
        })
    }

}

const updateMessageRead = (req, res) => {
    if (req.body.Message_id > 0) {
        var messageQuery = "UPDATE Message SET is_read =1 WHERE Message_id =" + req.body.Message_id;
        var values = []
        db.runQuery(req, res, messageQuery, [values])
    }
}
const deleteMessage = (req, res) => {
    var messageQuery = "UPDATE Message SET deleted_at ='" + req.body.deleted_at + "', is_deleted =" + req.body.deleted + ", deleted_by =" + req.body.deleted_by + " WHERE Message_id =" + req.body.Message_id;
    var values = []
    db.runQuery(req, res, messageQuery, [values])
}

const updateNotes = (req, res) => {
    if (req.body.Message_id > 0) {
        var messageQuery = "UPDATE Message SET message_text =?,message_media=?,media_type=?,Type=? WHERE Message_id =" + req.body.Message_id;
        var values = [req.body?.message_text, req.body?.message_media, req.body?.media_type, req.body?.Type]
        db.runQuery(req, res, messageQuery, [values])
    }
}

const addAction = async (req, res) => {
    try {
        let actionQuery = `insert into InteractionEvents (interactionId,action,action_at,action_by,created_at,SP_ID) values (?,?,?,?,?,?)`

        let actions = await db.excuteQuery(actionQuery, [req.body.interactionId, req.body.action, req.body.action_at, req.body.action_by, req.body.created_at, req.body.SP_ID])

        res.send({
            actions: actions,
            status: 200
        })

    } catch (err) {
        res.send({
            err: err,
            status: 500
        })
    }
}

async function autoReplyPauseTime(spid, newId) {
    try {
        // Execute the first query to get interactionPause data
        let interactionPause = await db.excuteQuery('select * from Interaction where InteractionId = ? and is_deleted != 1', [newId]);

        // Execute the second query to get defaultActions data
        let defaultAction = await db.excuteQuery('select * from defaultActions where spid = ? and (isDeleted is null or isDeleted = 0);', [spid]);
        let pauseTime;

        // Check if the defaultAction result is not empty
        if (defaultAction?.length > 0) {
            let pauseAutoReplyTime = defaultAction[0]?.pauseAutoReplyTime;
            // console.log("interactionPause", interactionPause, "autoReplyTime default", pauseAutoReplyTime, "new Date().getTime()", new Date().getTime(), new Date());

            // Calculate the new time based on autoReplyTime and pauseDuration
            let calcTime = new Date(new Date().getTime() + pauseAutoReplyTime * 60000);
            let deActpausedTill = calcTime.toString();
            // console.log("calcTime", calcTime, "deActpausedTill", deActpausedTill);

            // Check and convert interactionPause[0]?.paused_till to timestamp if it's an ISO date string
            let pausedTill = interactionPause[0]?.paused_till;
            let pausedTillTime;
            if (!isNaN(pausedTill)) {
                pausedTillTime = parseInt(pausedTill, 10);
            } else {
                pausedTillTime = new Date(pausedTill).getTime();
            }

            //console.log(pausedTillTime, calcTime.getTime());

            // Compare and get the maximum of the paused_till times
            pauseTime = Math.max(pausedTillTime, calcTime.getTime());
            // console.log("pauseTime", new Date(pauseTime));
            if (pauseTime != NaN) {
                let updateInteractionPause = await db.excuteQuery('UPDATE Interaction SET paused_till = ? WHERE InteractionId = ?', [pauseTime, newId]);
                //  console.log("updateInteractionPause", updateInteractionPause);
            }
        } else {
            console.error('No defaultAction found for the given spid');
        }

        return pauseTime;
    } catch (err) {
        console.log("autoReplyPauseTime Err");
        console.log(err);
        return err;
    }
}


const insertMessage = async (req, res) => {
    try {
        console.log(req.body)
        if (req.body.Message_id == '') {
            var messageQuery = val.insertMessageQuery


            SPID = req.body.SPID
            interaction_id = req.body.InteractionId
            customerId = req.body.CustomerId
            Agent_id = req.body.AgentId
            message_direction = "Out"
            message_text = req.body.message_text
            message_media = req.body.message_media
            media_type = req.body.media_type
            Message_template_id = req.body.template_id
            Quick_reply_id = req.body.quick_reply_id
            Type = req.body.message_type
            created_at = req.body.created_at
            ExternalMessageId = ''
            mediaSize = req.body.mediaSize
            spNumber = req.body?.spNumber
            assignAgent = req.body?.assignAgent

            let agentName = await db.excuteQuery('select name from user where uid=?', [Agent_id])
            let channelType = await db.excuteQuery('select * from EndCustomer where customerId=? and SP_ID=?', [customerId, SPID]);
            let spchannel = await db.excuteQuery('select channel_id from WhatsAppWeb where spid=? limit 1', [SPID])

            const channel = channelType.length > 0 ? channelType[0].channel : spchannel[0]?.channel_id;

            var values = [[SPID, Type, ExternalMessageId, interaction_id, Agent_id, message_direction, message_text, message_media, media_type, Message_template_id, Quick_reply_id, created_at, created_at, mediaSize, assignAgent]]
            let msg_id = await db.excuteQuery(messageQuery, [values]);
            console.log("msg_id -------------", msg_id)
            if (agentName.length >= 0) {
                let mentionQuery = "SELECT * FROM Message WHERE ? LIKE ?";
                let messageTextParameter = `%${message_text}%`; // assuming message_text is the text you want to search
                let agentNameParameter = `@${agentName[0].name}`; // assuming agentName is an array and you want to search for the first agent's name

                var mentionedNotification = await db.excuteQuery(mentionQuery, [messageTextParameter, agentNameParameter]);

            }
            if (mentionedNotification.length != 0) {
                let myUTCString = new Date().toUTCString();
                const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
                let notifyvalues = [[SPID, 'Mentioned You', message_text, Agent_id, 'teambox', Agent_id, utcTimestamp]]
                let mentionRes = await db.excuteQuery(val.addNotification, [notifyvalues])
                console.log("mentionRes")

            }
            let content = await removeTags.removeTagsFromMessages(message_text);
            // Parse the message template to get placeholders
            const placeholders = parseMessageTemplate(content);
            if (placeholders.length > 0) {
                // Construct a dynamic SQL query based on the placeholders
                console.log(placeholders)
                const results = await removeTags.getDefaultAttribue(placeholders, SPID, customerId);
                console.log("results", results)

                placeholders.forEach(placeholder => {
                    const result = results.find(result => result.hasOwnProperty(placeholder));
                    const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
                    content = content.replace(`{{${placeholder}}}`, replacement);
                });
            }

            let middlewareresult = ""
            if (Type != 'notes') {
                if (channelType[0].isBlocked != 1) {

                    console.log("channelType[0].isBlocked != 1 ", channelType[0].isBlocked != 1, customerId)
                    //let content = await removeTags.removeTagsFromMessages(message_text);
                    if (req.body.message_type == 'text') {
                        if (req.body.message_media != '') {
                            // sendMediaOnWhatsApp(req.body.messageTo, message_media)

                            middlewareresult = await middleWare.channelssetUp(SPID, channel, 'image', req.body.messageTo, content, message_media, interaction_id, msg_id.insertId, spNumber)
                        }
                        // sendTextOnWhatsApp(req.body.messageTo, message_text)
                        else {
                            middlewareresult = await middleWare.channelssetUp(SPID, channel, 'text', req.body.messageTo, content, message_media, interaction_id, msg_id.insertId, spNumber)

                        }
                        autoReplyPauseTime(SPID, interaction_id)
                    }
                    if (middlewareresult?.status != 200) {
                        let NotSendedMessage = await db.excuteQuery('UPDATE Message set msg_status=9 where Message_id=?', [msg_id.insertId]) // just mark msg_status 9 for  identify
                    }
                    console.log("middlewareresult", middlewareresult)
                } else {
                    console.log("else _________")
                    let NotSendedMessage = await db.excuteQuery('UPDATE Message set msg_status=10 where Message_id=?', [msg_id.insertId]) //// just mark msg_status 10 for block identify
                }
            }
            res.send({ middlewareresult: middlewareresult, status: middlewareresult?.status, insertId: msg_id.insertId })

        } else {
            message_text = req.body.message_text
            Message_id = req.body.Message_id
            var values = [[message_text, Message_id]]
            var messageQuery = "UPDATE Message SET updated_at ='" + created_at + "', message_text ='" + message_text + "' WHERE Message_id =" + Message_id;
            db.runQuery(req, res, messageQuery, [values])
        }

    } catch (err) {
        console.log(err);

    }





}


// Function to parse the message template and retrieve placeholders
function parseMessageTemplate(template) {
    const placeholderRegex = /{{(.*?)}}/g;
    const placeholders = [];
    let match;
    while ((match = placeholderRegex.exec(template))) {
        placeholders.push(match[1]);
    }
    return placeholders;
}
const WHATSAPP_TOKEN = 'Bearer EAAD3Jp4D3lIBAAXiPHzN4z4HlLOTd3Hn6nKBYfBwUk0ASNvGMCZAXBuIzZA7z07tNzfRYUheZA6XEIph79MtwvvfXZCOIjO0NKyLdh07pU5j24rktuZAazxIxnTgyPAFsEqCwq3Om3R3xTpcANJwonii87Uq1BZBx8Ckj9pj5YPho4zjZCTrZBrUhA3U98rkyAnp5V4BHdxMlAZDZD'
const WHATSAPPOptions = {
    "method": "POST",
    "hostname": 'graph.facebook.com',
    "path": "/v15.0/102711876156078/messages",
    "headers": {
        "Authorization": WHATSAPP_TOKEN,
        "Content-Type": "application/json",
    }

};

function sendMediaOnWhatsApp(messageTo, mediaFile) {
    console.log(mediaFile)
    var reqBH = http.request(WHATSAPPOptions, (resBH) => {
        var chunks = [];
        resBH.on("data", function (chunk) {
            chunks.push(chunk);
        });
        resBH.on("end", function () {
            const body = Buffer.concat(chunks);

        });
    });

    reqBH.write(JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": messageTo,
        "type": "image",
        "image": {
            "link": mediaFile
        }
    }));
    reqBH.end();

}

function sendTextOnWhatsApp(messageTo, messateText) {
    let content = messateText;
    if (content) {
        content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
        content = content.replace(/<strong[^>]*>/g, '*').replace(/<\/strong>/g, '*');
        content = content.replace(/<em[^>]*>/g, '_').replace(/<\/em>/g, '_');
        content = content.replace(/<span*[^>]*>/g, '~').replace(/<\/span>/g, '~');
        content = content.replace('&nbsp;', '\n')
        content = content.replace(/<br[^>]*>/g, '\n')
        content = content.replace(/<\/?[^>]+(>|$)/g, "")

    }

    var reqBH = http.request(WHATSAPPOptions, (resBH) => {
        var chunks = [];
        resBH.on("data", function (chunk) {
            chunks.push(chunk);
        });
        resBH.on("end", function () {
            const body = Buffer.concat(chunks);

        });
    });

    reqBH.write(JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": messageTo,
        "type": "text",
        "text": {
            "body": content
        }
    }));
    reqBH.end();

}

const resetInteractionMapping = (req, res) => {
    InteractionId = req.body.InteractionId
    var valuesUpdate = [[InteractionId]]

    var updoateQuery = "UPDATE InteractionMapping SET is_active =0 WHERE InteractionId =" + InteractionId;
    db.runQuery(req, res, updoateQuery, [valuesUpdate])
}


const updateInteractionMapping = async (req, res) => {
    InteractionId = req.body.InteractionId
    AgentId = req.body.AgentId
    MappedBy = req.body.MappedBy
    is_active = 1
    var values = [[is_active, InteractionId, AgentId, MappedBy]]
    if (AgentId != -1) {
        let nameData = await db.excuteQuery(val.assignedNameQuery, [AgentId])
        let myUTCString = new Date().toUTCString();
        const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let notifyvalues = [[nameData[0].SP_ID, 'Assigned a conversation', 'Assigned a conversation with' + nameData[0].name, AgentId, 'teambox', MappedBy, utcTimestamp]]
        let notifyRes = await db.excuteQuery(val.addNotification, [notifyvalues])
    }
    let myUTCString = new Date().toUTCString();
    const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
    let actionQuery = `insert into InteractionEvents (interactionId,action,action_at,action_by,created_at,SP_ID,Type) values (?,?,?,?,?,?)`

    let actions = await db.excuteQuery(actionQuery, [req.body.InteractionId, req.body?.action, req.body?.action_at, req.body?.action_by, utcTimestamp, req.body?.SP_ID,'text'])

    db.runQuery(req, res, val.updateInteractionMapping, [values])
}

const getInteractionMapping = (req, res) => {
    db.runQuery(req, res, val.getInteractionMapping, [req.params.InteractionId])
}


const getsavedMessages = (req, res) => {
    db.runQuery(req, res, val.savedMessagesQuery, [req.params.SPID])
}

const getquickReply = (req, res) => {
    db.runQuery(req, res, val.getquickReplyQuery, [req.params.SPID])
}

const getTemplates = (req, res) => {
    db.runQuery(req, res, val.getTemplatesQuery, [req.params.SPID])
}


module.exports = {
    getAllFilteredInteraction, getAllAgents, getAllCustomer, insertCustomers, updatedCustomer, getCustomerById, filterCustomers, searchCustomer, blockCustomer,
    createInteraction, resetInteractionMapping, updateInteraction, updateTags, getAllInteraction, getInteractionById, getFilteredInteraction, checkInteractionPinned, getSearchInteraction,
    getAllMessageByInteractionId, insertMessage, deleteMessage, updateMessageRead,
    updateInteractionMapping, deleteInteraction, getInteractionMapping, updatePinnedStatus,
    getsavedMessages, getquickReply, getTemplates, sendTextOnWhatsApp, sendMediaOnWhatsApp, updateNotes, addAction
};






