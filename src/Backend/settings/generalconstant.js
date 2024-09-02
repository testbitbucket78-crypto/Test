const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "CIP"
const password = "cip#321#"
const database = "cip_project"


//__________ Bucket Acess ____________//
const accessKeyId = 'AKIAYY5FSMYVNUZHPOEH'
const secretAccessKey = '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'
const region = 'ap-south-1'



// default actions

defaultactiondetails = 'select * from defaultActions where spid=?'
updatedefaultactionDetails = 'UPDATE defaultActions SET isAgentActive=?,agentActiveTime=?,isAutoReply=?,autoReplyTime=?,isAutoReplyDisable=?,isContactAdd=?,pausedTill=?,updated_at=?,pauseAgentActiveTime=?,pauseAutoReplyTime=?,defaultAdminUid=? ,defaultAdminName=? Where spid=? and id=?'
defaultinsertDetails = 'INSERT INTO defaultActions(spid, isAgentActive,agentActiveTime,isAutoReply,autoReplyTime,isAutoReplyDisable,isContactAdd,pausedTill,created_at,pauseAgentActiveTime,pauseAutoReplyTime,defaultAdminUid ,defaultAdminName) VALUES ?'

// default messages
getenabledisable = 'select * from defaultmessages where SP_ID=? and isDeleted !=1'
var Abledisablequery='UPDATE defaultmessages SET Is_disable=?,updated_at=? WHERE uid=? '
selectdefaultquery = `select *from defaultmessages where SP_ID=? and isDeleted !=1`
uploaddetails = 'select * from companyDetails where SP_ID=? and isDeleted !=1'
addDefaultMsg='INSERT INTO defaultmessages (SP_ID,title,description,message_type,value,link,override,autoreply,Is_disable,isDeleted,created_at) values ?'

// routing rules
routingrule = 'select * from routingrules where SP_ID=?'
routingdetails = 'UPDATE routingrules SET  contactowner=?,assignagent=?,broadcast=?,roundrobin=?,conversationallowed=?,manualassign=?,assignuser=?,timeoutperiod=?,isadmin=?,assignspecificuser=?,selectuser=?,isMissChatAssigContactOwner=?,updated_at=?,manualAssignUid=?,SpecificUserUid=?,adminName=?,adminUid=? Where SP_ID=?'
insertRouteQuery=`INSERT INTO routingrules (SP_ID,contactowner,assignagent,broadcast,roundrobin,conversationallowed,manualassign,assignuser,timeoutperiod,isadmin,assignspecificuser,selectuser,isMissChatAssigContactOwner,created_at,manualAssignUid,SpecificUserUid,adminName,adminUid) VALUES ?`

// manage storage
selectmanage = 'select * from managestorage where SP_ID=? AND  isDeleted !=1'
updatemanagestorage = 'UPDATE  managestorage SET  autodeletion_message=?, autodeletion_media=?, autodeletion_contacts=?, numberof_messages=?, sizeof_messages=?,updated_at=? Where SP_ID=? and isDeleted !=1'
insertmanagestorage = 'INSERT INTO managestorage (SP_ID, autodeletion_message, autodeletion_media, autodeletion_contacts, numberof_messages, sizeof_messages,created_at) VALUES ?'
getdeletion = 'select * from managestorage where SP_ID=? AND  isDeleted !=1'


//DEFAULT MESSAGE 


noAgentReply=`SELECT
ic.interaction_status,
ic.InteractionId,
ic.customerId,
ec.channel,
ec.phone_number AS customer_phone_number,
dm.*,
latestmsg.*
FROM
Interaction ic
JOIN EndCustomer ec ON ic.customerId = ec.customerId
JOIN defaultmessages dm ON dm.SP_ID = ic.SP_ID
JOIN (
SELECT subLatestMessage.* FROM (
SELECT
    *,
    MAX(updated_at) AS latestMessageDate
FROM Message
WHERE  (system_message_type_id IS NULL OR system_message_type_id IN (1, 2,3,5,6))

GROUP BY interaction_id) subLatestMessage where subLatestMessage.message_direction = 'IN'
) latestmsg ON ic.InteractionId = latestmsg.interaction_id
where (ic.interaction_status = 'open' OR  ic.interaction_status = 'Open Interactions')  and ic.is_deleted=0 and dm.title = 'No Agent Reply'
AND dm.Is_disable=1 and latestmsg.updated_at <= DATE_SUB(NOW(), INTERVAL dm.autoreply MINUTE)`



let CustomerReplyReminder = `SELECT
ic.InteractionId,
ic.customerId,
m.*,
ec.channel,
ec.phone_number AS customer_phone_number
FROM
Interaction ic
JOIN (
SELECT
    interaction_id,
    MAX(updated_at) AS latestMessageDate
FROM Message
WHERE message_direction = 'out' 
AND (system_message_type_id IS NULL OR system_message_type_id IN (1, 2,3,4,6))
AND updated_at <= DATE_SUB(NOW(), INTERVAL 23 HOUR)
GROUP BY interaction_id
) latestMsg ON ic.interactionId = latestMsg.interaction_id
JOIN Message m ON latestMsg.interaction_id = m.interaction_id AND latestMsg.latestMessageDate = m.updated_at
LEFT JOIN Message m_in ON ic.InteractionId = m_in.interaction_id
AND m_in.message_direction = 'IN'
AND m_in.updated_at > latestMsg.latestMessageDate
LEFT JOIN EndCustomer ec ON ic.customerId = ec.customerId
WHERE
(ic.interaction_status = 'Open' OR ic.interaction_status = 'Open Interactions') and ic.is_deleted=0
AND ic.SP_ID IN (SELECT SP_ID FROM defaultmessages WHERE Is_disable = 1 and title='No Customer Reply Reminder')
AND m_in.interaction_id IS NULL
group by latestMsg.interaction_id`







