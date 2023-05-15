const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "scroot"
const password = "amsdb1234"
const database = "cip_project"



//Query for dashboard
interactionsQuery = `select interaction_status,count(*) count from Interaction WHERE created_at >=  NOW() - INTERVAL 30 DAY Group by (interaction_status) 
union select 'Total Interactions',count(*) count from Interaction WHERE created_at >=  NOW() - INTERVAL 30 DAY`;
campaignsQuery = ` SELECT STATUS,COUNT(*) COUNT FROM Campaign
WHERE start_datetime >= NOW() - INTERVAL 30 DAY and sp_id=?
GROUP BY (STATUS) `;
agentsQuery = `select Status,count(*) count from AgentDetails  WHERE timings >=  NOW() - INTERVAL 30 DAY  Group by (Status) union select 'Total Agents',
count(*) count from AgentDetails  where  timings >= NOW() - INTERVAL 30 DAY`;
subscribersQuery = `select OptInStatus,count(*) count from EndCustomer WHERE created_at >=  NOW() - INTERVAL 30 DAY and SP_ID=?  Group by (OptInStatus) union select  'Total Contacts',
count(*) count from EndCustomer WHERE created_at >=  NOW() - INTERVAL 30 DAY and SP_ID=?  and (isDeleted IS NULL OR isDeleted = 0) AND (isBlocked IS NULL OR isBlocked= 0) `;
conversationQuery = "CALL dashboardRecentConversations(?)"
crachlogQuery=`INSERT INTO CrashLog(processText,created_at) VALUES (?,now())`

module.exports = {host,user,password,database,
    interactionsQuery, campaignsQuery, agentsQuery,
    subscribersQuery, conversationQuery,crachlogQuery

}