// ============================================================
// Email Service — Nodemailer + Gmail
// ============================================================

const nodemailer = require('nodemailer');

// Configure Gmail transporter
// User must set GMAIL_USER and GMAIL_APP_PASSWORD env vars
// To get app password: Google Account > Security > 2FA > App Passwords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || '',
    pass: process.env.GMAIL_APP_PASSWORD || '',
  },
});

/**
 * Send credentials email to a newly created user
 */
async function sendCredentialsEmail({ to, name, email, password, role, companyName }) {
  // If Gmail not configured, simulate
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`📧 [SIMULATED] Email to ${to}:`);
    console.log(`   Subject: Your ExpensePro Account Credentials`);
    console.log(`   Email: ${email}, Password: ${password}, Role: ${role}`);
    return { simulated: true, message: `Credentials would be sent to ${to}` };
  }

  const mailOptions = {
    from: `"ExpensePro Admin" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Your ExpensePro Account — ${companyName}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#FFF9EE;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#376479;font-size:24px;margin:0;">ExpensePro</h1>
          <p style="color:#71787D;font-size:13px;margin:4px 0 0;">Enterprise Expense Management</p>
        </div>
        <div style="background:#fff;padding:24px;border-radius:12px;border:1px solid #E8E2D7;">
          <h2 style="color:#1D1C15;font-size:18px;margin:0 0 16px;">Welcome, ${name}!</h2>
          <p style="color:#41484C;font-size:14px;line-height:1.6;margin:0 0 20px;">
            You've been added to <strong>${companyName}</strong> on ExpensePro as <strong style="color:#376479;text-transform:uppercase;">${role}</strong>.
          </p>
          <div style="background:#F3EDE2;padding:16px;border-radius:8px;margin-bottom:20px;">
            <p style="margin:0 0 8px;font-size:12px;color:#71787D;text-transform:uppercase;font-weight:700;letter-spacing:1px;">Your Login Credentials</p>
            <p style="margin:0 0 6px;font-size:14px;"><strong>Email:</strong> ${email}</p>
            <p style="margin:0;font-size:14px;"><strong>Password:</strong> ${password}</p>
          </div>
          <p style="color:#71787D;font-size:12px;margin:0;line-height:1.5;">
            Please change your password after first login. If you didn't expect this email, please ignore.
          </p>
        </div>
        <p style="text-align:center;color:#C1C7CC;font-size:11px;margin-top:16px;">© ExpensePro — Financial Architect</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Email sent to ${to}: ${info.messageId}`);
    return { simulated: false, messageId: info.messageId };
  } catch (err) {
    console.error(`✗ Email send failed to ${to}:`, err.message);
    return { simulated: true, error: err.message, message: `Failed to send — credentials shown in app` };
  }
}

module.exports = { sendCredentialsEmail };
