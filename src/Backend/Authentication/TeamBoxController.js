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
const logger = require('../common/logger.log');
const commonFun = require('../common/resuableFunctions.js')
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
    //  logger.info('Received request for getAllAgents', { spID: req.params.spID });
    db.runQuery(req, res, val.selectAllAgentsQuery, [req.params.spID])
    // .then(() => logger.info('Query executed for getAllAgents', { spID: req.params.spID }))
    // .catch(err => logger.error('Error executing query for getAllAgents', { error: err.message, stack: err.stack }));
};

const getAllCustomer = async (req, res) => {
    // logger.info('Received request for getAllCustomer', { spID: req.params.spID, RangeStart: req.params.RangeStart, RangeEnd: req.params.RangeEnd });
    try {
        let RangeStart = parseInt(req.params.RangeStart);
        let RangeEnd = parseInt(req.params.RangeEnd - req.params.RangeStart);
        //  logger.info('RangeStart and RangeEnd calculated', { RangeStart, RangeEnd });

        let contacts = await db.excuteQuery(val.selectAllQuery, [req.params.spID, req.params.spID, req.params.spID, req.params.spID, req.params.spID, RangeStart, RangeEnd]);
        // logger.info('Query executed for getAllCustomer', { spID: req.params.spID, RangeStart, RangeEnd, contacts });
        let isCompleted = false;
        if (contacts?.length === 0 || contacts?.length < RangeEnd) {
            isCompleted = true;
        }
        res.send({
            status: 200,
            results: contacts,
            isCompleted: isCompleted
        });
    } catch (err) {
        logger.error('Error occurred in getAllCustomer', { error: err.message, stack: err.stack });
        res.send({
            status: 500,
            err: err
        });
    }
};

const getCustomerById = (req, res) => {
    // logger.info('Received request for getCustomerById', { id: req.params.id });
    db.runQuery(req, res, val.selectByIdQuery, [req.params.id])
    //  .then(() => logger.info('Query executed for getCustomerById', { id: req.params.id }))
    // .catch(err => logger.error('Error executing query for getCustomerById', { error: err.message, stack: err.stack }));
};

const filterCustomers = (req, res) => {
    //  logger.info('Received request for filterCustomers', { id: req.params.id });
    db.runQuery(req, res, val.filterQuery, [req.params.id])
    //.then(() => logger.info('Query executed for filterCustomers', { id: req.params.id }))
    //.catch(err => logger.error('Error executing query for filterCustomers', { error: err.message, stack: err.stack }));
};

const searchCustomer = (req, res) => {
    let sQuery = "SELECT * from EndCustomer where channel = '" + req.params.Channel + "' and SP_ID=" + req.params.spID;
    if (req.params.key) {
        sQuery = sQuery + " and (Phone_number like '%" + req.params.key + "%' or Name like '%" + req.params.key + "%')";
    }
    // logger.info('Received request for searchCustomer', { sQuery });
    db.runQuery(req, res, sQuery, [req.params.spID, req.params.key, req.params.key])
    //   .then(() => logger.info('Query executed for searchCustomer', { sQuery }))
    //   .catch(err => logger.error('Error executing query for searchCustomer', { error: err.message, stack: err.stack }));
};

const insertCustomers = async (req, res) => {
    //logger.info('Received request for insertCustomers', { body: req.body });
    try {
        let { Name, Phone_number, Channel, OptInStatus, SP_ID, country_code, displayPhoneNumber } = req.body;
        let values = [[Name, Phone_number, Channel, SP_ID, OptInStatus, country_code, displayPhoneNumber]];
        let interactionId;
        let customerId;

        let checkTempContactQuery = `SELECT * FROM EndCustomer WHERE Phone_number = ? AND (isDeleted = 1 or IsTemporary = 1) AND SP_ID = ?`;
        let tempContactResult = await db.excuteQuery(checkTempContactQuery, [Phone_number, SP_ID]);

        if (tempContactResult.length > 0) {
            let resetContactFields = await commonFun.resetContactFields(Phone_number, SP_ID)
            let updateTempContactQuery = `
                UPDATE EndCustomer
                SET Name = ?, channel = ?, OptInStatus = ?, countryCode = ?, displayPhoneNumber = ?, IsTemporary = 0, isDeleted = 0, created_at = NOW()
                WHERE Phone_number = ? AND SP_ID = ?
            `;
            await db.excuteQuery(updateTempContactQuery, [Name, Channel, OptInStatus, country_code, displayPhoneNumber, Phone_number, SP_ID]);
            customerId = tempContactResult[0]?.customerId;
            interactionId = await db.excuteQuery('select * from Interaction where customerId=? and is_deleted !=1 and SP_ID=? order by created_at desc', [customerId, SP_ID]);
            res.status(200).send({
                msg: 'Temporary contact updated to permanent.',
                status: 200,
                customerId: customerId,
                interactionId: interactionId
            });
            // logger.info('Temporary contact updated to permanent', { customerId, interactionId });
        } else {
            let existContactWithSameSpidQuery = `SELECT * FROM EndCustomer WHERE Phone_number = ? AND isDeleted != 1 AND IsTemporary != 1 AND SP_ID = ?`;
            let existingContactResult = await db.excuteQuery(existContactWithSameSpidQuery, [Phone_number, SP_ID]);

            if (existingContactResult.length > 0) {
                res.status(409).send({
                    msg: 'Phone number already exists!',
                    status: 409
                });
                //  logger.warn('Phone number already exists', { Phone_number, SP_ID });
            } else {
                let insertQuery = `
                    INSERT INTO EndCustomer (Name, Phone_number, channel, SP_ID, OptInStatus, countryCode, displayPhoneNumber)
                    VALUES ?
                `;
                let insertedCon = await db.excuteQuery(insertQuery, [values]);
                customerId = insertedCon?.insertId;
                interactionId = await db.excuteQuery('select * from Interaction where customerId=? and is_deleted !=1 and SP_ID=? order by created_at desc', [customerId, SP_ID]);
                res.status(200).send({
                    msg: 'Contact added successfully.',
                    status: 200,
                    customerId: customerId,
                    interactionId: interactionId
                });
                logger.info('New contact added successfully', { customerId, interactionId });
            }
        }
    } catch (error) {
        logger.error('Error inserting/updating contact:', { error: error.message, stack: error.stack });
        res.status(500).send({
            msg: 'Internal Server Error',
            status: 500
        });
    }
};

