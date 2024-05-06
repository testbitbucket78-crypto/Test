const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "CIP"
const password = "cip#321#"
const database = "cip_project"


//__________ Bucket Acess ____________//
const accessKeyId = 'AKIAYY5FSMYVNUZHPOEH'
const secretAccessKey = '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'
const region = 'ap-south-1'

//__________END_____________________//

const baseURL = 'https://staging.engageflo.com/api/';
const accessToken = '64c4bcc7c05b1';

insertCompanyDetails = 'INSERT INTO companyDetails(SP_ID,profile_img,Company_Name,Company_Website,Country,Phone_Number,Industry,Employees_count,created_By,created_at) VALUES ?'
insertlocalDetails = 'INSERT INTO localDetails(SP_ID,Date_Format,Time_Format,Time_Zone,Currency,created_By,created_at) VALUES ?'
insertBillingDetails = 'INSERT INTO billing(SP_ID,InvoiceId,billing_email,Address1,zip_code,created_By,Address2,created_at,Country,City,State) VALUES ?'

updateCompanyDetails = 'UPDATE companyDetails SET profile_img=?,Company_Name=?,Company_Website=?,Country=?,Phone_Number=?,Industry=?,Employees_count=?,created_By=?,updated_at=? Where SP_ID=?'
updatelocalDetails = 'UPDATE  localDetails SET Date_Format=?,Time_Format=?,Time_Zone=?,Currency=?,created_By=?,updated_at=? Where SP_ID=?'
updateBillingDetails = 'UPDATE  billing SET InvoiceId=?,billing_email=?,Address1=?,zip_code=?,created_By=?,Address2=?,updated_at=?,Country=?,City=?,State=? Where SP_ID=?'

selectCompanyDetails = 'select * from companyDetails where SP_ID=? and isDeleted !=1'
selectlocalDetails = 'select * from localDetails where SP_ID=? and isDeleted !=1'
selectBillingDetails = 'select * from billing where SP_ID=? and isDeleted !=1'


insertWork = `INSERT INTO WorkingTimeDetails (SP_ID,working_days, start_time, end_time,created_at,created_By) VALUES (?, ?, ?, ?,?,?)`;
selectWork = `select * from WorkingTimeDetails where SP_ID=? and isDeleted !=1`
updateWork = `UPDATE WorkingTimeDetails SET working_days=?, start_time=?, end_time=?,updated_at=?,created_By=? where SP_ID=? AND id=?`
deleteWork = `UPDATE WorkingTimeDetails SET isDeleted=? , updated_at=? where SP_ID=?`

insertHoliday = `INSERT INTO holidays(SP_ID,holiday_date,created_By,created_at) values ?`
selectHoliday = `select * from holidays WHERE holiday_date >= ? AND holiday_date <= ? and SP_ID=? AND isDeleted !='1' `
removeHoliday = `UPDATE holidays SET isDeleted=1,updated_at=? WHERE SP_ID=? AND holiday_date=? `

getSubRight = `select * from subRights where  isDeleted !=1`
getRights = `select * from rights where isDeleted !=1`


addRoleQuery = `INSERT INTO roles (RoleName,Privileges,IsActive,subPrivileges,created_at,updated_at,SP_ID) values ?`
updateRole = `UPDATE roles set RoleName=?,Privileges=?,IsActive=?,subPrivileges=?,updated_at=? where roleID=? AND SP_ID=?`
getRoleQuery = `SELECT * from roles where roleID=? and SP_ID=? and isDeleted !=1`
getUserQuery = `SELECT * from user where SP_ID=? AND UserType=? AND IsDeleted != 1`
deleteQuery = `UPDATE roles set IsDeleted=1 where roleID=? and SP_ID=?`


selectAllQuery = `SELECT   r.RoleName,  u.*
FROM user u
JOIN roles r ON u.UserType = r.roleID
WHERE u.SP_ID =? AND u.isDeleted != 1 ;
`//"SELECT * FROM user WHERE SP_ID=? AND IsDeleted != 1";
selectUserByIdQuery = `SELECT DISTINCT u.uid, r.RoleName, t.team_name, u.*
FROM user u
JOIN roles r ON u.UserType = r.roleID
LEFT JOIN UserTeamMapping utm ON u.uid = utm.userID AND utm.isDeleted != 1
LEFT JOIN teams t ON utm.teamID = t.id AND t.isDeleted != 1
WHERE u.SP_ID =? AND u.isDeleted != 1  AND u.uid = ?`

