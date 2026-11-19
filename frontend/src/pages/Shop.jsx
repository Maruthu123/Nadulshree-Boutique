import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHero from '../components/PageHero';
import ProductCard from '../components/ProductCard';
import { IMG } from '../data/images';
import api from '../api';

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const q = params.get('q') || '';
  const sort = params.get('sort') || '';
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/products', { params: { category: category || undefined, q: q || undefined, sort: sort || undefined } })
      .then((r) => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, q, sort]);

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  const title = q ? `Results for “${q}”` : (cats.find((c) => c.slug === category)?.name || 'All Products');

  return (
    <>
      <PageHero title={title} subtitle="Find your perfect outfit" image={IMG.banner.shop} />
      <section className="section container">
        <div className="shop-bar">
          <div className="chips">
            <button className={!category ? 'chip active' : 'chip'} onClick={() => set('category', '')}>All</button>
            {cats.map((c) => (
              <button key={c.id} className={category === c.slug ? 'chip active' : 'chip'} onClick={() => set('category', c.slug)}>{c.name}</button>
            ))}
          </div>
          <select value={sort} onChange={(e) => set('sort', e.target.value)} aria-label="Sort products">
            <option value="">Featured</option>
            <option value="new">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="grid-products">{[...Array(8)].map((_, i) => <div key={i} className="skeleton" />)}</div>
        ) : products.length === 0 ? (
          <motion.div className="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span>🛍️</span>
            <h3>No products found</h3>
            <p>Try another category or search word.</p>
            <button className="btn btn-orange" onClick={() => setParams({})}>Show all products</button>
          </motion.div>
        ) : (
          <div className="grid-products">{products.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div>
        )}
      </section>
    </>
  );
}
