const express = require('express');
const db = require("../dbhelper");
const bodyParser = require('body-parser');
const val = require('./TeamBoxConstant')
const app = express();
const bcrypt = require('bcrypt');
const http = require("https");
const middleWare=require('../middleWare')
const multer = require('multer');
let fs = require('fs-extra');


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



const getAllCustomer = (req, res) => {
    db.runQuery(req, res, val.selectAllQuery, [req.params.spID]);
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

    db.runQuery(req, res, sQuery, [req.params.spID, req.params.key, req.params.key]);
}

const insertCustomers = (req, res) => {
    Name = req.body.Name
    Phone_number = req.body.Phone_number
    channel = req.body.Channel
    OptInStatus = req.body.OptedIn
    SP_ID = req.body.SP_ID
    var values = [[Name, Phone_number, channel, SP_ID, OptInStatus]]
    db.runQuery(req, res, val.insertCustomersQuery, [values])
}

const updatedCustomer = (req, res) => {

    var updateQueryQuery = "UPDATE EndCustomer SET Name ='" + req.body.Name + "',";
    updateQueryQuery += " Phone_number ='" + req.body.Phone_number + "',"
    updateQueryQuery += " channel ='" + req.body.channel + "',"
    updateQueryQuery += " status ='" + req.body.status + "',"
    updateQueryQuery += " OptInStatus ='" + req.body.OptInStatus + "',"
    updateQueryQuery += " sex ='" + req.body.sex + "',"
    updateQueryQuery += " age ='" + req.body.age + "',"
    updateQueryQuery += " emailId ='" + req.body.emailId + "',"
    updateQueryQuery += " Country ='" + req.body.Country + "',"
    updateQueryQuery += " facebookId ='" + req.body.facebookId + "',"
    updateQueryQuery += " InstagramId ='" + req.body.InstagramId + "'"

    updateQueryQuery += " WHERE customerId =" + req.body.customerId

    console.log(updateQueryQuery)
    db.runQuery(req, res, updateQueryQuery, [])


}

const updateTags = (req, res) => {
    var updateQueryQuery = "UPDATE EndCustomer SET tag ='" + req.body.tag + "'  WHERE customerId =" + req.body.customerId
    console.log(updateQueryQuery)
    db.runQuery(req, res, updateQueryQuery, [])


}
const blockCustomer = (req, res) => {
    customerId = req.body.customerId
    isBlocked = req.body.isBlocked
    var values = [[customerId, isBlocked]]
    db.runQuery(req, res, val.blockCustomerQuery, [isBlocked, customerId])
}


const createInteraction = async (req, res) => {
    try {
        customerId = req.body.customerId
        SP_ID = req.body.spid
        interaction_status = "Open"
        interaction_details = " "
        interaction_type = "Marketing"
        var values = [[customerId, interaction_status, interaction_details, SP_ID, interaction_type]]
        console.log(values)
        let time = new Date();
        let createInteraction = await db.excuteQuery(val.createInteractionQuery, [values])

        let currency_nameQuery = ` select Currency   from localDetails where SP_ID=?;`
        let currency_name = await db.excuteQuery(currency_nameQuery, [SP_ID])
        let country_nameQuery = `select Country  from companyDetails where SP_ID=?;`
        let country_name = await db.excuteQuery(country_nameQuery, [SP_ID])

        let template_costQuery = `select Marketing from whatsappPlanPricing where Market =?;`
        let template_cost = await db.excuteQuery(template_costQuery, [country_name[0].Country])
        let overall_cost = (-1 * template_cost[0].Marketing);
        let SPTransationsQuery = `INSERT INTO SPTransations (sp_id,transation_date,amount,transation_type,description,interaction_id,currency) values ?`
        let SPTransationsvalues = [[SP_ID, time, overall_cost, 'Credited', 'Your Wallet amount is debited and credited to Marketing charges', createInteraction.insertId, currency_name[0].Currency]]

        let SPTransations = await db.excuteQuery(SPTransationsQuery, [SPTransationsvalues])

        res.status(200).send({
            SPTransations: SPTransations,
            status: 200
        })
    } catch (err) {
        console.log(err)
        res.send(err)
    }

}

const updateInteraction = (req, res) => {
    if (req.body.Status && req.body.Status != '') {
        var updateQuery = "UPDATE Interaction SET interaction_status ='" + req.body.Status + "' WHERE InteractionId =" + req.body.InteractionId
    }
    if (req.body.AutoReply && req.body.AutoReply != '') {
        var updateQuery = "UPDATE Interaction SET AutoReplyStatus ='" + req.body.AutoReply + "',paused_till ='" + req.body.paused_till + "' , AutoReplyUpdatedAt ='" + req.body.updated_at + "'  WHERE InteractionId =" + req.body.InteractionId
    }



    db.runQuery(req, res, updateQuery, [])
}

