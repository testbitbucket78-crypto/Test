const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "scroot"
const password = "amsdb1234"
const database = "cip_project"



//Query for dashboard
// interactionsQuery = `SELECT interaction_status, COUNT(*) AS count
// FROM Interaction
// WHERE SP_ID = ?  AND is_deleted !=1
// AND created_at >= now() - INTERVAL 30 DAY
// GROUP BY interaction_status

// UNION

// SELECT 'Total Interactions' AS interaction_status, COUNT(*) AS count
// FROM Interaction
// WHERE SP_ID = ? AND  is_deleted !=1
// AND created_at >= now()  - INTERVAL 30 DAY; `;

interactionsQuery =`
WITH LatestInteractions AS (
    SELECT 
        InteractionId,
        SP_ID,
        customerId,
        interaction_status,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY customerId ORDER BY created_at DESC) AS rn
    FROM 
        Interaction
    WHERE 
        SP_ID = ?
        AND is_deleted != 1 
        AND IsTemporary != 1
),
BlockedInteractions AS (
    SELECT 
        customerId
    FROM 
        EndCustomer
    WHERE 
        isBlocked = 1
)
SELECT 
    interaction_status, 
    COUNT(*) AS count
FROM 
    LatestInteractions
WHERE 
    rn = 1
    AND customerId NOT IN (SELECT customerId FROM BlockedInteractions)
    AND interaction_status IN ('Open', 'Resolved')
GROUP BY 
    interaction_status

UNION ALL

SELECT 
    'Total Interactions' AS interaction_status, 
    COUNT(*) AS count
FROM 
    LatestInteractions
WHERE 
    rn = 1
    AND customerId NOT IN (SELECT customerId FROM BlockedInteractions)
    AND interaction_status IN ('Open', 'Resolved');`


campaignsQuery = ` SELECT STATUS,COUNT(*) COUNT FROM Campaign
WHERE  sp_id=? and is_deleted != 1
GROUP BY (STATUS) `;

agentsQuery = `SELECT '1' AS IsActive, COUNT(*) AS count
FROM user
WHERE SP_ID =? AND IsActive = 1 AND isDeleted != 1

UNION ALL

SELECT '0' AS InActive, COUNT(*) AS count
FROM user
WHERE SP_ID =? AND IsActive <> 1 AND isDeleted != 1

UNION ALL

SELECT 'Total Agents' AS Total, COUNT(*) AS count
FROM user
WHERE SP_ID =? AND isDeleted != 1;`;

subscribersQuery = `select OptInStatus,count(*) count from EndCustomer WHERE SP_ID=? and (isDeleted IS NULL OR isDeleted = 0)  AND IsTemporary !=1  Group by (OptInStatus) union select  'Total Contacts',
count(*) count from EndCustomer WHERE SP_ID=?  and (isDeleted IS NULL OR isDeleted = 0)  AND IsTemporary !=1  `;
conversationQuery = "CALL dashboardRecentConversationlatest(?)"
crachlogQuery = `INSERT INTO CrashLog(processText,created_at) VALUES (?,now())`

module.exports = {
  host, user, password, database,
  interactionsQuery, campaignsQuery, agentsQuery,
  subscribersQuery, conversationQuery, crachlogQuery

}