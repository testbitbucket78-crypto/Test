const db = require("../dbhelper");

const host= "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user= "scroot"
const password= "amsdb1234"
const database= "cip_project"


//Queries for user.js

var selectAllQuery = "SELECT * FROM user WHERE SP_ID=?";
var selectByIdQuery = "SELECT * FROM user WHERE uid=? "
var deletQuery = "UPDATE user SET IsDeleted='1' WHERE uid=?"
var updateQuery = "UPDATE user SET password=?,email_id=?,address=?,name=?,mobile_number=?,country=?,timezone=?,CreatedDate=?,LastModifiedDate=?,PasswordHint=?,securityquestion=?,Securityanswer=?,ParentId=?,UserType=?,IsDeleted=?,IsActive=? WHERE uid=?";
var insertQuery = "INSERT INTO user (password,email_id,address,name,mobile_number,country,timezone,CreatedDate,LastModifiedDate,PasswordHint,securityquestion,Securityanswer,ParentId,UserType,IsDeleted,IsActive) VALUES ?";
var allAgents = "select *from user where ParentId=? and UserType=? and SP_ID=?"
var activeAgent = "select *from user where ParentId=? and UserType=? and IsActive=? and SP_ID=?"


//Query for index.js pages

var loginQuery = "SELECT * FROM user WHERE email_id =?"
var registerQuery = "call signUp(?,?,?,?)";
var uidresetEmailQuery = "select uid from user where email_id=?"
var verifyUid = "select uid from user where uid=?"
var updatePassword = "UPDATE user SET password=? WHERE uid=?";


insertOtp="CALL otpVerification(?,?,?)"
verifyOtp=`SELECT  otp FROM otpVerify WHERE created_at > NOW() - INTERVAL 15 MINUTE and otpfieldvalue=?`
crachlogQuery=`INSERT INTO CrashLog(processText,created_at) VALUES (?,now())`

var access_token='Bearer EAAiPxMFEGCYBADPTwZAXpZCv9JgfullRyIDfr9ULZB5DweHZCc1O0VcsGuZCtE9g3B09exFOPzXHq4FORZA90ZCKq1FzZA9k889oiRqTrGbUpyU6xXHgAUaAqW4K6Lzu7aY6zMgw1QIDimeygGgXEbhGxY5c6rtMsORZAOi3SymrewonbnbGWh4Eb'
var url='https://graph.facebook.com/v16.0/108525132105860/messages'
var content_type='application/json'




//Sms varification variables
const email = "info@sampana.in";
const appPassword = "xf*q(F#0";
const emailHost = "us2.smtp.mailhostbox.com"
const port = "587"




//Query for campaignPage
var camQuery = "Select * from Campaign"


//Query For automation
var selectQuery = "Select * from AutomatedCampaign"






module.exports = {
    host, user, password, database, selectAllQuery, selectByIdQuery, deletQuery, insertQuery,
    updateQuery,allAgents,activeAgent, loginQuery, registerQuery, 
    email, appPassword, emailHost, port, 
     updatePassword, uidresetEmailQuery, verifyUid, camQuery, selectQuery,insertOtp,verifyOtp,
     access_token,url,content_type,crachlogQuery
}