deleteInteraction = (req, res) => {
    var deleteQuery = "UPDATE Interaction SET deleted_by =" + req.body.AgentId + " ,is_deletedd =1 WHERE InteractionId =" + req.body.InteractionId
    db.runQuery(req, res, deleteQuery, [])
}

const getAllInteraction = (req, res) => {
    db.runQuery(req, res, val.getAllInteraction, [req.params.id])
}

const getAllFilteredInteraction = (req, res) => {

    //let queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer where Interaction.is_deleted=0 and Interaction.customerId=EndCustomer.customerId";
    let queryPath = "SELECT    ic.interaction_status,ic.InteractionId, ec.*             FROM       Interaction ic    JOIN        EndCustomer ec ON ic.customerId = ec.customerId     WHERE        ic.interactionId = (            SELECT MAX(interactionId)            FROM Interaction            WHERE customerId = ic.customerId        )  and ic.is_deleted=0 order by interactionId desc";
    if (req.body.FilterBy != 'All') {


        var filterBy = req.body.FilterBy
        if (filterBy == 'Open' || filterBy == 'Resolved') {
            queryPath += " and Interaction.interaction_status='" + filterBy + "'"
        } else if (filterBy == 'Unassigned') {
            queryPath += " and Interaction.InteractionId NOT IN (SELECT InteractionId FROM InteractionMapping)"
        } else if (filterBy == 'Mine') {
            queryPath += " and Interaction.InteractionId  IN (SELECT InteractionId FROM InteractionMapping where AgentId=" + req.body.AgentId + " and is_active=1)"
        } else if (filterBy == 'Mentioned') {
            queryPath += " and Interaction.InteractionId  IN (SELECT interaction_id FROM `Message` WHERE `message_text` LIKE '%@" + req.body.AgentName + "%')"
        } else if (filterBy == 'Pinned') {
            queryPath += " and Interaction.InteractionId  IN (SELECT InteractionId FROM PinnedInteraction where AgentId=" + req.body.AgentId + ")"
        }

    }
    if (req.body.SearchKey != '') {
        queryPath += " and EndCustomer.Name like '%" + req.body.SearchKey + "%'"

    }
    console.log(queryPath)
    db.runQuery(req, res, queryPath, [])
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
    var filterBy = req.params.filterBy
    if (filterBy == 'Open' || filterBy == 'Resolved') {
        //	var queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer where Interaction.customerId=EndCustomer.customerId and Interaction.interaction_status='"+filterBy+"' and Interaction.InteractionId  IN (SELECT InteractionId FROM InteractionMapping where AgentId="+req.params.AgentId+")"
        var queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer where Interaction.is_deleted=0 and Interaction.customerId=EndCustomer.customerId and Interaction.interaction_status='" + filterBy + "'"
    } else if (filterBy == 'Unassigned') {
        var queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer WHERE Interaction.is_deleted=0 and Interaction.customerId=EndCustomer.customerId and Interaction.InteractionId NOT IN (SELECT InteractionId FROM InteractionMapping)"
    } else if (filterBy == 'Mine') {
        var queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer WHERE Interaction.is_deleted=0 and Interaction.customerId=EndCustomer.customerId and Interaction.InteractionId  IN (SELECT InteractionId FROM InteractionMapping where AgentId=" + req.params.AgentId + " and is_active=1)"
    } else if (filterBy == 'Mentioned') {
        var queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer WHERE Interaction.is_deleted=0 and Interaction.customerId=EndCustomer.customerId and Interaction.InteractionId  IN (SELECT interaction_id FROM `Message` WHERE `message_text` LIKE '%@" + req.params.AgentName + "%')"
    } else if (filterBy == 'Pinned') {
        var queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer WHERE Interaction.is_deleted=0 and Interaction.customerId=EndCustomer.customerId and Interaction.InteractionId  IN (SELECT InteractionId FROM PinnedInteraction where AgentId=" + req.params.AgentId + ")"
    }

    db.runQuery(req, res, queryPath, [filterBy])
}

const getSearchInteraction = (req, res) => {
    var searchKey = req.params.searchKey
    let queryPath = "SELECT Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer WHERE Interaction.is_deleted=0 and Interaction.customerId=EndCustomer.customerId and EndCustomer.Name like '%" + searchKey + "%'"

    if (req.params.AgentId && req.params.AgentId != '') {
        //queryPath  +=" and Interaction.InteractionId IN (SELECT InteractionId FROM InteractionMapping where AgentId="+req.params.AgentId
        //queryPath  +=" )"
    }



    db.runQuery(req, res, queryPath, [searchKey])
}



