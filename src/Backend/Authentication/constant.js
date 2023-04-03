const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "scroot"
const password = "amsdb1234"
const database = "cip_project"


//Queries for user.js
var selectAllQuery = "SELECT * FROM user";
var selectByIdQuery = "SELECT * FROM user WHERE SP_ID=?"
var deletQuery = "UPDATE user SET IsDeleted='1' WHERE SP_ID=?"
var updateQuery = "UPDATE user SET SP_ID=?,password=?,email_id=?,address=?,name=?,mobile_number=?,country=?,timezone=?,CreatedDate=?,LastModifiedDate=?,PasswordHint=?,securityquestion=?,Securityanswer=?,ParentId=?,UserType=?,IsDeleted=?,IsActive=? WHERE uid=?";
var insertQuery = "INSERT INTO user (SP_ID,password,email_id,address,name,mobile_number,country,timezone,CreatedDate,LastModifiedDate,PasswordHint,securityquestion,Securityanswer,ParentId,UserType,IsDeleted,IsActive) VALUES ?";
var allAgents = "select *from user where ParentId=? and UserType=?"
var activeAgent = "select *from user where ParentId=? and UserType=? and IsActive=?"
//for index pages

var loginQuery = "SELECT * FROM user WHERE email_id =?"
var registerQuery = "INSERT INTO user (name,mobile_number,email_id,password) VALUES ?";
var uidresetEmailQuery = "select uid from user where email_id=?"
var verifyUid = "select uid from user where uid=?"
var updatePassword = "UPDATE user SET password=? WHERE uid=?";
//Sms varification variables
const email = "raunakriya816@gmail.com";
const appPassword = "tmmtkimnhfirrxio";
const emailHost = "smpt.gmail.com"
const port = "465"
var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

//Query for contactPage
var sql1 = "Select * from EndCustomer where isBlocked is null and isDeleted is null or isDeleted=0 "
var sql = "INSERT INTO EndCustomer (Name,Phone_number,emailId,age,tag,status,facebookId,InstagramId) VALUES ?";
var editContact = "UPDATE EndCustomer set Phone_number=?,uid=?,SP_ID=?,status=?,Name=?,age=?,sex=?,emailId=?,address=?,pincode=?,city=?,state=?,Country=?,OptInStatus=?,tag=?,facebookId=?,InstagramId=? WHERE customerId=?"
var neweditContact='UPDATE EndCustomer SET '
//Query for campaignPage
var camQuery = "Select * from Campaign"


//Query For automation
var selectQuery = "Select * from AutomatedCampaign"

//Query for dashboard
interactionsQuery = `select interaction_status,count(*) count from Interaction WHERE created_at >=  NOW() - INTERVAL 30 DAY Group by (interaction_status) 
union select 'Total Interactions',count(*) count from Interaction WHERE created_at >=  NOW() - INTERVAL 30 DAY`;
campaignsQuery = ` select campaign_status,count(*) count from CampaignStats where timings >= NOW() - INTERVAL 30 DAY
Group by (campaign_status)`;
agentsQuery = `select Status,count(*) count from AgentDetails  WHERE timings >=  NOW() - INTERVAL 30 DAY  Group by (Status) union select 'Total Agents',
count(*) count from AgentDetails  where  timings >= NOW() - INTERVAL 30 DAY`;
subscribersQuery = `select OptInStatus,count(*) count from EndCustomer WHERE created_at >=  NOW() - INTERVAL 30 DAY   Group by (OptInStatus) union select  'Total Contacts',
count(*) count from EndCustomer WHERE created_at >=  NOW() - INTERVAL 30 DAY`;
conversationQuery = "CALL dashboardRecentConversation()"

//contact filter
filterQuery = "select * from EndCustomer where Phone_number=?"
importquery = "INSERT INTO EndCustomer (Name,Phone_number,emailId,status,sex,age,state,Country,tag,uid,sp_account_id,address,pincode,city,OptInStatus,facebookId,InstagramId) VALUES ?"
searchQuery = "select * from EndCustomer where Phone_number=? or Name=? or emailId=? "
delet = "UPDATE EndCustomer set isDeleted=1 WHERE customerId IN (?)"
selectbyid = "select * from EndCustomer where customerId=?"
isBlockedQuery = "UPDATE EndCustomer set  isBlocked=1,isBlockedOn=now() where customerId=?"
// Path for download sample csv file for import of contact
var Path = 'C:/Users/hp/Downloads/data.csv'

//update query for override 
//updateCustomer='UPDATE EndCustomer SET '+ contact.updateData +'=?' +' WHERE ' + contact.identifierData + '=?'
verfiyCount = "select * from EndCustomer where emailId in (?) and isBlocked is null and isDeleted is null"


