const db = require("../dbhelper");

const host= "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user= "scroot"
const password= "amsdb1234"
const database= "cip_project"


//Query for contactPage
var selectAllQuery = "SELECT * from EndCustomer where SP_ID=? and isBlocked !=1";
var insertCustomersQuery = "INSERT INTO EndCustomer (Name,Phone_number,channel,SP_ID,OptInStatus) VALUES ?"
var filterQuery="SELECT * from EndCustomer where Phone_number=?"
var searchQuery="SELECT * from EndCustomer where SP_ID=? and (Phone_number like ? or Name like ?)"
var selectByIdQuery="SELECT * FROM EndCustomer WHERE customerId=?"
var blockCustomerQuery="UPDATE EndCustomer SET isBlocked =? WHERE customerId =?";



//var selectAllAgentsQuery = "WITH RECURSIVE user_paths AS ( SELECT SP_ID,ParentID as ParentId, uid,name, mobile_number,email_id,address,usertype,1 lvl FROM user WHERE ParentID = 0 and sp_id=? UNION ALL SELECT e.sp_id, e.ParentID, e.uid, e.name, e.mobile_number,e.email_id,e.address,e.usertype,lvl+1 FROM user e INNER JOIN user_paths ep ON ep.sp_id = e.ParentId ) SELECT sp_id, ParentId, uid,name, mobile_number, email_id, address, usertype, lvl FROM user_paths ep ";
var selectAllAgentsQuery = "SELECT * from user where SP_ID=?";



var createInteractionQuery = "INSERT INTO Interaction (customerId,interaction_status,interaction_details) VALUES ?"
var updateInteractionQuery="UPDATE Interaction SET interaction_status =? WHERE InteractionId =?";

var getAllInteraction = "SELECT  Interaction.AutoReplyStatus,Interaction.AutoReplyUpdatedAt, Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer where Interaction.customerId=EndCustomer.customerId OR Interaction.customerId=EndCustomer.Phone_number"
//var searchInteractionQuery="SELECT * from Interaction where Phone_number=? or Name=?"
var selectInteractionByIdQuery="SELECT * FROM Interaction WHERE Interaction.InteractionId=?"



var getAllMessagesByInteractionId = "SELECT Message.* ,Author.name As AgentName, DelAuthor.name As DeletedBy from Message LEFT JOIN user AS DelAuthor ON Message.Agent_id= DelAuthor.uid LEFT JOIN user AS Author ON Message.Agent_id= Author.uid where  Message.interaction_id=? and Type=?"


var insertMessageQuery = "INSERT INTO Message (Type,ExternalMessageId, interaction_id, Agent_id, message_direction,message_text,message_media,media_type,Message_template_id,Quick_reply_id,created_at,updated_at) VALUES ?"



var updateInteractionMapping="INSERT INTO InteractionMapping (InteractionId,AgentId,MappedBy) VALUES ?"
var getInteractionMapping = "SELECT * from InteractionMapping,user where user.uid=InteractionMapping.AgentId  and InteractionMapping.InteractionId=? ORDER BY MappingId DESC LIMIT 1"



module.exports={host,user,password,database,
selectAllAgentsQuery,selectAllQuery,insertCustomersQuery,filterQuery,searchQuery,selectByIdQuery,blockCustomerQuery,
createInteractionQuery,updateInteractionQuery,getAllInteraction,selectInteractionByIdQuery,
getAllMessagesByInteractionId,insertMessageQuery,
updateInteractionMapping,getInteractionMapping}