selectByIdQuery = `select Company_Name,profile_img from companyDetails where SP_ID=?`
userdeletQuery = "UPDATE user SET IsDeleted='1' WHERE uid=?"
updateQuery = "UPDATE user SET  email_id=?, name=?, mobile_number=?, LastModifiedDate=?, UserType=?,country_code=? ,display_mobile_number=? WHERE uid=?";
insertQuery = "INSERT INTO user (SP_ID, email_id, name, mobile_number,password,CreatedDate,ParentId,UserType,IsDeleted,IsActive,LastModifiedDate,LoginIP,country_code,display_mobile_number) VALUES ?";
findEmail = "SELECT * FROM user WHERE (email_id=? OR mobile_number=?) and isDeleted !=1 and SP_ID=?"
getRole = `SELECT * from roles where SP_ID=?  and isDeleted !=1`



//Sms varification variables
const email = "info@sampana.in";
const appPassword = "xf*q(F#0";
const emailHost = "us2.smtp.mailhostbox.com"
const port = "587"


addteamQuery = `INSERT INTO teams(SP_ID,team_name,created_at,updated_at,userIDs) VALUES ?`
addUserTeamMap = `INSERT INTO UserTeamMapping(teamID,userID,created_at) VALUES ?`

teamDelete = `UPDATE teams set isDeleted=? ,isDeletedOn=? where id=? and SP_ID=? `
mapteamDelete = ` UPDATE UserTeamMapping set isDeleted=? where teamID=?`
updateTeams = `UPDATE teams SET SP_ID=?,team_name=?,updated_at=? WHERE id=?`


selectTeams = `SELECT t.id,t.team_name,t.updated_at,t.created_at,u.id as userteamMapID ,um.name,um.uid
FROM teams AS t
JOIN UserTeamMapping AS u ON t.id = u.teamID
JOIN user AS um ON u.userID = um.uid
WHERE t.SP_ID = ? and t.isDeleted !=1 and u.isDeleted !=1 and um.isDeleted !=1`

//_______________________________________ PROFILE QUERY _____________________________________//


var teamID = `SELECT teamID FROM UserTeamMapping where userID=? and isDeleted !=1`;
var teamName = `SELECT team_name from teams where id IN (?)  and isDeleted !=1`
var roleIDQuery = `SELECT UserType FROM user where uid=? and isDeleted !=1`;
var roleNameQuery = `SELECT RoleName from roles where roleID=?  and isDeleted !=1`
var PasswordQuery = `select password from user where uid=?`
var updatePasswordQuery = `UPDATE user SET password=? ,LastModifiedDate=? WHERE uid=?`
var activeStatusquery = `UPDATE  user SET IsActive=?,LastModifiedDate=? WHERE uid=? `


addNotification = `INSERT INTO TeamboxNotificationSettings(UID,notificationId,PushNotificationValue,SoundNotificationValue,isDeleted,created_at) VALUES ?`
getNotification = `SELECT * FROM TeamboxNotificationSettings WHERE UID=?`
updateNotification=`UPDATE TeamboxNotificationSettings SET UID=?, notificationId=?,PushNotificationValue=?,SoundNotificationValue=?,updated_at=? where ID=?`

savePlanQuery = `INSERT INTO PlanPricing (SP_ID,planType,planDivision,discount,subtotalAmount,totalAmount,tax,created_at) VALUES ?`
updatePlanQuery = `UPDATE PlanPricing SET isDeleted=1,updated_at=? where ID=?`
selectPlan = `SELECT * FROM PlanPricing where SP_ID=? AND isDeleted !=1`


profilebillQuery = `INSERT INTO BillingHistory (SP_ID,billing_date,billing_id,amount,payment_status,payment_method,billing_type) VALUES ?`
//updateProfileBillingQuery=`UPDATE BillingHistory set billing_date=?,billing_id=?,amount=?,payment_status=?,payment_method=?,billing_type=? WHERE SP_ID=?`
selectbillinghistory = `select *from BillingHistory where SP_ID=?`


