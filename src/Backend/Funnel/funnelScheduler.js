const cron = require('node-cron');

async function ScheduledFunnels() {
    try {
  
      var messagesData = await db.excuteQuery(`select * from Funnel where status=1 and is_deleted != 1`, [])
      var remaingMessage = [];
  
  
      const currentDate = new Date();
  
      const currentDay = currentDate.getDay();
  
  
      for (const message of messagesData) {
  
        let campaignTime = await getCampTime(message.sp_id)
        console.log("campaignTime", isWorkingTime(campaignTime))
        if (isWorkingTime(campaignTime)) {
  
          if (new Date(message.start_datetime) < new Date()) {
            console.log(" isWorkingTime messagesData loop",)
            const phoneNumber = message.segments_contacts.length > 0 ? mapPhoneNumberfomList(message) : mapPhoneNumberfomCSV(message);
  
          }
        } else {
          remaingMessage.push(message);
        }
  
      }
  
      for (const message of remaingMessage) {
  
        console.log("remaingMessage loop", message.sp_id)
        let campaignTime = await getCampTime(message.sp_id)
        if (isWorkingTime(campaignTime)) {
          console.log("remaingMessage  isWorkingTime loop", isWithinTimeWindow(message.start_datetime))
          if (isWithinTimeWindow(message.start_datetime)) {
            console.log("remaingMessage  start_datetime loop",)
            const phoneNumber = message.segments_contacts.length > 0 ? mapPhoneNumberfomList(message) : mapPhoneNumberfomCSV(message);
  
          }
        }
  
  
      }
  
    } catch (err) {
      console.log(err)
    }
  
  }





cron.schedule('*/5 * * * *', async () => {
    console.log('Running scheduled task...');



});

app.listen(3012, () => {
    console.log("Campaign scheduler  is listening on port 3008");
});