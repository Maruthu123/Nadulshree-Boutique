import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, wrap } from '../middleware/auth.js';
import { cleanImg } from '../utils/validate.js';

const router = Router();

// Settings the frontend needs (no secrets here, key_id is public by design)
router.get('/config', (_req, res) => {
  res.json({
    razorpayEnabled: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    shippingFee: Number(process.env.SHIPPING_FEE ?? 60),
    freeShippingAbove: Number(process.env.FREE_SHIPPING_ABOVE ?? 1500),
    whatsapp: process.env.WHATSAPP_NUMBER || '919342728248',
    instagram: process.env.INSTAGRAM_HANDLE || 'na_ndhini8288',
    // Nexora Menswear
    nexora: {
      whatsapp: process.env.NEXORA_WHATSAPP || '916383718976',
      phone2: process.env.NEXORA_PHONE_2 || '9942148763',
      instagram: process.env.NEXORA_INSTAGRAM || 'nexora_menswear_',
      address: process.env.NEXORA_ADDRESS || 'Thiruchuli, Erode',
      shippingFee: Number(process.env.NEXORA_SHIPPING_FEE ?? 70),
      freeShippingAbove: Number(process.env.NEXORA_FREE_SHIPPING_ABOVE ?? 1999),
    },
  });
});

// Hero photos of a shop (Nexora Menswear home page). Nadulshree pages never ask for this.
router.get('/hero', wrap(async (req, res) => {
  const store = req.query.store === 'menswear' ? 'menswear' : 'boutique';
  const { rows } = await query(
    'SELECT id, image_url, title, subtitle, product_id, link FROM hero_slides WHERE store = $1 AND is_active = TRUE ORDER BY sort_order, id LIMIT 12',
    [store],
  );
  res.json(rows);
}));

router.post('/contact', wrap(async (req, res) => {
  const name = (req.body.name || '').trim();
  const message = (req.body.message || '').trim();
  const phone = (req.body.phone || '').trim();
  const email = (req.body.email || '').trim();
  if (name.length < 2) return res.status(400).json({ error: 'Please enter your name' });
  if (message.length < 5) return res.status(400).json({ error: 'Please write your message' });
  if (!phone && !email) return res.status(400).json({ error: 'Enter a phone number or email so we can reply' });
  await query('INSERT INTO contact_messages (name, phone, email, message) VALUES ($1,$2,$3,$4)',
    [name.slice(0, 120), phone.slice(0, 20) || null, email.slice(0, 160) || null, message.slice(0, 1500)]);
  res.status(201).json({ ok: true });
}));

// Happy customers page: only approved reviews are public
router.get('/testimonials', wrap(async (req, res) => {
  const store = req.query.store === 'menswear' ? 'menswear' : 'boutique'; // Nadulshree pages send nothing
  res.json((await query(
    'SELECT id, name, city, rating, message, image_url, created_at FROM testimonials WHERE is_approved = TRUE AND store = $1 ORDER BY created_at DESC LIMIT 60',
    [store],
  )).rows);
}));

// A customer can write a review only after a delivered order; admin approves it first
router.post('/testimonials', requireAuth, wrap(async (req, res) => {
  const store = req.body.store === 'menswear' ? 'menswear' : 'boutique';
  const delivered = await query("SELECT 1 FROM orders WHERE user_id = $1 AND status = 'delivered' AND store = $2 LIMIT 1", [req.user.id, store]);
  if (!delivered.rowCount) return res.status(403).json({ error: 'You can write a review after your order is delivered' });
  const message = (req.body.message || '').trim();
  const image = cleanImg(req.body.image_url) || null;
  if (message.length < 5 && !image) return res.status(400).json({ error: 'Please write a few words or add a photo' });
  const rating = Math.max(1, Math.min(5, parseInt(req.body.rating, 10) || 5));
  const city = (req.body.city || '').trim().slice(0, 80) || null;
  await query('INSERT INTO testimonials (user_id, name, city, rating, message, image_url, store) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [req.user.id, req.user.name, city, rating, message.slice(0, 600), image, store]);
  res.status(201).json({ ok: true, message: 'Thank you! Your review will appear after approval.' });
}));

export default router;
