import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import NxImage from './NxImage';
import NxTilt from './NxTilt';
import { colorHex } from './ShirtArt';
import { discount, enquiryText, useNx, useWishlist, waLink } from './nxUtils';
import { inr } from '../api';

export default function NxProductCard({ p, index = 0 }) {
  const { whatsapp } = useNx();
  const wish = useWishlist();
  const off = discount(p);
  const liked = wish.has(p.id);
  return (
    <motion.article
      className="nx-card-wrap"
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.07 }}
    >
      <NxTilt className="nx-card" max={7}>
      <Link to={`/menswear/product/${p.id}`} className="nx-card-img" aria-label={p.name}>
        <NxImage p={p} />
        {off > 0 && <span className="nx-tag">{off}% OFF</span>}
        {p.stock === 0 && <span className="nx-tag out">Sold out</span>}
      </Link>
      <button className={`nx-heart ${liked ? 'on' : ''}`} onClick={() => wish.toggle(p.id)} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}><FiHeart /></button>
      <div className="nx-card-body">
        <small>{p.category_name}</small>
        <Link to={`/menswear/product/${p.id}`}><h3>{p.name}</h3></Link>
        <div className="nx-card-row">
          <div className="nx-price"><strong>{inr(p.price)}</strong>{off > 0 && <s>{inr(p.mrp)}</s>}</div>
          <div className="nx-dots" aria-hidden>
            {(p.colors || []).slice(0, 4).map((c) => <i key={c} style={{ background: colorHex(c) }} title={c} />)}
          </div>
        </div>
        <a className="nx-wa-mini" href={waLink(whatsapp, enquiryText(p))} target="_blank" rel="noreferrer"><FaWhatsapp /> Enquire on WhatsApp</a>
      </div>
      </NxTilt>
    </motion.article>
  );
}
