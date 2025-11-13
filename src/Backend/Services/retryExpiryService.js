const db = require("../dbhelper");

async function retryExpiryService() {
  try {

    const failedMessages = await db.excuteQuery(`
      SELECT 
        cm.id AS messageId,
        cm.CampaignId,
        cm.phone_number,
        cm.status,
        cm.FailureReason,
        cm.updated_at AS lastFailedTime,
        c.RetryAndExpirySettings,
        c.sp_id,
        c.status AS campaignStatus
      FROM CampaignMessages cm
      INNER JOIN Campaign c ON c.Id = cm.CampaignId
      WHERE 
        cm.status = 400 AND cm.FailureReason IS NOT NULL
        AND c.is_deleted != 1
        AND c.RetryAndExpirySettings IS NOT NULL
    `);

    if (!failedMessages?.length) {
      logger.info("✅ [RetryExpiryService] No failed messages found for retry.");
      return [];
    }

    const retryList = [];

    for (const msg of failedMessages) {
      try {
        const settings =
          typeof msg.RetryAndExpirySettings === "string"
            ? JSON.parse(msg.RetryAndExpirySettings)
            : msg.RetryAndExpirySettings;

        if (!settings?.autoRetryEnabled) continue;

        const retryIntervals = settings.retryCount || []; 
        const lastFailed = new Date(msg.lastFailedTime);
        const now = new Date();

        const retryMeta = await db.excuteQuery(
          `SELECT COUNT(*) AS retriesDone 
           FROM CampaignMessages 
           WHERE CampaignId=? AND phone_number=? AND status IN (400, 408, 504)`,
          [msg.CampaignId, msg.phone_number]
        );

        const retriesDone = retryMeta[0]?.retriesDone || 0;

        if (retriesDone < retryIntervals.length) {
          const hoursToWait = retryIntervals[retriesDone]; // e.g. 2 hours
          const nextRetryTime = new Date(lastFailed);
          nextRetryTime.setHours(nextRetryTime.getHours() + hoursToWait);

          if (now >= nextRetryTime) {
            retryList.push({
              ...msg,
              nextRetryAttempt: retriesDone + 1,
              nextRetryAfterHours: hoursToWait,
            });
          }
        } else {
          console.log(
            ` Max retries reached for message ${msg.messageId} (Campaign: ${msg.CampaignId})`
          );
        }
      } catch (err) {
        console.log(
          `[RetryExpiryService] Error processing message ${msg.messageId}: ${err.message}`
        );
      }
    }

    console.log(`[RetryExpiryService] ${retryList.length} messages eligible for retry`);
    return retryList;
  } catch (err) {
    console.log(`[RetryExpiryService] Fatal error: ${err.message}`, {
      stack: err.stack,
    });
    return [];
  }
}

module.exports = { retryExpiryService };