noCustomerRqplyTimeOut=`SELECT
	ic.interaction_status,
    ic.InteractionId,
    ic.customerId,
    ec.channel,
    ec.phone_number AS customer_phone_number,
    dm.*,
    latestmsg.*
FROM
    Interaction ic
JOIN EndCustomer ec ON ic.customerId = ec.customerId
JOIN defaultmessages dm ON dm.SP_ID = ic.SP_ID
JOIN (
SELECT subLatestMessage.* FROM (
    SELECT
        *,
        MAX(updated_at) AS latestMessageDate
    FROM Message
    WHERE  (system_message_type_id IS NULL OR system_message_type_id IN (1, 2,3,4,5))
    
    GROUP BY interaction_id) subLatestMessage where subLatestMessage.message_direction = 'out'
    ) latestmsg ON ic.InteractionId = latestmsg.interaction_id
where (ic.interaction_status = 'open' OR  ic.interaction_status = 'Open Interactions') and ic.is_deleted=0 and dm.title = 'No Customer Reply Timeout'
AND dm.Is_disable=1 and latestmsg.updated_at <= DATE_SUB(NOW(), INTERVAL dm.autoreply MINUTE)`

systemMsgQuery='UPDATE Message set system_message_type_id=?,updated_at=? where Message_id=?'
selectdefaultMsgQuery = `SELECT * FROM defaultmessages WHERE Is_disable = 1 and title=? and SP_ID=?`;

assignCount=`SELECT 
  COUNT(*) AS count
FROM 
    InteractionMapping im
JOIN 
    (SELECT 
        InteractionId,
        MAX(created_at) AS latest_created_at
     FROM 
        InteractionMapping
     GROUP BY 
        InteractionId) AS latest_interactions
ON 
    im.InteractionId = latest_interactions.InteractionId 
AND 
    im.created_at = latest_interactions.latest_created_at
WHERE 
    im.AgentId = ?
AND 
    im.InteractionId IN (
        SELECT 
            InteractionId 
        FROM 
            Interaction 
        WHERE 
            (interaction_status = 'open' OR interaction_status = 'Open Interactions') 
            AND SP_ID = ?
    );
;`


checkAssignInteraction=`SELECT * FROM InteractionMapping WHERE InteractionId = ? order by  MappingId desc limit 1`

messageSizeQuery=`SELECT 
count( LENGTH(message_media) + LENGTH(Type) + LENGTH(message_text) ) AS message_size,
COUNT(DISTINCT message_id) AS message_count 
FROM 
 Message
WHERE 
 SPID= ? AND is_deleted !=1 and (message_media is null OR message_media="") 
AND   DATE(created_at) <= ?;`

mediaSizeQuery=`SELECT 
count( LENGTH(message_media) + LENGTH(Type) + LENGTH(message_text) ) AS message_size,
COUNT(DISTINCT message_id) AS message_count 
FROM 
 Message
WHERE 
 SPID= ? AND is_deleted !=1 and !(message_media is null OR message_media="") 
AND   DATE(created_at) <= ?;`

deleteText=`UPDATE Message set is_deleted=1,updated_at=? where SPID=? and (media_type is null OR media_type="")  AND DATE(created_at) <=  ? `
deleteMedia=`UPDATE Message set is_deleted=1,updated_at=? where SPID=? and  ( media_type !="")   AND DATE(created_at) <=  ? `

// default sms query

let isNoReplySent = `select * from Message where interaction_id =? and system_message_type_id=4`
let getInteractionbyId =`select * from Interaction WHERE InteractionId=? and interaction_status=?  and is_deleted !=1`
let getLatestMsgbyInteraction = `SELECT M.interaction_id, M.SPID, M.Agent_id, MAX(M.Message_id) as MaxMessageId, M.updated_at
 ,dm.autoreply, dm.value, dm.message_type, dm.link, ec.channel,ec.Phone_number as customer_phone_number, interaction_status, 
       ms.Message_id as SystemReplyMessageId, ms.system_message_type_id
    FROM Interaction I
     left Join  Message M on I.InteractionId = M.interaction_id 
     Left join EndCustomer ec on I.customerId = ec.customerId
     left join Message ms on I.InteractionId = ms.interaction_id and ms.system_message_type_id = 4
     left join defaultmessages dm on dm.SP_ID = M.SPID and title='No Agent Reply' and dm.isDeleted !=1
     WHERE (M.msg_status != 9 AND M.msg_status != 10) 
      AND M.is_deleted != 1 and I.interaction_status = 'Open' and I.is_deleted !=1
    GROUP BY M.interaction_id`

let defaultMessageQuery = `SELECT * FROM defaultmessages where SP_ID=? AND title=? and isDeleted !=1` 
let customerPhone =`select * from EndCustomer where customerId=?`
module.exports={
    defaultactiondetails,updatedefaultactionDetails,defaultinsertDetails,getenabledisable,Abledisablequery,selectdefaultquery,uploaddetails,routingrule,routingdetails,selectmanage,updatemanagestorage,insertmanagestorage,getdeletion,insertRouteQuery,
    CustomerReplyReminder,systemMsgQuery,selectdefaultMsgQuery,noCustomerRqplyTimeOut,noAgentReply,addDefaultMsg,assignCount,checkAssignInteraction,
    messageSizeQuery,deleteText,deleteMedia,mediaSizeQuery,isNoReplySent,getInteractionbyId,getLatestMsgbyInteraction,defaultMessageQuery,customerPhone
}