import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FiArrowRight, FiArrowUpRight, FiShield, FiTruck, FiMapPin, FiPlus, FiSearch, FiMessageCircle, FiPackage, FiStar } from 'react-icons/fi';
import NxProductCard from '../NxProductCard';
import ShirtArt from '../ShirtArt';
import { useNx, waLink, discount } from '../nxUtils';
import { NxReview } from './NxHappy';
import api, { errMsg, imgSrc, inr } from '../../api';

const EASE = [0.22, 1, 0.36, 1];

const TILES = {
  'formal-shirts': { color: 'White', pattern: 'plain', sleeve: 'long', tag: 'Office & functions' },
  'casual-shirts': { color: 'Olive', pattern: 'plain', sleeve: 'long', tag: 'Everyday easy' },
  'printed-shirts': { color: 'Black', pattern: 'print', sleeve: 'long', tag: 'Stand out' },
  'checked-shirts': { color: 'Maroon', pattern: 'check', sleeve: 'long', tag: 'Classic checks' },
  'linen-shirts': { color: 'Beige', pattern: 'stripe', sleeve: 'long', tag: 'Cool & breathable' },
  'half-sleeve-shirts': { color: 'Mustard', pattern: 'plain', sleeve: 'short', tag: 'Daily comfort' },
};

const MARQUEE = ['SOFT COTTON', 'BREATHABLE FABRIC', 'DURABLE QUALITY', 'PERFECT FIT', 'SIMPLE', 'CLASSY', 'ALWAYS'];

const asList = (d) => (Array.isArray(d) ? d : d?.testimonials || d?.reviews || d?.data || d?.products || []);

const Reveal = ({ children, delay = 0, className = '', from = 'up' }) => {
  const initial = from === 'left' ? { opacity: 0, x: -50 } : from === 'right' ? { opacity: 0, x: 50 } : { opacity: 0, y: 40 };
  const shown = from === 'up' ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 };
  return (
    <motion.div className={className} initial={initial} whileInView={shown} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, delay, ease: EASE }}>
      {children}
    </motion.div>
  );
};

const Words = ({ text, delay = 0, className = '' }) => (
  <span className={className} aria-label={text}>
    {text.split(' ').map((w, i) => (
      <span className="nh-wmask" key={w + i} aria-hidden>
        <motion.span className="nh-w" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: delay + i * 0.09, ease: EASE }}>
          {w}&nbsp;
        </motion.span>
      </span>
    ))}
  </span>
);

const SecTitle = ({ small, children }) => (
  <Reveal className="nh-title">
    <small>{small}</small>
    <h2>{children}</h2>
  </Reveal>
);