const updatedCustomer = async (req, res) => {
    // logger.info('Received request for updatedCustomer', { body: req.body });
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

        let updateCustomer = await db.excuteQuery(updateQueryQuery, []);
        res.send({
            status: 200,
            updateCustomer: updateCustomer
        });
        //   logger.info('Customer updated successfully', { customerId: req.body.customerId, updateCustomer });
    } catch (err) {
        //  logger.error('Error updating customer:', { error: err.message, stack: err.stack });
        res.send({
            status: 500,
            err: err
        });
    }
};

const updateTags = (req, res) => {
    var updateQueryQuery = "UPDATE EndCustomer SET tag ='" + req.body.tag + "'  WHERE customerId =" + req.body.customerId;
    //   logger.info('Received request for updateTags', { updateQueryQuery });
    db.runQuery(req, res, updateQueryQuery, [])
    updateActionTagUpdation(req)

    //   .then(() => logger.info('Tags updated successfully', { customerId: req.body.customerId }))
    //  .catch(err => logger.error('Error updating tags', { error: err.message, stack: err.stack }));
};
async function updateActionTagUpdation(req) {
    try {
        let getInteraction = await db.excuteQuery(`SELECT  InteractionId FROM Interaction WHERE customerId = ? and SP_ID=? ORDER BY InteractionId DESC`, [req.body.customerId, req.body?.SP_ID])
        let myUTCString = new Date().toUTCString();
        const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        var interactionId = getInteraction[0].InteractionId;
        let actionQuery = `insert into InteractionEvents (interactionId, action, action_at, action_by, created_at, SP_ID, Type) values (?,?,?,?,?,?,?)`;
        let actiond = await db.excuteQuery(actionQuery, [interactionId, req.body?.action, req.body?.action_at, req.body?.action_by, utcTimestamp, 78, 'text']);
        console.log("updateStatus", updateStatus)
    } catch (err) {
        console.log("err", err)
    }
}
const blockCustomer = async (req, res) => {
    customerId = req.body.customerId;
    isBlocked = req.body.isBlocked;
    let blockedQuery = val.blockCustomerQuery;
    if (req.body.isBlocked == 1) {
        blockedQuery = `UPDATE EndCustomer SET isBlocked =? ,OptInStatus='No' WHERE customerId =?`;
        UnassignedBlockedContact(customerId, req.body?.SP_ID);
    }

    var values = [[customerId, isBlocked]];
    // logger.info('Received request for blockCustomer', { customerId, isBlocked });

    let getInteractionWithCId = await db.excuteQuery('select * FROM Interaction where customerId = ?  and   is_deleted !=1 order by created_at desc limit 1 ', [customerId])

    let myUTCString = new Date().toUTCString();
    const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
    let actionQuery = `insert into InteractionEvents (interactionId, action, action_at, action_by, created_at, SP_ID, Type) values (?,?,?,?,?,?,?)`;

    let actiond = await db.excuteQuery(actionQuery, [getInteractionWithCId[0]?.InteractionId, req.body?.action, req.body?.action_at, req.body?.action_by, utcTimestamp, req.body?.SP_ID, 'text']);

    db.runQuery(req, res, blockedQuery, [isBlocked, customerId])
    //  .then(() => logger.info('Customer blocked successfully', { customerId }))
    // .catch(err => logger.error('Error blocking customer', { error: err.message, stack: err.stack }));
};

async function UnassignedBlockedContact(customerId, spid) {
    try {
        let getInteraction = await db.excuteQuery(`SELECT InteractionId FROM Interaction WHERE customerId = ? and SP_ID=? ORDER BY InteractionId DESC`, [customerId, spid]);
        let findMappingQuery = `SELECT * FROM InteractionMapping WHERE InteractionId = (SELECT InteractionId FROM Interaction WHERE customerId = ? and SP_ID=? ORDER BY InteractionId DESC);`;

        let mapping = await db.excuteQuery(findMappingQuery, [customerId, spid]);

        if (mapping?.length > 0) {
            await db.excuteQuery(`update InteractionMapping set AgentId = -1 where MappingId =?`, [mapping[0]?.MappingId]);
        }

        await db.excuteQuery(`update Interaction set interaction_status=? where InteractionId=? and SP_ID=? AND customerId=?`, ['empty', getInteraction[0]?.InteractionId, spid, customerId]);
        // logger.info('Unassigned blocked contact successfully', { customerId, spid });
    } catch (err) {
        logger.error('Error unassigning blocked contact:', { error: err.message, stack: err.stack });
    }
}

