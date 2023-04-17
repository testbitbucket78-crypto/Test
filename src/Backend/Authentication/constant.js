const db = require("../dbhelper");

const host= "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user= "scroot"
const password= "amsdb1234"
const database= "cip_project"


//Queries for user.js
var selectAllQuery = "SELECT * FROM user";
var selectByIdQuery = "SELECT * FROM user WHERE SP_ID=?"
var deletQuery = "UPDATE user SET IsDeleted='1' WHERE SP_ID=?"
var updateQuery = "UPDATE user SET password=?,email_id=?,address=?,name=?,mobile_number=?,country=?,timezone=?,CreatedDate=?,LastModifiedDate=?,PasswordHint=?,securityquestion=?,Securityanswer=?,ParentId=?,UserType=?,IsDeleted=?,IsActive=? WHERE SP_ID=?";
var insertQuery = "INSERT INTO user (password,email_id,address,name,mobile_number,country,timezone,CreatedDate,LastModifiedDate,PasswordHint,securityquestion,Securityanswer,ParentId,UserType,IsDeleted,IsActive) VALUES ?";
var allAgents = "select *from user where ParentId=? and UserType=?"
var activeAgent = "select *from user where ParentId=? and UserType=? and IsActive=?"
//for index pages

var loginQuery = "SELECT * FROM user WHERE email_id =?"
var registerQuery = "INSERT INTO user (name,mobile_number,email_id,password) VALUES ?";
var uidresetEmailQuery = "select SP_ID from user where email_id=?"
var verifyUid = "select SP_ID from user where SP_ID=?"
var updatePassword = "UPDATE user SET password=? WHERE SP_ID=?";
//Sms varification variables
const email = "info@sampana.in";
const appPassword = "xf*q(F#0";
const emailHost = "us2.smtp.mailhostbox.com"
const port = "587"
// var otp = Math.random();
// otp = otp * 1000000;
// otp = parseInt(otp);



//Query for campaignPage
var camQuery = "Select * from Campaign"


//Query For automation
var selectQuery = "Select * from AutomatedCampaign"

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

insertOtp="CALL otpVerification(?,?,?)"
verifyOtp=`SELECT  otp FROM otpVerify WHERE created_at > NOW() - INTERVAL 15 MINUTE and otpfieldvalue=?`


module.exports = {
    host, user, password, database, selectAllQuery, selectByIdQuery, deletQuery, insertQuery,
    updateQuery,allAgents,activeAgent, loginQuery, registerQuery, 
    email, appPassword, emailHost, port, 
     updatePassword, uidresetEmailQuery, verifyUid, camQuery, selectQuery,insertOtp,verifyOtp
}
