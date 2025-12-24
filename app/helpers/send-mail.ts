import nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

export interface SendMailOptions {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
    contentType?: string;
  }>;
}

/**
 * Create and configure nodemailer transporter for Digital Ocean mail service
 * Supports both Digital Ocean managed email and custom SMTP
 */
const createTransporter = (): Transporter => {
  const mailHost = process.env.MAIL_HOST || "mail.digitalocean.com";
  const mailPort = parseInt(process.env.MAIL_PORT || "587", 10);
  const mailSecure = process.env.MAIL_SECURE === "true" || mailPort === 465;
  const mailUsername = process.env.MAIL_USERNAME;
  const mailPassword = process.env.MAIL_PASSWORD;

  if (!mailUsername || !mailPassword) {
    throw new Error(
      "Mail configuration is missing. Please set MAIL_USERNAME and MAIL_PASSWORD environment variables."
    );
  }

  const transporter = nodemailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: mailSecure, // true for 465, false for other ports
    auth: {
      user: mailUsername,
      pass: mailPassword,
    },
    // Digital Ocean mail service configuration
    tls: {
      // Do not fail on invalid certificates
      rejectUnauthorized: process.env.MAIL_TLS_REJECT_UNAUTHORIZED !== "false",
    },
  });

  return transporter;
};

/**
 * Send email using Digital Ocean mail service
 * @param options - Email options (from, to, subject, text, html, etc.)
 * @returns Promise with message info
 */
export const sendMail = async (options: SendMailOptions) => {
  try {
    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();

    const mailOptions = {
      from: options.from,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      cc: options.cc
        ? Array.isArray(options.cc)
          ? options.cc.join(", ")
          : options.cc
        : undefined,
      bcc: options.bcc
        ? Array.isArray(options.bcc)
          ? options.bcc.join(", ")
          : options.bcc
        : undefined,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });

    return info;
  } catch (error: any) {
    console.error("Error sending email:", {
      error: error.message,
      to: options.to,
      subject: options.subject,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send OTP email (convenience function)
 */
export const sendOTPEmail = async (
  to: string,
  otp: string,
  expiresInMinutes: number = 15
) => {
  const from = process.env.MAIL_FROM || process.env.MAIL_USERNAME || "noreply@example.com";
  const appName = process.env.APP_NAME || "YC Fitness";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #0066cc; text-align: center; padding: 20px; background-color: white; border: 2px dashed #0066cc; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${appName}</h1>
        </div>
        <div class="content">
          <h2>Your Verification Code</h2>
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <div class="otp-code">${otp}</div>
          <p>This code will expire in ${expiresInMinutes} minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    ${appName} - Verification Code
    
    Your verification code is: ${otp}
    
    This code will expire in ${expiresInMinutes} minutes.
    
    If you didn't request this code, please ignore this email.
  `;

  return sendMail({
    from,
    to,
    subject: `${appName} - Verification Code`,
    text,
    html,
  });
};

/**
 * Send welcome email (convenience function)
 */
export const sendWelcomeEmail = async (
  to: string,
  name: string,
  memberCode?: string
) => {
  const from = process.env.MAIL_FROM || process.env.MAIL_USERNAME || "noreply@example.com";
  const appName = process.env.APP_NAME || "YC Fitness";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${appName}!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Welcome to ${appName}! We're excited to have you on board.</p>
          ${memberCode ? `<p>Your member code is: <strong>${memberCode}</strong></p>` : ""}
          <p>Start your fitness journey with us today!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to ${appName}!
    
    Hello ${name},
    
    Welcome to ${appName}! We're excited to have you on board.
    ${memberCode ? `Your member code is: ${memberCode}` : ""}
    
    Start your fitness journey with us today!
  `;

  return sendMail({
    from,
    to,
    subject: `Welcome to ${appName}!`,
    text,
    html,
  });
};
