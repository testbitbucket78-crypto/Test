
async function isStatusEmpty(InteractionId, spid,cusid) {
    try {
      let isUpdateTime ;
      let isNewContact = await db.excuteQuery('select * from Interaction where interaction_status =? and customerId = ? and SP_ID=? and IsTemporary =! and is_deleted !=1', ['empty', cusid, spid]);
      let getInteractionStatus = await db.excuteQuery('select * from Interaction where interaction_status =? and InteractionId = ? and SP_ID=? and IsTemporary =! and is_deleted !=1', ['empty', InteractionId, spid]);
      if(isNewContact?.length ==1 && getInteractionStatus.length >0){
        isUpdateTime = 1;
      }else if(getInteractionStatus.length >0){
        isUpdateTime =0;
      }
     console.log("isUpdateTime",isUpdateTime)
  
      return isUpdateTime;
    } catch (err) {
      return err;
    }
  }

  module.exports  ={isStatusEmpty}