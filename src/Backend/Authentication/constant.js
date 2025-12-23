const db = require("../dbhelper");
const { getUrl, env } = require('../config');

// const host= getUrl('host');

// const user= getUrl('user');
// const password= getUrl('password');
// const database= getUrl('database');
const host = "cip-pre-prod.cnq0kiwmcdcv.ap-south-1.rds.amazonaws.com";
const user = "cip_preprod";
const password = "cip_preprod@123$";
const database = "cip_preprod";

const awsaccessKeyId ='AKIAU2DXFI5LOZMFTY5J' //'AKIAYY5FSMYVNUZHPOEH'
const awssecretAccessKey ='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' //'1GRtbJy2ZfwFDSNUZpESn4fOE1NtXattU1839phj'
const awsregion = 'ap-south-1'
const awsbucket='cip-engage-o'   //'cip-engage'
//Queries for user.js

var selectAllQuery = "SELECT * FROM user WHERE SP_ID=?";
var selectByIdQuery = "SELECT * FROM user WHERE uid=? "
var deletQuery = "UPDATE user SET IsDeleted='1' WHERE uid=?"
var updateQuery = "UPDATE user SET password=?,email_id=?,address=?,name=?,mobile_number=?,country=?,timezone=?,CreatedDate=?,LastModifiedDate=?,PasswordHint=?,securityquestion=?,Securityanswer=?,ParentId=?,UserType=?,IsDeleted=?,IsActive=? WHERE uid=?";
var insertQuery = "INSERT INTO user (password,email_id,address,name,mobile_number,country,timezone,CreatedDate,LastModifiedDate,PasswordHint,securityquestion,Securityanswer,ParentId,UserType,IsDeleted,IsActive) VALUES ?";
var allAgents = "select *from user where ParentId=? and UserType=? and SP_ID=?"
var activeAgent = "select *from user where ParentId=? and UserType=? and IsActive=? and SP_ID=?"


//Query for index.js pages

var loginQuery = "SELECT * FROM user WHERE mobile_number = ? and isDeleted !=1 and IsActive !=2 and ParentId is null"
var registerQuery = "call signUp(?,?,?,?,?,?,?,?,?,?,?)";
var uidresetEmailQuery = "select uid from user where email_id=?"
var verifyUid = "select uid from user where uid=?"
var updatePassword = "UPDATE user SET password=? WHERE uid=?";
var getSPIDandChannel = `select * from user where email_id = ? and ParentId is null`

insertOtp="CALL otpVerification(?,?,?)"
verifyOtp=`SELECT  otp FROM otpVerify WHERE created_at > NOW() - INTERVAL 15 MINUTE and otpfieldvalue=? ORDER BY created_at DESC limit 1;`
crachlogQuery=`INSERT INTO CrashLog(processText,created_at) VALUES (?,now())`

//var access_token='Bearer EAAU0g9iuku4BOzSD75ynSUzKSsYrIWv3qkEa9QPAnUNTUzPwN5aTjGxoAHxsXF4Nlrw8UxbMGqZBxqarODf2sY20MvFfTQm0umq4ZBKCpFAJdcPtbcYSZBsHMqYVwjfFPiQwFk1Rmadl4ctoncnxczMGJZALoVfZBpqoQ0lYHzOwbRb1nvImzhL4ex53c9HKVyzl2viy4EhLy9g0K'
//var url='https://graph.facebook.com/v16.0/101714466262650/messages'
var content_type='application/json'


var access_token = 'Bearer EAAQTkLZBFFR8BOxmMdkw15j53ZCZBhwSL6FafG1PCR0pyp11EZCP5EO8o1HNderfZCzbZBZBNXiEFWgIrwslwoSXjQ6CfvIdTgEyOxCazf0lWTLBGJsOqXnQcURJxpnz3i7fsNbao0R8tc3NlfNXyN9RdDAm8s6CxUDSZCJW9I5kSmJun0Prq21QeOWqxoZAZC0ObXSOxM3pK0KfffXZC5S'
var url='https://graph.facebook.com/v19.0/211544555367892/messages'

//Sms varification variables
const email = getUrl('EngagekartEmail') ||  "notification@engagekart.com"; 
const appPassword = getUrl('EngagekartEmailPassword') || "Notification@123"  
const emailHost = getUrl('EngagekartEmailHost') || "mail.engagekart.com" 
const port = getUrl('EngagekartPort') || "465"

//Sms varification variables
// const email =    'info@sampana.in'
// const appPassword = "xf*q(F#0";
// const emailHost ="us2.smtp.mailhostbox.com"
// const port = "587"

//Query for campaignPage
var camQuery = "Select * from Campaign"


//Query For automation
var selectQuery = "Select * from AutomatedCampaign"

const EmailConfigurations = {
    Engagekart: {
      email: getUrl('EngagekartEmail') ||  "notification@engagekart.com",
      appPassword: getUrl('EngagekartEmailPassword') || "Notification@123",
      emailHost: getUrl('EngagekartEmailHost') || "mail.engagekart.com",
      port: getUrl('EngagekartPort') || 465,
    },
    Engagezilla: {
      email: getUrl('EngagezillaEmail') || "notification@engagezilla.com",
      appPassword: getUrl('EngagezillaEmailPassword') || "Notification@123",
      emailHost: getUrl('EngagezillaEmailHost') || "mail.engagezilla.com",
      port: getUrl('EngagezillaPort') || 465,
    },

  };

async function whiteLableEmailConfiguration(userEmail, db) {
  try {
    const query = `
      SELECT 
          w.brand_name AS brandName,
          w.sender_email AS email,
          w.smtp_host AS emailHost,
          w.smtp_port AS port,
          w.smtp_password AS appPassword  -- use db password instead of hardcoded
      FROM user u
      JOIN white_label_settings w 
          ON u.partnerId = w.partner_id
      WHERE u.email_id = ? 
      LIMIT 1
    `;

    const results = await db.excuteQuery(query, [userEmail]);

    if (results.length === 0) {
      return null
    }

    return results[0];
  } catch (error) {
    return null
  }
}



 var emailForSendingOtp = "testing@engagezilla.com" // for Prod "superadmin@engagezilla.com"


module.exports = {
    host, user, password, database, selectAllQuery, selectByIdQuery, deletQuery, insertQuery,
    updateQuery,allAgents,activeAgent, loginQuery, registerQuery, 
    email, appPassword, emailHost, port, 
     updatePassword, uidresetEmailQuery, verifyUid, camQuery, selectQuery,insertOtp,verifyOtp,
     access_token,url,content_type,crachlogQuery,awsaccessKeyId,awssecretAccessKey,awsregion,awsbucket,EmailConfigurations,getSPIDandChannel, emailForSendingOtp
     ,whiteLableEmailConfiguration,
}
