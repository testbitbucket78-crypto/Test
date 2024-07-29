const db = require("../dbhelper");

const host = "sdpl-staging.cdjbek5fprnn.ap-south-1.rds.amazonaws.com"
const user = "scroot"
const password = "amsdb1234"
const database = "cip_project"


//Query for contactPage
//var selectAllQuery = "SELECT * from EndCustomer where SP_ID=? and isBlocked !=1 and isDeleted !=1";
// var selectAllQuery = `WITH LatestInteractions AS (
//     SELECT i1.InteractionId, i1.customerId, i1.interaction_status, i1.interaction_details, 
//            i1.AutoReplyStatus, i1.AutoReplyUpdatedAt, i1.paused_till, i1.deleted_by, 
//            i1.is_deleted, i1.updated_at AS interaction_updated_at, i1.created_at AS interaction_created_at, 
//            i1.SP_ID, i1.interaction_type
//     FROM Interaction i1
//     JOIN (
//         SELECT customerId, MAX(InteractionId) as latestInteractionId
//         FROM Interaction
//         GROUP BY customerId
//     ) i2 ON i1.customerId = i2.customerId AND i1.InteractionId = i2.latestInteractionId
//     WHERE i1.is_deleted != 1
//       AND i1.SP_ID = ?
// ),
// ContactsWithoutInteraction AS (
//     SELECT ec.customerId, ec.Phone_number, ec.Name, 'WithoutInteraction' AS source, 1 AS priority
//     FROM EndCustomer ec
//     WHERE ec.customerId NOT IN (SELECT customerId FROM Interaction)
//       AND ec.IsTemporary != 1
//       AND ec.isDeleted != 1
//       AND ec.SP_ID = ?
// ),
// ContactsWithLatestInteraction AS (
//     SELECT ec.customerId, ec.Phone_number, ec.Name, li.InteractionId, 'WithLatestInteraction' AS source, 2 AS priority
//     FROM EndCustomer ec
//     JOIN LatestInteractions li ON ec.customerId = li.customerId
//     WHERE ec.IsTemporary != 1
//       AND ec.isDeleted != 1
//       AND ec.SP_ID = ?
// ),
// ContactsWithLatestInteractionDeletedOrTemporary AS (
//     SELECT ec.customerId, ec.Phone_number, li.InteractionId, 'WithLatestInteractionDeletedOrTemporary' AS source, 3 AS priority
//     FROM EndCustomer ec
//     JOIN LatestInteractions li ON ec.customerId = li.customerId
//     WHERE (ec.IsTemporary = 1 OR ec.isDeleted = 1)
//       AND ec.SP_ID = ?
// )
// SELECT DISTINCT customerId, Phone_number, Name, InteractionId, source FROM (
//     SELECT customerId, Phone_number, Name, 
//            NULL AS InteractionId, source, priority
//     FROM ContactsWithoutInteraction
//     UNION ALL
//     SELECT customerId, Phone_number, Name, 
//            InteractionId, source, priority
//     FROM ContactsWithLatestInteraction
//     UNION ALL
//     SELECT customerId, Phone_number, NULL AS Name, 
//            InteractionId, source, priority
//     FROM ContactsWithLatestInteractionDeletedOrTemporary
// ) AS CombinedResults
// ORDER BY priority, customerId
// LIMIT ?, ?
// `;

