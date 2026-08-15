const nodemailer = require("nodemailer");

// Helper to check if a credential is not a placeholder
const isValidCredential = (val) => {
  return Boolean(val && !val.startsWith("<") && !val.endsWith(">") && val.trim() !== "");
};

const createTransporter = async () => {
  // Option 1: Gmail
  if (
    process.env.EMAIL_SERVICE === "gmail" &&
    isValidCredential(process.env.EMAIL_USER) &&
    isValidCredential(process.env.EMAIL_PASSWORD)
  ) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Option 2: Custom SMTP (with valid credentials)
  if (
    isValidCredential(process.env.SMTP_HOST) &&
    isValidCredential(process.env.SMTP_USER) &&
    isValidCredential(process.env.SMTP_PASSWORD)
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Option 3: Local Dev fallback (no valid SMTP configured)
  return null;
};

const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetURL = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

  try {
    const transporter = await createTransporter();

    if (!transporter) {
      // Direct Local Development Output: Print reset link clearly in terminal
      console.log("\n=======================================================");
      console.log("🔑 [LOCAL DEV] PASSWORD RESET LINK GENERATED");
      console.log("-------------------------------------------------------");
      console.log(`👤 User: ${userName} (${email})`);
      console.log(`🔗 Link: ${resetURL}`);
      console.log("=======================================================\n");
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@skillforge.com",
      to: email,
      subject: "Password Reset Request - SkillForge AI",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #111;">Password Reset Request</h2>
          <p>Hi ${userName || "there"},</p>
          <p>We received a request to reset your password for SkillForge AI. Click the button below to proceed:</p>
          
          <div style="margin: 30px 0;">
            <a href="${resetURL}" style="background-color: #6344f5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #555; background: #f8f8f8; padding: 10px; border-radius: 4px;">
            ${resetURL}
          </p>

          <p style="color: #888; font-size: 13px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #aaa; font-size: 12px;">
            © 2026 SkillForge AI. All rights reserved.
          </p>
        </div>
      `,
      text: `
Password Reset Request

Hi ${userName || "there"},

Click the link below to reset your password:
${resetURL}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✓ Reset email sent successfully to:", email);
    return true;
  } catch (error) {
    console.error("✗ SMTP send error:", error.message);
    
    // In local dev, still log the link so developers are never blocked
    console.log("\n=======================================================");
    console.log("⚠️ [SMTP FAILED -> FALLBACK LINK FOR TESTING]");
    console.log(`🔗 Link: ${resetURL}`);
    console.log("=======================================================\n");

    // If in production, rethrow; if local dev, succeed with logged link
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    return true;
  }
};

module.exports = {
  sendPasswordResetEmail,
};
