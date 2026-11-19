import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../db.js';
import { signToken, requireAuth, wrap } from '../middleware/auth.js';
import { sendOtpMail } from '../utils/mailer.js';

const router = Router();
const OTP_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_SECONDS = 30;

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
const phoneOk = (v) => /^[6-9]\d{9}$/.test(v || '');
const hashOtp = (email, purpose, otp) => crypto.createHash('sha256').update(`${email}:${purpose}:${otp}`).digest('hex');
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, adminStore: u.admin_store || null });
const fail = (status, message) => Object.assign(new Error(message), { status });

/** purpose: 'verify' (new account) or 'reset' (forgot password) */
async function issueOtp(user, purpose = 'verify') {
  const last = await query('SELECT created_at FROM otps WHERE email = $1 AND purpose = $2 ORDER BY id DESC LIMIT 1', [user.email, purpose]);
  if (last.rows[0] && Date.now() - new Date(last.rows[0].created_at).getTime() < RESEND_SECONDS * 1000) {
    throw fail(429, `Please wait ${RESEND_SECONDS} seconds before requesting a new OTP`);
  }
  const otp = String(crypto.randomInt(100000, 1000000));
  await query('DELETE FROM otps WHERE email = $1 AND purpose = $2', [user.email, purpose]);
  await query(
    "INSERT INTO otps (email, code_hash, expires_at, purpose) VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval, $4)",
    [user.email, hashOtp(user.email, purpose, otp), String(OTP_MINUTES), purpose],
  );
  const sent = await sendOtpMail(user.email, user.name, otp, purpose);
  // Dev only (no mail configured): return the OTP so you can test quickly. Never in production.
  const devOtp = !sent && process.env.NODE_ENV !== 'production' ? otp : undefined;
  return { sent, devOtp };
}

/** Throws if the OTP is wrong / expired. Deletes it when correct. */
async function consumeOtp(email, purpose, otp) {
  const rec = (await query('SELECT * FROM otps WHERE email = $1 AND purpose = $2 ORDER BY id DESC LIMIT 1', [email, purpose])).rows[0];
  if (!rec) throw fail(400, 'No OTP found. Please request a new one.');
  if (new Date(rec.expires_at) < new Date()) throw fail(400, 'OTP expired. Please request a new one.');
  if (rec.attempts >= MAX_ATTEMPTS) throw fail(429, 'Too many wrong attempts. Request a new OTP.');
  if (rec.code_hash !== hashOtp(email, purpose, otp)) {
    await query('UPDATE otps SET attempts = attempts + 1 WHERE id = $1', [rec.id]);
    throw fail(400, 'Wrong OTP. Please check and try again.');
  }
  await query('DELETE FROM otps WHERE email = $1 AND purpose = $2', [email, purpose]);
}

// ---------- Register ----------
router.post('/register', wrap(async (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const phone = (req.body.phone || '').trim();
  const password = req.body.password || '';

  if (name.length < 2) return res.status(400).json({ error: 'Please enter your name' });
  if (!emailOk(email)) return res.status(400).json({ error: 'Please enter a valid email' });
  if (!phoneOk(phone)) return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
  if (existing.rows[0]?.is_verified) return res.status(409).json({ error: 'This email is already registered. Please login.' });

  const password_hash = await bcrypt.hash(password, 10);
  let user;
  if (existing.rows[0]) {
    user = (await query('UPDATE users SET name=$1, phone=$2, password_hash=$3 WHERE id=$4 RETURNING *',
      [name, phone, password_hash, existing.rows[0].id])).rows[0];
  } else {
    user = (await query('INSERT INTO users (name, email, phone, password_hash) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, email, phone, password_hash])).rows[0];
  }
  const { devOtp } = await issueOtp(user, 'verify');
  res.status(201).json({ message: 'OTP sent to your email', email, devOtp });
}));

// ---------- Verify OTP (new account) ----------
router.post('/verify-otp', wrap(async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();
  if (!emailOk(email) || !/^\d{6}$/.test(otp)) return res.status(400).json({ error: 'Enter the 6-digit OTP' });
  await consumeOtp(email, 'verify', otp);
  const user = (await query('UPDATE users SET is_verified = TRUE WHERE email = $1 RETURNING *', [email])).rows[0];
  if (!user) return res.status(404).json({ error: 'Account not found' });
  res.json({ token: signToken(user), user: publicUser(user) });
}));

// ---------- Resend OTP (new account) ----------
router.post('/resend-otp', wrap(async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const user = (await query('SELECT * FROM users WHERE email = $1', [email])).rows[0];
  if (!user) return res.status(404).json({ error: 'Account not found' });
  if (user.is_verified) return res.status(400).json({ error: 'Account already verified' });
  const { devOtp } = await issueOtp(user, 'verify');
  res.json({ message: 'New OTP sent', devOtp });
}));

// ---------- Login (ONE login for admin + customer) ----------
router.post('/login', wrap(async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const user = (await query('SELECT * FROM users WHERE email = $1', [email])).rows[0];
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) return res.status(401).json({ error: 'Wrong email or password' });

  if (!user.is_verified) {
    let devOtp;
    try { ({ devOtp } = await issueOtp(user, 'verify')); } catch { /* cooldown: OTP already sent recently */ }
    return res.status(403).json({ error: 'Please verify your email with the OTP', needsVerification: true, email, devOtp });
  }
  // role decides where the frontend sends the person: admin -> /admin, customer -> /my-orders
  res.json({ token: signToken(user), user: publicUser(user) });
}));

// ---------- Forgot password -> OTP mail ----------
router.post('/forgot-password', wrap(async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!emailOk(email)) return res.status(400).json({ error: 'Please enter a valid email' });
  const user = (await query('SELECT * FROM users WHERE email = $1', [email])).rows[0];
  let devOtp;
  if (user?.is_verified) ({ devOtp } = await issueOtp(user, 'reset'));
  // same answer whether the email exists or not (nobody can check who is registered)
  res.json({ message: 'If this email is registered, a 6-digit OTP has been sent.', email, devOtp });
}));

// ---------- Reset password with the OTP ----------
router.post('/reset-password', wrap(async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();
  const password = req.body.password || '';
  if (!emailOk(email) || !/^\d{6}$/.test(otp)) return res.status(400).json({ error: 'Enter the 6-digit OTP' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  await consumeOtp(email, 'reset', otp);
  const hash = await bcrypt.hash(password, 10);
  const { rowCount } = await query('UPDATE users SET password_hash = $1 WHERE email = $2 AND is_verified = TRUE', [hash, email]);
  if (!rowCount) return res.status(404).json({ error: 'Account not found' });
  res.json({ message: 'Password changed. Please login with your new password.' });
}));

router.get('/me', requireAuth, wrap(async (req, res) => {
  const user = (await query('SELECT * FROM users WHERE id = $1', [req.user.id])).rows[0];
  if (!user) return res.status(401).json({ error: 'Account not found' });
  res.json({ user: publicUser(user) });
}));

export default router;