const createInteraction = async (req, res) => {
    //logger.info('Received request for createInteraction', { body: req.body });
    try {
        customerId = req.body.customerId;
        SP_ID = req.body.spid;
        interaction_status = "empty";
        interaction_details = " ";
        interaction_type = "Marketing";
        IsTemporary = req.body?.IsTemporary;
        var values = [[customerId, interaction_status, interaction_details, SP_ID, interaction_type, IsTemporary]];
        //Update EndCustomer for customer

        let isExist = await db.excuteQuery('select * from Interaction where SP_ID=? and customerId=? and is_deleted!=1 and IsTemporary !=1', [SP_ID, customerId]);
        if (isExist?.length > 0) {
            res.status(409).send({
                msg: 'This customer interaction already exists!',
                status: 409
            });
            logger.warn('Customer interaction already exists', { customerId, SP_ID });
        } else {
            let myUTCString = new Date().toUTCString();
            const time = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
            let createInteraction = await db.excuteQuery(val.createInteractionQuery, [values]);
            let updateChannel = await db.excuteQuery('update EndCustomer set channel=? where customerId=? and SP_ID=?', [req.body?.channel, customerId, SP_ID])
            let interactionData = await db.excuteQuery(val.interactionDataById, [SP_ID, createInteraction?.insertId]);
            let currency_nameQuery = `select Currency from localDetails where SP_ID=?;`;
            let currency_name = await db.excuteQuery(currency_nameQuery, [SP_ID]);
            let country_nameQuery = `select Country from companyDetails where SP_ID=?;`;
            let country_name = await db.excuteQuery(country_nameQuery, [SP_ID]);

            let template_costQuery = `select Marketing from whatsappPlanPricing where Market =?;`;
            let template_cost = await db.excuteQuery(template_costQuery, [country_name[0]?.Country]);
            let overall_cost = (-1 * template_cost[0]?.Marketing) ? (-1 * template_cost[0]?.Marketing) : '0';
            let SPTransationsQuery = `INSERT INTO SPTransations (sp_id, transation_date, amount, transation_type, description, interaction_id, currency) values ?`;
            let SPTransationsvalues = [[SP_ID, time, overall_cost, 'Credited', 'Your Wallet amount is debited and credited to Marketing charges', createInteraction.insertId, currency_name[0]?.Currency]];

            let SPTransations = await db.excuteQuery(SPTransationsQuery, [SPTransationsvalues]);

            res.status(200).send({
                SPTransations: SPTransations,
                interaction: interactionData,
                status: 200
            });
            // logger.info('Interaction created successfully', { SP_ID, interactionId: createInteraction.insertId });
        }
    } catch (err) {
        logger.error('Error creating interaction:', { error: err.message, stack: err.stack });
        res.send(err);
    }
};

const updateInteraction = async (req, res) => {
    logger.info(`Received request for updateInteraction ${req.body}`);
    try {
        let updateQuery;
        if (req.body?.IsTemporary && req.body?.IsTemporary != '') {
            updateQuery = "UPDATE Interaction SET IsTemporary ='" + req.body.IsTemporary + "' WHERE InteractionId =" + req.body.InteractionId;
        }
        if (req.body.Status && req.body.Status != '') {
            let myUTCString = new Date().toUTCString();
            const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
            let actionQuery = `insert into InteractionEvents (interactionId, action, action_at, action_by, created_at, SP_ID, Type) values (?,?,?,?,?,?,?)`;

            await db.excuteQuery(actionQuery, [req.body.InteractionId, req.body?.action, req.body?.action_at, req.body?.action_by, utcTimestamp, req.body?.SP_ID, 'text']);
            updateQuery = "UPDATE Interaction SET interaction_status ='" + req.body.Status + "' ,updated_at ='" + utcTimestamp + "' WHERE InteractionId =" + req.body.InteractionId;
            if (req.body.Status == 'Open') {
                let ResolveOpenChat = await db.excuteQuery('UPDATE Interaction SET interaction_status =? WHERE InteractionId !=? and customerId=?', ['Resolved', req.body.InteractionId, req.body?.customerId]);
                logger.info(`ResolveOpenChat if previous is open already ${req.body?.customerId}`)
            }
        }
        if (req.body.AutoReply && req.body.AutoReply != '') {
            updateQuery = "UPDATE Interaction SET AutoReplyStatus ='" + req.body.AutoReply + "',paused_till ='" + req.body.paused_till + "' , AutoReplyUpdatedAt ='" + req.body.updated_at + "'  WHERE InteractionId =" + req.body.InteractionId;
        }

        await db.runQuery(req, res, updateQuery, []);
        logger.info('Interaction updated successfully', { InteractionId: req.body.InteractionId });
    } catch (err) {
        logger.error('Error updating interaction:', { error: err.message, stack: err.stack });
        res.send(err);
    }
};

const deleteInteraction = (req, res) => {
    var deleteQuery = "UPDATE Interaction SET deleted_by =" + req.body.AgentId + " ,is_deleted =1 WHERE InteractionId =" + req.body.InteractionId;
    //   logger.info('Received request for deleteInteraction', { deleteQuery });
    db.runQuery(req, res, deleteQuery, [])
    // .then(() => logger.info('Interaction deleted successfully', { InteractionId: req.body.InteractionId }))
    // .catch(err => logger.error('Error deleting interaction', { error: err.message, stack: err.stack }));
};

const getAllInteraction = (req, res) => {
    //  logger.info('Received request for getAllInteraction', { SP_ID: req.body.SPID });
    db.runQuery(req, res, val.getAllInteraction, [req.body.SPID])
    //  .then(() => logger.info('Query executed for getAllInteraction', { SP_ID: req.body.SPID }))
    // .catch(err => logger.error('Error executing query for getAllInteraction', { error: err.message, stack: err.stack }));
};


