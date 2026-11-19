import { Router } from 'express';
import crypto from 'crypto';
import { pool, query } from '../db.js';
import { requireAuth, wrap } from '../middleware/auth.js';

const router = Router();

const SHIPPING_FEE = Number(process.env.SHIPPING_FEE ?? 60);
const FREE_ABOVE = Number(process.env.FREE_SHIPPING_ABOVE ?? 1500);
// Nexora Menswear has its own delivery charge
const NX_SHIPPING_FEE = Number(process.env.NEXORA_SHIPPING_FEE ?? 70);
const NX_FREE_ABOVE = Number(process.env.NEXORA_FREE_SHIPPING_ABOVE ?? 1999);
const SHOP_NAME = { boutique: 'Nadulshree Boutique', menswear: 'Nexora Menswear' };
const razorpayOn = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

async function getRazorpay() {
  const { default: Razorpay } = await import('razorpay');
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

const makeOrderNo = (store = 'boutique') => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `${store === 'menswear' ? 'NX' : 'NS'}${ymd}${crypto.randomInt(1000, 10000)}`;
};

const ORDER_SELECT = `
  SELECT o.*,
    COALESCE((SELECT json_agg(json_build_object('id',oi.id,'product_id',oi.product_id,'name',oi.name,'image',oi.image,
              'price',oi.price,'qty',oi.qty,'size',oi.size,'color',oi.color) ORDER BY oi.id)
              FROM order_items oi WHERE oi.order_id = o.id), '[]') AS items,
    COALESCE((SELECT json_agg(json_build_object('status',te.status,'location',te.location,'note',te.note,'created_at',te.created_at)
              ORDER BY te.created_at, te.id)
              FROM tracking_events te WHERE te.order_id = o.id), '[]') AS events
  FROM orders o`;

export async function restockOrder(client, orderId) {
  await client.query(
    `UPDATE products p SET stock = p.stock + oi.qty
     FROM order_items oi WHERE oi.order_id = $1 AND oi.product_id = p.id`,
    [orderId],
  );
}

