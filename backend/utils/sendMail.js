import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendMail = async (mailTo, subject, body, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.APP_USER,
      pass: process.env.APP_PASSWORD,
    },
  });
  try {
    const info = await transporter.sendMail({
      from: process.env.APP_USER,
      to: mailTo,
      subject: subject,
      body: body,
      html: html,
    });

    return `Message delivered successfully. MessageId: ${info.messageId}`;
  } catch (error) {
    console.error("Error sending email " + error.message);
  }
};

export default sendMail;
