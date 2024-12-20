const nodemailer = require("nodemailer");
const { EmailConfigurations } =  require('../Authentication/constant');

async function sendEmail({ to, subject, html, fromChannel, attachments = [] }) {
    try {
        const senderConfig = EmailConfigurations[fromChannel];

        if (!senderConfig) {
            throw new Error(`Invalid messaging channel: ${fromChannel}`);
        }

        const transporter = nodemailer.createTransport({
            host: senderConfig.emailHost,
            port: senderConfig.port,
            secure: true,
            auth: {
                user: senderConfig.email,
                pass: senderConfig.appPassword,
            },
        });


        const mailOptions = {
            from: senderConfig.email, 
            to,
            subject,
            html,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        if (nodemailer.getTestMessageUrl(info)) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error("Failed to send email.");
    }
}

module.exports = { sendEmail };