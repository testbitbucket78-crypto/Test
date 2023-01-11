const db = require("../dbhelper");

const host= "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user= "scroot"
const password= "amsdb1234"
const database= "cip_project"


//Queries for user.js
var selectAllQuery = "SELECT * FROM user";
var selectByIdQuery="SELECT * FROM user WHERE userId=?"
var deletQuery="DELETE FROM user WHERE userId=?"
var updateQuery="UPDATE user SET uid=?,password=?,email_id=?,address=?,name=?,mobile_number=?,country=?,timezone=?,CreatedDate=?,LastModifiedDate=?,PasswordHint=?,securityquestion=?,Securityanswer=?,ParentId=?,UserType=?,IsDeleted=?,IsActive=? WHERE userId=?";
var insertQuery = "INSERT INTO user (uid,userId,password,email_id,address,name,mobile_number,country,timezone,CreatedDate,LastModifiedDate,PasswordHint,securityquestion,Securityanswer,ParentId,UserType,IsDeleted,IsActive) VALUES ?";

//for index pages

var loginQuery="SELECT * FROM user WHERE email_id =?"
var registerQuery = "INSERT INTO user (name,mobile_number,email_id,password) VALUES ?";
var updatePassword="UPDATE user SET password=? WHERE email_id=?";
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
var sql = "INSERT INTO EndCustomer (Name,Phone_number,emailId) VALUES ?";

//Query for campaignPage
var camQuery="Select * from Campaign"


//Query For automation
var selectQuery="Select * from AutomatedCampaign"



module.exports={host,user,password,database,selectAllQuery,selectByIdQuery,deletQuery,insertQuery,updateQuery,loginQuery,registerQuery,email,appPassword,emailHost,port,sql,sql1,camQuery,selectQuery,otp,updatePassword}