const Faq = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`nh-faq${open ? ' open' : ''}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>{q}</span><FiPlus />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} style={{ overflow: 'hidden' }}>
            <p className="nh-faq-a">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function NxHome() {
  const nx = useNx();
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [loadErr, setLoadErr] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    api.get('/categories', { params: { store: 'menswear' } }).then((r) => setCats(asList(r.data))).catch(() => {});
    api.get('/testimonials', { params: { store: 'menswear' } }).then((r) => setReviews(asList(r.data).slice(0, 3))).catch(() => setReviews([]));
    api.get('/products', { params: { store: 'menswear', limit: 24 } })
      .then((r) => { setProducts(asList(r.data)); setLoadErr(''); })
      .catch((e) => { setProducts([]); setLoadErr(errMsg(e, 'Could not load the shirts.')); });
  }, [tick]);

  const list = products || [];
  const featured = list.filter((p) => p.is_featured);
  const pool = featured.length >= 4 ? featured : list;
  const grid = pool.slice(0, pool.length >= 4 ? Math.min(8, Math.floor(pool.length / 4) * 4) : pool.length);
  const withPhoto = list.filter((p) => p.images?.[0]);
  const heroA = withPhoto[0];
  const heroB = withPhoto[1];
  const star = featured.find((p) => p.images?.[0]) || withPhoto[2] || withPhoto[0];
  const strip = withPhoto.slice(0, 12);
  const catShot = (c) => list.find((p) => p.category_slug === c.slug && p.images?.[0]);
  const wa = waLink(nx.whatsapp, 'Hi Nexora Menswear, I need details about your shirts.');

  const faqs = [
    ['Can I ask about size or stock before buying?', 'Yes. Send the shirt you like on WhatsApp and we will confirm size, colour and stock for you.'],
    ['How do I pay?', 'Pay securely online with UPI, cards or net banking through Razorpay.'],
    ['How can I track my order?', 'Log in to your account and open My Orders to follow your parcel step by step.'],
    ['Where is the shop?', `We are based in ${nx.address}. You can also order online and we will deliver to you.`],
  ];

  return (
    <div className="nh">
      {/* 1. HERO */}
      <section className="nh-hero">
        <div className="nh-container nh-hero-grid">
          <div className="nh-hero-copy">
            <motion.span className="nh-eyebrow" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <i /> NEXORA MENSWEAR
            </motion.span>
            <h1 className="nh-h1">
              <Words text="Shirts that" delay={0.15} /><br />
              <Words text="speak" delay={0.4} className="nh-gold" /> <Words text="for you." delay={0.5} />
            </h1>
            <motion.p className="nh-lead" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }}>
              Soft cotton, perfect fit and styles for office, function and everyday wear. Simple. Classy. Always.
            </motion.p>
            <motion.div className="nh-btns" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.7 }}>
              <Link to="/menswear/shop" className="nh-btn nh-btn-gold">Shop shirts <FiArrowRight /></Link>
              <a className="nh-btn nh-btn-outline" href={wa} target="_blank" rel="noreferrer"><FaWhatsapp /> WhatsApp us</a>
            </motion.div>
            <motion.ul className="nh-trust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.8 }}>
              <li><FiShield /> Secure payment</li>
              <li><FiTruck /> Order tracking</li>
              <li><FaWhatsapp /> WhatsApp help</li>
            </motion.ul>
          </div>

          <motion.div className="nh-art" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1, ease: EASE }}>
            <div className="nh-arch">
              {heroA ? <img src={imgSrc(heroA.images[0])} alt={heroA.name} loading="eager" /> : <ShirtArt color="White" accent="#b8892a" />}
            </div>
            {heroB && (
              <Link to={`/menswear/product/${heroB.id}`} className="nh-round nh-bob" aria-label={heroB.name}>
                <img src={imgSrc(heroB.images[0])} alt="" loading="eager" />
              </Link>
            )}
            {heroA && (
              <Link to={`/menswear/product/${heroA.id}`} className="nh-chip nh-chip-price nh-bob">
                <small>Featured</small>
                <b>{heroA.name}</b>
                <span>{inr(heroA.price)}</span>
              </Link>
            )}
            <div className="nh-chip nh-chip-note">
              <FiStar /> Soft cotton · Perfect fit
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. MARQUEE */}
      <div className="nh-marquee" aria-hidden>
        <div className="nh-marquee-track">
          {[0, 1].map((k) => <span key={k}>{MARQUEE.map((t) => <em key={t + k}>{t}<i /></em>)}</span>)}
        </div>
      </div>

      {/* 3. BROWSE BY STYLE */}
      {cats.length > 0 && (
        <section className="nh-section">
          <div className="nh-container">
            <SecTitle small="Browse by style">Find your <span>shirt</span></SecTitle>
            <div className="nh-cats">
              {cats.map((c, i) => {
                const t = TILES[c.slug] || TILES['casual-shirts'];
                const shot = catShot(c);
                return (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: (i % 3) * 0.1, duration: 0.6, ease: EASE }}>
                    <Link to={`/menswear/shop?category=${c.slug}`} className="nh-cat">
                      <div className="nh-cat-img">
                        {shot ? <img src={imgSrc(shot.images[0])} alt="" loading="lazy" /> : <ShirtArt color={t.color} pattern={t.pattern} sleeve={t.sleeve} accent="#b8892a" />}
                      </div>
                      <div className="nh-cat-bar">
                        <div>
                          <h3>{c.name}</h3>
                          <small>{t.tag}{c.product_count ? ` · ${c.product_count} shirts` : ''}</small>
                        </div>
                        <span className="nh-cat-go"><FiArrowUpRight /></span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. TRENDING */}
      <section className="nh-section nh-alt">
        <div className="nh-container">
          <SecTitle small="Fresh picks">Trending <span>shirts</span></SecTitle>
          {products === null ? (
            <div className="nh-grid">{[...Array(4)].map((_, i) => <div key={i} className="nh-skel" />)}</div>
          ) : loadErr ? (
            <div className="nh-empty">
              <h3>Shirts could not be loaded</h3>
              <p>{loadErr} If the server was idle, wait about 30 seconds and try again.</p>
              <button type="button" className="nh-btn nh-btn-gold" onClick={() => { setProducts(null); setTick((t) => t + 1); }}>Try again</button>
            </div>
          ) : grid.length === 0 ? (
            <div className="nh-empty">
              <h3>New shirts are arriving soon</h3>
              <p>Message us on WhatsApp and we will show you the latest collection.</p>
              <a className="nh-btn nh-btn-gold" href={waLink(nx.whatsapp, 'Hi Nexora Menswear, please share your latest shirts.')} target="_blank" rel="noreferrer"><FaWhatsapp /> Chat on WhatsApp</a>
            </div>
          ) : (
            <div className="nh-grid">{grid.map((p, i) => <NxProductCard key={p.id} p={p} index={i} />)}</div>
          )}
          {grid.length > 0 && <div className="nh-center"><Link to="/menswear/shop" className="nh-btn nh-btn-dark">View all shirts <FiArrowRight /></Link></div>}
        </div>
      </section>

      {/* 5. SHIRT OF THE WEEK */}
      {star && (
        <section className="nh-section">
          <div className="nh-container nh-split">
            <Reveal from="left" className="nh-split-img">
              <img src={imgSrc(star.images[0])} alt={star.name} loading="lazy" />
              {discount(star) > 0 && <span className="nh-off">{discount(star)}% OFF</span>}
            </Reveal>
            <Reveal from="right" className="nh-split-txt">
              <small className="nh-kick">SHIRT OF THE WEEK</small>
              <h2>{star.name}</h2>
              {star.description && <p className="nh-split-p">{star.description}</p>}
              <div className="nh-split-price">
                <b>{inr(star.price)}</b>
                {discount(star) > 0 && <s>{inr(star.mrp)}</s>}
              </div>
              <div className="nh-btns">
                <Link to={`/menswear/product/${star.id}`} className="nh-btn nh-btn-dark">View product <FiArrowRight /></Link>
                <a className="nh-btn nh-btn-wa" href={waLink(nx.whatsapp, `Hi Nexora Menswear, I want details about ${star.name}.`)} target="_blank" rel="noreferrer"><FaWhatsapp /> Ask on WhatsApp</a>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* 6. WHY NEXORA */}
      <section className="nh-section nh-alt">
        <div className="nh-container">
          <SecTitle small="Why Nexora">Shop with <span>confidence</span></SecTitle>
          <div className="nh-perks">
            {[
              [FiShield, 'Secure online payment', 'Pay with UPI, cards or net banking through Razorpay.'],
              [FaWhatsapp, 'Enquire on WhatsApp', 'Ask about size, colour or stock on any shirt before you buy.'],
              [FiTruck, 'Order tracking', 'Follow your parcel step by step from your account.'],
              [FiMapPin, 'Local shop, trusted', `Based in ${nx.address}.`],
            ].map(([Icon, h, t], i) => (
              <Reveal key={h} delay={i * 0.09} className="nh-perk">
                <b className="nh-perk-n">0{i + 1}</b>
                <span className="nh-perk-ic"><Icon /></span>
                <h3>{h}</h3>
                <p>{t}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. HOW TO ORDER */}
      <section className="nh-section nh-dark">
        <div className="nh-container">
          <SecTitle small="Simple process">How to <span>order</span></SecTitle>
          <div className="nh-steps">
            {[
              [FiSearch, 'Pick your shirt', 'Browse styles, colours and sizes in the shop.'],
              [FiMessageCircle, 'Ask or pay', 'Confirm details on WhatsApp, or pay online in a minute.'],
              [FiPackage, 'Get it delivered', 'Track your order from your account until it reaches you.'],
            ].map(([Icon, h, t], i) => (
              <Reveal key={h} delay={i * 0.12} className="nh-step">
                <span className="nh-step-ic"><Icon /></span>
                <b>Step 0{i + 1}</b>
                <h3>{h}</h3>
                <p>{t}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. LOOKBOOK STRIP */}
      {strip.length >= 3 && (
        <section className="nh-section nh-tightb">
          <div className="nh-container"><SecTitle small="Lookbook">Style it <span>your way</span></SecTitle></div>
          <div className="nh-strip">
            {strip.map((p) => (
              <Link key={p.id} to={`/menswear/product/${p.id}`} className="nh-strip-i">
                <img src={imgSrc(p.images[0])} alt={p.name} loading="lazy" />
                <span>{p.name}<b>{inr(p.price)}</b></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 9. REVIEWS (always shown) */}
      <section className="nh-section nh-alt" id="reviews">
        <div className="nh-container">
          <SecTitle small="Happy customers">What they <span>say</span></SecTitle>

          {reviews === null ? (
            <div className="nh-reviews">{[...Array(3)].map((_, i) => <div key={i} className="nh-skel wide" />)}</div>
          ) : reviews.length > 0 ? (
            <div className="nh-reviews">
              {reviews.map((r, i) => (
                <Reveal key={r.id ?? i} delay={i * 0.12} from={i === 0 ? 'left' : i === 2 ? 'right' : 'up'} className="nh-rv">
                  <NxReview r={r} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="nh-empty">
                <h3>Be our first reviewer</h3>
                <p>Bought a shirt from us? Share your feedback and help others choose.</p>
              </div>
            </Reveal>
          )}

          <div className="nh-center">
            <Link to="/menswear/happy-customers" className="nh-btn nh-btn-dark">
              {reviews && reviews.length > 0 ? 'More feedback' : 'Share your feedback'} <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="nh-section">
        <div className="nh-container nh-faq-wrap">
          <SecTitle small="Questions">Good to <span>know</span></SecTitle>
          <Reveal>{faqs.map(([q, a]) => <Faq key={q} q={q} a={a} />)}</Reveal>
        </div>
      </section>

      {/* 11. CTA */}
      <section className="nh-cta">
        <div className="nh-cta-glow" aria-hidden />
        <div className="nh-container">
          <Reveal>
            <small>NEED HELP CHOOSING?</small>
            <h2>Can't decide? <span>Talk to us.</span></h2>
            <p>Send the shirt you like on WhatsApp or Instagram and we will help you with size, colour and delivery.</p>
            <div className="nh-btns nh-btns-c">
              <a className="nh-btn nh-btn-gold nh-btn-lg" href={wa} target="_blank" rel="noreferrer"><FaWhatsapp /> WhatsApp {nx.whatsapp.slice(-10)}</a>
              <a className="nh-btn nh-btn-line nh-btn-lg" href={`https://instagram.com/${nx.instagram}`} target="_blank" rel="noreferrer"><FaInstagram /> @{nx.instagram}</a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}