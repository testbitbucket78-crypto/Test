const db = require("../../dbhelper");

class ExportLogsModel {
  constructor({ spid, fromDate, toDate, email, channel }) {
    this.spid = spid;
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.email = email;
    this.channel = channel;
  }

  validate() {
    if (!this.spid || !this.fromDate || !this.toDate) {
      throw new Error('spid, fromDate, and toDate are required');
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const from = new Date(this.fromDate);
    const to = new Date(this.toDate);

    if (from < sixMonthsAgo || to < sixMonthsAgo || from > to) {
      throw new Error('Date range must be within the last 6 months and valid');
    }
  }

    // async fetchLogs() {
    // const query = `
 
    // `;

    // return await db.excuteQuery(query, [this.spid, this.fromDate, this.toDate]);
    // }

async fetchLogs() {
    const startDate = `${this.fromDate} 00:00:00`;
    const endDate = `${this.toDate} 23:59:59`;
  const query = `
    SELECT 
      CustomerNumber AS CustomerNumber,
      TriggerTime AS TriggerTime,
      KeywordSent AS KeywordSent
    FROM 
      SmartReplyLogs
    WHERE 
      SP_ID = ?
      AND TriggerTime BETWEEN ? AND ?
    ORDER BY 
      TriggerTime DESC
  `;

  const result = await db.excuteQuery(query, [this.spid, startDate, endDate]);
  if (!result || result.length === 0) {
    throw new Error(`No Smart Reply logs found for the selected date range ${this.fromDate} to ${this.toDate}`);
  }
  return result;
 }
}

module.exports = { ExportLogsModel };