var selectAllQuery = `WITH LatestInteractions AS (
    SELECT i1.InteractionId, i1.customerId, i1.interaction_status, i1.interaction_details, 
           i1.AutoReplyStatus, i1.AutoReplyUpdatedAt, i1.paused_till, i1.deleted_by, 
           i1.is_deleted, i1.updated_at AS interaction_updated_at, i1.created_at AS interaction_created_at, 
           i1.SP_ID, i1.interaction_type
    FROM Interaction i1
    JOIN (
        SELECT customerId, MAX(InteractionId) as latestInteractionId
        FROM Interaction
        GROUP BY customerId
    ) i2 ON i1.customerId = i2.customerId AND i1.InteractionId = i2.latestInteractionId
    WHERE i1.is_deleted != 1
      AND i1.SP_ID = ?
),
ContactsWithoutInteraction AS (
    SELECT ec.customerId, ec.Phone_number, ec.Name, 'WithoutInteraction' AS source, 1 AS priority
    FROM EndCustomer ec
    WHERE ec.customerId NOT IN (SELECT customerId FROM Interaction)
      AND ec.IsTemporary != 1
      AND ec.isDeleted != 1
      AND ec.SP_ID = ?
),
ContactsWithLatestInteraction AS (
    SELECT ec.customerId, ec.Phone_number, ec.Name, li.InteractionId, 'WithLatestInteraction' AS source, 2 AS priority
    FROM EndCustomer ec
    JOIN LatestInteractions li ON ec.customerId = li.customerId
    WHERE ec.IsTemporary != 1
      AND ec.isDeleted != 1
      AND ec.SP_ID = ?
),
ContactsWithLatestInteractionDeletedOrTemporary AS (
    SELECT ec.customerId, ec.Phone_number, li.InteractionId, 'WithLatestInteractionDeletedOrTemporary' AS source, 3 AS priority
    FROM EndCustomer ec
    JOIN LatestInteractions li ON ec.customerId = li.customerId
    WHERE (ec.IsTemporary = 1 OR ec.isDeleted = 1)
      AND ec.SP_ID = ?
),
CombinedResults AS (
    SELECT customerId, Phone_number, Name, NULL AS InteractionId, source, priority
    FROM ContactsWithoutInteraction
    UNION ALL
    SELECT customerId, Phone_number, Name, InteractionId, source, priority
    FROM ContactsWithLatestInteraction
    UNION ALL
    SELECT customerId, Phone_number, NULL AS Name, InteractionId, source, priority
    FROM ContactsWithLatestInteractionDeletedOrTemporary
),
DistinctPhoneNumbers AS (
    SELECT Phone_number, MIN(priority) AS min_priority
    FROM CombinedResults
    GROUP BY Phone_number
)
SELECT DISTINCT cr.customerId, cr.Phone_number, cr.Name, cr.InteractionId, cr.source
FROM CombinedResults cr
JOIN DistinctPhoneNumbers dpn ON cr.Phone_number = dpn.Phone_number AND cr.priority = dpn.min_priority
ORDER BY cr.priority, cr.customerId
LIMIT ?, ?`;
var interactionsquery = "SELECT * FROM Interaction WHERE SP_ID=?  and is_deleted !=1"
var contactsInteraction = `SELECT e.*, i.*
FROM EndCustomer e
JOIN Interaction i ON e.customerID = i.customerID
WHERE e.isDeleted != 1 AND e.SP_ID=?
  AND i.is_deleted != 1  AND i.SP_ID=?
  AND i.created_at = (
    SELECT MAX(created_at)
    FROM Interaction
    WHERE customerID = e.customerID
);`


var insertCustomersQuery = "INSERT INTO EndCustomer (Name,Phone_number,channel,SP_ID,OptInStatus,countryCode,displayPhoneNumber) VALUES ?"
var filterQuery = "SELECT * from EndCustomer where Phone_number=? and isDeleted !=1"
var searchQuery = "SELECT * from EndCustomer where SP_ID=? and (Phone_number like ? or Name like ?)"
var selectByIdQuery = "SELECT * FROM EndCustomer WHERE customerId=? and isDeleted !=1"
var blockCustomerQuery = "UPDATE EndCustomer SET isBlocked =? WHERE customerId =?";



var selectAllAgentsQuery = `SELECT r.RoleName as UserType ,u.name as name , u.uid
FROM roles r
JOIN user u ON u.UserType = r.roleID
where u.isDeleted !=1 and u.SP_ID=? and u.IsActive=1`

//var selectAllAgentsQuery = "SELECT * from user where SP_ID=?";



