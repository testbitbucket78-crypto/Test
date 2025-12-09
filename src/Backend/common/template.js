const { MessagingName, channelName }= require('../enum');
const db = require('../dbhelper')
const {formatDateTimeAccToTimeZone} = require('../Contact/utils')

async function EmailTemplateProvider(alert, status, emailwhomToSent, name, spMobileNumber) {
    let subject = '';
    let body = '';
    let emailSender = MessagingName[emailwhomToSent];
    const channelname = channelName[emailwhomToSent]
    let msgStatus = status == '3' ? await find_message_status(alert) : null;
  
    let audience = alert.segments_contacts.length > 0
      ? JSON.parse(alert.segments_contacts).length
      : JSON.parse(alert.csv_contacts).length;
  
    if (status == '-11') { // need to disable this message for now (1)
      subject = `Your ${emailSender} Campaign is Scheduled!`;
      body = `
        <p>Hello <strong>${name}</strong>,</p>
  
        <p>Your <strong>${emailSender}</strong> campaign has been successfully scheduled! 🎉 Here are the details of your upcoming campaign:</p>
        
        <ul>
          <li><strong>Campaign Name:</strong> ${alert.title}</li>
          <li><strong>Scheduled Time:</strong> ${formatDateTimeAccToTimeZone(alert.start_datetime, alert.time_zone)}</li>
          <li><strong>Target Audience:</strong> ${audience}</li>
          <li><strong>Channel:</strong> ${channelname}, ${spMobileNumber}</li>
        </ul>
  
        <p>Your campaign will go live as per the scheduled time, ensuring you reach your audience right on time. 🚀</p>
  
        <p>Best regards,<br>Team ${emailSender}</p>
      `;
    } else if (status == '-1' || status == '2') {
      subject = `Your ${emailSender} Campaign Has Started!`;
      body = `
        <p>Dear <strong>${name}</strong>,</p>

        <p>We’re excited to inform you that your <strong>${emailSender}</strong> campaign has started successfully! 🎉</p>
        <p><strong>Here are the campaign details:</strong></p>

        <ul>
          <li><strong>Campaign Name:</strong> ${alert.title}</li>
          <li><strong>Target Audience:</strong> ${audience}</li>
          <li><strong>Channel:</strong> ${channelname}, ${spMobileNumber}</li>
        </ul>
  
        <p>Your campaign is now live and reaching your audience as planned.</p>
  
        <p>Best regards,<br>Team ${emailSender}</p>
      `;
    } else if (status == '3') {
      subject = `${emailSender} Campaign Completed - Campaign Summary`;
      body = `
        <p>Hello <strong>${name}</strong>,</p>
  
        <p>Your <strong>${emailSender}</strong> campaign has been successfully completed! Here’s a quick summary of your campaign delivery:</p>
        
        <ul>
          <li><strong>Campaign Name:</strong> ${alert.title}</li>
          <li><strong>Target Audience:</strong> ${audience}</li>
          <li><strong>Channel:</strong> ${channelname}, ${spMobileNumber}</li>
          <li><strong>Sent:</strong> ${msgStatus?.Sent || 0}</li>
          <li><strong>Failed:</strong> ${msgStatus?.Failed || 0}</li>
        </ul>
  
        <p>For a more detailed report and insights, please log in to your <strong>${emailSender}</strong> account.</p>
  
        <p>Best regards,<br>Team ${emailSender}</p>
      `;
    } else if (status == '-11') { // need to disable this message for now (0)
      subject = `Alert! Your ${emailSender} Campaign Has Been Stopped / Paused`;
      body = `
        <p>Hello <strong>${name}</strong>,</p>
  
        <p>This is a quick alert regarding your <strong>${emailSender}</strong> campaign.<br>
        Your campaign, <strong>${alert.title}</strong>, has been stopped/paused.</p>
  
        <p>Please log in to your <strong>${emailSender}</strong> account for more details and to take further action if needed. Ensuring your campaigns run smoothly is our priority, and we’re here to help if you need assistance.</p>
  
        <p>Thank you for your attention.</p>
      `;
    }
  
    return { subject, body, emailSender };
  }

  
async function find_message_status(alert) {
  let Sent = 0;
  let Failed = 0;
  let msgStatusquery = `SELECT
  
  CM.status,
 COUNT( CM.status) AS Status_Count
 FROM
  CampaignMessages AS CM
 JOIN
  Campaign AS C ON CM.CampaignId = C.Id
 WHERE
  C.is_deleted != 1 and C.status=3
 AND C.sp_id =${alert.sp_id} AND C.Id=${alert.Id}
 GROUP BY
 CM.status;`

  let msgStatus = await db.excuteQuery(msgStatusquery, []);
  for (const item of msgStatus) {
    console.log("item.status", item.status)
    if (item.status != 0) {
      Sent += item.Status_Count;
    } else if (item.status === 0) {
      Failed += item.Status_Count;
    }
  }

  return {
    Sent: Sent,
    Failed: Failed,
  };
}

async function TemplateQualityUpdateEmail(templateName, status, rejectionReason = "N/A") {
  const emailSender = "Engagekart";

  const subject = `Update - WhatsApp Template Status Changed`;

  const body = `
    <p>Hello,</p>

    <p>The Status for your below mentioned WhatsApp template has been updated by Meta.</p>

    <ul>
      <li><strong>Template Name:</strong> ${templateName}</li>
      <li><strong>Updated Status:</strong> ${status}</li>
      <li><strong>Rejection Reason:</strong> ${status === "Rejected" ? rejectionReason : "N/A"}</li>
    </ul>

    <p>This change has been synced across your account. Please review your campaigns or automations using this template to ensure everything remains aligned.</p>

    <p>Best regards,<br>Team ${emailSender}</p>
  `;

  return { subject, body, emailSender };
}



  module.exports = { EmailTemplateProvider, TemplateQualityUpdateEmail };