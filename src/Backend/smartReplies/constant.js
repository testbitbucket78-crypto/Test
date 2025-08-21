const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "scroot"
const password = "amsdb1234"
const database = "cip_project"



// smartReplies Queries
selectAll = `SELECT
t.ID,
t.Title,
t.Description,
t.CreatedDate,
t.ModifiedDate,
t.Channel,
COUNT(DISTINCT s.Keyword) AS KeywordCount,
t.MatchingCriteria,
COALESCE(action_counts.ActionCount, 0) AS ActionCount
FROM
SmartReply t
LEFT JOIN
SmartReplyKeywords s ON s.SmartReplyID = t.ID
LEFT JOIN
(
    SELECT 
        SmartReplyID,
        COUNT(ActionID) AS ActionCount
    FROM 
        SmartReplyAction
    WHERE 
        isDeleted != 1 
    GROUP BY 
        SmartReplyID
) AS action_counts ON action_counts.SmartReplyID = t.ID
WHERE
t.isDeleted != 1
AND s.isDeleted != 1
AND t.SP_ID = ?
GROUP BY
t.ID,
t.Title,
t.Description,
t.MatchingCriteria`


getRecentInsertion = `SELECT
t.ID,
t.Title,
t.Description,
t.CreatedDate,
t.ModifiedDate,
t.Channel,
COUNT(DISTINCT s.Keyword) AS KeywordCount,
t.MatchingCriteria,
COALESCE(action_counts.ActionCount, 0) AS ActionCount
FROM
SmartReply t
LEFT JOIN
SmartReplyKeywords s ON s.SmartReplyID = t.ID
LEFT JOIN
(
    SELECT 
        SmartReplyID,
        COUNT(ActionID) AS ActionCount
    FROM 
        SmartReplyAction
    WHERE 
        isDeleted != 1 
    GROUP BY 
        SmartReplyID
) AS action_counts ON action_counts.SmartReplyID = t.ID
WHERE
t.isDeleted != 1
AND s.isDeleted != 1
AND t.SP_ID = ?
GROUP BY
t.ID,
t.Title,
t.Description,
t.MatchingCriteria order by 1 desc limit 1`

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
t.Channel,
GROUP_CONCAT(s.Keyword) as Keywords,
count(distinct s.Keyword) as KeywordsCount,
t.MatchingCriteria
from
SmartReply t
right join SmartReplyKeywords s ON s.SmartReplyID = t.ID
where t.isDeleted !=1 and t.SP_ID=?) as b on a.SRID=b.SRID `

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
t.CreatedDate,
t.ModifiedDate,
t.Channel,
m.isTemplate,
m.headerText,
m.bodyText,
m.laungage as templatelanguage,
m.Message,
m.Value ,
m.media_type,
m.Media,
n.Name,
JSON_UNQUOTE(m.buttons) as buttons,
JSON_UNQUOTE(m.buttonsVariable) as buttonsVariable,
JSON_UNQUOTE(m.interactive_buttons) as interactive_buttons
from
SmartReply t
left join SmartReplyAction m ON m.SmartReplyID = t.ID
left join SRActionMaster n ON n.ID=m.ActionID
left join SmartReplyKeywords s ON s.SmartReplyID = t.ID
where t.ID=?  and t.isDeleted !=1 and  m.isDeleted !=1   and s.isDeleted !=1`

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


addNewReply = `CALL updatedAddnewSmartReply(?,?,?,?,?,?,?)`;
deleteSmartReply = `CALL deleteSmartUpdate(?)`;
deletMessage = `update SmartReplyAction set isDeleted='1',isDeletedOn=now() where SmartReplyID=?`;
editMessage = `update SmartReplyAction set Message=? where SmartReplyID=?`;
editAction = `update SmartReplyAction set ActionID=?,Value=? where SmartReplyID=?`;
removeKeyword = `UPDATE SmartReplyKeywords set  isDeleted=1 , isDeletedOn=now() where SmartReplyId=? and Keyword=?`
updateSmartReply = `CALL UpdateAndDeleteSReply(?,?,?,?,?,?,?) `   //`CALL updateSmartReply(?,?,?,?,?,?) `;
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
    access_token,url,content_type, getRecentInsertion
}