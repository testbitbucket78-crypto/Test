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
recentConversationQuery =`
WITH LatestInteraction AS (
    SELECT 
        customerId,
        MAX(interactionId) AS LatestInteractionId
    FROM 
        Interaction
    WHERE 
        is_deleted = 0
        AND (IsTemporary = 0 OR IsTemporary IS NULL)
    GROUP BY 
        customerId
),
LatestInteractionMapping AS (
    SELECT 
        InteractionId,
        MAX(created_at) AS LatestMappingInfo
    FROM 
        InteractionMapping
    GROUP BY 
        InteractionId
),
TagSplit AS (
    SELECT 
        ec.customerId,
        TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(ec.Tag, ',', numbers.n), ',', -1)) AS TagId
    FROM 
        EndCustomer ec
    JOIN (
        SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL 
        SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL 
        SELECT 9 UNION ALL SELECT 10
    ) numbers ON CHAR_LENGTH(ec.Tag) - CHAR_LENGTH(REPLACE(ec.Tag, ',', '')) >= numbers.n - 1
),
TagNames AS (
    SELECT 
        ts.customerId,
        GROUP_CONCAT(ectm.TagName SEPARATOR ', ') AS TagNames
    FROM 
        TagSplit ts
    JOIN 
        EndCustomerTagMaster ectm ON ts.TagId = ectm.ID
    WHERE 
        ectm.isDeleted != 1 AND ectm.SP_ID = ?
    GROUP BY 
        ts.customerId
)
SELECT DISTINCT
    CASE 
        WHEN ec.isDeleted != 1 THEN ec.Name
        ELSE ec.Phone_Number
    END AS Name,
    ec.Phone_Number,
    m.message_text,
    m.created_at AS interaction_date,
    ic.InteractionId,
    m.Message_id,
    m.is_read AS isread,
    m.message_direction,
    m.media_type,
    CASE 
        WHEN pnin.InteractionId IS NOT NULL THEN 1
        ELSE 0
    END AS is_pinned
FROM 
    LatestInteraction li
JOIN 
    Interaction ic ON li.LatestInteractionId = ic.interactionId
LEFT JOIN 
    EndCustomer ec ON ic.customerId = ec.customerId
LEFT JOIN (
    SELECT 
        m.interaction_id,
        MAX(m.Message_id) AS LastMessageId
    FROM 
        Message m
    GROUP BY 
        m.interaction_id
) AS last_message ON ic.InteractionId = last_message.interaction_id
LEFT JOIN 
    Message m ON ic.InteractionId = m.interaction_id AND m.Message_id = last_message.LastMessageId
LEFT JOIN 
    PinnedInteraction pnin ON ic.InteractionId = pnin.InteractionId
WHERE 
    ec.SP_ID = ?
ORDER BY 
    pnin.InteractionId IS NULL,
    m.created_at DESC, 
    ic.InteractionId DESC
    LIMIT 3;`

module.exports = {
  host, user, password, database,
  interactionsQuery, campaignsQuery, agentsQuery,
  subscribersQuery, conversationQuery, crachlogQuery,recentConversationQuery

}