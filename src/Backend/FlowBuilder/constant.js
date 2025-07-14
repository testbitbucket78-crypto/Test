const getGalleryQuery =`SELECT * FROM FlowBuilderGallery` ;
const insertBot = `INSERT INTO Bots (spid, name, description, channel_id, status, timeout_value, timeout_message, created_by,advanceAction,keywords) VALUES ?`;
const  updateBots = `UPDATE Bots SET name=?, description=?, channel_id=?, timeout_value=?, timeout_message=?,advanceAction=?,keywords=?,status=? WHERE id=?`;
const deleteBotsNode = `UPDATE botNodes SET isDeleted=1 WHERE botId=?`;
const insertNode = `INSERT INTO botNodes (botId, type, message, payload_json, tempNodeId, previous_Node_Id)
        VALUES ?`;
const updateBotStatus= `UPDATE Bots SET status=? ,node_FE_Json=?,published_at=?  WHERE id=?`;

const isBotExist= `SELECT * FROM Bots WHERE spid=? and isDeleted !=1 and name=?`;
const isKeywordUsed= `SELECT * FROM Bots WHERE spid=? and isDeleted !=1 and FIND_IN_SET(?, LOWER(keywords))`;
const isKeywordUsedSmartReply= `SELECT Lower(Keyword) as Keyword FROM SmartReplyKeywords WHERE SmartReplyId IN ( select ID from SmartReply where SP_ID =? and isDeleted !=1) and Keyword IN (?) and isDeleted !=1`;
const isBotRunning= `SELECT * FROM BotSessions WHERE spid=? and botId=? and status =2`;
const getAllBots= `SELECT b.id,b.spid,b.name,b.description,b.channel_id,b.status,b.timeout_value,b.timeout_message,b.created_by,b.updated_at,b.created_at,b.published_at,b.deprecated_at,b.isDeleted,b.isDeprecated,b.keywords,b.node_FE_Json,b.advanceAction,COUNT(bs.id) AS invoked,
 COUNT(CASE WHEN bs.status=3 THEN 1 END) AS complete,
 COUNT(CASE WHEN bs.status=2 THEN 1 END) AS dropped 
 from Bots b
LEFT JOIN 
    BotSessions bs ON bs.botId = b.id
    WHERE b.spid=? and b.isDeleted !=1
    GROUP BY 
    b.id`;
const getBotById= `SELECT * FROM Bots WHERE spid=? and id=? and isDeleted !=1 `;
const getBotDetailById= `SELECT * FROM botNodes WHERE botId=?`;
const getSessionsData= `SELECT COUNT(CASE WHEN botId=? THEN 1 END) AS invoked, COUNT(CASE WHEN botId=? and status=3 THEN 1 END) AS complete, COUNT(CASE WHEN botId=? and status=2 THEN 1 END) AS dropped FROM BotSessions`;
const deleteBot= `UPDATE Bots SET isDeleted=1 WHERE id=?`;
const deprecateBot= `UPDATE Bots SET isDeprecated=1 WHERE id=?`;
const geBotSession= `SELECT * FROM BotSessions WHERE AND botId=? AND spid=? AND started_at BETWEEN ? AND ?`;
const insertMessage= "INSERT INTO Message (SPID,Type,ExternalMessageId, interaction_id, Agent_id, message_direction,message_text,message_media,media_type,Message_template_id,Quick_reply_id,created_at,updated_at,system_message_type_id,assignAgent,msg_status) VALUES ?";

module.exports = {getGalleryQuery,insertBot,isBotExist,getAllBots,isBotRunning,deleteBot,deprecateBot,getBotById,getBotDetailById,insertNode,updateBotStatus,isKeywordUsed,isKeywordUsedSmartReply,updateBots,deleteBotsNode,getSessionsData,insertMessage,geBotSession};