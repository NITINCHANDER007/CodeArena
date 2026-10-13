import nodemailer from "nodemailer";

const host = process.env.EMAIL_SERVER_HOST || "smtp.ethereal.email";
const port = parseInt(process.env.EMAIL_SERVER_PORT || "587", 10);
const user = process.env.EMAIL_SERVER_USER || "";
const pass = process.env.EMAIL_SERVER_PASSWORD || "";
const from = process.env.EMAIL_FROM || "CodeArena <no-reply@codearena.dev>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  // If credentials are valid or default, try to initialize
  if (user && pass && user !== "test@ethereal.email") {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    // Generate an automatic Ethereal test account in development
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("📧 Ethereal test email account initialized:", testAccount.user);
    } catch {
      // Fallback pseudo transporter
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  return transporter;
}

export async function sendVerificationEmail(to: string, rawToken: string, name: string): Promise<string | null> {
  const verifyUrl = `${appUrl}/verify-email?token=${rawToken}`;
  const mailer = await getTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0d1117; color: #f0f6fc; border-radius: 8px;">
      <h1 style="color: #22c55e; margin-bottom: 16px;">Welcome to CodeArena, ${name}!</h1>
      <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">
        Thanks for signing up. Please verify your email address to activate your account and start solving coding challenges.
      </p>
      <div style="margin: 32px 0;">
        <a href="${verifyUrl}" style="background-color: #22c55e; color: #0d1117; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #8b949e; font-size: 14px;">
        Or copy and paste this link in your browser:<br/>
        <a href="${verifyUrl}" style="color: #58a6ff;">${verifyUrl}</a>
      </p>
      <p style="color: #8b949e; font-size: 12px; margin-top: 32px; border-top: 1px solid #30363d; padding-top: 16px;">
        This verification link will expire in 24 hours. If you did not create this account, you can safely ignore this email.
      </p>
    </div>
  `;

  const info = await mailer.sendMail({
    from,
    to,
    subject: "Verify your email on CodeArena",
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`✉️ Verification email preview URL: ${previewUrl}`);
  }
  return previewUrl || null;
}

export async function sendPasswordResetEmail(to: string, rawToken: string, name: string): Promise<string | null> {
  const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;
  const mailer = await getTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0d1117; color: #f0f6fc; border-radius: 8px;">
      <h1 style="color: #22c55e; margin-bottom: 16px;">Password Reset Request</h1>
      <p style="color: #c9d1d9; font-size: 16px; line-height: 1.6;">
        Hello ${name}, we received a request to reset your password on CodeArena.
      </p>
      <div style="margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #22c55e; color: #0d1117; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
          Reset Your Password
        </a>
      </div>
      <p style="color: #8b949e; font-size: 14px;">
        Or copy and paste this link in your browser:<br/>
        <a href="${resetUrl}" style="color: #58a6ff;">${resetUrl}</a>
      </p>
      <p style="color: #f85149; font-size: 13px; font-weight: bold;">
        ⚠️ This link is valid for 15 minutes only and can be used once.
      </p>
      <p style="color: #8b949e; font-size: 12px; margin-top: 32px; border-top: 1px solid #30363d; padding-top: 16px;">
        If you did not request a password reset, please ignore this email or review your account security.
      </p>
    </div>
  `;

  const info = await mailer.sendMail({
    from,
    to,
    subject: "Reset your password on CodeArena",
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`✉️ Password reset email preview URL: ${previewUrl}`);
  }
  return previewUrl || null;
}
