const db = require("../dbhelper");

const host= "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user= "scroot"
const password= "amsdb1234"
const database= "cip_project"


//Queries for user.js
var selectAllQuery = "SELECT * FROM user";
var selectByIdQuery="SELECT * FROM user WHERE userId=?"
var deletQuery="DELETE FROM user WHERE userId=?"
var updateQuery="UPDATE user SET userId=?,password=?,email_id=?,address=?,name=?,mobile_number=?,country=?,timezone=?,CreatedDate=?,LastModifiedDate=?,PasswordHint=?,securityquestion=?,Securityanswer=?,ParentId=?,UserType=?,IsDeleted=?,IsActive=? WHERE uid=?";
var insertQuery = "INSERT INTO user (userId,password,email_id,address,name,mobile_number,country,timezone,CreatedDate,LastModifiedDate,PasswordHint,securityquestion,Securityanswer,ParentId,UserType,IsDeleted,IsActive) VALUES ?";

//for index pages

var loginQuery="SELECT * FROM user WHERE email_id =?"
var registerQuery = "INSERT INTO user (name,mobile_number,email_id,password) VALUES ?";
var uidresetEmailQuery="select uid from user where email_id=?"
var verifyUid="select uid from user where uid=?"
var updatePassword="UPDATE user SET password=? WHERE uid=?";
//Sms varification variables
 const email="raunakriya816@gmail.com";
 const appPassword="tmmtkimnhfirrxio";
 const emailHost="smpt.gmail.com"
 const port="465"
var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

//Query for contactPage
var sql1="Select * from EndCustomer"
var sql = "INSERT INTO EndCustomer (Name,Phone_number,emailId,age,tag,status,facebookId,InstagramId) VALUES ?";
var editContact="UPDATE EndCustomer set Phone_number=?,uid=?,sp_account_id=?,status=?,Name=?,age=?,sex=?,emailId=?,address=?,pincode=?,city=?,state=?,Country=?,OptInStatus=?,tag=?,facebookId=?,InstagramId=? WHERE customerId=?"
//Query for campaignPage
var camQuery="Select * from Campaign"


//Query For automation
var selectQuery="Select * from AutomatedCampaign"

//Query for dashboard
interactionsQuery="select interaction_status,count(*) count from Interaction where  (customerId=1) Group by (interaction_status)  union select 'Total Interactions',count(*) count from Interaction where  customerId=1";
campaignsQuery="select campaign_status,count(*) count from CampaignStats where  (customerID=1) Group by (campaign_status)";
agentsQuery="select Status,count(*) count from AgentDetails where  (uid=1) Group by (Status) union select 'Total Agents',count(*) count from AgentDetails where  uid=1";
subscribersQuery="select OptInStatus,count(*) count from EndCustomer  Group by (OptInStatus) union select  'Total Subscriber',count(*) count from EndCustomer";

//contact filter
filterQuery="select * from EndCustomer where Phone_number=?"
importquery="INSERT INTO EndCustomer (Name,Phone_number,emailId,status,sex,age,state,Country,tag,uid,sp_account_id,address,pincode,city,OptInStatus,facebookId,InstagramId) VALUES ?"
searchQuery="select * from EndCustomer where Phone_number=? or Name=? or emailId=?"
delet="DELETE FROM EndCustomer WHERE customerId IN (?)"
selectbyid="select * from EndCustomer where customerId=?"
// Path for download sample csv file for import of contact
var Path='C:/Users/hp/Downloads/data.csv'

//update query for override 
//updateCustomer='UPDATE EndCustomer SET '+ contact.updateData +'=?' +' WHERE ' + contact.identifierData + '=?'
verfiyCount="select * from EndCustomer where emailId in (?)"


// smartReplies Queries
selectAll=`select
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
group by
t.ID,
t.Title,
t.Description,
t.MatchingCriteria`

search=`   select
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
where t.ID=?
group by
t.ID,
t.Title,
t.Description,
t.MatchingCriteria `





sideNavKeywords=`select
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
where t.ID=?`

addNewReply=`CALL addnewReply(?, ?,?, ?,?,?)`;

module.exports={host,user,password,database,selectAllQuery,selectByIdQuery,deletQuery,insertQuery,updateQuery,loginQuery,registerQuery,email,appPassword,emailHost,port,sql,sql1,camQuery,selectQuery,otp,updatePassword,uidresetEmailQuery,verifyUid,
    interactionsQuery,campaignsQuery,agentsQuery,subscribersQuery,filterQuery,importquery,searchQuery,Path,verfiyCount,selectAll,search,sideNavKeywords,addNewReply,delet,editContact,selectbyid}