var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./generalconstant');
const bodyParser = require('body-parser');
const cors = require('cors')
const awsHelper = require('../awsHelper');
const moment = require('moment');
app.use(bodyParser.json());
app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json({ limit: "10000kb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10000kb", extended: true }));


//Default actions
const defaultaction = async (req, res) => {
    try {
        console.log(req.body.SP_ID)
        SP_ID = req.body.SP_ID
        isAgentActive = req.body.isAgentActive
        agentActiveTime = req.body.agentActiveTime
        isAutoReply = req.body.isAutoReply
        autoReplyTime = req.body.autoReplyTime
        isAutoReplyDisable = req.body.isAutoReplyDisable
        isContactAdd = req.body.isContactAdd
        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        pausedTill = req.body.pausedTill
        defaultAdminUid = req.body?.defaultAdminUid
        defaultAdminName = req.body?.defaultAdminName

        console.log(req.body)
        var select = await db.excuteQuery(val.defaultactiondetails, [SP_ID])
        console.log(select)
        if (select.length != 0) {

            var defaultValues = [req.body.isAgentActive, req.body.agentActiveTime, req.body.isAutoReply, req.body.autoReplyTime, req.body.isAutoReplyDisable, req.body.isContactAdd, pausedTill, req.body.created_at,req.body.pauseAgentActiveTime, req.body.pauseAutoReplyTime,defaultAdminUid ,defaultAdminName ,req.body.SP_ID, select[0]?.id]
            var updateddefaultData = await db.excuteQuery(val.updatedefaultactionDetails, defaultValues)

            res.status(200).send({
                msg: 'defaultaction updated successfully !',
                updateddefaultData: updateddefaultData,
                status: 200
            });
        } else {
            var defaultinsert = [req.body.SP_ID, req.body.isAgentActive, req.body.agentActiveTime, req.body.isAutoReply, req.body.autoReplyTime, req.body.isAutoReplyDisable, req.body.isContactAdd, pausedTill, req.body.created_at, req.body.pauseAgentActiveTime, req.body.pauseAutoReplyTime,defaultAdminUid ,defaultAdminName]
            var defaultaction = await db.excuteQuery(val.defaultinsertDetails, [[defaultinsert]])

            res.status(200).send({
                msg: 'defaultaction added successfully !',
                defaultaction: defaultaction,
                status: 200
            });
        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const getdefaultaction = async (req, res) => {
    try {
        var resbyspid = await db.excuteQuery(val.defaultactiondetails, [req.params.spid])
        console.log("message")
        res.status(200).send({
            msg: 'default action got successfully !',
            defaultaction: resbyspid,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}



// Default messages//
const getdefaultmessages = async (req, res) => {
    try {
        var resbyspid = await db.excuteQuery(val.getenabledisable, [req.params.spid])
        console.log("message")
        res.status(200).send({
            msg: 'default action got successfully !',
            defaultaction: resbyspid,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

// const Abledisable=async(req,res)=>{
//     try{
//         console.log(req.body.id)
//         Is_disable=req.body.Is_disable

//         var saveAbledisable = await db.excuteQuery(val.Abledisablequery, [Is_disable, req.body.id]);
//         res.status(200).send({
//             msg: 'save active status',
//             saveAbledisable: saveAbledisable,
//             status: 200
//         });
//     } catch (err) {
//         console.log(err)
//         db.errlog(err);
//         res.send(err)


//     }

// }
const Abledisable = async (req, res) => {
    try {
        console.log(req.body.uid)
        Isdisable = req.body.Is_disable
        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');



        var saveAbledisable = await db.excuteQuery(val.Abledisablequery, [Isdisable, updated_at, req.body.uid]);
        res.status(200).send({
            msg: 'save active messages',
            saveAbledisable: saveAbledisable,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const uploadimg = async (req, res) => {
    try {
        uid = req.body.uid
        title = req.body.title
        description = req.body.description
        value = req.body.value
        override = req.body.override,
            autoreply = req.body.autoreply
        Is_disable = req.body.Is_disable
        spid = req.body.spid
        message_type = req.body.message_type
        link = req.body.link
        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

        // Remove header
        let streamSplit = link.split(';base64,');
        let base64Image = streamSplit.pop();//With the change done in aws helper this is not required though keeping it in case required later.
        let datapart = streamSplit.pop();// this is dependent on the POP above

        let imgType = datapart.split('/').pop();
        let imageName = 'DefaultMessage.png';//Default it to png.
        if (imgType) {
            imageName = 'DefaultMessage' + '.' + imgType;
        }

        let awsres = await awsHelper.uploadStreamToAws(spid + "/" + uid + "/" + imageName, link)
        console.log(awsres.value.Location)

        if (uid != 0) {
            let userimgquery = `UPDATE defaultmessages set SP_ID=?, title=?, description=?, message_type=?, value=?, link=?,override=?,autoreply=?,Is_disable=?,isDeleted=?,updated_at=? where uid =?`;
            let result = await db.excuteQuery(userimgquery, [spid, title, description, message_type, value, awsres.value.Location, override, autoreply, Is_disable, '0', updated_at, uid]);
            console.log(result);
            res.status(200).send({
                status: 200,
                msg: 'Message Updated'
            })
        } else {
            let addMsgValues = [[spid, title, description, message_type, value, awsres.value.Location, override, autoreply, Is_disable, '0', updated_at]]
            let addMessage = await db.excuteQuery(val.addDefaultMsg, [addMsgValues])
            res.status(200).send({
                status: 200,
                msg: 'Message added'
            })
        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const addAndUpdateDefaultMsg = async (req, res) => {
    try {
        uid = req.body.uid
        title = req.body.title
        description = req.body.description
        value = req.body.value
        override = req.body.override,
            autoreply = req.body.autoreply
        Is_disable = req.body.Is_disable
        spid = req.body.spid
        message_type = req.body.message_type
        link = req.body.link
        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');

        let image = link

        if (uid != 0) {
            let userimgquery = `UPDATE defaultmessages set SP_ID=?, title=?, description=?, message_type=?, value=?, link=?,override=?,autoreply=?,Is_disable=?,isDeleted=?,updated_at=? where uid =?`;
            let result = await db.excuteQuery(userimgquery, [spid, title, description, message_type, value, image, override, autoreply, Is_disable, '0', updated_at, uid]);
            console.log(result);
            res.status(200).send({
                status: 200,
                msg: 'Message Updated'
            })
        } else {
            let addMsgValues = [[spid, title, description, message_type, value, image, override, autoreply, Is_disable, '0', updated_at]]
            let addMessage = await db.excuteQuery(val.addDefaultMsg, [addMsgValues])
            res.status(200).send({
                status: 200,
                msg: 'Message added'
            })
        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}
const savedefaultmessages = async (req, res) => {
    try {

        SP_ID = req.body.SP_ID
        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        message_type = req.body.message_type
        link = req.body.link

        let defaultVal = [SP_ID, updated_at, message_type, link]
        let defaultsave = await db.excuteQuery(val.selectdefaultquery, [SP_ID])
        res.status(200).send({
            msg: 'save',
            defaultsave: defaultsave,
            status: 200
        })

    } catch {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}



const deletedefaultactions = async (req, res) => {
    try {
        let myUTCString = new Date().toUTCString();
        const updated_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');


        var deletedefaultQuery = `UPDATE defaultmessages SET isDeleted=1,updated_at=? where SP_ID=? and uid=?`
        let deletepay = await db.excuteQuery(deletedefaultQuery, [updated_at, req.body.spid, req.body.uid])
        res.status(200).send({
            deletepay: deletepay,
            status: 200
        })
    }
    catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}


//   Routing Rules  //
const rotingsave = async (req, res) => {
    try {
        SP_ID = req.body.SP_ID
        contactowner = req.body.contactowner
        assignagent = req.body.assignagent
        broadcast = req.body.broadcast
        roundrobin = req.body.roundrobin
        conversationallowed = req.body.conversationallowed
        manualassign = req.body.manualassign
        assignuser = req.body.assignuser
        timeoutperiod = req.body.timeoutperiod
        isadmin = req.body.isadmin
        assignspecificuser = req.body.assignspecificuser
        selectuser = req.body.selectuser
        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        isMissChatAssigContactOwner = req.body.isMissChatAssigContactOwner
        manualAssignUid = req.body.manualAssignUid
        SpecificUserUid = req.body.SpecificUserUid
        adminName = req.body?.adminName
        adminUid = req.body?.adminUid
        enableAdmin = req.body?.enableAdmin
        isMissedChat = req.body?.isMissedChat
        var select = await db.excuteQuery(val.routingrule, [SP_ID])
       // console.log("select")
        if (select.length != 0) {
           // console.log(req.body.SpecificUserUid ," select.length != 0 "    ,req.body.manualAssignUid)

            var routingValues = [req.body.contactowner, req.body.assignagent, req.body.broadcast, req.body.roundrobin, req.body.conversationallowed, req.body.manualassign, req.body.assignuser, req.body.timeoutperiod, req.body.isadmin, req.body.assignspecificuser, req.body.selectuser, req.body.isMissChatAssigContactOwner, created_at, manualAssignUid, SpecificUserUid,adminName,adminUid,enableAdmin,isMissedChat, req.body.SP_ID]
            //console.log(routingValues)

            var updatedroutingtData = await db.excuteQuery(val.routingdetails, routingValues)

            res.status(200).send({
                msg: 'routing updated successfully !',
                updatedroutingtData: updatedroutingtData,
                status: 200
            });
        } else {
            var routinginsert = [SP_ID, contactowner, assignagent, broadcast, roundrobin, conversationallowed, manualassign, assignuser, timeoutperiod, isadmin, assignspecificuser, selectuser, isMissChatAssigContactOwner, created_at, manualAssignUid, SpecificUserUid,adminName,adminUid,enableAdmin,isMissedChat]
            var insertedRoutes = await db.excuteQuery(val.insertRouteQuery, [[routinginsert]])

            res.status(200).send({
                msg: 'spid not found!',
                insertedRoutes: insertedRoutes,
                status: 200
            });
        }


    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)

    }
}

const getroutingrules = async (req, res) => {
    try {
        // console.log(req.body.spid)
        var resbyspid = await db.excuteQuery(val.routingrule, [req.params.spid])
        console.log("auto-addition")
        res.status(200).send({
            msg: 'auto_addition got successfully !',
            autoaddition: resbyspid,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }


}


// manage storage//
const savemanagestorage = async (req, res) => {
    try {
        console.log(req.body)
        spid = req.body.spid
        autodeletion_message = req.body.autodeletion_message
        autodeletion_media = req.body.autodeletion_media
        autodeletion_contacts = req.body.autodeletion_contacts
        numberof_messages = req.body.numberof_messages
        sizeof_messages = req.body.sizeof_messages
        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        var managebyspid = await db.excuteQuery(val.selectmanage, [spid])
        console.log(managebyspid.length != 0)
        if (managebyspid.length != 0) {
            var managebyVal = [autodeletion_message, autodeletion_media, autodeletion_contacts, numberof_messages, sizeof_messages, created_at, spid]
            var managebyData = await db.excuteQuery(val.updatemanagestorage, managebyVal);
            res.status(200).send({
                msg: 'managestroage updated successfully !',
                managebyData: managebyData,
                status: 200
            });
        } else {
            var InmanageVal = [spid, autodeletion_message, autodeletion_media, autodeletion_contacts, numberof_messages, sizeof_messages, created_at]
            var InmanageData = await db.excuteQuery(val.insertmanagestorage, [[InmanageVal]]);
            res.status(200).send({
                msg: 'managestroage added successfully !',
                InmanageData: InmanageData,
                status: 200
            });
        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

// get auto deletion
const getautodeletion = async (req, res) => {
    try {
        // console.log(req.body.spid)
        let spid = req.params.spid
        let storageUtilizationBytes = await awsHelper.getStorageUtilization(spid, '-1')
        console.log("storageUtilizationBytes"  ,storageUtilizationBytes)
        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        const storageUtilizationKB = (storageUtilizationBytes.totalSize) / 1024;
        const storageUtilizationMB = storageUtilizationKB / 1024;
        const storageUtilizationGB = (storageUtilizationMB / 1024).toFixed(2);

         var resultbyspid = await db.excuteQuery(val.getdeletion, [req.params.spid])
        var resbyspid = await db.excuteQuery(val.messageSizeQuery, [req.params.spid, created_at])
        console.log("routing" ,resbyspid[0]?.message_size ,storageUtilizationBytes?.totalSize)
        res.status(200).send({
            msg: 'routing got successfully !',
            resultbyspid:resultbyspid,
            managestroage: resbyspid[0]?.message_size,
            storageUtilization: storageUtilizationBytes?.totalSize,    // data in bytes
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const manualDelation = async (req, res) => {
    try {

        SPID = req.body.SPID
        manually_deletion_days = req.body.manually_deletion_days
        message_type = req.body.message_type


        function subtractDaysFromNow(manually_deletion_days) {
            return moment().subtract(manually_deletion_days, 'days').format('YYYY-MM-DD');
        }
        //UPDATE Message set is_deleted=1,updated_at=? where SPID=? AND created_at < ?`

        let myUTCString = new Date().toUTCString();
        const created_at = moment.utc(myUTCString).format('YYYY-MM-DD HH:mm:ss');
        const result = subtractDaysFromNow(manually_deletion_days);
        let mediaDeleted = '';
        let textDeleted = '';
        if (message_type == 'Text') {
            textDeleted = await db.excuteQuery(val.deleteText, [created_at, SPID, result])

        } else if (message_type == 'Media') {
            // console.log(Media)
            let deletedData = await awsHelper.deleteObjectFromBucket(manually_deletion_days, SPID);
            mediaDeleted = await db.excuteQuery(val.deleteMedia, [created_at, SPID,'text', result])
        }
        else if (message_type == 'Both') {
            textDeleted = await db.excuteQuery(val.deleteText, [created_at, SPID, result])
            let deletedData = await awsHelper.deleteObjectFromBucket(manually_deletion_days, SPID);
            mediaDeleted = await db.excuteQuery(val.deleteMedia, [created_at, SPID,'text', result])

        }


        let insertmanagestorage = 'INSERT INTO managestorage (SP_ID, autodeletion_message, autodeletion_media, autodeletion_contacts, manually_deletion_days, message_type,created_at,isDeleted) VALUES ?';
        let addManualData = await db.excuteQuery(insertmanagestorage, [[[SPID, '', '', '', manually_deletion_days, message_type, new Date().toUTCString(), '1']]]);


        res.status(200).send({
            msg: 'messages deleted successfully !',
            mediaDeleted: mediaDeleted,
            textDeleted: textDeleted,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
}

const deletedDetails = async (req, res) => {
    try {


        SPID = req.body.SPID
        manually_deletion_days = req.body.Manually_deletion_days
        message_type = req.body.message_type

        function subtractDaysFromNow(manually_deletion_days) {
            return moment().subtract(manually_deletion_days, 'days').format('YYYY-MM-DD');
        }

        const result = subtractDaysFromNow(manually_deletion_days);
        console.log("manually_deletion_days", result)
        let mediaSize = '';
        let textSize = '';
        let dbMedia = '';
        if (message_type == 'Text') {
            textSize = await db.excuteQuery(val.messageSizeQuery, [SPID, result])

        } else if (message_type == 'Media') {
            dbMedia = await db.excuteQuery(val.mediaSizeQuery, [SPID, result])
           
            mediaSize = await awsHelper.getStorageUtilization(SPID, manually_deletion_days)
            dbMedia.forEach(item => {
                mediaSize.totalSize += item.message_size;
                mediaSize.mediaCount = item.message_count;
            });

        } else if (message_type == 'Both') {
            textSize = await db.excuteQuery(val.messageSizeQuery, [SPID, result])
            console.log(SPID, result ,textSize)
            dbMedia = await db.excuteQuery(val.mediaSizeQuery, [SPID, result])
            mediaSize = await awsHelper.getStorageUtilization(SPID, manually_deletion_days)
            dbMedia.forEach(item => {
                mediaSize.totalSize += item.message_size;
                mediaSize.mediaCount = item.message_count;
            });
        }


        res.status(200).send({
            msg: 'messageSize got successfully !',
            textSize: textSize,
            mediaSize: mediaSize,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

}


module.exports = {
    defaultaction, getdefaultaction, getdefaultmessages, Abledisable, uploadimg, deletedefaultactions, savedefaultmessages, rotingsave, getroutingrules, savemanagestorage, getautodeletion, addAndUpdateDefaultMsg,
    manualDelation, deletedDetails
}

