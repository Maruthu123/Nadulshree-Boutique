import { Router } from 'express';
import { pool, query } from '../db.js';
import { requireAdmin, wrap } from '../middleware/auth.js';
import { restockOrder } from './orders.js';
import { cleanImg } from '../utils/validate.js';

const router = Router();
router.use(requireAdmin);

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

// ================= Dashboard numbers =================
// ?store=boutique | menswear limits a list to one shop; no ?store (or "all") = both shops together
// A Nexora admin account (users.admin_store = 'menswear') is locked to Nexora data, whatever the browser asks for.
const scoped = (req) => (req.user?.store === 'menswear' ? 'menswear' : req.query.store);
const isNx = (req) => req.user?.store === 'menswear';
const storeFilter = (req, col) => (['boutique', 'menswear'].includes(scoped(req)) ? { sql: `${col} = $1`, params: [scoped(req)] } : { sql: 'TRUE', params: [] });
const forbid = () => Object.assign(new Error('This account can only manage Nexora Menswear'), { status: 403 });
async function assertProduct(req, id) {
  if (!isNx(req)) return;
  const r = await query("SELECT COALESCE(c.store,'boutique') AS store FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = $1", [parseInt(id, 10) || 0]);
  if (r.rows[0] && r.rows[0].store !== 'menswear') throw forbid();
}
async function assertCategory(req, categoryId) {
  if (!isNx(req)) return;
  const r = await query('SELECT store FROM categories WHERE id = $1', [parseInt(categoryId, 10) || 0]);
  if (!r.rows[0] || r.rows[0].store !== 'menswear') throw forbid();
}
const COAL = "COALESCE(c.store, 'boutique')";

router.get('/stats', wrap(async (req, res) => {
  const f = storeFilter(req, 'store');
  const w = f.sql === 'TRUE' ? '' : `WHERE ${f.sql}`;
  const recentW = w;
  const prodFilter = storeFilter(req, COAL);
  const [o, p, c, recent, daily] = await Promise.all([
    query(`SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE status IN ('placed','confirmed'))::int AS new_orders,
             COUNT(*) FILTER (WHERE status IN ('packed','shipped','out_for_delivery'))::int AS in_transit,
             COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered,
             COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled' AND (payment_status = 'paid' OR status = 'delivered')), 0) AS revenue
           FROM orders ${w}`, f.params),
    query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE p.stock <= 3 AND p.is_active)::int AS low_stock
           FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE ${prodFilter.sql}`, prodFilter.params),
    isNx(req)
      ? query(`SELECT COUNT(DISTINCT user_id)::int AS total FROM orders WHERE store = 'menswear'`)
      : query(`SELECT COUNT(*)::int AS total FROM users WHERE role = 'user' AND is_verified`),
    query(`SELECT id, order_no, ship_name, total, status, created_at, store FROM orders ${recentW} ORDER BY created_at DESC LIMIT 6`, f.params),
    query(`SELECT to_char(d, 'DD Mon') AS day, COALESCE(x.cnt, 0)::int AS orders
           FROM generate_series(CURRENT_DATE - 6, CURRENT_DATE, '1 day') d
           LEFT JOIN (SELECT created_at::date AS dt, COUNT(*) AS cnt FROM orders ${w} GROUP BY 1) x ON x.dt = d::date
           ORDER BY d`, f.params),
  ]);
  res.json({ orders: o.rows[0], products: p.rows[0], customers: c.rows[0].total, recent: recent.rows, daily: daily.rows });
}));

// ================= Products (add / update / delete) =================
const cleanList = (v) => (Array.isArray(v) ? v : String(v || '').split(','))
  .map((x) => String(x).trim()).filter(Boolean);

function parseProduct(b) {
  const name = (b.name || '').trim();
  const price = Number(b.price);
  const mrp = b.mrp === '' || b.mrp == null ? null : Number(b.mrp);
  const stock = parseInt(b.stock, 10);
  if (name.length < 2) throw Object.assign(new Error('Enter product name'), { status: 400 });
  if (!(price >= 0)) throw Object.assign(new Error('Enter a valid price'), { status: 400 });
  if (mrp != null && !(mrp >= 0)) throw Object.assign(new Error('Enter a valid MRP'), { status: 400 });
  if (!(stock >= 0)) throw Object.assign(new Error('Enter a valid stock number'), { status: 400 });
  return {
    category_id: parseInt(b.category_id, 10) || null,
    name, price, mrp, stock,
    description: (b.description || '').trim(),
    sizes: cleanList(b.sizes),
    colors: cleanList(b.colors),
    images: cleanList(b.images).map(cleanImg).filter(Boolean).slice(0, 6),
    is_active: b.is_active !== false,
    is_featured: Boolean(b.is_featured),
  };
}

const PRODUCT_SELECT = `SELECT p.*, c.name AS category_name, ${COAL} AS store FROM products p LEFT JOIN categories c ON c.id = p.category_id`;

router.get('/products', wrap(async (req, res) => {
  const f = storeFilter(req, COAL);
  res.json((await query(`${PRODUCT_SELECT} WHERE ${f.sql} ORDER BY p.created_at DESC`, f.params)).rows);
}));

// both shops' categories for the admin product form (each has a "store" field)
router.get('/categories', wrap(async (req, res) => {
  res.json((await query(isNx(req) ? "SELECT * FROM categories WHERE store = 'menswear' ORDER BY sort_order, id" : 'SELECT * FROM categories ORDER BY store, sort_order, id')).rows);
}));

router.post('/products', wrap(async (req, res) => {
  const p = parseProduct(req.body);
  await assertCategory(req, p.category_id);
  const { rows } = await query(
    `INSERT INTO products (category_id,name,description,price,mrp,sizes,colors,images,stock,is_active,is_featured)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [p.category_id, p.name, p.description, p.price, p.mrp, p.sizes, p.colors, p.images, p.stock, p.is_active, p.is_featured],
  );
  res.status(201).json((await query(`${PRODUCT_SELECT} WHERE p.id = $1`, [rows[0].id])).rows[0]);
}));

