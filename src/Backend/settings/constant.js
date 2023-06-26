const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "scroot"
const password = "amsdb1234"
const database = "cip_project"


//__________ Bucket Acess ____________//
const  accessKeyId = 'AKIAYY5FSMYVNUZHPOEH'
const secretAccessKey = '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'
const region = 'ap-south-1'

//__________END_____________________//

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
deleteWork=`UPDATE WorkingTimeDetails SET isDeleted=? , updated_at=? where SP_ID=?`

insertHoliday = `INSERT INTO holidays(SP_ID,holiday_date,created_By,created_at) values ?`
selectHoliday = `select * from holidays WHERE holiday_date >= ? AND holiday_date <= ? and SP_ID=? AND isDeleted !='1' `
removeHoliday = `UPDATE holidays SET isDeleted=1,updated_at=? WHERE SP_ID=? AND holiday_date=? `

getSubRight = `select * from subRights where rightsID=? and isDeleted !=1`
getRights = `select * from rights where isDeleted !=1`


addRoleQuery = `INSERT INTO roles (RoleName,Privileges,IsActive,subPrivileges,created_at,SP_ID) values ?`
updateRole=`UPDATE roles set RoleName=?,Privileges=?,IsActive=?,subPrivileges=?,updated_at=? where roleID=? AND SP_ID=?` 
getRoleQuery = `SELECT * from roles where roleID=? and SP_ID=? and isDeleted !=1`
getUserQuery = `SELECT * from user where SP_ID=? AND UserType=? AND IsDeleted != 1`
deleteQuery = `UPDATE roles set IsDeleted=1 where roleID=? and SP_ID=?`


 selectAllQuery = "SELECT * FROM user WHERE SP_ID=? AND IsDeleted != 1";
 selectByIdQuery = "SELECT * FROM user WHERE uid=? and isDeleted !=1"
 userdeletQuery = "UPDATE user SET IsDeleted='1' WHERE uid=?"
 updateQuery = "UPDATE user SET  email_id=?, name=?, mobile_number=?, LastModifiedDate=?, UserType=? WHERE uid=?";
 insertQuery = "INSERT INTO user (SP_ID, email_id, name, mobile_number,password,CreatedDate,ParentId,UserType,IsDeleted,IsActive) VALUES ?";
 findEmail="SELECT * FROM user WHERE email_id=? and isDeleted !=1"
 getRole = `SELECT * from roles where SP_ID=? and isDeleted !=1`



 //Sms varification variables
const email = "info@sampana.in";
const appPassword = "xf*q(F#0";
const emailHost = "us2.smtp.mailhostbox.com"
const port = "587"


addteamQuery=`INSERT INTO teams(SP_ID,team_name,created_at) VALUES ?`
addUserTeamMap=`INSERT INTO UserTeamMapping(teamID,userID,created_at) VALUES ?`

teamDelete=`UPDATE teams set isDeleted=? ,isDeletedOn=? where id=? and SP_ID=? `
mapteamDelete=` UPDATE UserTeamMapping set isDeleted=? where teamID=?`

updateTeams=`UPDATE teams SET SP_ID=?,team_name=?,updated_at=? WHERE id=?`
selectTeams=`SELECT t.id,t.team_name,t.updated_at,t.created_at,u.id as userteamMapID ,um.name
FROM teams AS t
JOIN UserTeamMapping AS u ON t.id = u.teamID
JOIN user AS um ON u.userID = um.uid
WHERE t.SP_ID = ? and t.isDeleted !=1 and u.isDeleted !=1 and um.isDeleted !=1`

module.exports = {
    host, user, password, database, insertCompanyDetails, insertlocalDetails, insertBillingDetails, selectCompanyDetails, selectlocalDetails, selectBillingDetails,
    updateCompanyDetails, updatelocalDetails, updateBillingDetails, insertWork, selectWork,deleteWork, insertHoliday, selectHoliday, removeHoliday, updateWork, getSubRight, getRights,
    accessKeyId,secretAccessKey,region,addRoleQuery,updateRole,getRoleQuery,getUserQuery,deleteQuery,selectAllQuery,userdeletQuery,
    updateQuery,insertQuery,selectByIdQuery,findEmail,getRole,email,appPassword,emailHost,port,
    addteamQuery,addUserTeamMap,teamDelete,mapteamDelete,updateTeams,selectTeams
}