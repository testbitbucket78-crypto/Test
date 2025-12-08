const db = require("../dbhelper");

async function retryExpiryService() {
  try {
    const failedCampaigns = await db.excuteQuery(`
      SELECT 
        c.Id AS CampaignId,
        c.RetryAndExpirySettings,
        c.remainingSegmentAudiance,
        c.RetryCount,
        c.status,
        c.sp_id
      FROM Campaign c
      WHERE 
        c.is_deleted != 1
        AND c.remainingSegmentAudiance IS NOT NULL
        AND JSON_LENGTH(c.remainingSegmentAudiance) > 0
        AND c.status = 9
        AND c.RetryAndExpirySettings IS NOT NULL
    `);

    if (!failedCampaigns?.length) {
      console.log("No campaigns with pending remaining audience.");
      return [];
    }

    for (const campaign of failedCampaigns) {
      try {
        const settings = typeof campaign.RetryAndExpirySettings === "string"
          ? JSON.parse(campaign.RetryAndExpirySettings)
          : campaign.RetryAndExpirySettings;

        if (!settings.autoRetryEnabled) continue;

        const retryIntervals = settings.retryCount || [];
        const currentRetryCount = campaign.RetryCount || 0;

        // STEP 2: Stop retry if retry count reached max
        if (currentRetryCount >= retryIntervals.length) {
           await db.excuteQuery(`update Campaign set status = 3 where Id = ?`, [campaign.CampaignId]);
          continue;
        }

        const hoursToWait = retryIntervals[currentRetryCount];
        const lastRetryTime = await getLastRetryTimestamp(campaign.CampaignId);

        const now = new Date();
        const nextRetryTime = new Date(lastRetryTime);
        nextRetryTime.setHours(nextRetryTime.getHours() + hoursToWait);

        if (now < nextRetryTime) {
          console.log(`Retry not due yet for Campaign ${campaign.CampaignId}`);
          continue;
        }

        await processRetrySegments(campaign);

      } catch (err) {
        console.log("[RetryExpiryService] Error processing campaign:", err);
      }
    }
  } catch (err) {
    console.log("[RetryExpiryService] Fatal error:", err);
  }
}

async function processRetrySegments(campaign) {
  const segments = JSON.parse(campaign.remainingSegmentAudiance || "[]");
  const updatedSegments = [];
  const campaignId = campaign.CampaignId;

  for (const seg of segments) {
    const phone = seg.phone_number; 

    if (response.status === 200) {
      await db.excuteQuery(
        `UPDATE CampaignMessages
         SET status = 1, FailureReason = NULL, FailureCode = NULL
         WHERE CampaignId = ? AND phone_number = ?`,
        [campaignId, phone]
      );
    } else {
      updatedSegments.push(seg);

      await db.excuteQuery(
        `UPDATE CampaignMessages
         SET status = 400, FailureReason = ?, FailureCode = ?
         WHERE CampaignId = ? AND phone_number = ?`,
        [response.reason || "Failed Again", response.code || 400, campaignId, phone]
      );
    }
  }


  await db.excuteQuery(
    `UPDATE Campaign
     SET remainingSegmentAudiance = ?
     WHERE Id = ?`,
    [JSON.stringify(updatedSegments), campaignId]
  );


  await db.excuteQuery(
    `UPDATE Campaign
     SET RetryCount = RetryCount + 1
     WHERE Id = ?`,
    [campaignId]
  );

  console.log(`Retry completed for campaign ${campaignId}`);
}

async function remaining_segments_contacts(segments_contacts, campaignMessageId) {
  try {
    let existingData = await db.excuteQuery(
      `SELECT remainingSegmentAudiance 
       FROM Campaign 
       WHERE Id = ?`,
      [campaignMessageId]
    );

    let oldArray = [];

    if (existingData.length > 0 && existingData[0].remainingSegmentAudiance) {
      try {
        oldArray = JSON.parse(existingData[0].remainingSegmentAudiance);
        if (!Array.isArray(oldArray)) oldArray = [];
      } catch (err) {
        oldArray = [];
      }
    }

    oldArray.push(segments_contacts);

    let result = await db.excuteQuery(
      `UPDATE Campaign 
       SET 
         remainingSegmentAudiance = ?, 
         status = 9
       WHERE Id = ?`,
      [JSON.stringify(oldArray), campaignMessageId]
    );

    return result;

  } catch (err) {
    console.log("Error updating remaining segments: ", err);
  }
}

module.exports = { retryExpiryService, remaining_segments_contacts };