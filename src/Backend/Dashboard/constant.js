const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "scroot"
const password = "amsdb1234"
const database = "cip_project"



//Query for dashboard
interactionsQuery = `SELECT interaction_status, COUNT(*) AS count
FROM Interaction

WHERE  SP_ID = ? 
GROUP BY interaction_status

UNION

SELECT 'Total Interactions' AS interaction_status, COUNT(*) AS count
FROM Interaction

WHERE SP_ID = ? `;


campaignsQuery = ` SELECT STATUS,COUNT(*) COUNT FROM Campaign
WHERE  sp_id=? and is_deleted != 1
GROUP BY (STATUS) `;

agentsQuery = `SELECT IsActive, COUNT(*) AS count
FROM user
WHERE  SP_ID = ? and isDeleted != 1
GROUP BY IsActive
UNION
SELECT 'Total Agents', COUNT(*) AS count
FROM user
WHERE  SP_ID = ? and isDeleted != 1`;

subscribersQuery = `select OptInStatus,count(*) count from EndCustomer WHERE SP_ID=? and (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0)   Group by (OptInStatus) union select  'Total Contacts',
count(*) count from EndCustomer WHERE SP_ID=?  and (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0) `;
conversationQuery = "CALL dashboardRecentConversations(?)"
crachlogQuery = `INSERT INTO CrashLog(processText,created_at) VALUES (?,now())`

module.exports = {
  host, user, password, database,
  interactionsQuery, campaignsQuery, agentsQuery,
  subscribersQuery, conversationQuery, crachlogQuery

}