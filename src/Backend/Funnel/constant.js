var selectTemplate = `SELECT * FROM templateMessages WHERE spid=? and isDeleted !=1 and isTemplate=1`;
var getfunnel=`select * from Funnel where sp_id=? and is_deleted != 1`

var addFunnelDaysQuery = `INSERT INTO FunnelDays (sp_id,day,Message_id,FunnelId,created_at,scheduled_min) values ?`
var deleteFunnelDaysQuery = `UPDATE  FunnelDays SET isDeleted=1 ,updated_at=? where sp_id=? and FunnelId=? and Message_id=?`
var selectFunnelDaysQuery = `SELECT * FROM FunnelDays WHERE sp_id=? and FunnelId=? and Message_id=? and isDeleted  !=1`

var deleteAllFunnelDaysQuery = `UPDATE  FunnelDays SET isDeleted=1 ,updated_at=? where sp_id=? and FunnelId=?`

var addMessages=`INSERT INTO FunnelMessages (sp_id,FunnelId,message_content,message_media,schedule_datetime,allTime,allDays,isEnable,start_time,end_time,created_at) values ?`
var enableMessage=`UPDATE FunnelMessages SET isEnable=?,updated_at=? WHERE Message_id=? and FunnelId=?`
var deleteMessage=`UPDATE FunnelMessages SET isDeleted=1 ,updated_at=? WHERE Message_id=? and FunnelId=?`
var editMessage=`UPDATE FunnelMessages SET message_content=?,message_media=?,schedule_datetime=?,allTime=?,allDays=?,isEnable=?,start_time=?,end_time=?,updated_at=? where Message_id=? and FunnelId=?`

var deleteAllMessage=`UPDATE FunnelMessages SET isDeleted=1 ,updated_at=? WHERE FunnelId=?`

var deleteFunnel=`UPDATE Funnel SET is_deleted=1 ,updated_at=? WHERE FunnelId=?`
var disableFunnel=`UPDATE Funnel SET IsEnable=? ,updated_at=? WHERE FunnelId=?`

module.exports={selectTemplate,getfunnel,addFunnelDaysQuery,deleteFunnelDaysQuery,selectFunnelDaysQuery,addMessages,enableMessage,deleteMessage,
    editMessage,deleteAllMessage,deleteAllFunnelDaysQuery,deleteFunnel,disableFunnel
}