// ---------- Place order ----------
router.post('/', requireAuth, wrap(async (req, res) => {
  const { items, shipping = {}, paymentMethod, notes } = req.body;

  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Your cart is empty' });
  // COD disabled - online payment only
  // if (!['cod', 'online'].includes(paymentMethod)) return res.status(400).json({ error: 'Choose a payment method' });
  // if (paymentMethod === 'online' && !razorpayOn()) return res.status(400).json({ error: 'Online payment is not available right now. Please choose Cash on Delivery.' });
  if (paymentMethod !== 'online') return res.status(400).json({ error: 'Please choose online payment' });
  if (!razorpayOn()) return res.status(400).json({ error: 'Online payment is not available right now. Please try again later.' });

  const s = {
    name: (shipping.name || '').trim(),
    phone: (shipping.phone || '').trim(),
    address: (shipping.address || '').trim(),
    city: (shipping.city || '').trim(),
    state: (shipping.state || '').trim(),
    pincode: (shipping.pincode || '').trim(),
  };
  if (s.name.length < 2) return res.status(400).json({ error: 'Enter receiver name' });
  if (!/^[6-9]\d{9}$/.test(s.phone)) return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
  if (s.address.length < 8) return res.status(400).json({ error: 'Enter your full address' });
  if (!s.city || !s.state) return res.status(400).json({ error: 'Enter city and state' });
  if (!/^\d{6}$/.test(s.pincode)) return res.status(400).json({ error: 'Enter a valid 6-digit pincode' });

  // merge duplicate lines
  const lines = new Map();
  for (const it of items) {
    const productId = parseInt(it.productId, 10);
    const qty = Math.max(1, Math.min(10, parseInt(it.qty, 10) || 1));
    if (!productId) return res.status(400).json({ error: 'Invalid item in cart' });
    const key = `${productId}|${it.size || ''}|${it.color || ''}`;
    const prev = lines.get(key);
    lines.set(key, { productId, qty: Math.min(10, (prev?.qty || 0) + qty), size: it.size || null, color: it.color || null });
  }

  const client = await pool.connect();
  let order;
  try {
    await client.query('BEGIN');
    const ids = [...new Set([...lines.values()].map((l) => l.productId))];
    const { rows: prods } = await client.query(
      `SELECT p.*, COALESCE(c.store, 'boutique') AS store
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ANY($1) AND p.is_active = TRUE FOR UPDATE OF p`, [ids]);
    const byId = new Map(prods.map((p) => [p.id, p]));

    // one order = one shop (Nadulshree and Nexora parcels are packed separately)
    const stores = new Set(prods.map((p) => p.store));
    if (stores.size > 1) throw Object.assign(new Error('Please order Nadulshree and Nexora items separately'), { status: 400 });
    const store = stores.values().next().value || 'boutique';

    const needed = new Map();
    let subtotal = 0;
    const finalLines = [];
    for (const l of lines.values()) {
      const p = byId.get(l.productId);
      if (!p) throw Object.assign(new Error('A product in your cart is no longer available'), { status: 400 });
      if (p.sizes.length && !p.sizes.includes(l.size)) throw Object.assign(new Error(`Please select a size for ${p.name}`), { status: 400 });
      needed.set(p.id, (needed.get(p.id) || 0) + l.qty);
      if (needed.get(p.id) > p.stock) throw Object.assign(new Error(`Only ${p.stock} left in stock for ${p.name}`), { status: 400 });
      subtotal += p.price * l.qty;
      finalLines.push({ ...l, p });
    }
    const [fee, freeAbove] = store === 'menswear' ? [NX_SHIPPING_FEE, NX_FREE_ABOVE] : [SHIPPING_FEE, FREE_ABOVE];
    const shippingFee = subtotal >= freeAbove ? 0 : fee;
    const total = subtotal + shippingFee;

    order = (await client.query(
      `INSERT INTO orders (order_no, user_id, subtotal, shipping_fee, total, payment_method,
         ship_name, ship_phone, ship_address, ship_city, ship_state, ship_pincode, notes, expected_delivery, store)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, CURRENT_DATE + 7, $14) RETURNING *`,
      [makeOrderNo(store), req.user.id, subtotal, shippingFee, total, paymentMethod,
        s.name, s.phone, s.address, s.city, s.state, s.pincode, (notes || '').slice(0, 500) || null, store],
    )).rows[0];

    for (const l of finalLines) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, name, image, price, qty, size, color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [order.id, l.p.id, l.p.name, l.p.images[0] || null, l.p.price, l.qty, l.size, l.color],
      );
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [l.qty, l.p.id]);
    }
    await client.query(
      'INSERT INTO tracking_events (order_id, status, location, note) VALUES ($1,$2,$3,$4)',
      [order.id, 'placed', SHOP_NAME[order.store], paymentMethod === 'cod' ? 'Order placed (Cash on Delivery)' : 'Order placed, waiting for payment'],
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  // Online payment -> create Razorpay order
  if (paymentMethod === 'online') {
    try {
      const rzp = await getRazorpay();
      const rOrder = await rzp.orders.create({ amount: Math.round(order.total * 100), currency: 'INR', receipt: order.order_no });
      await query('UPDATE orders SET razorpay_order_id = $1 WHERE id = $2', [rOrder.id, order.id]);
      return res.status(201).json({
        order: { id: order.id, order_no: order.order_no, total: order.total },
        razorpay: { orderId: rOrder.id, amount: rOrder.amount, currency: 'INR', key: process.env.RAZORPAY_KEY_ID },
      });
    } catch (e) {
      console.error('Razorpay order failed:', e?.error?.description || e.message);
      const c = await pool.connect();
      try {
        await c.query('BEGIN');
        await restockOrder(c, order.id);
        await c.query("UPDATE orders SET status='cancelled', payment_status='failed' WHERE id=$1", [order.id]);
        await c.query("INSERT INTO tracking_events (order_id, status, note) VALUES ($1,'cancelled','Payment could not be started')", [order.id]);
        await c.query('COMMIT');
      } catch { await c.query('ROLLBACK'); } finally { c.release(); }
      return res.status(502).json({ error: 'Could not start the payment. Please try again.' });
    }
  }

  res.status(201).json({ order: { id: order.id, order_no: order.order_no, total: order.total } });
}));

