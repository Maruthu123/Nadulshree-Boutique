import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import {
  FiArrowRight, FiArrowUpRight, FiChevronLeft, FiChevronRight, FiTruck, FiShield, FiMapPin,
  FiMessageCircle, FiSearch, FiUserCheck, FiCreditCard, FiPackage, FiMail, FiCheckCircle,
} from 'react-icons/fi';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard'; 
import TestimonialSpotlight from '../components/TestimonialSpotlight';
// import ReviewCard from '../components/ReviewCard'; // old moving review strip (replaced)
import Lightbox from '../components/Lightbox';
import SectionHead from '../components/SectionHead';
import Reveal from '../components/Reveal';
import NexoraBanner from '../components/NexoraBanner';
import { IMG } from '../data/images';
import api, { inr } from '../api';
import { useConfig } from '../context/ConfigContext';
import './home.css'; // <- put home.css next to your main css and fix this path if needed

const TRUST = [  
  // [FiTruck, 'Cash on Delivery', 'Pay when it reaches you'], // COD disabled
  [FiShield, 'Secure Payment', 'Safe & verified checkout'],
  [FiCreditCard, 'Online Payment', 'UPI, cards, net banking'],
  [FiMapPin, 'Live Tracking', 'Know where your parcel is'],
  [FiMessageCircle, 'Personal Support', 'Instagram & WhatsApp'],
];

const STEPS = [
  [FiSearch, 'Choose your style', 'Browse sarees, kurti sets, tops, leggings and pants. Pick your size and colour.', 'Takes a minute'],
  [FiUserCheck, 'Login with OTP', 'Create your account and verify your email with a quick 6-digit code.', 'Safe & private'],
  // [FiCreditCard, 'Pay your way', 'Cash on Delivery, or pay online with UPI, cards and net banking.', 'COD available'], // COD disabled
  [FiCreditCard, 'Pay online', 'Pay securely with UPI, cards or net banking.', 'Secure payment'],
  [FiPackage, 'Track to your door', 'Follow every step of your parcel from packing until it is delivered.', 'Live updates'],
];

const WHY = [
  // [FiTruck, 'Cash on Delivery', 'Pay when your parcel reaches your hands, or pay online securely.'], // COD disabled
  [FiCreditCard, 'Secure Online Payment', 'Pay safely with UPI, cards or net banking.'],
  [FiMapPin, 'Live Order Tracking', 'Login and see exactly where your order is, step by step.'],
  [FiShield, 'Verified Accounts', 'Every customer is verified with an OTP for safe ordering.'],
  [FiMessageCircle, 'Instagram & WhatsApp', 'Message us any time. We reply personally.'],
];

const HELP_TAGS = ['Size & fit', 'Colour match', 'Fabric care', 'Delivery status'];

