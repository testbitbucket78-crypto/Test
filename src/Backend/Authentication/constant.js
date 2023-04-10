const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "scroot"
const password = "amsdb1234"
const database = "cip_project"


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


insertOtp="CALL otpVerification(?,?,?)"
verifyOtp=`SELECT  otp FROM otpVerify WHERE created_at > NOW() - INTERVAL 15 MINUTE and otpfieldvalue=?`


module.exports = {
    host, user, password, database, selectAllQuery, selectByIdQuery, deletQuery, insertQuery,
    updateQuery,allAgents,activeAgent, loginQuery, registerQuery, 
    email, appPassword, emailHost, port, 
     updatePassword, uidresetEmailQuery, verifyUid, camQuery, selectQuery,insertOtp,verifyOtp
}