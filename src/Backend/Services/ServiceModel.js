
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
    }
  
    async saveToDatabase() {
      const query = `
        INSERT INTO WebhookLogs (spid, event_type, url, payload, status_code, response_body, error, success)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `;
  
      const values = [
        this.spid,
        this.eventType,
        this.url,
        this.payload,
        this.statusCode,
        this.responseBody,
        this.error,
        this.success
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
            payload
          FROM WebhookLogs
          WHERE spid = ?
            AND DATE(created_at) BETWEEN ? AND ?
          ORDER BY created_at ASC;
        `;
    
        const values = [this.spid, this.fromDate, this.toDate];
        try {
          const results = await db.excuteQuery(query, values);
          return results;
        } catch (error) {
          console.error("Error fetching logs:", error);
          throw error;
        }
      }
  }
  
  module.exports = { WebhookLog, logData, exportLog };