import { Router } from 'express';
import { query } from '../db.js';
import { wrap } from '../middleware/auth.js';

const router = Router();

const SELECT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug, COALESCE(c.store, 'boutique') AS store
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id`;

// Which shop? Nadulshree pages send nothing -> 'boutique' (so they never see menswear). Nexora pages send ?store=menswear
const storeOf = (req) => (req.query.store === 'menswear' ? 'menswear' : 'boutique');

router.get('/categories', wrap(async (req, res) => {
  const { rows } = await query(`
    SELECT c.*, COUNT(p.id) FILTER (WHERE p.is_active) ::int AS product_count
    FROM categories c LEFT JOIN products p ON p.category_id = c.id
    WHERE c.store = $1
    GROUP BY c.id ORDER BY c.sort_order, c.id`, [storeOf(req)]);
  res.json(rows);
}));

router.get('/products', wrap(async (req, res) => {
  const { category, q, sort, featured } = req.query;
  const limit = Math.min(parseInt(req.query.limit, 10) || 60, 100);
  const where = ['p.is_active = TRUE'];
  const params = [storeOf(req)];
  where.push("COALESCE(c.store, 'boutique') = $1");
  if (category) { params.push(category); where.push(`c.slug = $${params.length}`); }
  if (q) { params.push(`%${String(q).trim()}%`); where.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length} OR c.name ILIKE $${params.length})`); }
  if (featured === '1') where.push('p.is_featured = TRUE');
  const order = { price_asc: 'p.price ASC', price_desc: 'p.price DESC', new: 'p.created_at DESC' }[sort] || 'p.is_featured DESC, p.created_at DESC';
  params.push(limit);
  const { rows } = await query(`${SELECT} WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT $${params.length}`, params);
  res.json(rows);
}));

router.get('/products/:id', wrap(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(404).json({ error: 'Product not found' });
  const product = (await query(`${SELECT} WHERE p.id = $1 AND p.is_active = TRUE`, [id])).rows[0];
  if (!product) return res.status(404).json({ error: 'Product not found' });
  // related products: same shop only, same category first, then fill with others
  const related = (await query(
    `${SELECT} WHERE p.is_active = TRUE AND p.id <> $1 AND COALESCE(c.store, 'boutique') = $3
     ORDER BY (p.category_id = $2) DESC NULLS LAST, p.is_featured DESC, p.created_at DESC LIMIT 4`,
    [id, product.category_id, product.store],
  )).rows;
  res.json({ product, related });
}));

export default router;
