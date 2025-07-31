const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "scroot"
const password = "amsdb1234"
const database = "cip_project"


const email =   "notification@engagekart.com"; 
const appPassword = "Notification@123"  
const emailHost = "mail.engagekart.com" 
const port = "465"
var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

//Query for contactPage
var selectAllContact = `SELECT 
EC.*,
IFNULL(GROUP_CONCAT(ECTM.TagName ORDER BY FIND_IN_SET(ECTM.ID, REPLACE(EC.tag, ' ', ''))), '') AS tag_names
FROM 
EndCustomer AS EC
LEFT JOIN 
EndCustomerTagMaster AS ECTM ON FIND_IN_SET(ECTM.ID, REPLACE(EC.tag, ' ', '')) AND (ECTM.isDeleted != 1)
WHERE 
EC.isDeleted != 1
AND EC.SP_ID = ?
AND EC.IsTemporary != 1
GROUP BY 
EC.customerId
order by updated_at desc;
`
var selectAllContactLimit = `SELECT 
EC.*,
IFNULL(GROUP_CONCAT(ECTM.TagName ORDER BY FIND_IN_SET(ECTM.ID, REPLACE(EC.tag, ' ', ''))), '') AS tag_names
FROM 
EndCustomer AS EC
LEFT JOIN 
EndCustomerTagMaster AS ECTM ON FIND_IN_SET(ECTM.ID, REPLACE(EC.tag, ' ', '')) AND (ECTM.isDeleted != 1)
WHERE 
EC.isDeleted != 1
AND EC.SP_ID = ?
AND EC.IsTemporary != 1
GROUP BY 
EC.customerId
order by updated_at desc
limit ?, ?;
`

var selectAllContactCount = `select count(*) as totalCount from EndCustomer WHERE isDeleted != 1 AND SP_ID = ? AND IsTemporary != 1`
var insertContact = "INSERT INTO EndCustomer (Name,Phone_number,emailId,age,tag,status,facebookId,InstagramId,SP_ID,countryCode) VALUES ?";
var neweditContact = 'UPDATE EndCustomer SET '
delet = "UPDATE EndCustomer set isDeleted=1 WHERE customerId IN (?) and SP_ID=?"

selectbyid = `SELECT 
EC.*,
IFNULL(GROUP_CONCAT(ECTM.TagName ORDER BY FIND_IN_SET(ECTM.ID, REPLACE(EC.tag, ' ', ''))), '') AS tag_names
FROM 
EndCustomer AS EC
LEFT JOIN 
EndCustomerTagMaster AS ECTM ON FIND_IN_SET(ECTM.ID, REPLACE(EC.tag, ' ', '')) AND (ECTM.isDeleted != 1)
WHERE 
EC.isDeleted != 1
AND EC.SP_ID = ?
AND EC.IsTemporary != 1

and 
EC.customerId =?`
isBlockedQuery = "UPDATE EndCustomer set  isBlocked=?,isBlockedOn=now() where customerId=? and SP_ID=?"
existContactWithSameSpid=`SELECT * FROM EndCustomer WHERE (emailId = ? or Phone_number=?) AND (isDeleted =0 ) AND SP_ID=? AND IsTemporary !=1  `


// Path for download sample csv file for import of contact
var Path = 'C:/Users/hp/Downloads/data.csv'


importquery = "INSERT INTO EndCustomer (Name,Phone_number,emailId,status,sex,age,state,Country,tag,address,pincode,city,OptInStatus,facebookId,InstagramId,channel,uid,SP_ID) SELECT ? WHERE NOT EXISTS (SELECT * FROM EndCustomer WHERE "
verfiyCount = "select * from EndCustomer where emailId in (?) and isBlocked is null and isDeleted is null and SP_ID=?"
importUpdate=`UPDATE EndCustomer set Name=?,Phone_number=?,emailId=?,status=?,sex=?,age=?,state=?,Country=?,tag=?,address=?,pincode=?,city=?,OptInStatus=?,facebookId=?,InstagramId=?,channel=?,uid=? where `
crachlogQuery=`INSERT INTO CrashLog(processText,created_at) VALUES (?,now())`


var getColumnsQuery = `SELECT 
displayName,
ActuallName
FROM 
(SELECT 
    'Name' AS displayName,
    'Name' AS ActuallName,
    1 AS sort_order,
    0 AS custom_order
UNION ALL
SELECT 
    'Phone_number' AS displayName,
    'Phone_number' AS ActuallName,
    2 AS sort_order,
    0 AS custom_order
UNION ALL
SELECT 
    'emailId' AS displayName,
    'emailId' AS ActuallName,
    3 AS sort_order,
    0 AS custom_order
UNION ALL
SELECT 
    'ContactOwner' AS displayName,
    'ContactOwner' AS ActuallName,
    5 AS sort_order,
    0 AS custom_order
UNION ALL
SELECT 
    column_name AS displayName,
    column_name AS ActuallName,
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
        'state', 'city', 'pincode', 'address', 'sex', 'status', 'age','OptInStatus','tag', 'defaultAction_PauseTime'
    )
UNION ALL
SELECT 
    ColumnName AS displayName,
    CustomColumn AS ActuallName,
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
        'state', 'city', 'pincode', 'address', 'sex', 'status', 'age', 'defaultAction_PauseTime'
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
displayName
ORDER BY 
custom_order, sort_order;`

module.exports = {
    host, user, password, database, email, appPassword, emailHost, port, otp, selectAllContact, insertContact
    ,neweditContact, importquery,delet,selectbyid, Path, verfiyCount,  isBlockedQuery,getcolumn,
    importUpdate,crachlogQuery,existContactWithSameSpid ,getColumnsQuery,selectAllContactLimit,selectAllContactCount
}