const getAllFilteredInteraction = async (req, res) => {
    try {
        //  logger.info('Starting getAllFilteredInteraction function');
        let queryPath = val.interactions;
        let RangeStart = req.body.RangeStart;
        let RangeEnd = req.body.RangeEnd - req.body.RangeStart;

        if (req.body.FilterBy !== 'All') {
            var filterBy = req.body.FilterBy;
            if (filterBy === 'Open' || filterBy === 'Resolved') {
                queryPath += " and ic.interaction_status='" + filterBy + "'";
            } else if (filterBy === 'Unassigned') {
                queryPath += " and ic.InteractionId NOT IN (SELECT InteractionId FROM InteractionMapping where AgentId != -1) and ic.interaction_status='Open' ";
            } else if (filterBy === 'Mine') {
                queryPath += " and ic.InteractionId  IN (SELECT InteractionId FROM InteractionMapping where AgentId=" + req.body.AgentId + " and is_active=1)";
            } else if (filterBy === 'Mentioned') {
                queryPath += " and ic.InteractionId  IN (SELECT interaction_id FROM `Message` WHERE `message_text` LIKE '%@" + req.body.AgentName + "%')";
            } else if (filterBy === 'Pinned') {
                queryPath += " and ic.InteractionId  IN (SELECT InteractionId FROM PinnedInteraction where AgentId=" + req.body.AgentId + ")";
            }
        }

        if (req.body.SearchKey !== '') {
            queryPath += " and EndCustomer.Name like '%" + req.body.SearchKey + "%'";
        }

        queryPath += ` ORDER BY 
          pnin.InteractionId IS NULL,
            LastMessageDate DESC, 
            ic.InteractionId DESC
        LIMIT ?, ?`;

        // logger.debug('Query Path:', queryPath);
        let conversations = await db.excuteQuery(queryPath, [req.body.SPID, req.body.SPID, RangeStart, RangeEnd]);

        let isCompleted = false;
        if (conversations?.length === 0 || conversations?.length < RangeEnd) {
            isCompleted = true;
        }

        res.send({
            status: 200,
            conversations: conversations,
            isCompleted: isCompleted
        });
        //  logger.info('getAllFilteredInteraction function completed successfully');
    } catch (err) {
        logger.error('Error in getAllFilteredInteraction:', err);
        db.errlog(err);

        res.send({
            status: 500,
            err: err
        });
    }
};

const getInteractionById = (req, res) => {
    // logger.info('Starting getInteractionById function');
    db.runQuery(req, res, val.selectInteractionByIdQuery, [req.params.InteractionId]);
    // logger.info('getInteractionById function completed successfully');
};

const checkInteractionPinned = (req, res) => {
    // logger.info('Starting checkInteractionPinned function');
    var queryPath = "SELECT Id FROM PinnedInteraction WHERE InteractionId=? and AgentId=?";
    db.runQuery(req, res, queryPath, [req.params.InteractionId, req.params.AgentId]);
    // logger.info('checkInteractionPinned function completed successfully');
};

const updatePinnedStatus = (req, res) => {
    //  logger.info('Starting updatePinnedStatus function');
    if (req.body.isPinned) {
        var updateQuery = "DELETE FROM PinnedInteraction WHERE Id>=1  and InteractionId =" + req.body.InteractionId;   //and AgentId =" + req.body.AgentId + "
    } else {
        var updateQuery = "INSERT INTO PinnedInteraction (AgentId,InteractionId) VALUES ?";
    }
    var values = [[req.body.AgentId, req.body.InteractionId]];

    db.runQuery(req, res, updateQuery, [values]);
    // logger.info('updatePinnedStatus function completed successfully');
};

// filter interactions
const getFilteredInteraction = (req, res) => {
    //logger.info('Starting getFilteredInteraction function');
    let filterQuery = "SELECT    ic.interaction_status,ic.InteractionId, ec.* FROM Interaction ic JOIN EndCustomer ec ON ic.customerId = ec.customerId WHERE ic.interactionId = (SELECT MAX(interactionId) FROM Interaction WHERE customerId = ic.customerId) and ec.SP_ID=? AND ec.isDeleted !=1 and ic.is_deleted=0";
    var filterBy = req.params.filterBy;

    if (filterBy === 'Open' || filterBy === 'Resolved') {
        filterQuery += " and ic.interaction_status='" + filterBy + "'";
    } else if (filterBy === 'Unassigned') {
        filterQuery += " and ic.InteractionId NOT IN (SELECT InteractionId FROM InteractionMapping)";
    } else if (filterBy === 'Mine') {
        filterQuery += " and ic.InteractionId  IN (SELECT InteractionId FROM InteractionMapping where AgentId=" + req.params.AgentId + " and is_active=1)";
    } else if (filterBy === 'Mentioned') {
        filterQuery += " and ic.InteractionId  IN (SELECT interaction_id FROM `Message` WHERE `message_text` LIKE '%@" + req.params.AgentName + "%')";
    } else if (filterBy === 'Pinned') {
        filterQuery += " and ic.InteractionId  IN (SELECT InteractionId FROM PinnedInteraction where AgentId=" + req.params.AgentId + ")";
    }
    filterQuery += " order by interactionId desc";

    db.runQuery(req, res, filterQuery, [req.params.SPID]);
    // logger.info('getFilteredInteraction function completed successfully');
};

