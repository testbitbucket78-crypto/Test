const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "scroot"
const password = "amsdb1234"
const database = "cip_project"



// smartReplies Queries
selectAll = `select
t.ID,
t.Title,
t.Description,
count(distinct s.Keyword) as KeywordCount,
t.MatchingCriteria,
count(distinct m.ActionID) as ActionCount
from
SmartReply t
left join SmartReplyAction m ON m.SmartReplyID = t.ID
left join SmartReplyKeywords s ON s.SmartReplyID = t.ID
where t.isDeleted is null and  m.isDeleted is null and  s.isDeleted is null  and t.SP_ID=?
group by
t.ID,
t.Title,
t.Description,
t.MatchingCriteria`

getsmartReplieswithSPID = `select *from 
(select t.ID AS SRID,
 CONCAT("[",
         GROUP_CONCAT(
              CONCAT("{ID:'",m.ID,"'"),
              CONCAT("ActionID:'",m.ActionID,"'"),
              CONCAT("Value:'",m.Value,"'"),
              CONCAT(",Message:'",m.Message,"'}")
         )
    ,"]")  as ReplyAction,
    count(distinct m.ActionID) as ActionCount  from
SmartReply t
 left join SmartReplyAction m ON m.SmartReplyID = t.ID
 where t.SP_ID=?) as a
 left join 
(select
t.ID AS SRID,
t.Title,
t.Description,
GROUP_CONCAT(s.Keyword) as Keywords,
count(distinct s.Keyword) as KeywordsCount,
t.MatchingCriteria
from
SmartReply t
right join SmartReplyKeywords s ON s.SmartReplyID = t.ID
where t.isDeleted is null and t.SP_ID=?) as b on a.SRID=b.SRID `

search = `   select
t.ID,
t.Title,
t.Description,
count(distinct s.Keyword) as KeywordCount,
t.MatchingCriteria,
count(distinct m.ActionID) as ActionCount
from
SmartReply t
left join SmartReplyAction m ON m.SmartReplyID = t.ID
left join SmartReplyKeywords s ON s.SmartReplyID = t.ID
where t.ID=? and t.isDeleted is null
group by
t.ID,
t.Title,
t.Description,
t.MatchingCriteria `





sideNavKeywords = `select
t.ID,
t.Title,
t.Description,
s.Keyword ,
t.MatchingCriteria,
m.Message,
m.Value ,
n.Name 
from
SmartReply t
left join SmartReplyAction m ON m.SmartReplyID = t.ID
left join SRActionMaster n ON n.ID=m.ActionID
left join SmartReplyKeywords s ON s.SmartReplyID = t.ID
where t.ID=?  and t.isDeleted is null and  m.isDeleted is null   and s.isDeleted is null`

alluserofAOwner = `WITH RECURSIVE user_paths AS
( SELECT SP_ID,
         ParentID as ParentId,
         name,
         mobile_number,
         email_id,
         address,
         usertype,

         1 lvl
 FROM user
 WHERE ParentID = ? and sp_id=?
   UNION ALL
   SELECT e.sp_id,
          e.ParentID,
          e.name,
         e.mobile_number,
         e.email_id,
         e.address,
         e.usertype,
          lvl+1
   FROM user e
   INNER JOIN user_paths ep ON ep.sp_id = e.ParentId )
SELECT sp_id,
     ParentId,
     name,
         mobile_number,
         email_id,
         address,
         usertype,
         lvl
FROM user_paths ep;`


addNewReply = `CALL updatedAddnewSmartReply(?,?,?,?,?,?)`;
deleteSmartReply = `CALL deleteSmartUpdate(?)`;
deletMessage = `update SmartReplyAction set isDeleted='1',isDeletedOn=now() where SmartReplyID=?`;
editMessage = `update SmartReplyAction set Message=? where SmartReplyID=?`;
editAction = `update SmartReplyAction set ActionID=?,Value=? where SmartReplyID=?`;
removeKeyword = `UPDATE SmartReplyKeywords set  isDeleted=1 , isDeletedOn=now() where SmartReplyId=? and Keyword=?`
updateSmartReply = `CALL updateSmartReply(?,?,?,?,?,?,?) `;
crachlogQuery=`INSERT INTO CrashLog(processText,created_at) VALUES (?,now())`

var updateInteractionMapping="INSERT INTO InteractionMapping (is_active,InteractionId,AgentId,MappedBy) VALUES ?"
var getInteractionMapping = "SELECT * from InteractionMapping,EndCustomer where EndCustomer.customerId=InteractionMapping.AgentId  and  is_active=1 and InteractionMapping.InteractionId=? ORDER BY MappingId DESC LIMIT 1"
var selectTagQuery = "select tag from EndCustomer where customerId= ?";

var access_token='Bearer EAAU0g9iuku4BACBhTZCxqtq5A8rIymreLIxUQa7HaToy7PBawzooIkG73XnY1PXAUGrtCulhniRrZCsQPWOB3YcozTpT4cpgcZC5MoNB05ptdnpwAIRLLz0FtQCaLvmXNqL8qqn8Yqmf07HxVpzs6OuZClb0XOylw5DWWaMxcMJm7jzVRZCmD'
var url='https://graph.facebook.com/v16.0/101714466262650/messages'
var content_type='application/json'

module.exports = {
    host, user, password, database, selectAll, search, sideNavKeywords, getsmartReplieswithSPID,
    alluserofAOwner, addNewReply, deleteSmartReply, deletMessage, editMessage, editAction,
    removeKeyword, updateSmartReply,crachlogQuery,updateInteractionMapping ,getInteractionMapping ,selectTagQuery,
    access_token,url,content_type
}