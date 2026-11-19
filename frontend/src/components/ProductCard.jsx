import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductImage from './ProductImage';
import { inr } from '../api';

export default function ProductCard({ p, index = 0 }) {
  const off = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.06 }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/product/${p.id}`} className="pcard">
        <div className="pcard-img">
          <ProductImage src={p.images?.[0]} alt={p.name} />
          {off > 0 && <span className="tag tag-off">{off}% OFF</span>}
          {p.stock === 0 && <span className="tag tag-out">Sold out</span>}
        </div>
        <div className="pcard-body">
          <small>{p.category_name}</small>
          <h3>{p.name}</h3>
          <div className="price">
            <strong>{inr(p.price)}</strong>
            {off > 0 && <s>{inr(p.mrp)}</s>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