const getSearchInteraction = async (req, res) => {
    try {
        logger.info('Starting getSearchInteraction function');
        var searchKey = req.params.searchKey;
        var spid = req.params.spid;

        var agentId = req.params.AgentId;

        let queryPath = val.searchWithAllData + ` ${agentId != 0 ? 'AND im.AgentId = ?' : ''}`;
        let queryParams = [spid, spid, `%${searchKey}%`, `%${searchKey}%`];
        if (agentId != 0) {
            queryParams.push(agentId);
        }
        let result = await db.excuteQuery(queryPath, queryParams);

        res.send({
            result: result,
            status: 200
        });
        //  logger.info('getSearchInteraction function completed successfully',queryPath);
    } catch (err) {
        logger.error('Error in getSearchInteraction:', err);
        res.send({
            err: err,
            status: 500
        });
    }
};

const getAllMessageByInteractionId = async (req, res) => {
    try {
        //  logger.info('Starting getAllMessageByInteractionId function');
        let result;
        let isCompleted = false;
        let endRange = parseInt(req.params.RangeEnd - req.params.RangeStart);

        if (req.params.Type !== 'media') {
            result = await db.excuteQuery(val.getallMessagesWithScripts, [req.params.InteractionId, req.params.Type, req.params.spid, req.params.InteractionId, req.params.Type, req.params.spid, parseInt(req.params.RangeStart), endRange]);
        } else {
            result = await db.excuteQuery(val.getMediaMessage, [req.params.InteractionId, req.params.spid, req.params.InteractionId, req.params.spid, req.params.Type, parseInt(req.params.RangeStart), endRange]);
        }
        if (result?.length === 0 || result?.length < endRange) {
            isCompleted = true;
        }
        res.send({
            result: result,
            isCompleted: isCompleted,
            status: 200
        });
        //logger.info('getAllMessageByInteractionId function completed successfully');
    } catch (err) {
        logger.error('Error in getAllMessageByInteractionId:', err);
        res.send({
            err: err,
            status: 500
        });
    }
};


const getMessagesByMsgId = async (req, res) => {
    try {

        let result = await db.excuteQuery(val.getmessageBymsgId, [req.params.Message_id, req.params.SP_ID])
        res.send({
            result: result,

            status: 200
        });
    } catch (err) {
        logger.error('Error in getsavedMessages:', err);
        res.status(500).send({ error: 'Internal server error' });
    }
};

const updateMessageRead = (req, res) => {
    // logger.info('Starting updateMessageRead function');
    if (req.body.Message_id > 0) {
        var messageQuery = "UPDATE Message SET is_read =1 WHERE Message_id <=" + req.body.Message_id;
        var values = [];
        db.runQuery(req, res, messageQuery, [values]);
        //    logger.info('updateMessageRead function completed successfully');
    }
};

const deleteMessage = async (req, res) => {
    //logger.info('Starting deleteMessage function');
    //Type=notes
    var messageQuery = "UPDATE Message SET deleted_at ='" + req.body.deleted_at + "', is_deleted =" + req.body.deleted + ", deleted_by =" + req.body.deleted_by + " WHERE Message_id =" + req.body.Message_id;

    var values = [];

    let myUTCString = new Date().toUTCString();
    const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
    let actionQuery = `insert into InteractionEvents (interactionId, action, action_at, action_by, created_at, SP_ID, Type) values (?,?,?,?,?,?,?)`;

    let actiond = await db.excuteQuery(actionQuery, [req.body.InteractionId, req.body?.action, req.body?.action_at, req.body?.action_by, utcTimestamp, req.body?.SP_ID, 'notes']);
    console.log(actiond)
    db.runQuery(req, res, messageQuery, [values]);
    //  logger.info('deleteMessage function completed successfully');
};

const updateNotes = async (req, res) => {
    // logger.info('Starting updateNotes function');
    if (req.body.Message_id > 0) {
        var messageQuery = "UPDATE Message SET message_text =?,message_media=?,media_type=?,Type=? WHERE Message_id =" + req.body.Message_id;
        logger.info(`updateNotes messageQuery completed successfully  ${messageQuery}`);
        var values = [req.body?.message_text, req.body?.message_media, req.body?.message_type, req.body?.message_type];
        let myUTCString = new Date().toUTCString();
        const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        let actionQuery = `insert into InteractionEvents (interactionId, action, action_at, action_by, created_at, SP_ID, Type) values (?,?,?,?,?,?,?)`;

        let actiond = await db.excuteQuery(actionQuery, [req.body.InteractionId, req.body?.action, req.body?.action_at, req.body?.action_by, utcTimestamp, req.body?.SP_ID, 'notes']);
        logger.info(`${values},updateNotes function completed successfully  ${JSON.stringify(actiond)}`);
        db.runQuery(req, res, messageQuery, values);

    }
};