// smartReplies Queries
selectAll = `select
t.ID,
t.Title,
t.Description,
count(distinct s.Keyword) as KeywordCount,
t.MatchingCriteria,
count(distinct m.ActionID) as ActionCount
from
SmartReply t
left join SmartReplyAction m ON m.SmartReplyID = t.ID
left join SmartReplyKeywords s ON s.SmartReplyID = t.ID
where t.isDeleted is null and  m.isDeleted is null and  s.isDeleted is null
group by
t.ID,
t.Title,
t.Description,
t.MatchingCriteria`

getsmartReplieswithSPID = `select *from 
(select t.ID AS SRID,
 CONCAT("[",
         GROUP_CONCAT(
              CONCAT("{ID:'",m.ID,"'"),
              CONCAT("Value:'",m.Value,"'"),
              CONCAT(",Message:'",m.Message,"'}")
         )
    ,"]")  as ReplyAction from
SmartReply t
 left join SmartReplyAction m ON m.SmartReplyID = t.ID
 where t.SP_ID=?) as a
 left join 
(select
t.ID AS SRID,
t.Title,
t.Description,
GROUP_CONCAT(s.Keyword) as Keywords,
t.MatchingCriteria
from
SmartReply t
right join SmartReplyKeywords s ON s.SmartReplyID = t.ID
where t.isDeleted is null and t.SP_ID=?) as b on a.SRID=b.SRID `

search = `   select
t.ID,
t.Title,
t.Description,
count(distinct s.Keyword) as KeywordCount,
t.MatchingCriteria,
count(distinct m.ActionID) as ActionCount
from
SmartReply t
left join SmartReplyAction m ON m.SmartReplyID = t.ID
left join SmartReplyKeywords s ON s.SmartReplyID = t.ID
where t.ID=? and t.isDeleted is null
group by
t.ID,
t.Title,
t.Description,
t.MatchingCriteria `





sideNavKeywords = `select
t.ID,
t.Title,
t.Description,
s.Keyword ,
t.MatchingCriteria,
m.Message,
m.Value ,
n.Name 
from
SmartReply t
left join SmartReplyAction m ON m.SmartReplyID = t.ID
left join SRActionMaster n ON n.ID=m.ActionID
left join SmartReplyKeywords s ON s.SmartReplyID = t.ID
where t.ID=?  and t.isDeleted is null and  m.isDeleted is null   and s.isDeleted is null`

alluserofAOwner=`WITH RECURSIVE user_paths AS
( SELECT SP_ID,
         ParentID as ParentId,
         name,
         mobile_number,
         email_id,
         address,
         usertype,

         1 lvl
 FROM user
 WHERE ParentID = ? and sp_id=?
   UNION ALL
   SELECT e.sp_id,
          e.ParentID,
          e.name,
         e.mobile_number,
         e.email_id,
         e.address,
         e.usertype,
          lvl+1
   FROM user e
   INNER JOIN user_paths ep ON ep.sp_id = e.ParentId )
SELECT sp_id,
     ParentId,
     name,
         mobile_number,
         email_id,
         address,
         usertype,
         lvl
FROM user_paths ep;`


addNewReply = `CALL addnewSmartReply(?,?,?,?,?,?,?)`;
deleteSmartReply = `CALL deleteSmartUpdate(?)`;
deletMessage = `update SmartReplyAction set isDeleted='1',isDeletedOn=now() where SmartReplyID=?`;
editMessage = `update SmartReplyAction set Message=? where SmartReplyID=?`;
editAction = `update SmartReplyAction set ActionID=?,Value=? where SmartReplyID=?`;
removeKeyword=`UPDATE SmartReplyKeywords set  isDeleted=1 , isDeletedOn=now() where SmartReplyId=? and Keyword=?`
updateSmartReply=`CALL updateSmartReply(?,?,?,?,?,?,?) `;


module.exports = {
    host, user, password, database, selectAllQuery, selectByIdQuery, deletQuery, insertQuery,
    updateQuery, loginQuery, registerQuery, email, appPassword, emailHost, port, sql, sql1, camQuery, selectQuery,
    otp, updatePassword, uidresetEmailQuery, verifyUid, interactionsQuery, campaignsQuery, agentsQuery,
    subscribersQuery, filterQuery, importquery, searchQuery, Path, verfiyCount, selectAll, search, sideNavKeywords,
    addNewReply, delet, editContact, selectbyid, allAgents, activeAgent, conversationQuery, isBlockedQuery,
    deleteSmartReply, deletMessage, editMessage, editAction, getsmartReplieswithSPID,alluserofAOwner,neweditContact,
    removeKeyword,updateSmartReply
}