router.put('/products/:id', wrap(async (req, res) => {
  const p = parseProduct(req.body);
  await assertProduct(req, req.params.id);
  await assertCategory(req, p.category_id);
  const { rowCount } = await query(
    `UPDATE products SET category_id=$1,name=$2,description=$3,price=$4,mrp=$5,sizes=$6,colors=$7,images=$8,
       stock=$9,is_active=$10,is_featured=$11,updated_at=NOW() WHERE id=$12`,
    [p.category_id, p.name, p.description, p.price, p.mrp, p.sizes, p.colors, p.images, p.stock, p.is_active, p.is_featured, req.params.id],
  );
  if (!rowCount) return res.status(404).json({ error: 'Product not found' });
  res.json((await query(`${PRODUCT_SELECT} WHERE p.id = $1`, [req.params.id])).rows[0]);
}));

router.delete('/products/:id', wrap(async (req, res) => {
  await assertProduct(req, req.params.id);
  const { rowCount } = await query('DELETE FROM products WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Product not found' });
  res.json({ ok: true }); // old orders keep their own copy of name/price
}));

// ================= Orders =================
const ORDER_LIST = `
  SELECT o.*, u.email AS customer_email,
    COALESCE((SELECT json_agg(json_build_object('name',oi.name,'price',oi.price,'qty',oi.qty,'size',oi.size,'color',oi.color,'image',oi.image) ORDER BY oi.id)
              FROM order_items oi WHERE oi.order_id = o.id), '[]') AS items,
    COALESCE((SELECT json_agg(json_build_object('status',te.status,'location',te.location,'note',te.note,'created_at',te.created_at) ORDER BY te.created_at, te.id)
              FROM tracking_events te WHERE te.order_id = o.id), '[]') AS events
  FROM orders o LEFT JOIN users u ON u.id = o.user_id`;

router.get('/orders', wrap(async (req, res) => {
  const { status, q, from, to } = req.query;
  const where = [];
  const params = [];
  if (['boutique', 'menswear'].includes(scoped(req))) { params.push(scoped(req)); where.push(`o.store = $${params.length}`); }
  if (status && STATUSES.includes(status)) { params.push(status); where.push(`o.status = $${params.length}`); }
  if (q) { params.push(`%${String(q).trim()}%`); where.push(`(o.order_no ILIKE $${params.length} OR o.ship_name ILIKE $${params.length} OR o.ship_phone ILIKE $${params.length})`); }
  if (from) { params.push(from); where.push(`o.created_at::date >= $${params.length}`); }
  if (to) { params.push(to); where.push(`o.created_at::date <= $${params.length}`); }
  const sql = `${ORDER_LIST} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY o.created_at DESC LIMIT 300`;
  res.json((await query(sql, params)).rows);
}));

