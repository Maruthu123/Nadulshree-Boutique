import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import uploadRoutes from './routes/uploads.js';
import { query } from './db.js';
import { bootstrap } from './utils/bootstrap.js';

const app = express();
app.set('trust proxy', 1); // Render runs behind a proxy

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CLIENT_URL = your website address(es), comma separated. A * wildcard is allowed, e.g. https://*.netlify.app
const allowed = [process.env.CLIENT_URL || 'http://localhost:5173', process.env.NEXORA_CLIENT_URL || ''].join(',').split(',').map((x) => x.trim().replace(/\/$/, '')).filter(Boolean);
const originOk = (origin) => allowed.some((rule) => (rule.includes('*')
  ? new RegExp(`^${rule.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^.]+')}$`).test(origin)
  : rule === origin));
app.use(cors({
  origin(origin, cb) {
    if (!origin || originOk(origin)) return cb(null, true);
    console.error(`CORS blocked for ${origin}. Add it to CLIENT_URL (comma separated) on the server.`);
    cb(Object.assign(new Error(`CORS blocked for ${origin}. Add it to CLIENT_URL on the server.`), { status: 403 }));
  },
}));
app.use(express.json({ limit: '4mb' }));

// Brute-force protection on login / register / OTP
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again after some time.' } });

app.get('/', (_req, res) => res.json({ name: 'Nadulshree Boutique API', status: 'running' }));
app.get('/api/health', async (_req, res) => {
  try { await query('SELECT 1'); res.json({ ok: true, db: 'connected', razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET), allowedOrigins: allowed }); }
  catch (e) { res.status(500).json({ ok: false, db: e.message }); }
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api', publicRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  const body = { error: status >= 500 ? 'Something went wrong. Please try again.' : err.message };
  if (status >= 500 && process.env.NODE_ENV !== 'production') body.detail = err.message || String(err.code || err); // only while testing on your computer
  res.status(status).json(body);
});

const port = process.env.PORT || 5000;
app.listen(port, async () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) console.warn('[payment] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing: online payment (the only payment method) is OFF for BOTH websites.');
  console.log(`Nadulshree Boutique API running on port ${port}`);
  try {
    const { admin } = await bootstrap();
    console.log('✓ Database connected and ready');
    console.log(`✓ Admin: ${admin}`);
  } catch (e) {
    console.error(`✗ Database NOT ready: ${e.message || e.code}`);
    console.error('  Check DATABASE_URL in backend/.env (or the Environment tab on Render), then restart.');
  }
});