const getAllMessageByInteractionId = (req, res) => {
    if (req.params.Type != 'media') {
        //var getAllMessagesByInteractionId = "SELECT Message.* ,Author.name As AgentName, DelAuthor.name As DeletedBy from Message LEFT JOIN user AS DelAuthor ON Message.Agent_id= DelAuthor.uid LEFT JOIN user AS Author ON Message.Agent_id= Author.uid where  Message.interaction_id=" + req.params.InteractionId + " and Type='" + req.params.Type + "'"
        var getAllMessagesByInteractionId = "SELECT Message.* ,Author.name As AgentName, DelAuthor.name As DeletedBy from Message LEFT JOIN user AS DelAuthor ON Message.Agent_id= DelAuthor.uid LEFT JOIN user AS Author ON Message.Agent_id= Author.uid where Message.interaction_id IN ( SELECT interactionId FROM Interaction Where customerid IN ( SELECT customerId FROM Interaction where interactionId = "+ req.params.InteractionId +"))  and Type='" + req.params.Type + "' order by interaction_id desc";
        db.runQuery(req, res, getAllMessagesByInteractionId, [req.params.InteractionId, req.params.Type])
    } else {
        //var getAllMessagesByInteractionId = "SELECT * from Message where message_media != '' and interaction_id=" + req.params.InteractionId + " ORDER BY Message_id DESC"
        var getAllMessagesByInteractionId = "SELECT * from Message where message_media != '' and interaction_id= IN ( SELECT interactionId FROM Interaction Where customerid ( SELECT customeId FROM Interaction where interactionId = "+ req.params.InteractionId +")) ORDER BY Message_id DESC"
        db.runQuery(req, res, getAllMessagesByInteractionId, [req.params.InteractionId, req.params.Type])

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
    var messageQuery = "UPDATE Message SET deleted_at ='" + req.body.deleted_at + "', is_deletedd =" + req.body.deleted + ", deleted_by =" + req.body.deleted_by + " WHERE Message_id =" + req.body.Message_id;
    var values = []
    db.runQuery(req, res, messageQuery, [values])
}


const insertMessage = async (req, res) => {
try{
     console.log("req.body.message_media")
     console.log(req.body)
    if (req.body.Message_id == '') {
        var messageQuery = val.insertMessageQuery

        
        SPID = req.body.SPID
        interaction_id = req.body.InteractionId
        customerId=req.body.customerId
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
        let agentName=await db.excuteQuery('select name from user where uid=?',[Agent_id])
        let channelType=await db.excuteQuery('select channel from EndCustomer where customerId=?',[customerId]);
        console.log("channelType" + channelType);
        let channel=channelType.length >0 ? channelType : 'WhatsApp Official'
        var values = [[SPID, Type, ExternalMessageId, interaction_id, Agent_id, message_direction, message_text, message_media, media_type, Message_template_id, Quick_reply_id, created_at, created_at]]
        db.runQuery(req, res, messageQuery, [values])
        if(agentName.length >=0){
         let mentionQuery=`SELECT * FROM Message WHERE '`+ message_text+`' LIKE '%@`+ agentName[0].name+`%'`;
        
        var mentionedNotification = await db.excuteQuery(mentionQuery, [])
        }
        if(mentionedNotification.length!=0){
          
           let notifyvalues = [[SPID,'Mentioned You', message_text, Agent_id, 'teambox', Agent_id, new Date()]]
           let  mentionRes=await db.excuteQuery(val.addNotification,[notifyvalues])
           console.log("mentionRes")
           
        }
        if (req.body.message_type == 'text') {
            if (req.body.message_media != '') {
              // sendMediaOnWhatsApp(req.body.messageTo, message_media)
               console.log(message_media)
              middleWare.channelssetUp(SPID,channel,'image',req.body.messageTo, message_media)
            }
           // sendTextOnWhatsApp(req.body.messageTo, message_text)
           middleWare.channelssetUp(SPID,channel,'text',req.body.messageTo, message_text)
        }

    } else {
        message_text = req.body.message_text
        Message_id = req.body.Message_id
        var values = [[message_text, Message_id]]
        var messageQuery = "UPDATE Message SET updated_at ='" + created_at + "', message_text ='" + message_text + "' WHERE Message_id =" + Message_id;
        db.runQuery(req, res, messageQuery, [values])
    }
}catch(err){
    console.log(err);
}





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

function sendTextOnWhatsApp(messageTo,messateText){
let content =messateText;
if(content){
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
   
    let nameData = await db.excuteQuery(val.assignedNameQuery, [AgentId])
    
    let notifyvalues = [[nameData[0].SP_ID,'Assigned a conversation', 'Assigned a conversation with' + nameData[0].name, AgentId, 'teambox', MappedBy, new Date()]]
    let notifyRes = await db.excuteQuery(val.addNotification, [notifyvalues])
   
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
    getsavedMessages, getquickReply, getTemplates,sendTextOnWhatsApp,sendMediaOnWhatsApp
};






