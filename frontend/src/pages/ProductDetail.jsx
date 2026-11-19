import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiMinus, FiPlus, FiShoppingBag, FiZap, FiCheck, FiChevronLeft, FiChevronRight, FiChevronDown,
  FiShield, FiTruck, FiRefreshCw, FiMapPin, FiShare2,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import PageHero from '../components/PageHero';
import ProductImage from '../components/ProductImage';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import api, { inr } from '../api';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';


/** colour name -> swatch (works for names CSS understands: red, navy, maroon...) */
const swatch = (name) => {
  const c = String(name).trim().toLowerCase().replace(/\s+/g, '');
  return typeof CSS !== 'undefined' && CSS.supports('color', c) ? c : null;
};

const TRUST = [
  [FiShield, 'Secure payment', 'UPI, cards, net banking'],
  [FiMapPin, 'Live tracking', 'Follow your parcel'],
  [FiRefreshCw, 'Easy cancel', 'Before packing'],
  [FiTruck, 'Careful packing', 'Checked before dispatch'],
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { whatsapp, freeShippingAbove, shippingFee } = useConfig();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [img, setImg] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [warn, setWarn] = useState('');
  const [added, setAdded] = useState(false);
  const [open, setOpen] = useState('desc');
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const mainRef = useRef(null);

  useEffect(() => {
    setData(null); setError(''); setImg(0); setSize(''); setColor(''); setQty(1); setWarn('');
    window.scrollTo({ top: 0 });
    api.get(`/products/${id}`)
      .then((r) => {
        setData(r.data);
        if (r.data.product.colors.length === 1) setColor(r.data.product.colors[0]);
        if (r.data.product.sizes.length === 1) setSize(r.data.product.sizes[0]);
      })
      .catch(() => setError('This product is not available.'));
  }, [id]);

  if (error) {
    return (<><PageHero title="Oops" /><div className="container section empty"><h3>{error}</h3><Link to="/shop" className="btn btn-orange">Back to shop</Link></div></>);
  }
  if (!data) return (<><PageHero title="Loading..." /><div className="container section"><div className="skeleton tall" /></div></>);

  const { product: p, related } = data;
  const off = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  const save = off ? p.mrp - p.price : 0;
  const soldOut = p.stock === 0;
  const imgs = p.images.length ? p.images : [null];
  const maxQty = Math.min(10, p.stock || 1);

  const line = () => ({
    productId: p.id, name: p.name, price: p.price, image: p.images[0] || null,
    size: size || null, color: color || null, category: p.category_name,
  });

  const validate = () => {
    if (p.sizes.length && !size) { setWarn('Please select a size'); return false; }
    if (p.colors.length && !color) { setWarn('Please select a colour'); return false; }
    setWarn('');
    return true;
  };

  const addToCart = () => {
    if (!validate()) return;
    add(line(), qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const buyNow = () => {
    if (!validate()) return;
    add(line(), qty);
    navigate('/checkout'); // -> address + payment page (asks login if needed)
  };

  const go = (d) => setImg((i) => (i + d + imgs.length) % imgs.length);

  const onMove = (e) => {
    const r = mainRef.current.getBoundingClientRect();
    setZoom({ on: true, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: p.name, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    } catch { /* cancelled */ }
  };

  const toggle = (k) => setOpen((o) => (o === k ? '' : k));

  const ACC = [
    ['desc', 'Product details', p.description || 'Handpicked and checked by Nadulshree Boutique before it is packed for you.'],
    ['ship', 'Delivery & payment', `Free delivery on orders above ${inr(freeShippingAbove)}, otherwise ${inr(shippingFee)}. Pay securely online with UPI, cards or net banking. You can cancel from My Orders before your parcel is packed.`],
    ['care', 'Care & note', 'Colours may look slightly different on your screen. Dry clean or gentle hand wash is recommended for sarees and festive wear.'],
  ];

  return (
    <>
      <PageHero title={p.category_name} crumb={p.name} />

      <section className="pd container">
        <div className="pd-grid">
          {/* ---------------- GALLERY ---------------- */}
          <div className="pd-gallery">
            {imgs.length > 1 && (
              <div className="pd-thumbs">
                {imgs.map((src, i) => (
                  <button key={i} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`Photo ${i + 1}`}>
                    <ProductImage src={src} alt={`${p.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}

            <div
              className="pd-main"
              ref={mainRef}
              onMouseMove={onMove}
              onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={img}
                  className="pd-main-img"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                  style={{ transformOrigin: `${zoom.x}% ${zoom.y}%`, transform: zoom.on ? 'scale(1.8)' : 'scale(1)' }}
                >
                  <ProductImage src={imgs[img]} alt={p.name} />
                </motion.div>
              </AnimatePresence>

              {off > 0 && <span className="pd-badge">{off}% OFF</span>}
              {soldOut && <span className="pd-badge dark">Sold out</span>}
              <button type="button" className="pd-share" onClick={share} aria-label="Share">{copied ? <FiCheck /> : <FiShare2 />}</button>

              {imgs.length > 1 && (
                <>
                  <button type="button" className="pd-arrow l" onClick={() => go(-1)} aria-label="Previous photo"><FiChevronLeft /></button>
                  <button type="button" className="pd-arrow r" onClick={() => go(1)} aria-label="Next photo"><FiChevronRight /></button>
                  <span className="pd-count">{img + 1} / {imgs.length}</span>
                </>
              )}
            </div>
          </div>

          {/* ---------------- INFO ---------------- */}
          <motion.div className="pd-info" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to={`/shop?category=${p.category_slug || ''}`} className="pd-cat">{p.category_name}</Link>
            <h1 className="pd-title">{p.name}</h1>

            <div className="pd-price">
              <strong>{inr(p.price)}</strong>
              {off > 0 && <><s>{inr(p.mrp)}</s><em>{off}% off</em></>}
            </div>
            {save > 0 && <p className="pd-save">You save {inr(save)} on this order</p>}
            <p className="pd-tax">Inclusive of all taxes</p>

            <div className={`pd-stock ${soldOut ? 'out' : p.stock <= 5 ? 'low' : ''}`}>
              <i />{soldOut ? 'Sold out' : p.stock <= 5 ? `Only ${p.stock} left, order soon` : 'In stock'}
            </div>

            <div className="pd-rule" />

            {p.sizes.length > 0 && (
              <div className="pd-opt">
                <div className="pd-opt-head"><label>Size</label>{size && <span>{size}</span>}</div>
                <div className="pd-sizes">
                  {p.sizes.map((s) => (
                    <button type="button" key={s} className={size === s ? 'on' : ''} onClick={() => { setSize(s); setWarn(''); }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {p.colors.length > 0 && (
              <div className="pd-opt">
                <div className="pd-opt-head"><label>Colour</label>{color && <span>{color}</span>}</div>
                <div className="pd-colors">
                  {p.colors.map((c) => {
                    const sw = swatch(c);
                    return (
                      <button type="button" key={c} className={`${color === c ? 'on' : ''} ${sw ? 'has-sw' : ''}`} onClick={() => { setColor(c); setWarn(''); }} title={c}>
                        {sw && <i style={{ background: sw }} />}{c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pd-opt">
              <div className="pd-opt-head"><label>Quantity</label></div>
              <div className="pd-qty">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Less"><FiMinus /></button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="More"><FiPlus /></button>
              </div>
            </div>

            {warn && <p className="warn pd-warn">{warn}</p>}

            {soldOut ? (
              <p className="warn">This item is sold out. Message us on WhatsApp to know when it is back.</p>
            ) : (
              <div className="pd-cta">
                <button type="button" className="btn btn-dark btn-lg" onClick={addToCart}>
                  {added ? <><FiCheck /> Added</> : <><FiShoppingBag /> Add to Cart</>}
                </button>
                <button type="button" className="btn btn-orange btn-lg" onClick={buyNow}><FiZap /> Buy Now</button>
              </div>
            )}

            <a className="pd-wa" target="_blank" rel="noreferrer"
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi, I am interested in ${p.name} (${inr(p.price)})`)}`}>
              <FaWhatsapp /> Ask about this product on WhatsApp
            </a>

            <div className="pd-trust">
              {TRUST.map(([Icon, t, s]) => (
                <div key={t}><span><Icon /></span><div><b>{t}</b><small>{s}</small></div></div>
              ))}
            </div>

            <div className="pd-acc">
              {ACC.map(([k, title, text]) => (
                <div key={k} className={open === k ? 'open' : ''}>
                  <button type="button" onClick={() => toggle(k)} aria-expanded={open === k}>{title}<FiChevronDown /></button>
                  <AnimatePresence initial={false}>
                    {open === k && (
                      <motion.div className="pd-acc-body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                        <p>{text}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* mobile sticky buy bar */}
      {!soldOut && (
        <div className="pd-sticky">
          <div><small>Total</small><b>{inr(p.price * qty)}</b></div>
          <button type="button" className="btn btn-dark" onClick={addToCart}>{added ? <FiCheck /> : <FiShoppingBag />}</button>
          <button type="button" className="btn btn-orange" onClick={buyNow}><FiZap /> Buy Now</button>
        </div>
      )}

      {related.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <Reveal><h2 className="sec-title">You may also <span>like</span></h2></Reveal>
            <div className="grid-products">{related.map((r, i) => <ProductCard key={r.id} p={r} index={i} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}