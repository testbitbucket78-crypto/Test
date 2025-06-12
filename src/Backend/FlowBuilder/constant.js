const getGalleryQuery =`SELECT * FROM FlowBuilderGallery` ;
const insertBot = `INSERT INTO Bots (spid, name, description, channel_id, status, timeout_value, timeout_message, created_by,advanceAction)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
const insertNode = `INSERT INTO botNodes (botId, type, message, node_Json, tempNodeId, previous_Node_Id)
        VALUES (?, ?, ?, ?, ?, ?)`;
const updateBotStatus= `UPDATE Bots SET status=? ,node_FE_Json=?,published_at=?  WHERE botId=?`;

const isBotExist= `SELECT * FROM Bots WHERE spid=? and isDeleted !=1 and name=?`;
const isBotRunning= `SELECT * FROM BotSessions WHERE spid=? and botId=? and status =2`;
const getAllBots= `SELECT * FROM Bots WHERE spid=? and isDeleted !=1`;
const getBotById= `SELECT * FROM Bots WHERE spid=? and botId=? and isDeleted !=1 `;
const getBotDetailById= `SELECT * FROM botNodes WHERE spid=? and botId=?  `;
const deleteBot= `UPDATE Bots SET isDeleted=1 WHERE botId=?`;
const deprecateBot= `UPDATE Bots SET isDeprecated=1 WHERE botId=?`;

module.exports = {getGalleryQuery,insertBot,isBotExist,getAllBots,isBotRunning,deleteBot,deprecateBot,getBotById,getBotDetailById,insertNode,updateBotStatus};