invoicePdf = `Select c.Company_Name,c.profile_img,b.*,l.Currency 
FROM companyDetails c
JOIN billing b ON c.SP_ID = b.SP_ID
JOIN localDetails l ON c.SP_ID = l.SP_ID
WHERE c.SP_ID = ?`

billhistoryQuery = `select billing_date,billing_type  from BillingHistory where SP_ID=?
    ORDER BY billing_date DESC
    LIMIT 1;`
planquery = `select *  from PlanPricing where SP_ID=? and isDeleted !=1`

cNameQuery = `Select name from user where uid=?`

insertSPTransations = `INSERT INTO SPTransations (sp_id,transation_date,amount,transation_type,currency) values ?`

useData = `SELECT interaction_type, DATE(created_at) AS interaction_date, COUNT(*) AS count
FROM Interaction where SP_ID=?
GROUP BY interaction_type, DATE(created_at)`

usageInsiteQuery = `SELECT interaction_type,  COUNT(*) AS count
FROM Interaction where SP_ID=2
GROUP BY interaction_type`

allusageInsiteCount = `SELECT   COUNT(*) AS count FROM Interaction where SP_ID=?`

addFunds = `INSERT INTO SPTransations (sp_id,transation_date,amount,transation_type,description,interaction_id,currency) VALUES ?`

subFAQsQuery = `SELECT * FROM SubFAQS WHERE FAQ_id=? and isDeleted!=1 `
FAQsQuery = `SELECT * FROM FAQS`
UserGuideTopicsQuery = `SELECT * FROM UserGuideTopics`
UserGuideSubTopicsQuery = `SELECT *FROM UserGuideSubTopics WHERE headings_id=?`

manageplans = `select * from ManagePlan`
manageplansCharges = `select * from ManagePlanCharges`

var selectNotification = `select * from Notification where sp_id=?`



//_____________________________________CAMPAIGN QUERY_____________________________________//


var addCampaignTimingsQuery = `INSERT INTO CampaignTimings (sp_id,day,start_time,end_time,created_at) values ?`
var deleteCampaignTimingsQuery = `UPDATE  CampaignTimings SET isDeleted=1 ,updated_at=? where sp_id=?`
//var updateCampaignTimingsQuery=`INSERT INTO CampaignTimings (sp_id,day,start_time,end_time,created_at,updated_at) values ?`
var selectCampaignTimingsQuery = `SELECT * FROM CampaignTimings WHERE sp_id=? and isDeleted  !=1`

var campaignAlertUsersList = `SELECT r.RoleName as UserType ,u.uid,u.email_id,u.mobile_number,u.name,u.profile_img
FROM roles r
JOIN user u ON u.UserType = r.roleID
where u.isDeleted !=1 and u.SP_ID=?`

var addCampaignAlerts = `INSERT INTO CampaignAlerts(SP_ID,uid,created_at) VALUES ?`
var deleteCampaignAlerts = `UPDATE  CampaignAlerts set isDeleted=1,updated_at=? where SP_ID=?`
var selectCampaignAlerts = `select c.uid,u.* from CampaignAlerts c
JOIN user u ON u.uid=c.uid
 where c.SP_ID=? and c.isDeleted !=1`

var addCampaignTest = `INSERT INTO CampaignTest(SP_ID,uid,created_at) VALUES ?`
var deleteCampaignTest = `UPDATE  CampaignTest set isDeleted=1,updated_at=? where SP_ID=?`
var selectCampaignTest = `select c.uid,u.* from CampaignTest c
JOIN user u ON u.uid=c.uid
 where c.SP_ID=? and c.isDeleted !=1`

//_______________________________CONTACT SETTINGS________________________//

