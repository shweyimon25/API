import nodemailer, { Transporter } from "nodemailer";

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
 * Create and configure nodemailer transporter
 * Supports Gmail, Digital Ocean, and other SMTP services
 */
const createTransporter = (): Transporter => {
  const mailHost = process.env.MAIL_HOST || "smtp.gmail.com";
  const mailPort = parseInt(process.env.MAIL_PORT || "587", 10);
  
  // Determine secure mode: port 465 uses SSL/TLS directly, other ports use STARTTLS
  // Port 465 = secure: true (SSL/TLS from start)
  // Port 587/25 = secure: false (STARTTLS - upgrade plain connection to TLS)
  let mailSecure: boolean;
  if (process.env.MAIL_SECURE !== undefined) {
    mailSecure = process.env.MAIL_SECURE === "true";
  } else {
    // Auto-detect: only port 465 uses secure: true
    mailSecure = mailPort === 465;
  }
  
  // Validate port/secure combination to prevent SSL errors
  if (mailPort === 465 && !mailSecure) {
    console.warn("Warning: Port 465 requires MAIL_SECURE=true. Auto-correcting...");
    mailSecure = true;
  } else if ((mailPort === 587 || mailPort === 25) && mailSecure) {
    console.warn("Warning: Port 587/25 requires MAIL_SECURE=false (uses STARTTLS). Auto-correcting...");
    mailSecure = false;
  }
  
  const mailUsername = process.env.MAIL_USERNAME?.trim();
  // Remove all spaces from app password (Gmail app passwords should not have spaces)
  const mailPassword = process.env.MAIL_PASSWORD?.trim().replace(/\s+/g, "");

  if (!mailUsername || !mailPassword) {
    throw new Error(
      "Mail configuration is missing. Please set MAIL_USERNAME and MAIL_PASSWORD environment variables."
    );
  }

  // Log configuration for debugging (without password)
  console.log("Email transporter configuration:", {
    host: mailHost,
    port: mailPort,
    secure: mailSecure,
    username: mailUsername,
    passwordLength: mailPassword.length,
  });

  // Create SMTP transport configuration
  // Using type assertion to help TypeScript resolve the correct overload
  const transporter = nodemailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: mailSecure, // true for 465 (SSL/TLS), false for 587/25 (STARTTLS)
    auth: {
      user: mailUsername,
      pass: mailPassword,
    },
    // TLS configuration - only for STARTTLS ports (587, 25)
    ...(!mailSecure && {
      tls: {
        // Do not fail on invalid certificates (useful for self-signed certs)
        rejectUnauthorized: process.env.MAIL_TLS_REJECT_UNAUTHORIZED !== "false",
      },
    }),
  } as Parameters<typeof nodemailer.createTransport>[0]);

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
      code: error.code,
      command: error.command,
    });

    // Provide helpful error messages for common Gmail authentication errors
    let errorMessage = error.message;
    if (error.message?.includes("Invalid credentials") || error.message?.includes("535")) {
      errorMessage = `Gmail authentication failed. Please verify:
1. MAIL_USERNAME is correct: ${process.env.MAIL_USERNAME}
2. MAIL_PASSWORD is the App Password (not regular password) - remove all spaces
3. 2-Step Verification is enabled on your Gmail account
4. App Password was generated correctly from Google Account settings
5. The app password hasn't been revoked or regenerated`;
    }

    throw new Error(`Failed to send email: ${errorMessage}`);
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
