
const db = require('../dbhelper')

class WebhookLog {
    constructor(args) {
      this.spid = args.spid;
      this.eventType = args.eventType;
      this.url = args.url;
      this.payload = JSON.stringify(args.payload || {});
      this.statusCode = args.statusCode || null;
      this.responseBody = args.responseBody ? JSON.stringify(args.responseBody) : null;
      this.error = args.error || null;
      this.success = args.success || false;
      this.retryCount = args.retryCount || 0; // Number of retry attempts
    }
  
    async saveToDatabase() {
      const query = `
        INSERT INTO WebhookLogs (spid, event_type, url, payload, status_code, response_body, error, success, retry_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
  
      const values = [
        this.spid,
        this.eventType,
        this.url,
        this.payload,
        this.statusCode,
        this.responseBody,
        this.error,
        this.success,
        this.retryCount 
      ];
  
      try {
        await db.excuteQuery(query, values);
      } catch (err) {
        console.error('Failed to insert webhook log:', err);
      }
    }
  }
  class logData {
    constructor(args) {
      this.spid = args.spid;
      this.eventType = args.eventType;
      this.url = args.url;
      this.payload = JSON.stringify(args.payload || {});
      this.statusCode = args.statusCode || null;
      this.responseBody = args.responseBody ? JSON.stringify(args.responseBody) : null;
      this.error = args.error || null;
      this.success = args.success || false;
      this.retryCount = args.retryCount || 0; 
    }
  }

  class exportLog {
    constructor(args){
        this.spid = args.spid;
        this.channel = args.channel;
        this.fromDate = args.fromDate; 
        this.toDate = args.toDate;
        this.email = args.email;
    }

    async getLogs() {
        const query = `
          SELECT 
            id AS webhookLogId,
            event_type AS event,
            created_at AS timestamp,
            CASE WHEN success = 1 THEN 'Success' ELSE 'Failed' END AS status,
            payload,
            retry_count
          FROM WebhookLogs
          WHERE spid = ?
            AND DATE(created_at) BETWEEN ? AND ?
          ORDER BY created_at ASC;
        `;
    
        const values = [this.spid, this.fromDate, this.toDate];
        try {
          const results = await db.excuteQuery(query, values);
          if(!(results && results.length > 0)) {
            throw new Error("No logs were found for the given Dates.");
          }
          return results;
        } catch (error) {
          console.error("Error fetching logs:", error);
          throw error;
        }
      }
  }

  class SmartReplyLogModel {
  constructor({ spid, customerNumber, keywordSent }) {
    this.spid = spid;
    this.customerNumber = customerNumber;
    this.keywordSent = keywordSent;
  }

  validate() {
    if (!this.spid || !this.customerNumber || !this.keywordSent) {
      throw new Error("spid, customerNumber, and keywordSent are required");
    }
  }

  async save() {
    const query = `
      INSERT INTO SmartReplyLogs (SP_ID, CustomerNumber, KeywordSent)
      VALUES (?, ?, ?)
    `;
    return await db.excuteQuery(query, [
      this.spid,
      this.customerNumber,
      this.keywordSent,
    ]);
  }
  

}
class BrandConfigRequest {
  constructor(params) {
    this.domain = params.domain;
  }

  validate() {
    if (!this.domain) {
      throw new Error('Domain is required');
    }
  }

async fetch() {
  try{
  const query = `
    SELECT * FROM white_label_settings
    WHERE custom_domain = ?
    LIMIT 1
  `;

  const result = await db.excuteQuery(query, [this.domain]);
  return result.length ? this.formatResponse(result[0]) : null;
  } catch(error){
     throw error(error?.message || "Something went wrong while Fetching ")
  }

}

formatResponse(config) {
  return {
    brandName: config.brand_name || '',
    logoUrl: config.logo_url || '',
    faviconUrl: config.favicon_url || '',
    heroText: config.hero_text || '',
    heroTextColor: config.hero_text_color || '#000000',
    footerText: config.copyright_text || '',
    domain: config.custom_domain || this.domain,
    emailSender: config.sender_email || '',
    isEmailActive: config.is_email_active === 1,
    smtp: {
      host: config.smtp_host || '',
      port: config.smtp_port || null,
      secure: config.smtp_secure === 1,
    },
    creativeImage: config.creative_image || '',
    isDomainVerified: config.is_domain_verified === 1,
    updatedAt: config.updated_at,
    partnerId: config.partner_id
  };
}
}

class RetryExpiryServiceModel {
  constructor({ campaignId, spId, phoneNumber, messageId, retryAttempt, nextRetryTime, status }) {
    this.campaignId = campaignId;
    this.spId = spId;
    this.phoneNumber = phoneNumber;
    this.messageId = messageId;
    this.retryAttempt = retryAttempt || 0;
    this.nextRetryTime = nextRetryTime || null;
    this.status = status || 'pending';
  }

  validate() {
    if (!this.campaignId || !this.spId) {
      throw new Error("Invalid RetryExpiryServiceModel: campaignId and spId are required");
    }
  }

  toJSON() {
    return {
      campaignId: this.campaignId,
      spId: this.spId,
      phoneNumber: this.phoneNumber,
      messageId: this.messageId,
      retryAttempt: this.retryAttempt,
      nextRetryTime: this.nextRetryTime,
      status: this.status
    };
  }
}

  
  module.exports = { WebhookLog, logData, exportLog, SmartReplyLogModel, BrandConfigRequest, RetryExpiryServiceModel };