var addtag = `INSERT INTO EndCustomerTagMaster(TagName,TagColour,SP_ID,created_at,updated_at) values ?`
var updatetag = `UPDATE EndCustomerTagMaster set TagName=?,TagColour=?,updated_at=? where ID=?`
var deletetag = `UPDATE EndCustomerTagMaster set isDeleted=1,updated_at=? where ID=?`
var selecttag = `SELECT
tm.TagName,
tm.TagColour,
tm.ID,
tm.created_at,
tm.updated_at,
(SELECT COUNT(*) FROM EndCustomer AS ec
 WHERE FIND_IN_SET(tm.ID,REPLACE(ec.tag, ' ', '')) > 0 AND ec.SP_ID = ? and
ec.isDeleted != 1  ) AS tag_count
FROM
EndCustomerTagMaster AS tm
WHERE
tm.SP_ID = ? 
AND tm.isDeleted != 1;`


 var getColCount=`SELECT count(*) AS columnCount FROM SPIDCustomContactFields WHERE SP_ID=?  AND isDeleted!=1 `
 var addcolumn=`INSERT INTO SPIDCustomContactFields (CustomColumn,ColumnName,SP_ID,Type,description,created_at,dataTypeValues) values ?`
 
//  let getcolumn = `SELECT column_name as displayName,column_name as ActuallName ,data_type as type, 1 as mandatory,1 as status,0 as id,"" as created,"" as updated ,"" as description ,"" as dataTypeValues
//  FROM information_schema.columns
//  WHERE table_name = 'EndCustomer' and column_name not like '%column%' and column_name not in ('created_at', 'customerId', 'isDeleted', 'SP_ID', 'uid', 'updated_at','isBlockedOn','isBlocked' ,'channel','displayPhoneNumber','countryCode','IsTemporary','contact_profile','InstagramId','facebookId','Country','state','city','pincode','address','sex','status','age')
//  UNION
//  SELECT ColumnName AS column_name,CustomColumn as ActuallName ,Type as type,Mandatory as mandatory,Status as status,id as id,created_at as created,updated_at as updated ,description as description ,dataTypeValues as dataTypeValues
//  FROM SPIDCustomContactFields  
//  WHERE SP_ID =?  AND isDeleted !=1;`

let getcolumn = `SELECT 
displayName,
ActuallName,
type,
mandatory,
status,
id,
created,
updated,
description,
dataTypeValues
FROM 
(SELECT 
    'Name' AS displayName,
    'Name' AS ActuallName,
    'varchar' AS type,
    1 AS mandatory,
    1 AS status,
    0 AS id,
    "" AS created,
    "" AS updated,
    "" AS description,
    "" AS dataTypeValues,
    1 AS sort_order,
    0 AS custom_order
UNION ALL
SELECT 
    'Phone_number' AS displayName,
    'Phone_number' AS ActuallName,
    'varchar' AS type,
    1 AS mandatory,
    1 AS status,
    0 AS id,
    "" AS created,
    "" AS updated,
    "" AS description,
    "" AS dataTypeValues,
    2 AS sort_order,
    0 AS custom_order
UNION ALL
SELECT 
    'emailId' AS displayName,
    'emailId' AS ActuallName,
    'varchar' AS type,
    1 AS mandatory,
    1 AS status,
    0 AS id,
    "" AS created,
    "" AS updated,
    "" AS description,
    "" AS dataTypeValues,
    3 AS sort_order,
    0 AS custom_order
UNION ALL
SELECT 
    'OptInStatus' AS displayName,
    'OptInStatus' AS ActuallName,
    'varchar' AS type,
    1 AS mandatory,
    1 AS status,
    0 AS id,
    "" AS created,
    "" AS updated,
    "" AS description,
    "" AS dataTypeValues,
    4 AS sort_order,
    0 AS custom_order
UNION ALL
SELECT 
    'ContactOwner' AS displayName,
    'ContactOwner' AS ActuallName,
    'varchar' AS type,
    1 AS mandatory,
    1 AS status,
    0 AS id,
    "" AS created,
    "" AS updated,
    "" AS description,
    "" AS dataTypeValues,
    5 AS sort_order,
    0 AS custom_order
UNION ALL
SELECT 
    'tag' AS displayName,
    'tag' AS ActuallName,
    'varchar' AS type,
    1 AS mandatory,
    1 AS status,
    0 AS id,
    "" AS created,
    "" AS updated,
    "" AS description,
    "" AS dataTypeValues,
    6 AS sort_order,
    0 AS custom_order
UNION ALL
SELECT 
    column_name AS displayName,
    column_name AS ActuallName,
    data_type AS type,
    1 AS mandatory,
    1 AS status,
    0 AS id,
    "" AS created,
    "" AS updated,
    "" AS description,
    "" AS dataTypeValues,
    7 AS sort_order,
    0 AS custom_order
FROM 
    information_schema.columns
WHERE 
    table_name = 'EndCustomer' 
    AND column_name NOT LIKE '%column%' 
    AND column_name NOT IN (
        'created_at', 'customerId', 'isDeleted', 'SP_ID', 'uid', 'updated_at',
        'isBlockedOn', 'isBlocked', 'channel', 'displayPhoneNumber', 'countryCode',
        'IsTemporary', 'contact_profile', 'InstagramId', 'facebookId', 'Country',
        'state', 'city', 'pincode', 'address', 'sex', 'status', 'age'
    )
UNION ALL
SELECT 
    ColumnName AS displayName,
    CustomColumn AS ActuallName,
    Type AS type,
    Mandatory AS mandatory,
    Status AS status,
    id AS id,
    created_at AS created,
    updated_at AS updated,
    description AS description,
    dataTypeValues AS dataTypeValues,
    8 AS sort_order,
    id AS custom_order
FROM 
    SPIDCustomContactFields  
WHERE 
    SP_ID = ?  
    AND isDeleted != 1
) AS result
GROUP BY 
ActuallName
ORDER BY 
custom_order, sort_order;`

 let getcolumnid = `SELECT  ColumnName AS displayName,CustomColumn as ActuallName  ,Type,Mandatory,Status,id,created_at,updated_at,description,dataTypeValues
 FROM SPIDCustomContactFields  
 WHERE id =? AND isDeleted !=1;`
