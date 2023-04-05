const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "scroot"
const password = "amsdb1234"
const database = "cip_project"



//Query for dashboard
interactionsQuery = `select interaction_status,count(*) count from Interaction WHERE created_at >=  NOW() - INTERVAL 30 DAY Group by (interaction_status) 
union select 'Total Interactions',count(*) count from Interaction WHERE created_at >=  NOW() - INTERVAL 30 DAY`;
campaignsQuery = ` select campaign_status,count(*) count from CampaignStats where timings >= NOW() - INTERVAL 30 DAY
Group by (campaign_status)`;
agentsQuery = `select Status,count(*) count from AgentDetails  WHERE timings >=  NOW() - INTERVAL 30 DAY  Group by (Status) union select 'Total Agents',
count(*) count from AgentDetails  where  timings >= NOW() - INTERVAL 30 DAY`;
subscribersQuery = `select OptInStatus,count(*) count from EndCustomer WHERE created_at >=  NOW() - INTERVAL 30 DAY   Group by (OptInStatus) union select  'Total Contacts',
count(*) count from EndCustomer WHERE created_at >=  NOW() - INTERVAL 30 DAY`;
conversationQuery = "CALL dashboardRecentConversation()"


module.exports = {host,user,password,database,
    interactionsQuery, campaignsQuery, agentsQuery,
    subscribersQuery, conversationQuery

}