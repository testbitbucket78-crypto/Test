const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "scroot"
const password = "amsdb1234"
const database = "cip_project"



//Sms varification variables
const email = "raunakriya816@gmail.com";
const appPassword = "tmmtkimnhfirrxio";
const emailHost = "smpt.gmail.com"
const port = "465"
var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

//Query for contactPage
var sql1 = "Select * from EndCustomer where isBlocked is null and isDeleted is null "
var sql = "INSERT INTO EndCustomer (Name,Phone_number,emailId,age,tag,status,facebookId,InstagramId) VALUES ?";
var editContact = "UPDATE EndCustomer set Phone_number=?,uid=?,SP_ID=?,status=?,Name=?,age=?,sex=?,emailId=?,address=?,pincode=?,city=?,state=?,Country=?,OptInStatus=?,tag=?,facebookId=?,InstagramId=? WHERE customerId=?"
var neweditContact = 'UPDATE EndCustomer SET '




//contact filter
filterQuery = "select * from EndCustomer where Phone_number=?"
importquery = "INSERT INTO EndCustomer (Name,Phone_number,emailId,status,sex,age,state,Country,tag,uid,sp_account_id,address,pincode,city,OptInStatus,facebookId,InstagramId) VALUES ?"
searchQuery = "select * from EndCustomer where Phone_number=? or Name=? or emailId=? "
delet = "UPDATE EndCustomer set isDeleted=1 WHERE customerId IN (?)"
selectbyid = "select * from EndCustomer where customerId=?"
isBlockedQuery = "UPDATE EndCustomer set  isBlocked=1,isBlockedOn=now() where customerId=?"
// Path for download sample csv file for import of contact
var Path = 'C:/Users/hp/Downloads/data.csv'

//update query for override 
//updateCustomer='UPDATE EndCustomer SET '+ contact.updateData +'=?' +' WHERE ' + contact.identifierData + '=?'
verfiyCount = "select * from EndCustomer where emailId in (?) and isBlocked is null and isDeleted is null"





module.exports = {
    host, user, password, database, email, appPassword, emailHost, port, otp, sql, sql1,editContact
    ,neweditContact,filterQuery, importquery, searchQuery,delet,selectbyid, Path, verfiyCount,  isBlockedQuery
    
}