let deletecolumn=`UPDATE SPIDCustomContactFields SET isDeleted=1 , isDeletedOn=? where id=?`
let enableMandatory=`UPDATE SPIDCustomContactFields SET Mandatory=? , updated_at=? where id=?`
let enablestatus=`UPDATE SPIDCustomContactFields SET Status=? , updated_at=? where id=?`
let editfield=`UPDATE SPIDCustomContactFields SET ColumnName=?,Type=?,description=?,updated_at=? where id=?`


//________________________________________TEMPLATE SETTINGS__________________________//

var addTemplates = `INSERT INTO templateMessages (TemplateName,Channel,Category,Language,media_type,Header,BodyText,Links,FooterText,template_json,status,spid,created_By,created_at,isTemplate,industry,category_id) VALUES ?`
var selectTemplate = `SELECT * FROM templateMessages WHERE spid=? and isDeleted !=1 and isTemplate=?`
var selectApprovedTemplate = `SELECT * FROM templateMessages WHERE spid=? and isDeleted !=1  and (status='saved' OR status='approved') and isTemplate=?`
var updateTemplate = `UPDATE templateMessages SET TemplateName=?,Channel=?,Category=?,Language=?,media_type=?,Header=?,BodyText=?,Links=?,FooterText=?,template_json=?,status=?,spid=?,created_By=?,updated_at=?,isTemplate=?,industry=?,category_id=? where ID=?`
var deleteTemplate = `UPDATE templateMessages set isDeleted=1 ,updated_at=? where ID=?`
var addGallery = `INSERT INTO templateMessages (TemplateName,Channel,Category,Language,media_type,Header,BodyText,Links,FooterText,template_json,status,spid,created_By,created_at,isTemplate,industry,category_id,updated_at,topic) VALUES ?`
var getGallery = `SELECT * FROM templateMessages WHERE spid=? and isDeleted !=1 and isTemplate=?`


//______________________________________ACCOUNT SETTINGS______________________________//

