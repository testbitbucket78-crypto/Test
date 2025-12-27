const { SmartReplyLogModel } = require('./ServiceModel');
const moment = require('moment');

async function logSmartReplyUsage({ spid, customerNumber, keywordSent }) {
  try {
    const utcTimestamp = moment.utc(new Date().toUTCString()).format('YYYY-MM-DD HH:mm:ss');
    
    const log = new SmartReplyLogModel({ spid, customerNumber, keywordSent, utcTimestamp});
    log.validate();
    await log.save();
    
    console.log("Smart Reply log saved successfully");
  } catch (err) {
    console.error("Error logging Smart Reply:", err.message);
  }
}

module.exports = { logSmartReplyUsage };