var createInteractionQuery = "INSERT INTO Interaction (customerId,interaction_status,interaction_details,SP_ID,interaction_type,IsTemporary) VALUES ?"
var updateInteractionQuery = "UPDATE Interaction SET interaction_status =? WHERE InteractionId =?";

var getAllInteraction = "SELECT ic.AutoReplyStatus,ic.AutoReplyUpdatedAt,ic.paused_till, ic.interaction_status,ic.InteractionId, ec.*     FROM    Interaction ic JOIN    EndCustomer ec ON ic.customerId = ec.customerId WHERE    ic.interactionId = (        SELECT MAX(interactionId)        FROM Interaction        WHERE customerId = ic.customerId    ) and ec.SP_ID=?  order by interactionId desc;"
//var getAllInteraction = "SELECT  Interaction.AutoReplyStatus,Interaction.AutoReplyUpdatedAt,Interaction.paused_till, Interaction.interaction_status,Interaction.InteractionId, EndCustomer.* from Interaction,EndCustomer where Interaction.is_deleted=0 and Interaction.customerId=EndCustomer.customerId OR Interaction.customerId=EndCustomer.Phone_number"
//var searchInteractionQuery="SELECT * from Interaction where Phone_number=? or Name=?"
var selectInteractionByIdQuery = "SELECT * FROM Interaction WHERE Interaction.InteractionId=?"



var getAllMessagesByInteractionId = "SELECT Message.* ,Author.name As AgentName, DelAuthor.name As DeletedBy from Message LEFT JOIN user AS DelAuthor ON Message.Agent_id= DelAuthor.uid LEFT JOIN user AS Author ON Message.Agent_id= Author.uid where  Message.interaction_id=? and Type=?"


var insertMessageQuery = "INSERT INTO Message (SPID,Type,ExternalMessageId, interaction_id, Agent_id, message_direction,message_text,message_media,media_type,Message_template_id,Quick_reply_id,created_at,updated_at,mediaSize,assignAgent) VALUES ?"



var updateInteractionMapping = "INSERT INTO InteractionMapping (is_active,InteractionId,AgentId,MappedBy,lastAssistedAgent) VALUES ?"
var getInteractionMapping = "SELECT * from InteractionMapping,user where user.uid=InteractionMapping.AgentId  and  is_active=1 and InteractionMapping.InteractionId=? ORDER BY MappingId DESC LIMIT 1"

var savedMessagesQuery = "SELECT * from savedMessages where is_active=1 and SPID=?";
var getquickReplyQuery = "SELECT * from quickReply where is_active=1 and SPID=?";
//var getTemplatesQuery =  "SELECT * from templates where is_active=1 and SPID=?";
var getTemplatesQuery = `SELECT * FROM templateMessages WHERE spid=? and isDeleted !=1 and isTemplate=1`;

//_________________________________FOR SETTINGS NOTIFICATIONS  ________________________//
var addNotification = `INSERT INTO Notification(sp_id,subject,message,sent_to,module_name,uid,created_at) values ?`
var assignedNameQuery = `SELECT name,SP_ID from user where uid=?`;


// interaction with messages

