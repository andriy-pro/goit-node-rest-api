import nodemailer from "nodemailer";
import "dotenv/config";
import { createVerificationUrl } from "../helpers/urlHelper.js";

/**
 * Кастомний клас для помилок email сервісу
 */
export class EmailServiceError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'EmailServiceError';
    this.originalError = originalError;
  }
}

/**
 * Створюємо транспорт один раз на рівні модуля для оптимізації
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.ukr.net',
  port: 465,
  secure: true,
  auth: {
    user: process.env.UKR_NET_EMAIL,
    pass: process.env.UKR_NET_PASSWORD,
  },
});

/**
 * Відправляє email для верифікації
 * @param {string} email - Email отримувача
 * @param {string} verificationToken - Токен для верифікації
 * @throws {EmailServiceError} При помилці відправки
 */
export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const verificationUrl = createVerificationUrl(verificationToken);

    const mailOptions = {
      from: process.env.UKR_NET_EMAIL,
      to: email,
      subject: "Email Verification",
      html: `
        <h2>Email Verification</h2>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" target="_blank">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
        <p><small>This link will expire after verification.</small></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Nodemailer error:", error);
    // Зберігаємо оригінальну помилку для відлагодження
    throw new EmailServiceError("Failed to send verification email", error);
  }
};