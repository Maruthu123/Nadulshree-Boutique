import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiHeart, FiMinus, FiPlus, FiShoppingBag, FiShield, FiTruck, FiMessageCircle, FiX, FiCheck, FiZoomIn } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import NxImage from '../NxImage';
import NxProductCard from '../NxProductCard';
import { colorHex, isLight } from '../ShirtArt';
import { useNxCart } from '../NxCartContext';
import { discount, enquiryText, useNx, useWishlist, waLink } from '../nxUtils';
import api, { errMsg, imgSrc, inr } from '../../api';
import { NxSeo, productSeo } from '../NxSeo';

const SIZE_CHART = [
  ['S', '38', '28', '17'],
  ['M', '40', '29', '17.5'],
  ['L', '42', '30', '18'],
  ['XL', '44', '31', '18.5'],
  ['XXL', '46', '32', '19'],
];

export default function NxProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const nx = useNx();
  const cart = useNxCart();
  const wish = useWishlist();
  const [data, setData] = useState(null);
  const [missing, setMissing] = useState(false);
  const [img, setImg] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('details');
  const [guide, setGuide] = useState(false);
  const [added, setAdded] = useState(false);
  const [warn, setWarn] = useState('');
  const [zoom, setZoom] = useState(null);
  const stage = useRef(null);

  useEffect(() => {
    setData(null); setMissing(false); setImg(0); setSize(''); setQty(1); setWarn(''); setAdded(false);
    api.get(`/products/${id}`).then((r) => {
      setData(r.data);
      setColor(r.data.product.colors?.[0] || '');
    }).catch((e) => { if (e.response?.status === 404) setMissing(true); else setWarn(errMsg(e)); });
  }, [id]);

  if (missing) {
    return <section className="nx-section"><div className="nx-container nx-empty"><h3>Shirt not found</h3><p>It may have been removed.</p><Link to="/menswear/shop" className="nx-btn">Back to shop</Link></div></section>;
  }
  if (!data) return <section className="nx-section"><div className="nx-container nx-pdp"><div className="nx-skel tall" /><div className="nx-skel tall" /></div></section>;
  const { product: p, related } = data;
  if (p.store !== 'menswear') return <Navigate to={`/product/${p.id}`} replace />;

  const off = discount(p);
  const soldOut = p.stock === 0;
  const photos = p.images || [];
  const needSize = p.sizes?.length > 0;

  const pick = () => {
    if (needSize && !size) { setWarn('Please select a size'); return null; }
    setWarn('');
    return { productId: p.id, name: p.name, price: p.price, image: photos[0] || null, size: size || null, color: color || null };
  };
  const addToCart = () => {
    const item = pick(); if (!item) return;
    cart.add(item, qty); setAdded(true); setTimeout(() => setAdded(false), 2200);
  };
  const buyNow = () => { const item = pick(); if (!item) return; cart.add(item, qty); navigate('/menswear/checkout'); };

  const onMove = (e) => {
    const r = stage.current.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const seoP = productSeo(p, inr);

  return (
    <>
      <NxSeo {...seoP} type="product" />
      <section className="nx-section nx-tight">
        <div className="nx-container">
          <nav className="nx-crumbs" aria-label="Breadcrumb">
            <Link to="/menswear">Home</Link> / <Link to="/menswear/shop">Shop</Link> / <Link to={`/menswear/shop?category=${p.category_slug}`}>{p.category_name}</Link>
          </nav>

          <div className="nx-pdp">
            {/* gallery */}
            <div className="nx-gal">
              {photos.length > 1 && (
                <div className="nx-thumbs">
                  {photos.map((src, k) => (
                    <button key={src + k} className={k === img ? 'on' : ''} onClick={() => setImg(k)} aria-label={`Photo ${k + 1}`}><img src={imgSrc(src)} alt="" loading="lazy" /></button>
                  ))}
                </div>
              )}
              <div className="nx-stage" ref={stage} onMouseMove={photos.length ? onMove : undefined} onMouseLeave={() => setZoom(null)}>
                <AnimatePresence mode="wait">
                  <motion.div key={`${img}${photos.length ? '' : color}`} className="nx-stage-in" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <NxImage p={p} src={photos[img]} color={color} alt={p.name} />
                  </motion.div>
                </AnimatePresence>
                {zoom && photos.length > 0 && <div className="nx-zoom" style={{ backgroundImage: `url(${imgSrc(photos[img])})`, backgroundPosition: `${zoom.x}% ${zoom.y}%` }} />}
                {photos.length > 0 && <span className="nx-zoom-ico"><FiZoomIn /></span>}
                {off > 0 && <span className="nx-tag big">{off}% OFF</span>}
              </div>
            </div>

            {/* info */}
            <div className="nx-info">
              <div className="nx-badges">
                {p.is_featured && <span className="nx-pill">Featured</span>}
                <span className="nx-pill soft">{p.category_name}</span>
              </div>
              <h1>{p.name}</h1>
              <div className="nx-pricebox">
                <strong>{inr(p.price)}</strong>
                {off > 0 && <><s>{inr(p.mrp)}</s><span className="nx-off">{off}% OFF</span></>}
              </div>
              {p.description && <p className="nx-desc">{p.description}</p>}

              {p.colors?.length > 0 && (
                <div className="nx-opt">
                  <div className="nx-opt-h"><b>Colour:</b> {color}</div>
                  <div className="nx-swatches">
                    {p.colors.map((c) => (
                      <button key={c} className={`sw ${c === color ? 'on' : ''} ${isLight(colorHex(c)) ? 'lt' : ''}`} style={{ background: colorHex(c) }} onClick={() => setColor(c)} title={c} aria-label={c} aria-pressed={c === color}>{c === color && <FiCheck />}</button>
                    ))}
                  </div>
                </div>
              )}

              {needSize && (
                <div className="nx-opt">
                  <div className="nx-opt-h"><span><b>Size:</b> {size || 'Select'}</span><button className="nx-link" onClick={() => setGuide(true)}>Size guide</button></div>
                  <div className="nx-sizes">
                    {p.sizes.map((s) => (
                      <button key={s} className={s === size ? 'on' : ''} onClick={() => { setSize(s); setWarn(''); }} aria-pressed={s === size}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {p.stock > 0 && p.stock <= 5 && <p className="nx-low">Hurry! Only {p.stock} left</p>}
              {soldOut && <p className="nx-low">Sold out. Message us on WhatsApp to know when it is back.</p>}

              <div className="nx-opt">
                <div className="nx-opt-h"><b>Quantity</b></div>
                <div className="nx-qty">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Less"><FiMinus /></button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(Math.max(1, Math.min(10, p.stock)), q + 1))} aria-label="More"><FiPlus /></button>
                </div>
              </div>

              {warn && <p className="nx-warn">{warn}</p>}

              <div className="nx-buy">
                <button className="nx-btn nx-btn-lg nx-grow" disabled={soldOut} onClick={addToCart}>
                  {added ? <><FiCheck /> Added to cart</> : <><FiShoppingBag /> Add to cart</>}
                </button>
                <button className={`nx-heart-big ${wish.has(p.id) ? 'on' : ''}`} onClick={() => wish.toggle(p.id)} aria-label="Wishlist"><FiHeart /></button>
              </div>
              <div className="nx-buy2">
                <button className="nx-btn nx-btn-ghost nx-grow" disabled={soldOut} onClick={buyNow}>Buy now · online payment</button>
                <a className="nx-btn nx-btn-wa nx-grow" href={waLink(nx.whatsapp, enquiryText(p, { size, color, qty }))} target="_blank" rel="noreferrer"><FaWhatsapp /> Enquire on WhatsApp</a>
              </div>

              <div className="nx-trust">
                <div><FiShield /><b>Secure payment</b><small>UPI, cards, net banking</small></div>
                <div><FaWhatsapp /><b>WhatsApp support</b><small>Ask before you buy</small></div>
                <div><FiTruck /><b>Order tracking</b><small>Track in your account</small></div>
              </div>
            </div>
          </div>

          {/* tabs */}
          <div className="nx-tabs">
            <div className="nx-tabbar" role="tablist">
              {[['details', 'Details'], ['fit', 'Size & Fit'], ['ship', 'Delivery']].map(([k, l]) => (
                <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}{tab === k && <motion.i layoutId="nx-tab" />}</button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={tab} className="nx-tabbody" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {tab === 'details' && (
                  <ul className="nx-ticks">
                    <li><FiCheck /> {p.description || 'A quality shirt from Nexora Menswear.'}</li>
                    {p.colors?.length > 0 && <li><FiCheck /> Available colours: {p.colors.join(', ')}</li>}
                    {p.sizes?.length > 0 && <li><FiCheck /> Available sizes: {p.sizes.join(', ')}</li>}
                    <li><FiCheck /> Category: {p.category_name}</li>
                  </ul>
                )}
                {tab === 'fit' && (
                  <div>
                    <p className="nx-muted">Approximate shirt measurements in inches. Not sure about your size? Message us on WhatsApp.</p>
                    <SizeTable />
                  </div>
                )}
                {tab === 'ship' && (
                  <ul className="nx-ticks">
                    <li><FiCheck /> Delivery charge ₹{nx.shippingFee}. Free delivery above ₹{nx.freeShippingAbove.toLocaleString('en-IN')}.</li>
                    <li><FiCheck /> Expected delivery within about 7 days after you order.</li>
                    <li><FiCheck /> Pay securely online. You can track every step of the parcel from My Orders.</li>
                    <li><FiCheck /> Packed and sent from {nx.address}.</li>
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {related?.length > 0 && (
            <div className="nx-related">
              <div className="nx-row-h"><h2>You may also like</h2><Link to="/menswear/shop" className="nx-link">View all →</Link></div>
              <div className="nx-grid">{related.map((r, i) => <NxProductCard key={r.id} p={r} index={i} />)}</div>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {guide && (
          <motion.div className="nx-modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGuide(false)}>
            <motion.div className="nx-modal" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Size guide">
              <button className="nx-icon nx-modal-x" onClick={() => setGuide(false)} aria-label="Close"><FiX /></button>
              <h3>Size guide</h3>
              <p className="nx-muted">Approximate shirt measurements in inches.</p>
              <SizeTable />
              <a className="nx-btn nx-btn-wa nx-btn-sm" href={waLink(nx.whatsapp, `Hi Nexora Menswear, please help me choose a size for ${p.name}.`)} target="_blank" rel="noreferrer"><FiMessageCircle /> Ask us about size</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SizeTable() {
  return (
    <div className="nx-table-wrap">
      <table className="nx-table">
        <thead><tr><th>Size</th><th>Chest</th><th>Length</th><th>Shoulder</th></tr></thead>
        <tbody>{SIZE_CHART.map((r) => <tr key={r[0]}>{r.map((c, i) => (i ? <td key={i}>{c}"</td> : <th key={i}>{c}</th>))}</tr>)}</tbody>
      </table>
    </div>
  );
}