// var interactions = `WITH LatestInteraction AS (
//     SELECT 
//         customerId,
//         MAX(interactionId) AS LatestInteractionId
//     FROM 
//         Interaction
//     WHERE 
//         is_deleted = 0
//         AND (IsTemporary = 0 OR IsTemporary IS NULL)
//     GROUP BY 
//         customerId
// )
// SELECT DISTINCT
//     ic.interaction_status, 
//     ic.InteractionId, 
//     ec.*,
//     last_message.LastMessageId,
//     COALESCE(unread_count.UnreadCount, 0) AS UnreadCount,
//     m.*,
//     m.created_at AS LastMessageDate,
//     ww.connected_id
// FROM 
//     LatestInteraction li
// JOIN 
//     Interaction ic ON li.LatestInteractionId = ic.interactionId
// LEFT JOIN 
//     EndCustomer ec ON ic.customerId = ec.customerId
// LEFT JOIN (
//     SELECT 
//         m.interaction_id,
//         MAX(m.Message_id) AS LastMessageId
//     FROM 
//         Message m
//     GROUP BY 
//         m.interaction_id
// ) AS last_message ON ic.InteractionId = last_message.interaction_id
// LEFT JOIN (
//     SELECT 
//         m.interaction_id,
//         COUNT(*) AS UnreadCount
//     FROM 
//         Message m
//     WHERE
//         m.is_read = 0
//         AND m.message_direction = 'IN'
//     GROUP BY 
//         m.interaction_id
// ) AS unread_count ON ic.InteractionId = unread_count.interaction_id
// LEFT JOIN 
//     Message m ON ic.InteractionId = m.interaction_id AND m.Message_id = last_message.LastMessageId
// LEFT JOIN 
//     WhatsAppWeb ww ON ec.SP_ID = ww.spid AND ww.is_deleted != 1
// WHERE 
//     ec.SP_ID = ?  
//     AND ec.isDeleted != 1  
// `
var interactions = `WITH LatestInteraction AS (
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
    ic.interaction_status, 
    ic.InteractionId, 
    ec.*,
    CASE 
        WHEN ec.isDeleted != 1 THEN ec.Name
        ELSE ec.Phone_Number
    END AS Name,
    last_message.LastMessageId,
    COALESCE(unread_count.UnreadCount, 0) AS UnreadCount,
    m.*,
    ic.created_at AS InCreatedDate,
    ic.updated_at AS InUpdatedDate,
    m.created_at AS LastMessageDate,
    ww.connected_id,
    im.AgentId AS InteractionMapping,
    pnin.InteractionId AS PinnedInteractionID,
    tn.TagNames 
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
LEFT JOIN (
    SELECT 
        m.interaction_id,
        COUNT(*) AS UnreadCount
    FROM 
        Message m
    WHERE
        m.is_read = 0
        AND m.message_direction = 'IN'
    GROUP BY 
        m.interaction_id
) AS unread_count ON ic.InteractionId = unread_count.interaction_id
LEFT JOIN 
    Message m ON ic.InteractionId = m.interaction_id AND m.Message_id = last_message.LastMessageId
LEFT JOIN 
    WhatsAppWeb ww ON ec.SP_ID = ww.spid AND ww.is_deleted != 1
LEFT JOIN 
    LatestInteractionMapping lim ON ic.InteractionId = lim.InteractionId
LEFT JOIN 
    InteractionMapping im ON ic.InteractionId = im.InteractionId AND im.created_at = lim.LatestMappingInfo
LEFT JOIN 
    TagNames tn ON ec.customerId = tn.customerId
LEFT JOIN 
    PinnedInteraction pnin ON ic.InteractionId = pnin.InteractionId
WHERE 
    ec.SP_ID = ?
`