var insertWhatsappdetails = `insert into WhatsAppWeb( channel_id,connected_id,channel_status,is_deleted,spid,phone_type,import_conversation,QueueMessageCount,connection_date,WAVersion,InMessageStatus,OutMessageStatus,QueueLimit,delay_Time,INGrMessage,OutGrMessage,online_status,serviceMonetringTool,syncContact,DisconnAlertEmail,roboot,restart,reset) values ?`
var updateWhatsappdetails = `UPDATE WhatsAppWeb SET channel_id=?,connected_id=?,channel_status=?,is_deleted=?,spid=?,phone_type=?,import_conversation=?,QueueMessageCount=?,connection_date=?,WAVersion=?,InMessageStatus=?,OutMessageStatus=?,QueueLimit=?,delay_Time=?,INGrMessage=?,OutGrMessage=?,online_status=?,serviceMonetringTool=?,syncContact=?,DisconnAlertEmail=?,roboot=?,restart=?,reset=?, updated_at=? WHERE id=?`
var selectChannelCount = `SELECT  channel_id, COUNT(channel_id) AS count_of_channel_id 
FROM WhatsAppWeb where spid=? and is_deleted !=1
GROUP BY channel_id `
var Whatsappdetails = `select *from WhatsAppWeb where spid=? and is_deleted !=1`

var addTokenQuery=` INSERT INTO APIToken (spid,APIName,created_at) values ?`
var updateTokenQuery=`UPDATE APIToken set spid=?,APIName=?,updated_at=? where id=?`
var deleteTokenQuery=`UPDATE APIToken set is_Deleted=1,updated_at=? where id=?`
var deleteIPQuery=`UPDATE APIIPAddress set is_Deleted=1,updated_at=? where token_id=?`
var selectTokenQuery=`  SELECT t.APIName,t.id,i.IPAddress,t.isEnable,i.token_id,t.spid
FROM APIToken AS t
JOIN APIIPAddress AS i ON t.id = i.token_id
WHERE t.spid = ? AND t.is_Deleted != 1 AND i.is_Deleted != 1; `
var isEnableQuery=`UPDATE APIToken SET isEnable=? ,updated_at=? where id=?`
var insertIPAddress=`INSERT INTO APIIPAddress (spid,token_id,IPAddress,created_at,is_Deleted) values ?`

module.exports = {
    host, user, password, database, insertCompanyDetails, insertlocalDetails, insertBillingDetails, selectCompanyDetails, selectlocalDetails, selectBillingDetails,
    updateCompanyDetails, updatelocalDetails, updateBillingDetails, insertWork, selectWork, deleteWork, insertHoliday, selectHoliday, removeHoliday, updateWork, getSubRight, getRights,
    accessKeyId, secretAccessKey, region, addRoleQuery, updateRole, getRoleQuery, getUserQuery, deleteQuery, selectAllQuery, userdeletQuery,
    updateQuery, insertQuery, selectByIdQuery, findEmail, getRole, email, appPassword, emailHost, port,
    addteamQuery, addUserTeamMap, teamDelete, mapteamDelete, updateTeams, selectTeams, teamID, teamName, roleIDQuery, roleNameQuery,
    PasswordQuery, updatePasswordQuery, activeStatusquery, addNotification, getNotification, savePlanQuery
    , profilebillQuery, updatePlanQuery, selectbillinghistory, useData, selectPlan, usageInsiteQuery, addFunds
    , subFAQsQuery, FAQsQuery, UserGuideTopicsQuery, UserGuideSubTopicsQuery, allusageInsiteCount, invoicePdf, billhistoryQuery, planquery, cNameQuery, insertSPTransations
    , manageplans, manageplansCharges, selectNotification, addCampaignTimingsQuery, deleteCampaignTimingsQuery, selectCampaignTimingsQuery, campaignAlertUsersList,
    addCampaignAlerts, deleteCampaignAlerts, selectCampaignAlerts, addCampaignTest, deleteCampaignTest, selectCampaignTest,
    addtag, updatetag, deletetag, selecttag, addTemplates, selectTemplate, updateTemplate, deleteTemplate, insertWhatsappdetails, updateWhatsappdetails, selectChannelCount,
    Whatsappdetails,addTokenQuery,updateTokenQuery,deleteTokenQuery,selectTokenQuery,isEnableQuery,baseURL,accessToken,deleteIPQuery,insertIPAddress,updateNotification,
    getColCount,addcolumn,getcolumn,deletecolumn,getcolumnid,enableMandatory,enablestatus,editfield ,selectApprovedTemplate ,addGallery ,getGallery,selectUserByIdQuery
}