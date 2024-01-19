const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "scroot"
const password = "amsdb1234"
const database = "cip_project"


const email = "info@sampana.in";
const appPassword = "xf*q(F#0";
const emailHost = "us2.smtp.mailhostbox.com"
const port = "587"
var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

//Query for contactPage
var selectAllContact = `SELECT * FROM EndCustomer WHERE (isDeleted IS NULL OR isDeleted = 0)  AND SP_ID = ? AND IsTemporary !=1 `
var insertContact = "INSERT INTO EndCustomer (Name,Phone_number,emailId,age,tag,status,facebookId,InstagramId,SP_ID,countryCode) VALUES ?";
var neweditContact = 'UPDATE EndCustomer SET '
delet = "UPDATE EndCustomer set isDeleted=1 WHERE customerId IN (?) and SP_ID=?"
selectbyid = "select * from EndCustomer where customerId=? and SP_ID=?"
isBlockedQuery = "UPDATE EndCustomer set  isBlocked=1,isBlockedOn=now() where customerId=? and SP_ID=?"
existContactWithSameSpid=`SELECT * FROM EndCustomer WHERE (emailId = ? or Phone_number=?) AND (isDeleted =0 ) AND SP_ID=? AND IsTemporary !=1  `


// Path for download sample csv file for import of contact
var Path = 'C:/Users/hp/Downloads/data.csv'


importquery = "INSERT INTO EndCustomer (Name,Phone_number,emailId,status,sex,age,state,Country,tag,address,pincode,city,OptInStatus,facebookId,InstagramId,channel,uid,SP_ID) SELECT ? WHERE NOT EXISTS (SELECT * FROM EndCustomer WHERE "
verfiyCount = "select * from EndCustomer where emailId in (?) and isBlocked is null and isDeleted is null and SP_ID=?"
importUpdate=`UPDATE EndCustomer set Name=?,Phone_number=?,emailId=?,status=?,sex=?,age=?,state=?,Country=?,tag=?,address=?,pincode=?,city=?,OptInStatus=?,facebookId=?,InstagramId=?,channel=?,uid=? where `
crachlogQuery=`INSERT INTO CrashLog(processText,created_at) VALUES (?,now())`

module.exports = {
    host, user, password, database, email, appPassword, emailHost, port, otp, selectAllContact, insertContact
    ,neweditContact, importquery,delet,selectbyid, Path, verfiyCount,  isBlockedQuery,
    importUpdate,crachlogQuery,existContactWithSameSpid
}