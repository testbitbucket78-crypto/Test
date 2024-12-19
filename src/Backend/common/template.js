const { MessagingName }= require('../enum');
async function EmailTemplateProvider(alert, status, emailwhomToSent, name) {
    let subject = '';
    let body = '';
    let emailSender = MessagingName[emailwhomToSent];
    let msgStatus = status === '3' ? await find_message_status(alert) : null;
  
    let audience = alert.segments_contacts.length > 0
      ? JSON.parse(alert.segments_contacts).length
      : JSON.parse(alert.csv_contacts).length;
  
    if (status == '1') {
      subject = `Your ${emailSender} Campaign is Scheduled!`;
      body = `
        <p>Hello <strong>${name}</strong>,</p>
  
        <p>Your <strong>${emailSender}</strong> campaign has been successfully scheduled! 🎉 Here are the details of your upcoming campaign:</p>
        
        <ul>
          <li><strong>Campaign Name:</strong> ${alert.title}</li>
          <li><strong>Scheduled Time:</strong> ${alert.start_datetime}</li>
          <li><strong>Target Audience:</strong> ${audience}</li>
          <li><strong>Channel:</strong> WhatsApp, ${alert.channel_id}</li>
        </ul>
  
        <p>Your campaign will go live as per the scheduled time, ensuring you reach your audience right on time. 🚀</p>
  
        <p>Best regards,<br>Team ${emailSender}</p>
      `;
    } else if (status == '-1' || status == '2') {
      subject = `Your ${emailSender} Campaign Has Started!`;
      body = `
        <p>Dear <strong>${name}</strong>,</p>
  
        <p>We’re excited to inform you that your <strong>${emailSender}</strong> campaign has started successfully! 🎉</p>
        
        <ul>
          <li><strong>Campaign Name:</strong> ${alert.title}</li>
          <li><strong>Target Audience:</strong> ${audience}</li>
          <li><strong>Channel:</strong> WhatsApp, ${alert.channel_id}</li>
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
          <li><strong>Channel:</strong> WhatsApp, ${alert.channel_id}</li>
          <li><strong>Sent:</strong> ${msgStatus?.Sent || 0}</li>
          <li><strong>Failed:</strong> ${msgStatus?.Failed || 0}</li>
        </ul>
  
        <p>For a more detailed report and insights, please log in to your <strong>${emailSender}</strong> account.</p>
  
        <p>Best regards,<br>Team ${emailSender}</p>
      `;
    } else if (status == '0') {
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

  module.exports = { EmailTemplateProvider };