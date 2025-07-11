const { SmartReplyLogModel } = require('./ServiceModel');

async function logSmartReplyUsage({ spid, customerNumber, keywordSent }) {
  try {
    const log = new SmartReplyLogModel({ spid, customerNumber, keywordSent });
    log.validate();
    await log.save();
    
    console.log("Smart Reply log saved successfully");
  } catch (err) {
    console.error("Error logging Smart Reply:", err.message);
  }
}

module.exports = { logSmartReplyUsage };