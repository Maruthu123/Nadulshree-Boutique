// Run once:  npm run db:setup
// Creates all tables in Neon, the 6 categories, the admin account (and optional demo products).
import 'dotenv/config';
import { pool } from '../db.js';
import { bootstrap } from '../utils/bootstrap.js';

// Demo photos come from Unsplash (free to use). Delete these demo products in Admin > Products and add your own.
const ph = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=75`;

// [category slug, name, description, price, mrp, sizes, colours, stock, featured, photos]
// Demo photos show clothes / fabrics only. They are just placeholders: delete the demo products in Admin > Products
// and add your own products with your own photos.
const SAMPLES = [
  ['saree', 'Soft Silk Saree', 'Rich soft silk saree with zari border and matching blouse piece. Perfect for weddings and festivals.', 1799, 2399, ['Free Size'], ['Maroon', 'Green'], 6, true,
    [ph('1616986491129-3e37cb654c82'), ph('1588140686379-1b76a52103dc')]],
  ['saree', 'Designer Party Wear Saree', 'Lightweight designer saree with a graceful drape and rich pallu.', 2199, 2899, ['Free Size'], ['Pink', 'Purple'], 5, true,
    [ph('1540292370723-60cf448886c3'), ph('1507434745378-235a6297156b')]],
  ['3-piece-set-kurtis', 'Cotton 3 Piece Kurti Set', 'Kurti with pant and dupatta in soft cotton. Comfortable for daily and festive wear.', 1299, 1699, ['S', 'M', 'L', 'XL', 'XXL'], ['Red', 'Pink'], 10, true,
    [ph('1612423284934-2850a4ea6b0f'), ph('1774691799598-71e688b1bf7f')]],
  ['2-piece-set', 'Printed 2 Piece Set', 'Kurti and pant set with a neat print. Easy to wear and easy to style.', 899, 1199, ['S', 'M', 'L', 'XL'], ['Red', 'Black'], 12, true,
    [ph('1774691799598-71e688b1bf7f'), ph('1788347102327-519a5454ff05')]],
  ['single-top', 'Rayon Single Top', 'Light rayon top, perfect with jeans or leggings.', 449, 599, ['S', 'M', 'L', 'XL'], ['White', 'Black'], 15, false,
    [ph('1573879500655-98f2012dd1db'), ph('1700659392887-0a026c53f8e2')]],
  ['legging', 'Ankle Length Legging', 'Stretchable and soft ankle length legging.', 249, 349, ['M', 'L', 'XL', 'XXL'], ['Black', 'Maroon', 'Navy'], 25, false,
    [ph('1705248382836-3618e25706d0'), ph('1710440189404-e95fabead2a3')]],
  ['straight-cut-pant', 'Straight Cut Pant', 'Comfortable straight cut pant that goes with any kurti.', 399, 549, ['M', 'L', 'XL', 'XXL'], ['Black', 'Beige'], 18, false,
    [ph('1773525911716-a24c634a1319'), ph('1700659393913-af754a9bbc0f')]],
];

// Nexora Menswear demo shirts (no photos: the website draws a neat shirt picture until you upload real photos in Admin > Products)
// [category slug, name, description, price, mrp, sizes, colours, stock, featured]
const SH = ['S', 'M', 'L', 'XL', 'XXL'];
const NX_SAMPLES = [
  ['formal-shirts', 'Classic White Formal Shirt', 'Crisp cotton formal shirt with a sharp collar. Perfect for office, meetings and functions.', 899, 1299, SH, ['White', 'Sky Blue'], 20, true],
  ['formal-shirts', 'Midnight Navy Formal Shirt', 'Smooth finish navy shirt with a slim, comfortable fit.', 949, 1399, SH, ['Navy', 'Black'], 15, true],
  ['casual-shirts', 'Olive Everyday Casual Shirt', 'Soft cotton casual shirt. Wear it open over a tee or buttoned up.', 799, 1099, SH, ['Olive', 'Beige', 'Grey'], 18, true],
  ['printed-shirts', 'Neon Print Party Shirt', 'Bold printed shirt that stands out at parties and celebrations.', 999, 1499, SH, ['Black', 'Maroon'], 12, true],
  ['checked-shirts', 'Urban Check Shirt', 'Neat checks on soft fabric. Easy to style for college and weekends.', 849, 1199, SH, ['Maroon', 'Navy', 'Green'], 14, false],
  ['linen-shirts', 'Breathable Linen Shirt', 'Light linen shirt that keeps you cool in hot weather.', 1099, 1599, SH, ['Beige', 'White', 'Sky Blue'], 10, true],
  ['half-sleeve-shirts', 'Half Sleeve Cotton Shirt', 'Comfortable half sleeve shirt for daily wear.', 699, 949, SH, ['Mustard', 'Teal', 'White'], 22, false],
  ['casual-shirts', 'Charcoal Oxford Shirt', 'Textured oxford weave in charcoal. Smart casual and long lasting.', 899, 1299, SH, ['Charcoal', 'Navy'], 16, false],
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing in backend/.env');
  const { admin } = await bootstrap({ resetAdminPassword: true });
  console.log('✓ Tables and categories ready');
  console.log(`✓ Admin: ${admin}`);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM products');
  if (process.env.SEED_SAMPLES !== 'false') {
    if (rows[0].n === 0) {
      for (const [slug, name, desc, price, mrp, sizes, colors, stock, featured, images] of SAMPLES) {
        await pool.query(
          `INSERT INTO products (category_id, name, description, price, mrp, sizes, colors, stock, is_featured, images)
           VALUES ((SELECT id FROM categories WHERE slug = $1), $2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [slug, name, desc, price, mrp, sizes, colors, stock, featured, images],
        );
      }
      console.log('✓ Demo products added (delete them from Admin > Products)');
    } else {
      // demo products added by an older setup have no photos: give them photos
      for (const [, name, , , , , , , , images] of SAMPLES) {
        // only demo products that still use the demo (Unsplash) photos or have none; your own uploaded photos are never touched
        await pool.query("UPDATE products SET images = $2 WHERE name = $1 AND (cardinality(images) = 0 OR images[1] LIKE 'https://images.unsplash.com/%')", [name, images]);
      }
      console.log('✓ Demo products checked');
    }
  }

  // Nexora Menswear demo shirts (only when the menswear shop has no products yet)
  if (process.env.SEED_SAMPLES !== 'false') {
    const nx = await pool.query("SELECT COUNT(*)::int AS n FROM products p JOIN categories c ON c.id = p.category_id WHERE c.store = 'menswear'");
    if (nx.rows[0].n === 0) {
      for (const [slug, name, desc, price, mrp, sizes, colors, stock, featured] of NX_SAMPLES) {
        await pool.query(
          `INSERT INTO products (category_id, name, description, price, mrp, sizes, colors, stock, is_featured, images)
           VALUES ((SELECT id FROM categories WHERE slug = $1), $2,$3,$4,$5,$6,$7,$8,$9,'{}')`,
          [slug, name, desc, price, mrp, sizes, colors, stock, featured],
        );
      }
      console.log('✓ Nexora Menswear demo shirts added (delete them from Admin > Products > Nexora Menswear)');
    }
  }

  console.log('\nDatabase setup finished.');
}

main()
  .catch((e) => { console.error('\n✗ Setup failed:', e.message); process.exitCode = 1; })
  .finally(() => pool.end());