getallMessagesWithScripts = `(
    SELECT 
        Message.Message_id,
        Message.message_direction,
        Message.SPID,
        Message.Agent_id,
        Message.message_text,
        Message.interaction_id,
        Message.message_media,
        Message.media_type,
        Message.Message_template_id,
        Message.Quick_reply_id,
        Message.Type,
        Message.ExternalMessageId,
        Message.is_read,
        Message.is_deleted,
        Message.deleted_by,
        Message.deleted_at,
        Message.created_at,
        Message.updated_at,
        Message.components,
        Message.template_type,
        Message.msg_status,
        Message.system_message_type_id,
        Message.mediaSize,
        Message.assignAgent,
        Author.name AS AgentName,
        DelAuthor.name AS DeletedBy,
        NULL AS action,
        NULL AS action_at,
        NULL AS action_by
    FROM 
        Message 
    LEFT JOIN 
        user AS DelAuthor ON Message.Agent_id = DelAuthor.uid 
    LEFT JOIN 
        user AS Author ON Message.Agent_id = Author.uid 
    WHERE 
        Message.interaction_id IN (
            SELECT InteractionId 
            FROM Interaction 
            WHERE customerId IN (
                SELECT customerId 
                FROM Interaction 
                WHERE InteractionId = ?
            )
        )  
        AND Message.Type = ? 
        AND Message.is_deleted != 1 
        AND (Message.msg_status IS NULL OR Message.msg_status != 10)
        AND Message.SPID = ?
        order by Message_id desc
)
UNION
(
    SELECT 
        NULL AS Message_id,
        NULL AS message_direction,
        InteractionEvents.SP_ID AS SPID,
        NULL AS Agent_id,
        NULL AS message_text,
        InteractionEvents.interactionId AS interaction_id,
        NULL AS message_media,
        NULL AS media_type,
        NULL AS Message_template_id,
        NULL AS Quick_reply_id,
        NULL AS Type,
        NULL AS ExternalMessageId,
        NULL AS is_read,
        NULL AS is_deleted,
        NULL AS deleted_by,
        NULL AS deleted_at,
        InteractionEvents.created_at,
        NULL AS updated_at,
        NULL AS components,
        NULL AS template_type,
        NULL AS msg_status,
        NULL AS system_message_type_id,
        NULL AS mediaSize,
        NULL AS assignAgent,
        NULL AS AgentName,
        NULL AS DeletedBy,
        InteractionEvents.action,
        InteractionEvents.action_at,
        InteractionEvents.action_by
    FROM 
        InteractionEvents 
    WHERE 
        InteractionEvents.interactionId = ?
        AND InteractionEvents.Type = ? 
        AND InteractionEvents.SP_ID = ?
    ORDER BY 
    created_at DESC
)
ORDER BY 
    created_at DESC  
LIMIT ?, ?;
`
getMediaMessage = `(
    SELECT 
        Message.*,
        NULL AS action,
        NULL AS action_at,
        NULL AS action_by
    FROM 
        Message 
    WHERE 
        message_media != '' 
        AND interaction_id IN (
            SELECT interactionId 
            FROM Interaction 
            WHERE customerid IN (
                SELECT customerId 
                FROM Interaction 
                WHERE interactionId = ?
            )
        ) 
        AND is_deleted != 1 
        AND (msg_status IS NULL OR msg_status != 10)
        
)
UNION
(
    SELECT 
        NULL AS Message_id,
        NULL AS message_direction,
         InteractionEvents.SP_ID AS SPID,
        NULL AS Agent_id,
        NULL AS message_text,
        NULL AS interaction_id,
        NULL AS message_media,
        NULL AS media_type,
        NULL AS Message_template_id,
        NULL AS Quick_reply_id,
        NULL AS Type,
        NULL AS ExternalMessageId,
        NULL AS is_read,
        NULL AS is_deleted,
        NULL AS deleted_by,
        NULL AS deleted_at,
        InteractionEvents.created_at,
        NULL AS updated_at,
        NULL AS components,
        NULL AS template_type,
        NULL AS msg_status,
        NULL AS system_message_type_id,
        NULL AS mediaSize,
        NULL AS assignAgent,
         InteractionEvents.action,
        InteractionEvents.action_at,
        InteractionEvents.action_by
    FROM 
        InteractionEvents 
    WHERE 
        InteractionEvents.interactionId = ?
        AND InteractionEvents.SP_ID = ?
         AND InteractionEvents.Type = ?
)
ORDER BY 
    created_at DESC,
    Message_id desc
    LIMIT ?, ?;`







    let searchWithAllData =`
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
        ic.interaction_status, 
        ic.InteractionId, 
        ec.*,
        CASE 
            WHEN ec.isDeleted != 1 THEN ec.Name
            ELSE ec.Phone_Number
        END AS Name,
        last_message.LastMessageId,
        COALESCE(unread_count.UnreadCount, 0) AS UnreadCount,
        m.*,
        ic.created_at AS InCreatedDate,
        ic.updated_at AS InUpdatedDate,
        m.created_at AS LastMessageDate,
        ww.connected_id,
        im.AgentId AS InteractionMapping,
        pnin.InteractionId AS PinnedInteractionID,
        tn.TagNames -- Include the TagNames from the EndCustomerTagMaster
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
    LEFT JOIN (
        SELECT 
            m.interaction_id,
            COUNT(*) AS UnreadCount
        FROM 
            Message m
        WHERE
            m.is_read = 0
            AND m.message_direction = 'IN'
        GROUP BY 
            m.interaction_id
    ) AS unread_count ON ic.InteractionId = unread_count.interaction_id
    LEFT JOIN 
        Message m ON ic.InteractionId = m.interaction_id AND m.Message_id = last_message.LastMessageId
    LEFT JOIN 
        WhatsAppWeb ww ON ec.SP_ID = ww.spid AND ww.is_deleted != 1
    LEFT JOIN 
        LatestInteractionMapping lim ON ic.InteractionId = lim.InteractionId
    LEFT JOIN 
        InteractionMapping im ON ic.InteractionId = im.InteractionId AND im.created_at = lim.LatestMappingInfo
    LEFT JOIN 
        TagNames tn ON ec.customerId = tn.customerId -- Join with TagNames to get the comma-separated TagNames
    LEFT JOIN 
    PinnedInteraction pnin ON ic.InteractionId = pnin.InteractionId
    WHERE 
        ec.SP_ID = ?
        AND (ec.Name LIKE ? or  ec.Phone_number LIKE ?)
        AND ic.IsTemporary !=1 
        AND (ec.isDeleted !=1 or (ec.isDeleted =1 and ic.is_deleted = 0))
        AND ic.is_deleted = 0
       `;




