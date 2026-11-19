import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, wrap } from '../middleware/auth.js';

const router = Router();
const MAX_BYTES = 1.5 * 1024 * 1024;
const DAILY_LIMIT_CUSTOMER = 5;

const looksLikeImage = (buf, mime) => {
  if (mime === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8;
  if (mime === 'image/png') return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  if (mime === 'image/webp') return buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
  return false;
};

// Upload a photo (the website shrinks it to ~1000px first). Admin: unlimited. Customer: 5 per day (review photos).
router.post('/', requireAuth, wrap(async (req, res) => {
  const dataUrl = String(req.body.dataUrl || '');
  const comma = dataUrl.indexOf(',');
  const head = /^data:(image\/(?:jpeg|png|webp));base64$/.exec(dataUrl.slice(0, comma));
  if (!head) return res.status(400).json({ error: 'Please choose a JPG, PNG or WEBP photo' });
  const buf = Buffer.from(dataUrl.slice(comma + 1), 'base64');
  if (!buf.length || buf.length > MAX_BYTES) return res.status(400).json({ error: 'Photo is too big. Please choose a smaller one.' });
  if (!looksLikeImage(buf, head[1])) return res.status(400).json({ error: 'This file is not a valid photo' });

  if (req.user.role !== 'admin') {
    const { rows } = await query("SELECT COUNT(*)::int AS n FROM uploads WHERE created_by = $1 AND created_at > NOW() - INTERVAL '1 day'", [req.user.id]);
    if (rows[0].n >= DAILY_LIMIT_CUSTOMER) return res.status(429).json({ error: 'Daily photo upload limit reached' });
  }
  const { rows } = await query('INSERT INTO uploads (mime, data, created_by) VALUES ($1,$2,$3) RETURNING id', [head[1], buf, req.user.id]);
  res.status(201).json({ url: `/api/uploads/${rows[0].id}` });
}));

// Public: show a photo
router.get('/:id', wrap(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(404).end();
  const { rows } = await query('SELECT mime, data FROM uploads WHERE id = $1', [id]);
  if (!rows[0]) return res.status(404).end();
  res.set({ 'Content-Type': rows[0].mime, 'Cache-Control': 'public, max-age=31536000, immutable' });
  res.send(rows[0].data);
}));

export default router;