router.patch('/orders/:id', wrap(async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const { status, current_location, note, expected_delivery, payment_status } = req.body;
  if (status && !STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  if (payment_status && !['pending', 'paid', 'failed', 'refunded'].includes(payment_status)) return res.status(400).json({ error: 'Invalid payment status' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const o = (await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [id])).rows[0];
    if (!o) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Order not found' }); }
    if (isNx(req) && o.store !== 'menswear') { await client.query('ROLLBACK'); return res.status(403).json({ error: 'This account can only manage Nexora Menswear' }); }

    const newStatus = status || o.status;
    const location = current_location !== undefined ? (current_location || '').trim() || null : o.current_location;
    let pay = payment_status || o.payment_status;
    if (newStatus === 'delivered' && o.payment_method === 'cod' && pay === 'pending') pay = 'paid'; // cash collected

    if (newStatus === 'cancelled' && o.status !== 'cancelled') await restockOrder(client, id);
    if (o.status === 'cancelled' && newStatus !== 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'A cancelled order cannot be re-opened. Ask the customer to place a new order.' });
    }

    await client.query(
      `UPDATE orders SET status=$1, current_location=$2, payment_status=$3,
         cancel_reason = CASE WHEN $1 = 'cancelled' AND cancel_reason IS NULL THEN 'Cancelled by shop' ELSE cancel_reason END,
         cancelled_at = CASE WHEN $1 = 'cancelled' AND cancelled_at IS NULL THEN NOW() ELSE cancelled_at END,
         expected_delivery = COALESCE($4::date, expected_delivery),
         delivered_at = CASE WHEN $1 = 'delivered' AND delivered_at IS NULL THEN NOW() ELSE delivered_at END
       WHERE id=$5`,
      [newStatus, location, pay, expected_delivery || null, id],
    );

    const changed = newStatus !== o.status || (current_location !== undefined && location !== o.current_location) || (note && note.trim());
    if (changed) {
      await client.query(
        'INSERT INTO tracking_events (order_id, status, location, note) VALUES ($1,$2,$3,$4)',
        [id, newStatus, location, (note || '').trim() || null],
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
  res.json((await query(`${ORDER_LIST} WHERE o.id = $1`, [id])).rows[0]);
}));

// Delivered list (with delivered date)
router.get('/delivered', wrap(async (req, res) => {
  const { from, to } = req.query;
  const params = [];
  const where = ["o.status = 'delivered'"];
  if (['boutique', 'menswear'].includes(scoped(req))) { params.push(scoped(req)); where.push(`o.store = $${params.length}`); }
  if (from) { params.push(from); where.push(`o.delivered_at::date >= $${params.length}`); }
  if (to) { params.push(to); where.push(`o.delivered_at::date <= $${params.length}`); }
  res.json((await query(`${ORDER_LIST} WHERE ${where.join(' AND ')} ORDER BY o.delivered_at DESC LIMIT 500`, params)).rows);
}));

// ================= Customers =================
router.get('/customers', wrap(async (req, res) => {
  const nx = isNx(req);
  const { rows } = await query(`
    SELECT u.id, u.name, u.email, u.phone, u.created_at,
           COUNT(o.id)::int AS orders, COALESCE(SUM(o.total) FILTER (WHERE o.status <> 'cancelled'), 0) AS spent
    FROM users u LEFT JOIN orders o ON o.user_id = u.id ${nx ? "AND o.store = 'menswear'" : ''}
    WHERE u.role = 'user' AND u.is_verified ${nx ? "AND EXISTS (SELECT 1 FROM orders x WHERE x.user_id = u.id AND x.store = 'menswear')" : ''}
    GROUP BY u.id ORDER BY u.created_at DESC`);
  res.json(rows);
}));

// ================= Contact messages =================
router.get('/messages', wrap(async (req, res) => {
  // Nexora enquiries are saved with the tag [Nexora Menswear]; the Nexora admin sees only those
  res.json((await query(`SELECT * FROM contact_messages ${isNx(req) ? "WHERE message LIKE '[Nexora Menswear]%'" : ''} ORDER BY created_at DESC LIMIT 200`)).rows);
}));
router.delete('/messages/:id', wrap(async (req, res) => {
  await query(`DELETE FROM contact_messages WHERE id = $1 ${isNx(req) ? "AND message LIKE '[Nexora Menswear]%'" : ''}`, [req.params.id]);
  res.json({ ok: true });
}));

// ================= Happy customer reviews =================
router.get('/testimonials', wrap(async (req, res) => {
  const f = storeFilter(req, 'store');
  res.json((await query(`SELECT * FROM testimonials WHERE ${f.sql} ORDER BY is_approved ASC, created_at DESC`, f.params)).rows);
}));
router.post('/testimonials', wrap(async (req, res) => {
  const { name, city, rating, message } = req.body;
  const image = cleanImg(req.body.image_url) || null;
  if (!name?.trim() || (!message?.trim() && !image)) return res.status(400).json({ error: 'Name and a message or a photo are required' });
  const r = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
  const { rows } = await query(
    'INSERT INTO testimonials (name, city, rating, message, image_url, is_approved, store) VALUES ($1,$2,$3,$4,$5,TRUE,$6) RETURNING *',
    [name.trim(), (city || '').trim() || null, r, (message || '').trim(), image, isNx(req) || req.body.store === 'menswear' ? 'menswear' : 'boutique'],
  );
  res.status(201).json(rows[0]);
}));
router.patch('/testimonials/:id', wrap(async (req, res) => {
  const { rows } = await query('UPDATE testimonials SET is_approved = $1 WHERE id = $2 ' + (isNx(req) ? "AND store = 'menswear' " : '') + 'RETURNING *', [Boolean(req.body.is_approved), req.params.id]);
  res.json(rows[0]);
}));
router.delete('/testimonials/:id', wrap(async (req, res) => {
  await query('DELETE FROM testimonials WHERE id = $1' + (isNx(req) ? " AND store = 'menswear'" : ''), [req.params.id]);
  res.json({ ok: true });
}));

// ================= Hero photos (Nexora Menswear home page) =================
const parseHero = (b) => ({
  image_url: cleanImg(b.image_url),
  title: String(b.title || '').trim().slice(0, 120),
  subtitle: String(b.subtitle || '').trim().slice(0, 200),
  product_id: parseInt(b.product_id, 10) || null,
  link: String(b.link || '').trim().slice(0, 300) || null,
  is_active: b.is_active !== false,
});
const HERO_SELECT = `SELECT h.*, p.name AS product_name FROM hero_slides h LEFT JOIN products p ON p.id = h.product_id WHERE h.store = 'menswear'`;

router.get('/hero', wrap(async (_req, res) => {
  res.json((await query(`${HERO_SELECT} ORDER BY h.sort_order, h.id`)).rows);
}));

router.post('/hero', wrap(async (req, res) => {
  const h = parseHero(req.body);
  if (!h.image_url) return res.status(400).json({ error: 'Please choose a photo' });
  const { rows } = await query(
    `INSERT INTO hero_slides (store, image_url, title, subtitle, product_id, link, is_active, sort_order)
     VALUES ('menswear',$1,$2,$3,$4,$5,$6,(SELECT COALESCE(MAX(sort_order), 0) + 1 FROM hero_slides WHERE store = 'menswear')) RETURNING id`,
    [h.image_url, h.title, h.subtitle, h.product_id, h.link, h.is_active],
  );
  res.status(201).json((await query(`${HERO_SELECT} AND h.id = $1`, [rows[0].id])).rows[0]);
}));

router.put('/hero/:id', wrap(async (req, res) => {
  const h = parseHero(req.body);
  if (!h.image_url) return res.status(400).json({ error: 'Please choose a photo' });
  const { rowCount } = await query(
    `UPDATE hero_slides SET image_url=$1, title=$2, subtitle=$3, product_id=$4, link=$5, is_active=$6 WHERE id=$7 AND store='menswear'`,
    [h.image_url, h.title, h.subtitle, h.product_id, h.link, h.is_active, req.params.id],
  );
  if (!rowCount) return res.status(404).json({ error: 'Hero photo not found' });
  res.json((await query(`${HERO_SELECT} AND h.id = $1`, [req.params.id])).rows[0]);
}));

// move one place up (dir = -1) or down (dir = 1) by swapping the order numbers with the neighbour
router.post('/hero/:id/move', wrap(async (req, res) => {
  const dir = Number(req.body.dir) < 0 ? -1 : 1;
  const rows = (await query("SELECT id FROM hero_slides WHERE store = 'menswear' ORDER BY sort_order, id")).rows.map((r) => r.id);
  const i = rows.indexOf(parseInt(req.params.id, 10));
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return res.json({ ok: true });
  [rows[i], rows[j]] = [rows[j], rows[i]];
  for (const [k, id] of rows.entries()) await query('UPDATE hero_slides SET sort_order = $1 WHERE id = $2', [k + 1, id]);
  res.json({ ok: true });
}));

router.delete('/hero/:id', wrap(async (req, res) => {
  const { rowCount } = await query("DELETE FROM hero_slides WHERE id = $1 AND store = 'menswear'", [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Hero photo not found' });
  res.json({ ok: true });
}));

export default router;