const addAction = async (req, res) => {
    try {
        //  logger.info('Starting addAction function');
        let actionQuery = `insert into InteractionEvents (interactionId,action,action_at,action_by,created_at,SP_ID) values (?,?,?,?,?,?,?)`;

        let values = [req.body.interactionId, req.body.action, req.body.action_at, req.body.action_by, req.body.created_at, req.body.SP_ID];
        await db.excuteQuery(actionQuery, [values]);
        res.send({
            status: 200,
            message: 'Action added successfully'
        });
        //logger.info('addAction function completed successfully');
    } catch (err) {
        logger.error('Error in addAction:', err);
        res.send({
            status: 500,
            message: 'Failed to add action',
            error: err
        });
    }
};

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
            //  console.log("pauseTime", pauseTime != NaN,pauseTime);
            if (!isNaN(pauseTime)) {
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
        logger.info('Starting insertMessage function');
            logger.debug('Request Body:', req.body);
        
        if (req.body.Message_id == '') {
            var messageQuery = val.insertMessageQuery;

            let SPID = req.body.SPID;
            let interaction_id = req.body.InteractionId;
            let customerId = req.body.CustomerId;
            let Agent_id = req.body.AgentId;
            let message_direction = "Out";
            let message_text = req.body.message_text;
            let message_media = req.body.message_media;
            let media_type = req.body.media_type;
            let Message_template_id = req.body.template_id;
            let Quick_reply_id = req.body.quick_reply_id;
            let Type = req.body.message_type;
            let created_at = req.body.created_at;  //send time in utc
            let ExternalMessageId = '';
            let mediaSize = req.body.mediaSize;
            let spNumber = req.body?.spNumber;
            let assignAgent = req.body?.assignAgent;
            var msgVar = req.body?.MessageVariables;

            var header = req.body?.headerText
            var body = req.body?.bodyText
            let DynamicURLToBESent;
            let buttonsVariable = typeof req.body?.buttonsVariable === 'string' ? JSON.parse(req.body?.buttonsVariable) : req.body?.buttonsVariable;
            if(!commonFun.isInvalidParam(req.body?.buttonsVariable) && buttonsVariable.length > 0) {
               DynamicURLToBESent = await removeTags.getDynamicURLToBESent(buttonsVariable, SPID, customerId);
            }

            let agentName = await db.excuteQuery('select name from user where uid=?', [Agent_id]);
            let channelType = await db.excuteQuery('select * from EndCustomer where customerId=? and SP_ID=?', [customerId, SPID]);
            let spchannel = await db.excuteQuery('select channel_id from WhatsAppWeb where spid=? limit 1', [SPID]);
            let uidMentioned = Array.isArray(req.body?.uidMentioned) ? req.body.uidMentioned : [];
            let buttons = JSON.stringify(req?.body?.buttons);
            const channel = channelType.length > 0 ? channelType[0].channel : spchannel[0]?.channel_id;

            var values = [[SPID, Type, ExternalMessageId, interaction_id, Agent_id, message_direction, message_text, message_media, media_type, Message_template_id, Quick_reply_id, created_at, created_at, mediaSize, assignAgent, buttons]];
            let msg_id = await db.excuteQuery(messageQuery, [values]);
            //  logger.debug('Message ID:', msg_id);
            let updateInteraction = await db.excuteQuery(val.updateTempInteractionQuery, [0, interaction_id])
            if (agentName.length >= 0) {
                let mentionQuery = "SELECT * FROM Message WHERE ? LIKE ?";
                let messageTextParameter = `%${message_text}%`; // assuming message_text is the text you want to search
                let agentNameParameter = `@${agentName[0].name}`; // assuming agentName is an array and you want to search for the first agent's name

                var mentionedNotification = await db.excuteQuery(mentionQuery, [messageTextParameter, agentNameParameter]);
            }

            if (Type == 'notes') {
                let myUTCString = new Date().toUTCString();
                const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
                await Promise.all(
                    uidMentioned.map(async (element) => {
                        const check = await commonFun.notifiactionsToBeSent(element, 4);
                        if (check) {
                            let notifyvalues = [
                                [SPID, '@Mention in the Notes', 'You have a been mentioned in the Notes', element, 'teambox', element, utcTimestamp]
                            ];
                            let mentionRes = await db.excuteQuery(val.addNotification, [notifyvalues]);
                        } else {
                            console.log(`Notification disabled for UID: ${element}`);
                        }
                    })
                );
            }

            let content = await removeTags.removeTagsFromMessages(message_text);
            const placeholders = parseMessageTemplate(content);
            console.log(placeholders)
            let results;
            if (placeholders.length > 0) {


                // console.log(msgVar != null,"msgVar",msgVar,msgVar !='')
                if (msgVar != null && msgVar != '') {

                    results = await removeTags.getDefaultAttribue(msgVar, SPID, customerId);
                    console.log("atribute result ", results)
                    placeholders.forEach(placeholder => {
                        const result = results.find(result => result.hasOwnProperty(placeholder));
                        //  console.log(placeholder,"place foreach",results)
                        const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
                        console.log(replacement, "replacement placeholder ", placeholder)
                        content = content.replace(`{{${placeholder}}}`, replacement);
                    });
                } else {

                    results = await removeTags.getDefaultAttribueWithoutFallback(placeholders, SPID, customerId);
                }

                placeholders.forEach(placeholder => {
                    const result = results.find(result => result.hasOwnProperty(placeholder));
                    const replacement = result && result[placeholder] !== undefined ? result[placeholder] : null;
                    content = content.replace(`{{${placeholder}}}`, replacement);
                });
            }

            let middlewareresult = "";
            if (Type != 'notes') {
                if (channelType[0].isBlocked != 1) {
                    if (req?.body?.isTemplate == true && channel == 'WA API') {
                        const mediaType = determineMediaType(media_type);
                        //get header and body variable 
                        let headerVar = await commonFun.getTemplateVariables(msgVar, header, SPID, customerId);
                        let bodyVar = await commonFun.getTemplateVariables(msgVar, body, SPID, customerId);

                        middlewareresult = await middleWare.createWhatsAppPayload(mediaType, req?.body?.messageTo, req?.body?.name, req?.body?.language, headerVar, bodyVar, message_media, SPID, req?.body?.buttons, DynamicURLToBESent);
                       // middlewareresult = await middleWare.channelssetUp(SPID, channel, mediaType, req.body.messageTo, content, message_media, interaction_id, msg_id.insertId, spNumber);
                    } else {
                        if (req.body.message_media != 'text') {
                            const mediaType = determineMediaType(media_type);
                            middlewareresult = await middleWare.channelssetUp(SPID, channel, mediaType, req.body.messageTo, content, message_media, interaction_id, msg_id.insertId, spNumber);
                        } else {
                            middlewareresult = await middleWare.channelssetUp(SPID, channel, 'text', req.body.messageTo, content, message_media, interaction_id, msg_id.insertId, spNumber);
                        }
                        // autoReplyPauseTime(SPID, interaction_id);
                    }
                    if (middlewareresult?.status != 200) {
                        let NotSendedMessage = await db.excuteQuery('UPDATE Message set msg_status=9, whatsAppMessageId=? where Message_id=?', [middlewareresult?.msgId, msg_id.insertId]);
                    };
                    if (middlewareresult?.status == 200) {
                        let UpdatePauseTime = await getDefaultActionTimeandUpdatePauseTime(SPID, customerId)
                        let NotSendedMessage = await db.excuteQuery('UPDATE Message set Message_template_id=?,whatsAppMessageId=? where Message_id=?', [middlewareresult?.message?.messages[0]?.id, middlewareresult?.msgId, msg_id.insertId]);
                    }

                    //  logger.debug('Middleware Result:', middlewareresult);
                } else {
                    let NotSendedMessage = await db.excuteQuery('UPDATE Message set msg_status=10 where Message_id=?', [msg_id.insertId]);
                }
            }
            res.send({ middlewareresult: middlewareresult, status: middlewareresult?.status, insertId: msg_id.insertId });
            logger.info('insertMessage function completed successfully');
        } else {
            let message_text = req.body.message_text;
            let Message_id = req.body.Message_id;
            var values = [[message_text, Message_id]];
            var messageQuery = "UPDATE Message SET updated_at ='" + created_at + "', message_text ='" + message_text + "' WHERE Message_id =" + Message_id;
            db.runQuery(req, res, messageQuery, [values]);
            // logger.info('insertMessage function completed successfully with message update');
        }
    } catch (err) {
        logger.error('Error in insertMessage:', err);
        res.send({ status: 500, error: err });
    }
};


