// utils/sendEmail.js
const Brevo = require("@getbrevo/brevo");
require("dotenv").config();

const apiInstance = new Brevo.TransactionalEmailsApi();

// Set API key
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      email: process.env.EMAIL_SENDER,
      name: "PrintedTeez",
    };
    sendSmtpEmail.to = [{ email: to }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Brevo Email Error:", error.message || error);
  }
};

module.exports = sendEmail;