// ---------- Verify Razorpay payment ----------
router.post('/verify-payment', requireAuth, wrap(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpayOn()) return res.status(400).json({ error: 'Online payment is not configured' });
  const order = (await query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [orderId, req.user.id])).rows[0];
  if (!order || order.razorpay_order_id !== razorpay_order_id) return res.status(404).json({ error: 'Order not found' });

  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(razorpay_signature || ''));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  if (order.payment_status !== 'paid') {
    await query(
      `UPDATE orders SET payment_status='paid', razorpay_payment_id=$1,
         status = CASE WHEN status='placed' THEN 'confirmed' ELSE status END WHERE id=$2`,
      [razorpay_payment_id, order.id],
    );
    await query(
      "INSERT INTO tracking_events (order_id, status, location, note) VALUES ($1,'confirmed',$2,'Payment received. Order confirmed')",
      [order.id, SHOP_NAME[order.store] || SHOP_NAME.boutique],
    );
  }
  res.json({ ok: true, order_no: order.order_no });
}));

// ---------- My orders (tracking page data) ----------
router.get('/mine', requireAuth, wrap(async (req, res) => {
  // Nadulshree pages send no ?store -> only boutique orders; Nexora pages send ?store=menswear
  const store = req.query.store === 'menswear' ? 'menswear' : 'boutique';
  const { rows } = await query(`${ORDER_SELECT} WHERE o.user_id = $1 AND o.store = $2 ORDER BY o.created_at DESC`, [req.user.id, store]);
  res.json(rows);
}));

router.get('/last-address', requireAuth, wrap(async (req, res) => {
  const o = (await query(
    'SELECT ship_name, ship_phone, ship_address, ship_city, ship_state, ship_pincode FROM orders WHERE user_id=$1 ORDER BY id DESC LIMIT 1',
    [req.user.id],
  )).rows[0];
  res.json(o || null);
}));

// Retry payment for an online order that is still unpaid
router.get('/:id/pay-info', requireAuth, wrap(async (req, res) => {
  if (!razorpayOn()) return res.status(400).json({ error: 'Online payment is not available right now' });
  const o = (await query('SELECT * FROM orders WHERE id=$1 AND user_id=$2', [parseInt(req.params.id, 10) || 0, req.user.id])).rows[0];
  if (!o || o.payment_method !== 'online' || o.payment_status === 'paid' || o.status === 'cancelled' || !o.razorpay_order_id) {
    return res.status(400).json({ error: 'Nothing to pay for this order' });
  }
  res.json({ orderId: o.id, razorpay: { orderId: o.razorpay_order_id, amount: Math.round(o.total * 100), currency: 'INR', key: process.env.RAZORPAY_KEY_ID } });
}));

router.get('/:id', requireAuth, wrap(async (req, res) => {
  const o = (await query(`${ORDER_SELECT} WHERE o.id = $1 AND o.user_id = $2`, [parseInt(req.params.id, 10) || 0, req.user.id])).rows[0];
  if (!o) return res.status(404).json({ error: 'Order not found' });
  res.json(o);
}));

// ---------- Cancel (only before it is packed) ----------
export const CANCEL_REASONS = [
  'Ordered by mistake',
  'Want to change size or colour',
  'Found a better price',
  'Delivery is taking too long',
  'Need to change the delivery address',
  'Payment problem',
  'Other',
];
router.post('/:id/cancel', requireAuth, wrap(async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const reason = String(req.body?.reason || '').trim();
  const note = String(req.body?.note || '').trim().slice(0, 300);
  if (!CANCEL_REASONS.includes(reason)) return res.status(400).json({ error: 'Please choose a reason for cancelling' });
  if (reason === 'Other' && note.length < 3) return res.status(400).json({ error: 'Please write a few words about why you are cancelling' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const o = (await client.query('SELECT * FROM orders WHERE id=$1 AND user_id=$2 FOR UPDATE', [id, req.user.id])).rows[0];
    if (!o) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Order not found' }); }
    if (!['placed', 'confirmed'].includes(o.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'This order is already packed/shipped. Please contact us on WhatsApp.' });
    }
    await restockOrder(client, id);
    await client.query("UPDATE orders SET status='cancelled', cancel_reason=$2, cancel_note=$3, cancelled_at=NOW() WHERE id=$1", [id, reason, note || null]);
    const base = o.payment_status === 'paid' ? 'Cancelled by customer. Refund will be processed' : 'Cancelled by customer';
    await client.query(
      "INSERT INTO tracking_events (order_id, status, note) VALUES ($1,'cancelled',$2)",
      [id, `${base}. Reason: ${reason}${note ? ` (${note})` : ''}`],
    );
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}));

export default router;