export default function Home() {
  const { instagram, whatsapp, freeShippingAbove } = useConfig();
  const [cats, setCats] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [zoom, setZoom] = useState('');

  /* ---------- shop by category (coverflow) ---------- */
  const [active, setActive] = useState(0);
  const cfPaused = useRef(false);
  const cfTouch = useRef(null);
  const n = cats.length;

  const cfGo = useCallback((d) => setActive((a) => (n ? (a + d + n) % n : 0)), [n]);

  // position of card i relative to the active one (-2 .. 2 are visible), wraps around
  const posOf = (i) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  useEffect(() => {
    if (n < 2) return undefined;
    const id = setInterval(() => { if (!cfPaused.current) cfGo(1); }, 3500);
    return () => clearInterval(id);
  }, [n, cfGo]);

  /* ---------- data ---------- */
  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data)).catch(() => {});
    api.get('/products', { params: { featured: 1, limit: 8 } })
      .then(async (r) => {
        if (r.data.length) return setFeatured(r.data);
        const all = await api.get('/products', { params: { sort: 'new', limit: 8 } });
        setFeatured(all.data);
      })
      .catch(() => {});
    api.get('/testimonials').then((r) => setReviews(r.data.slice(0, 8))).catch(() => {});
  }, []);

  return (
    <>
      {/* ---------------- HERO (navbar is inside it) ---------------- */}
      <section className="hero">
        <div className="orb orb-a" /><div className="orb orb-b" /><div className="orb orb-c" />
        <Header />
        <div className="container hero-body">
          <div className="hero-text">
            <motion.span className="eyebrow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              ✨ New arrivals every week
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}>
              Elegance in <span className="grad">every thread</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }}>
              Sarees, kurti sets, tops, leggings and pants, hand-picked for you by Nadulshree Boutique.
            </motion.p>
            <motion.div className="hero-cta" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Link to="/shop" className="btn btn-orange btn-lg">Shop Now <FiArrowRight /></Link>
              <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-lg">
                <FaInstagram /> @{instagram}
              </a>
            </motion.div>
            <motion.ul className="hero-chips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              {/* <li>Cash on Delivery</li> */}<li>Online Payment</li><li>Order Tracking</li>
            </motion.ul>
          </div>

          <div className="collage" aria-hidden>
            <motion.div className="collage-ring" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 40, ease: 'linear' }} />
            <motion.figure className="col-main" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <img src={IMG.heroMain} alt="" onError={(e) => { e.currentTarget.style.opacity = 0; }} />
            </motion.figure>
            <motion.figure className="col-a" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0, y: [0, -10, 0] }} transition={{ opacity: { delay: 0.5 }, x: { delay: 0.5 }, y: { repeat: Infinity, duration: 5, ease: 'easeInOut' } }}>
              <img src={IMG.heroLeft} alt="" onError={(e) => { e.currentTarget.style.opacity = 0; }} />
            </motion.figure>
            <motion.figure className="col-b" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0, y: [0, 10, 0] }} transition={{ opacity: { delay: 0.7 }, x: { delay: 0.7 }, y: { repeat: Infinity, duration: 6, ease: 'easeInOut' } }}>
              <img src={IMG.heroRight} alt="" onError={(e) => { e.currentTarget.style.opacity = 0; }} />
            </motion.figure>
            <motion.div className="col-tag tag-1" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: 'spring' }}>New arrivals</motion.div>
            <motion.div className="col-tag tag-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: 'spring' }}>Secure Payment</motion.div>
          </div>
        </div>
      </section>

      {/* ---------------- TRUST STRIP ---------------- */}
      <section className="trust container">
        {TRUST.map(([Icon, title, text], i) => (
          <Reveal key={title} delay={i * 0.07} y={20}>
            <div className="trust-item"><span><Icon /></span><div><b>{title}</b><small>{text}</small></div></div>
          </Reveal>
        ))}
      </section>

      {/* Nexora Menswear highlight: opens /menswear */}
      <NexoraBanner />

      {/* ---------------- MARQUEE ---------------- */}
      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="marquee-set">
              {['Saree', '3 Piece Set Kurtis', '2 Piece Set', 'Single Top', 'Legging', 'Straight Cut Pant'].map((t) => (
                <span key={t + k}>{t} <b>✦</b></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- SHOP BY CATEGORY (coverflow) ---------------- */}
      <section className="cf-section">
        <Reveal>
          <div className="cf-head">
            <span className="cf-kicker">Collections</span>
            <h2>Shop by <em>Category</em></h2>
            <p>Explore our curated collections of handcrafted Indian fashion</p>
          </div>
        </Reveal>

        <div
          className="cf-stage"
          onMouseEnter={() => { cfPaused.current = true; }}
          onMouseLeave={() => { cfPaused.current = false; }}
          onTouchStart={(e) => { cfPaused.current = true; cfTouch.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - (cfTouch.current ?? 0);
            if (Math.abs(dx) > 40) cfGo(dx < 0 ? 1 : -1);
            cfTouch.current = null;
            setTimeout(() => { cfPaused.current = false; }, 4000);
          }}
        >
          <button type="button" className="cf-nav cf-prev" onClick={() => cfGo(-1)} aria-label="Previous category"><FiChevronLeft /></button>

          <div className="cf-track">
            {cats.map((c, i) => {
              const d = posOf(i);
              const hidden = Math.abs(d) > 2;
              return (
                <Link
                  key={c.id}
                  to={`/shop?category=${c.slug}`}
                  className={`cf-card ${d === 0 ? 'is-active' : ''}`}
                  data-pos={hidden ? 'x' : d}
                  aria-hidden={hidden}
                  tabIndex={hidden ? -1 : 0}
                  onClick={(e) => { if (d !== 0) { e.preventDefault(); setActive(i); } }}
                >
                  <img src={IMG.cat[c.slug]} alt={c.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span className="cf-shade" />
                  <span className="cf-text">
                    <b>{c.name}</b>
                    <small>{c.product_count} {c.product_count === 1 ? 'Design' : 'Designs'}</small>
                    <span className="cf-explore">Explore <FiArrowRight /></span>
                  </span>
                </Link>
              );
            })}
          </div>

          <button type="button" className="cf-nav cf-next" onClick={() => cfGo(1)} aria-label="Next category"><FiChevronRight /></button>
        </div>

        <div className="cf-dots">
          {cats.map((c, i) => (
            <button key={c.id} type="button" className={i === active ? 'on' : ''} onClick={() => setActive(i)} aria-label={c.name} />
          ))}
        </div>
      </section>

      {/* ---------------- FEATURED ---------------- */}
      <section className="section section-alt">
        <div className="container">
          <SectionHead kicker="Just in" text="Fresh from our boutique. Stock is limited, so grab your favourites early.">
            Fresh <em>picks</em>
          </SectionHead>
          {featured.length === 0
            ? <p className="muted center">Our collection is being updated. Please check back soon!</p>
            : <div className="grid-products">{featured.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div>}
          <div className="center mt"><Link to="/shop" className="btn btn-dark">View all products <FiArrowRight /></Link></div>
        </div>
      </section>

      {/* ---------------- HOW TO ORDER ---------------- */}
      <section className="section path-section">
        <div className="container">
          <SectionHead kicker="Simple & safe" text="From choosing your outfit to receiving it at home, ordering takes only a few minutes.">
            Order in <em>4 easy steps</em>
          </SectionHead>
          <div className="path">
            {STEPS.map(([Icon, title, text, tag], i) => (
              <Reveal key={title} delay={i * 0.12} className="path-cell">
                <div className="path-step">
                  <span className="path-no">0{i + 1}</span>
                  <span className="path-ic"><Icon /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <em>{tag}</em>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="center mt"><Link to="/shop" className="btn btn-orange btn-lg">Start shopping <FiArrowRight /></Link></div>
        </div>
      </section>

      {/* ---------------- PROMISE ---------------- */}
      <section className="section container">
        <div className="hc-promise">
          <Reveal x={-30}>
            <div className="hc-photos">
              <span className="hc-ring" />
              <img className="hc-pp1" src={IMG.promoA} alt="Colourful fabrics" loading="lazy" onError={(e) => { e.currentTarget.style.opacity = 0; }} />
              <img className="hc-pp2" src={IMG.promoB} alt="Festive outfits" loading="lazy" onError={(e) => { e.currentTarget.style.opacity = 0; }} />
              <span className="hc-badge">Festive<br />&amp; everyday</span>
            </div>
          </Reveal>
          <Reveal x={30}>
            <span className="kicker left">Our promise</span>
            <h2 className="hc-promise-title">Beautiful outfits, <em>delivered home</em></h2>
            <p className="lead">From a simple legging to a rich silk saree, every piece is checked before it is packed for you.</p>
            <div className="hc-points">
              <div className="hc-point"><span><FiTruck /></span><div><b>Free delivery</b><small>On orders above {inr(freeShippingAbove)}</small></div></div>
              {/* <div className="hc-point"><span><FiCreditCard /></span><div><b>Cash on Delivery</b><small>Pay when it arrives</small></div></div> */}
              <div className="hc-point"><span><FiCreditCard /></span><div><b>Secure online payment</b><small>UPI, cards, net banking</small></div></div>
              <div className="hc-point"><span><FiPackage /></span><div><b>Easy cancel</b><small>Any time before packing</small></div></div>
              <div className="hc-point"><span><FiCheckCircle /></span><div><b>Real photos</b><small>Real stock, no surprises</small></div></div>
            </div>
            <Link to="/about" className="btn btn-dark btn-lg">Our story <FiArrowRight /></Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------- WHY US ---------------- */}
      <section className="section section-dark">
        <div className="container">
          <SectionHead kicker="Why Nadulshree" light>
            Shop with <em>confidence</em>
          </SectionHead>
          <div className="feature-grid">
            {WHY.map(([Icon, title, text], i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="feature"><span><Icon /></span><h3>{title}</h3><p>{text}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- INSTAGRAM ---------------- */}
      <section className="section container">
        <Reveal>
          <div className="insta-banner">
            <div className="insta-glow" />
            <motion.div className="insta-icon" animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 4 }}><FaInstagram /></motion.div>
            <div className="insta-text">
              <span className="eyebrow">Where the magic happens</span>
              <h2>We sell on Instagram <span className="grad">@{instagram}</span></h2>
              <p>New arrivals, live stock updates and offers are posted first on our Instagram. Follow us and send a DM to order.</p>
            </div>
            <div className="insta-actions">
              <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" className="btn btn-orange"><FaInstagram /> Follow us</a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="btn btn-ghost"><FaWhatsapp /> WhatsApp</a>
            </div>
          </div>
        </Reveal>
        <div className="insta-grid">
          {IMG.insta.map((src, i) => (
            <Reveal key={src} delay={i * 0.06} y={20}>
              <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" className="insta-tile" aria-label="Open Instagram">
                <img src={src} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.opacity = 0; }} />
                <span><FaInstagram /></span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- HAPPY CUSTOMERS (testimonial spotlight) ---------------- */}
      {reviews.length > 0 && (
        <>
          <TestimonialSpotlight reviews={reviews} onOpenImage={setZoom} />
          <div className="tm-all"><Link to="/happy-customers" className="btn btn-dark">See all feedback <FiArrowRight /></Link></div>
        </>
      )}

      {/* ---------------- NEED HELP CTA ---------------- */}
      <section className="hc-help">
        <div className="container">
          <Reveal>
            <div className="hc-help-card">
              <div className="hc-help-text">
                <span className="eyebrow">We are one message away</span>
                <h2>Need help choosing? <span className="grad">Message us!</span></h2>
                <p>Not sure about size, colour or fabric? Send us a message and we will help you pick the perfect outfit.</p>
                <div className="hc-help-tags">
                  {HELP_TAGS.map((t) => <span key={t}>{t}</span>)}
                </div>
                <Link to="/shop" className="btn btn-orange btn-lg">Browse the shop <FiArrowRight /></Link>
              </div>

              <div className="hc-help-links">
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="hc-link hc-wa">
                  <span className="hc-link-ic"><FaWhatsapp /></span>
                  <div><b>Chat on WhatsApp</b><small>Quick replies, personal help</small></div>
                  <FiArrowUpRight />
                </a>
                <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" className="hc-link hc-ig">
                  <span className="hc-link-ic"><FaInstagram /></span>
                  <div><b>DM on Instagram</b><small>@{instagram}</small></div>
                  <FiArrowUpRight />
                </a>
                <Link to="/contact" className="hc-link hc-ct">
                  <span className="hc-link-ic"><FiMail /></span>
                  <div><b>Contact page</b><small>Send us a detailed message</small></div>
                  <FiArrowUpRight />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
            {/* ---------------- FLOATING CONTACT ICONS (bottom right) ---------------- */}
      <div className="fab-wrap">
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="fab fab-wa"
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
        >
          <FaWhatsapp />
        </a>
        <a
          href={`https://instagram.com/${instagram}`}
          target="_blank"
          rel="noreferrer"
          className="fab fab-ig"
          aria-label="Follow on Instagram"
          title="Follow on Instagram"
        >
          <FaInstagram />
        </a>
      </div>

      <Lightbox src={zoom} onClose={() => setZoom('')} />

      <Lightbox src={zoom} onClose={() => setZoom('')} />
    </>
  );
}