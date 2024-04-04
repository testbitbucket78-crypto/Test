const db = require("../dbhelper");

const host= "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user= "scroot"
const password= "amsdb1234"
const database= "cip_project"


//Query for contactPage
var selectAllQuery = "SELECT * from EndCustomer where SP_ID=? and isBlocked !=1 and isDeleted !=1";
var insertCustomersQuery = "INSERT INTO EndCustomer (Name,Phone_number,channel,SP_ID,OptInStatus,countryCode,displayPhoneNumber) VALUES ?"
var filterQuery="SELECT * from EndCustomer where Phone_number=? and isDeleted !=1"
var searchQuery="SELECT * from EndCustomer where SP_ID=? and (Phone_number like ? or Name like ?)"
var selectByIdQuery="SELECT * FROM EndCustomer WHERE customerId=? and isDeleted !=1"
var blockCustomerQuery="UPDATE EndCustomer SET isBlocked =? WHERE customerId =?";



var selectAllAgentsQuery = `SELECT r.RoleName as UserType ,u.name as name , u.uid
FROM roles r
JOIN user u ON u.UserType = r.roleID
where u.isDeleted !=1 and u.SP_ID=?`

//var selectAllAgentsQuery = "SELECT * from user where SP_ID=?";



var createInteractionQuery = "INSERT INTO Interaction (customerId,interaction_status,interaction_details,SP_ID,interaction_type) VALUES ?"
var updateInteractionQuery="UPDATE Interaction SET interaction_status =? WHERE InteractionId =?";

var getAllInteraction="SELECT ic.AutoReplyStatus,ic.AutoReplyUpdatedAt,ic.paused_till, ic.interaction_status,ic.InteractionId, ec.*     FROM    Interaction ic JOIN    EndCustomer ec ON ic.customerId = ec.customerId WHERE    ic.interactionId = (        SELECT MAX(interactionId)        FROM Interaction        WHERE customerId = ic.customerId    ) and ec.SP_ID=?  order by interactionId desc;"
//var getAllInteraction = "SELECT  Interaction.AutoReplyStatus,Interaction.AutoReplyUpdatedAt,Interaction.paused_till, Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer where Interaction.is_deleted=0 and Interaction.customerId=EndCustomer.customerId OR Interaction.customerId=EndCustomer.Phone_number"
//var searchInteractionQuery="SELECT * from Interaction where Phone_number=? or Name=?"
var selectInteractionByIdQuery="SELECT * FROM Interaction WHERE Interaction.InteractionId=?"



var getAllMessagesByInteractionId = "SELECT Message.* ,Author.name As AgentName, DelAuthor.name As DeletedBy from Message LEFT JOIN user AS DelAuthor ON Message.Agent_id= DelAuthor.uid LEFT JOIN user AS Author ON Message.Agent_id= Author.uid where  Message.interaction_id=? and Type=?"


var insertMessageQuery = "INSERT INTO Message (SPID,Type,ExternalMessageId, interaction_id, Agent_id, message_direction,message_text,message_media,media_type,Message_template_id,Quick_reply_id,created_at,updated_at,mediaSize) VALUES ?"



var updateInteractionMapping="INSERT INTO InteractionMapping (is_active,InteractionId,AgentId,MappedBy) VALUES ?"
var getInteractionMapping = "SELECT * from InteractionMapping,user where user.uid=InteractionMapping.AgentId  and  is_active=1 and InteractionMapping.InteractionId=? ORDER BY MappingId DESC LIMIT 1"

var savedMessagesQuery = "SELECT * from savedMessages where is_active=1 and SPID=?";
var getquickReplyQuery = "SELECT * from quickReply where is_active=1 and SPID=?";
//var getTemplatesQuery =  "SELECT * from templates where is_active=1 and SPID=?";
var getTemplatesQuery = `SELECT * FROM templateMessages WHERE spid=? and isDeleted !=1 and isTemplate=1`;

//_________________________________FOR SETTINGS NOTIFICATIONS  ________________________//
var addNotification = `INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`
var assignedNameQuery = `SELECT name,SP_ID from user where uid=?`;


// interaction with messages

var  interactions =`SELECT 
ic.interaction_status, 
ic.InteractionId, 
ec.*,
last_message.LastMessageId,
COALESCE(unread_count.UnreadCount, 0) AS UnreadCount,
m.*
FROM 
Interaction ic
JOIN 
EndCustomer ec ON ic.customerId = ec.customerId
JOIN (
SELECT 
    ic.InteractionId,
    MAX(m.Message_id) AS LastMessageId
FROM 
    Interaction ic
JOIN 
    Message m ON ic.InteractionId = m.interaction_id
GROUP BY 
    ic.InteractionId
) AS last_message ON ic.InteractionId = last_message.InteractionId
LEFT JOIN (
SELECT 
    ic.InteractionId,
    COUNT(*) AS UnreadCount
FROM 
    Interaction ic
JOIN 
    Message m ON ic.InteractionId = m.interaction_id
WHERE
    m.is_read = 0
    AND m.message_direction ='IN' 
GROUP BY 
    ic.InteractionId
) AS unread_count ON ic.InteractionId = unread_count.InteractionId
LEFT JOIN Message m ON ic.InteractionId = m.interaction_id AND m.Message_id = last_message.LastMessageId
WHERE 
ic.interactionId IN (
    SELECT MAX(interactionId)
    FROM Interaction
    WHERE customerId = ic.customerId
    GROUP BY customerId
) 
AND ec.SP_ID = ?
AND ec.isDeleted != 1
AND ic.is_deleted = 0
ORDER BY 
ic.interactionId DESC
LIMIT ?,?`

module.exports={host,user,password,database,
selectAllAgentsQuery,selectAllQuery,insertCustomersQuery,filterQuery,searchQuery,selectByIdQuery,blockCustomerQuery,
createInteractionQuery,updateInteractionQuery,getAllInteraction,selectInteractionByIdQuery,
getAllMessagesByInteractionId,insertMessageQuery,
updateInteractionMapping,getInteractionMapping,
savedMessagesQuery,getquickReplyQuery,getTemplatesQuery,
addNotification,assignedNameQuery,interactions
}


