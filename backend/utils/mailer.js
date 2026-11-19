import nodemailer from 'nodemailer';

let transporter = null;
const hasMail = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
}

/** Sends the OTP mail. Returns true if a real mail was sent, false in console (dev) mode. */
export async function sendOtpMail(to, name, otp, purpose = 'verify') {
  if (!hasMail()) {
    console.log(`\n[DEV] ${purpose.toUpperCase()} OTP for ${to}: ${otp}  (set EMAIL_PASS in .env to send real mails)\n`);
    return false;
  }
  const brand = process.env.EMAIL_FROM_NAME || 'Nadulshree Boutique';
  const reason = purpose === 'reset' ? 'reset your password' : 'verify your email';
  await getTransporter().sendMail({
    from: `"${brand}" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} is your ${brand} ${purpose === 'reset' ? 'password reset' : 'verification'} code`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
        <h2 style="color:#ff7a1a;margin:0 0 8px">${brand}</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Use this code to ${reason}:</p>
        <p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:16px 0">${otp}</p>
        <p style="color:#666">This code is valid for 10 minutes. Do not share it with anyone. If you did not ask for it, ignore this mail.</p>
      </div>`,
  });
  return true;
}