async function getDefaultActionTimeandUpdatePauseTime(spid, customerId) {
    try {
        let getDefaultAction = await db.excuteQuery(val.defaultQuery, [spid]);
        let timePause = getDefaultAction[0]?.pauseAutoReplyTime ? getDefaultAction[0]?.pauseAutoReplyTime : 0;
        let currentTime = new Date(); // Its default gives utc on server and i have to use it to compare only server time so not changed into UTC.
        let autoReplyVal = 0;
        if (timePause != 0) {
            autoReplyVal = new Date(currentTime.getTime() + timePause * 60000); // Clone the UTC time
        }


        //  console.log("currentTime,autoReplyVal ,timePause----", new Date(),  autoReplyVal,timePause,autoReplyVal.toISOString())

        let updatePauseTime = await db.excuteQuery(val.updateContactDefaultQuery, [autoReplyVal, customerId, spid])
        console.log(timePause, spid, "Teambox updatePauseTime", updatePauseTime.affectedRows)
    } catch (err) {

        logger.error(`Error in getDefaultActionTimeandUpdatePauseTime ${err}`);

    }
}

function determineMediaType(mediaType) {
    switch (mediaType) {
        case 'video/mp4':
            return 'video';
        case 'application/pdf':
            return 'document';
        case 'image/jpeg':
        case 'image/jpg':
        case 'image/png':
            return 'image';
        case '':
            return 'text';
        default:
            return 'text'; // Optional: handle other cases
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
    try {
        logger.info('Starting resetInteractionMapping function');
        const InteractionId = req.body.InteractionId;
        logger.debug('InteractionId:', InteractionId);
        const valuesUpdate = [[InteractionId]];

        const updateQuery = "UPDATE InteractionMapping SET is_active =0 WHERE InteractionId =" + InteractionId;
        db.runQuery(req, res, updateQuery, [valuesUpdate], (err, result) => {
            if (err) {
                logger.error('Error in resetInteractionMapping:', err);
                res.status(500).send({ error: 'Database query error' });
            } else {
                logger.info('resetInteractionMapping function completed successfully', result);
                res.send(result);
            }
        });
    } catch (err) {
        logger.error('Error in resetInteractionMapping:', err);
        res.status(500).send({ error: 'Internal server error' });
    }
};

const updateInteractionMapping = async (req, res) => {
    try {
        logger.info('Starting updateInteractionMapping function');
        const InteractionId = req.body.InteractionId;
        const AgentId = req.body.AgentId;
        const MappedBy = req.body.MappedBy;
        const is_active = 1;
        logger.debug('InteractionId:', InteractionId, 'AgentId:', AgentId, 'MappedBy:', MappedBy);

        const querryToGetPreviousAgent = "SELECT AgentId FROM InteractionMapping WHERE InteractionId = ? order by 1 desc";
        const PreviousAgentId = (await db.excuteQuery(querryToGetPreviousAgent, [InteractionId]))[0]?.AgentId;

        const values = [[is_active, InteractionId, AgentId, MappedBy, PreviousAgentId]];
        if (AgentId != -1) {
            const nameData = await db.excuteQuery(val.assignedNameQuery, [AgentId]);
            logger.debug('Name Data:', nameData);

            const myUTCString = new Date().toUTCString();
            const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
            const check = await commonFun.notifiactionsToBeSent(AgentId, 2);
            if (check) {
                const notifyvalues = [[nameData[0].SP_ID, 'New Chat Assigned to You', 'A new Chat has been Assigned to you', AgentId, 'teambox', AgentId, utcTimestamp]];
                const notifyRes = await db.excuteQuery(val.addNotification, [notifyvalues]);
                logger.debug('Notification Result:', notifyRes);
            }
        }

        const myUTCString = new Date().toUTCString();
        const utcTimestamp = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        const actionQuery = `insert into InteractionEvents (interactionId, action, action_at, action_by, created_at, SP_ID, Type) values (?, ?, ?, ?, ?, ?, ?)`;
        const actions = await db.excuteQuery(actionQuery, [req.body.InteractionId, req.body?.action, req.body?.action_at, req.body?.action_by, utcTimestamp, req.body?.SP_ID, 'text']);
        logger.debug('Action Result:', actions);

        db.runQuery(req, res, val.updateInteractionMapping, [values], (err, result) => {
            if (err) {
                logger.error('Error in updateInteractionMapping:', err);
                res.status(500).send({ error: 'Database query error' });
            } else {
                logger.info('updateInteractionMapping function completed successfully', result);
                res.send(result);
            }
        });
    } catch (err) {
        logger.error('Error in updateInteractionMapping:', err);
        res.status(500).send({ error: 'Internal server error' });
    }
};

const getInteractionMapping = (req, res) => {
    try {
        // logger.info('Starting getInteractionMapping function');
        db.runQuery(req, res, val.getInteractionMapping, [req.params.InteractionId], (err, result) => {
            if (err) {
                //  logger.error('Error in getInteractionMapping:', err);
                res.status(500).send({ error: 'Database query error' });
            } else {
                //   logger.info('getInteractionMapping function completed successfully', result);
                res.send(result);
            }
        });
    } catch (err) {
        logger.error('Error in getInteractionMapping:', err);
        res.status(500).send({ error: 'Internal server error' });
    }
};
const getInteraction = (req, res) => {
    try {
        // logger.info('Starting getInteractionMapping function');
        db.runQuery(req, res, 'select * from Interaction where InteractionId =?', [req.params.InteractionId], (err, result) => {
            if (err) {
                //  logger.error('Error in getInteractionMapping:', err);
                res.status(500).send({ error: 'Database query error' });
            } else {
                //   logger.info('getInteractionMapping function completed successfully', result);
                res.send(result);
            }
        });
    } catch (err) {
        logger.error('Error in getInteraction:', err);
        res.status(500).send({ error: 'Internal server error' });
    }
};
const getsavedMessages = (req, res) => {
    try {
        //  logger.info('Starting getsavedMessages function');
        db.runQuery(req, res, val.savedMessagesQuery, [req.params.SPID], (err, result) => {
            if (err) {
                logger.error('Error in getsavedMessages:', err);
                res.status(500).send({ error: 'Database query error' });
            } else {
                //    logger.info('getsavedMessages function completed successfully', result);
                res.send(result);
            }
        });
    } catch (err) {
        logger.error('Error in getsavedMessages:', err);
        res.status(500).send({ error: 'Internal server error' });
    }
};

const getquickReply = (req, res) => {
    try {
        // logger.info('Starting getquickReply function');
        db.runQuery(req, res, val.getquickReplyQuery, [req.params.SPID], (err, result) => {
            if (err) {
                logger.error('Error in getquickReply:', err);
                res.status(500).send({ error: 'Database query error' });
            } else {
                //    logger.info('getquickReply function completed successfully', result);
                res.send(result);
            }
        });
    } catch (err) {
        logger.error('Error in getquickReply:', err);
        res.status(500).send({ error: 'Internal server error' });
    }
};

const getTemplates = (req, res) => {
    try {
        //   logger.info('Starting getTemplates function');
        db.runQuery(req, res, val.getTemplatesQuery, [req.params.SPID], (err, result) => {
            if (err) {
                logger.error('Error in getTemplates:', err);
                res.status(500).send({ error: 'Database query error' });
            } else {
                logger.info('getTemplates function completed successfully', result);
                res.send(result);
            }
        });
    } catch (err) {
        logger.error('Error in getTemplates:', err);
        res.status(500).send({ error: 'Internal server error' });
    }
};

const searchConatct = async (req, res) => {
    try {
        logger.info('Starting searchConatct function');
        let getCustomerQuery = `CALL GetCustomerInteractions(?,?)`
        let resultList = await db.excuteQuery(getCustomerQuery, [req.params.spid, req.params.searchTerm]);
        logger.info(`GetCustomerInteractions response  ${JSON.stringify(resultList)}`);
        res.status(200).send({ resultList: resultList, status: 200 });

    } catch (err) {
        logger.error('Error in searchConatct:', err);
        res.status(500).send({ error: 'Internal server error' });
    }
};


module.exports = {
    getAllFilteredInteraction, getAllAgents, getAllCustomer, insertCustomers, updatedCustomer, getCustomerById, filterCustomers, searchCustomer, blockCustomer,
    createInteraction, resetInteractionMapping, updateInteraction, updateTags, getAllInteraction, getInteractionById, getFilteredInteraction, checkInteractionPinned, getSearchInteraction,
    getAllMessageByInteractionId, insertMessage, deleteMessage, updateMessageRead,
    updateInteractionMapping, deleteInteraction, getInteractionMapping, updatePinnedStatus,
    getsavedMessages, getquickReply, getTemplates, sendTextOnWhatsApp, sendMediaOnWhatsApp, updateNotes, addAction, getMessagesByMsgId, searchConatct, getInteraction
};