let interactionDataById = `WITH 
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
    ic.interaction_status, 
    ic.InteractionId, 
    ec.*,
    CASE 
        WHEN ec.isDeleted != 1 THEN ec.Name
        ELSE ec.Phone_Number
    END AS Name,
    last_message.LastMessageId,
    COALESCE(unread_count.UnreadCount, 0) AS UnreadCount,
    m.*,
    ic.created_at AS InCreatedDate,
    ic.updated_at AS InUpdatedDate,
    m.created_at AS LastMessageDate,
    ww.connected_id,
    im.AgentId AS InteractionMapping,
    pnin.InteractionId AS PinnedInteractionID,
    tn.TagNames -- Include the TagNames from the EndCustomerTagMaster
FROM 
    Interaction ic
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
LEFT JOIN (
    SELECT 
        m.interaction_id,
        COUNT(*) AS UnreadCount
    FROM 
        Message m
    WHERE
        m.is_read = 0
        AND m.message_direction = 'IN'
    GROUP BY 
        m.interaction_id
) AS unread_count ON ic.InteractionId = unread_count.interaction_id
LEFT JOIN 
    Message m ON ic.InteractionId = m.interaction_id AND m.Message_id = last_message.LastMessageId
LEFT JOIN 
    WhatsAppWeb ww ON ec.SP_ID = ww.spid AND ww.is_deleted != 1
LEFT JOIN 
    InteractionMapping im ON ic.InteractionId = im.InteractionId
LEFT JOIN 
    TagNames tn ON ec.customerId = tn.customerId -- Join with TagNames to get the comma-separated TagNames
 LEFT JOIN 
    PinnedInteraction pnin ON ic.InteractionId = pnin.InteractionId
WHERE 
    ic.InteractionId = ?
`
    
module.exports = {
    host, user, password, database,
    selectAllAgentsQuery, selectAllQuery, insertCustomersQuery, filterQuery, searchQuery, selectByIdQuery, blockCustomerQuery,
    createInteractionQuery, updateInteractionQuery, getAllInteraction, selectInteractionByIdQuery,
    getAllMessagesByInteractionId, insertMessageQuery,
    updateInteractionMapping, getInteractionMapping,
    savedMessagesQuery, getquickReplyQuery, getTemplatesQuery,
    addNotification, assignedNameQuery, interactions, contactsInteraction, interactionsquery, getallMessagesWithScripts, getMediaMessage,
    searchWithAllData ,interactionDataById
}


