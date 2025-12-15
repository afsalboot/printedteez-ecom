// config/mailer.js
const axios = require("axios");

const brevo = axios.create({
  baseURL: "https://api.brevo.com/v3",
  headers: {
    "api-key": process.env.BREVO_API_KEY,
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY missing");
    }

    if (!process.env.EMAIL_SENDER) {
      throw new Error("EMAIL_SENDER missing");
    }

    await brevo.post("/smtp/email", {
      sender: {
        email: process.env.EMAIL_SENDER,
        name: "PrintedTeez",
      },
      to: [{ email: to }],
      subject,
      htmlContent,
    });

    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(
      "❌ Brevo Email Error:",
      error?.response?.data || error.message
    );
  }
};

module.exports = sendEmail;
