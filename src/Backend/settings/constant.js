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


insertHoliday = `INSERT INTO holidays(SP_ID,holiday_date,created_By,created_at) values ?`
selectHoliday = `select * from holidays WHERE holiday_date >= ? AND holiday_date <= ? and SP_ID=? AND isDeleted !='1' `
removeHoliday = `UPDATE holidays SET isDeleted=1,updated_at=? WHERE SP_ID=? AND holiday_date=? `

getSubRight = `select * from subRights where rightsID=? and isDeleted !=1`
getRights = `select * from rights where isDeleted !=1`


module.exports = {
    host, user, password, database, insertCompanyDetails, insertlocalDetails, insertBillingDetails, selectCompanyDetails, selectlocalDetails, selectBillingDetails,
    updateCompanyDetails, updatelocalDetails, updateBillingDetails, insertWork, selectWork, insertHoliday, selectHoliday, removeHoliday, updateWork, getSubRight, getRights,
    accessKeyId,secretAccessKey,region
}