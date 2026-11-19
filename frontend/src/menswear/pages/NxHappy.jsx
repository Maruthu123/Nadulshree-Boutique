import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiStar,
  FiX,
  FiCamera,
  FiCheckCircle,
  FiThumbsUp,
  FiUser,
  FiArrowUpRight,
  FiSend,
  FiMaximize2,
} from 'react-icons/fi';
import ImageUploader from '../../components/ImageUploader';
import { useAuth } from '../../context/AuthContext';
import api, { errMsg, fmtDate, imgSrc } from '../../api';
import { R, Mosaic } from '../NxBits';
import { NX_IMG } from '../data/nxImages';
import { useNx } from '../nxUtils';
import { FaInstagram } from 'react-icons/fa';
import './NxHappy.css';

/* ---------------------------------------------------------
   HERO BACKGROUND PHOTO (online). Paste any other image link to change it.
--------------------------------------------------------- */
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=2000&q=80';

/* ---------------------------------------------------------
   YOUR CLIENT PHOTOS  -  ADD YOUR OWN HERE
   1. Put the photos in:  frontend/public/clients/   (ravi.jpg, arun.jpg ...)
   2. Add one line per client below:
        { src: '/clients/ravi.jpg', name: 'Ravi', city: 'Madurai', shirt: 'Navy formal shirt' },
   name, city and shirt are optional. Online image links also work.
   The lines below are SAMPLE pictures - replace them with your clients.
--------------------------------------------------------- */
const CLIENT_PHOTOS = [
  { src: NX_IMG.man1, name: '', city: '', shirt: 'Clean and sharp' },
  { src: NX_IMG.man2, name: '', city: '', shirt: 'Easy weekend' },
  { src: NX_IMG.man3, name: '', city: '', shirt: 'Function ready' },
  { src: NX_IMG.man4, name: '', city: '', shirt: 'Everyday cool' },
];

const MARQUEE = ['REAL PEOPLE', 'REAL PHOTOS', 'REAL FEEDBACK', 'HAPPY CUSTOMERS', 'NEXORA MENSWEAR'];

const TRUST = [
  { icon: FiCheckCircle, title: 'Verified', text: 'Only after delivery' },
  { icon: FiCamera, title: 'Photos', text: 'Wearing your shirt' },
  { icon: FiThumbsUp, title: 'Approved', text: 'By us before it shows' },
  { icon: FiUser, title: 'Yours', text: 'Remove it any time' },
];

const STEPS = [
  ['01', 'Order a shirt', 'Pay online and track it in My Orders.'],
  ['02', 'Get it delivered', 'The review box opens once your order is delivered.'],
  ['03', 'Write or add a photo', 'A few words and a photo wearing the shirt is perfect.'],
  ['04', 'We approve it', 'Your review then shows on this page and our Instagram.'],
];

const particles = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${(i * 43 + 5) % 96}%`,
  size: 3 + ((i * 5) % 6),
  duration: 9 + ((i * 3) % 9),
  delay: -((i * 1.7) % 12),
}));

const heroItem = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.15 + i * 0.12, ease: 'easeOut' },
  }),
};

const gridVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const Stars = ({ n = 5 }) => (
  <span className="nxh-stars" aria-label={`${n} out of 5 stars`}>
    {Array.from({ length: n }).map((_, k) => <FiStar key={k} />)}
  </span>
);

/* Kept as it was: other pages may import NxReview from this file. */
export function NxReview({ r, onImage }) {
  return (
    <div className={`nx-review ${r.image_url ? 'has-img' : ''}`}>
      {r.image_url && <button type="button" className="nx-review-img" onClick={() => onImage?.(imgSrc(r.image_url))} aria-label="Open photo"><img src={imgSrc(r.image_url)} alt={`Feedback from ${r.name}`} loading="lazy" /></button>}
      <div className="nx-review-body">
        <div className="nx-stars">{[...Array(r.rating)].map((_, k) => <FiStar key={k} />)}</div>
        {r.message && <p>“{r.message}”</p>}
        <b>{r.name}</b>{r.city && <small> · {r.city}</small>}
        <small className="nx-muted nx-d">{fmtDate(r.created_at)}</small>
      </div>
    </div>
  );
}

/* the new review card used on this page */
function ReviewCard({ r, onImage }) {
  const initial = (r.name || '?').trim().charAt(0).toUpperCase();
  return (
    <article className="nxh-review">
      {r.image_url && (
        <button type="button" className="nxh-review-img" onClick={() => onImage(imgSrc(r.image_url))} aria-label="Open photo">
          <img src={imgSrc(r.image_url)} alt={`Feedback from ${r.name}`} loading="lazy" />
          <span><FiMaximize2 /></span>
        </button>
      )}
      <div className="nxh-review-body">
        <span className="nxh-quote" aria-hidden="true">“</span>
        <Stars n={r.rating} />
        {r.message && <p>{r.message}</p>}
        <div className="nxh-who">
          <span className="nxh-avatar">{initial}</span>
          <div>
            <b>{r.name}</b>
            <small>{[r.city, fmtDate(r.created_at)].filter(Boolean).join(' · ')}</small>
          </div>
          <FiCheckCircle className="nxh-verified" title="Verified purchase" />
        </div>
      </div>
    </article>
  );
}

export default function NxHappy() {
  const { user } = useAuth();
  const nx = useNx();
  const [reviews, setReviews] = useState(null);
  const [form, setForm] = useState({ rating: 5, city: '', message: '', image_url: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState('');
  const [onlyPhotos, setOnlyPhotos] = useState(false);

  useEffect(() => { api.get('/testimonials', { params: { store: 'menswear' } }).then((r) => setReviews(r.data)).catch(() => setReviews([])); }, []);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError(''); setMsg('');
    try {
      const { data } = await api.post('/testimonials', { ...form, store: 'menswear' });
      setMsg(data.message); setForm({ rating: 5, city: '', message: '', image_url: '' });
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  const total = reviews ? reviews.length : 0;
  const average = total ? (reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / total).toFixed(1) : null;
  const withPhotos = reviews ? reviews.filter((r) => r.image_url).length : 0;
  const shown = reviews ? (onlyPhotos ? reviews.filter((r) => r.image_url) : reviews) : [];

  return (
    <main className="nxh-page">
      {/* ================= HERO ================= */}
      <section className="nxh-hero">
        <div className="nxh-hero-bg" aria-hidden="true">
          <img className="nxh-hero-photo" src={HERO_IMAGE} alt="" loading="eager" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="nxh-hero-shade" />
          <div className="nxh-hero-weave" />
          <div className="nxh-hero-aurora" />
        </div>

        <div className="nxh-particles" aria-hidden="true">
          {particles.map((p) => (
            <span key={p.id} style={{ left: p.left, width: p.size, height: p.size, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }} />
          ))}
        </div>

        <div className="nxh-hero-inner">
          <motion.div className="nxh-hero-copy" initial="hidden" animate="visible">
            <motion.div className="nxh-eyebrow" variants={heroItem} custom={0}>
              <span className="nxh-eyebrow-line" />
              REAL FEEDBACK
            </motion.div>

            <motion.h1 variants={heroItem} custom={1}>
              HAPPY
              <br />
              <span>CUSTOMERS.</span>
            </motion.h1>

            <motion.p variants={heroItem} custom={2}>
              Real words and photos from people who wore Nexora. Only reviews
              we have approved are shown here.
            </motion.p>

            <motion.div className="nxh-hero-actions" variants={heroItem} custom={3}>
              <a href="#nxh-reviews" className="nxh-btn-primary">READ REVIEWS <FiArrowUpRight /></a>
              <a href="#nxh-share" className="nxh-btn-ghost"><FiStar /> SHARE YOURS</a>
            </motion.div>
          </motion.div>

          {/* rating card */}
          <motion.div
            className="nxh-stage"
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
          >
            <div className="nxh-stage-glow" />
            <div className="nxh-stage-ring" />

            <motion.div className="nxh-rating" animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
              <span className="nxh-rating-label">CUSTOMER RATING</span>
              <strong>{average || '5.0'}</strong>
              <Stars n={5} />
              <small>{total ? `${total} approved review${total > 1 ? 's' : ''}` : 'Be our first review'}</small>

              <div className="nxh-faces">
                {CLIENT_PHOTOS.slice(0, 5).map((c, i) => (
                  <img key={`${c.src}-${i}`} src={c.src} alt="" loading="lazy" />
                ))}
                <span>+</span>
              </div>
            </motion.div>

            <motion.div className="nxh-pill nxh-pill-1" animate={{ y: [0, -10, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}>
              <FiCamera /> {withPhotos ? `${withPhotos} with photos` : 'Real photos'}
            </motion.div>
            <motion.div className="nxh-pill nxh-pill-2" animate={{ y: [0, -9, 0] }} transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}>
              <FiCheckCircle /> Verified buyers
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= MEASURING TAPE ================= */}
      <div className="nxh-marquee" aria-hidden="true">
        <div className="nxh-marquee-track">
          {[0, 1].map((g) => (
            <div className="nxh-marquee-group" key={g}>
              {[0, 1].map((rep) => MARQUEE.map((w) => <span key={`${g}-${rep}-${w}`}>{w}<i>✳</i></span>))}
            </div>
          ))}
        </div>
      </div>

      {/* ================= TRUST CARDS ================= */}
      <motion.section className="nxh-trust" variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
        {TRUST.map(({ icon: Icon, title, text }) => (
          <motion.div key={title} className="nxh-trust-card" variants={cardVariants} whileHover={{ y: -6 }}>
            <span className="nxh-trust-icon"><Icon /></span>
            <div><b>{title}</b><small>{text}</small></div>
          </motion.div>
        ))}
      </motion.section>

      {/* ================= CLIENT PHOTO GALLERY ================= */}
      {CLIENT_PHOTOS.length > 0 && (
        <section className="nxh-section">
          <div className="nxh-wrap">
            <motion.div className="nxh-head" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
              <span className="nxh-kicker">OUR CLIENTS</span>
              <h2>Seen in <span>Nexora</span></h2>
              <p>Our clients, wearing their favourite shirts. Tap a photo to see it bigger.</p>
            </motion.div>

            <motion.div className="nxh-gallery" variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              {CLIENT_PHOTOS.map((c, i) => (
                <motion.button
                  type="button"
                  key={`${c.src}-${i}`}
                  className="nxh-photo"
                  variants={cardVariants}
                  onClick={() => setZoom(c.src)}
                  aria-label={`Open photo ${c.name || i + 1}`}
                >
                  <img src={c.src} alt={c.name ? `${c.name} wearing Nexora` : 'Customer wearing Nexora'} loading="lazy" />
                  <span className="nxh-photo-cap">
                    <b>{c.name || 'Nexora customer'}</b>
                    <small>{[c.shirt, c.city].filter(Boolean).join(' · ')}</small>
                  </span>
                  <span className="nxh-photo-zoom"><FiMaximize2 /></span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ================= REVIEWS ================= */}
      <section className="nxh-section nxh-section-soft" id="nxh-reviews">
        <div className="nxh-wrap">
          <motion.div className="nxh-head nxh-head-row" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
            <div>
              <span className="nxh-kicker">WHAT THEY SAY</span>
              <h2>Words from <span>our people</span></h2>
            </div>

            <div className="nxh-filter" role="tablist" aria-label="Filter reviews">
              <button type="button" role="tab" aria-selected={!onlyPhotos} className={!onlyPhotos ? 'is-on' : ''} onClick={() => setOnlyPhotos(false)}>ALL</button>
              <button type="button" role="tab" aria-selected={onlyPhotos} className={onlyPhotos ? 'is-on' : ''} onClick={() => setOnlyPhotos(true)}><FiCamera /> WITH PHOTOS</button>
            </div>
          </motion.div>

          {reviews === null ? (
            <div className="nxh-skels"><i /><i /><i /></div>
          ) : shown.length === 0 ? (
            <motion.div className="nxh-empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="nxh-empty-icon"><FiStar /></span>
              <h3>{reviews.length === 0 ? 'Feedback will appear here' : 'No reviews with photos yet'}</h3>
              <p>{reviews.length === 0
                ? 'Customer feedback and photos are shown here. Be the first after your order is delivered!'
                : 'Try the All tab, or add a photo with your own review.'}</p>
              <a href="#nxh-share" className="nxh-btn-dark">WRITE A REVIEW <FiArrowUpRight /></a>
            </motion.div>
          ) : (
            <div className="nxh-reviews">
              {shown.map((r, i) => (
                <motion.div
                  key={r.id}
                  className="nxh-review-wrap"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: (i % 3) * 0.07 }}
                >
                  <ReviewCard r={r} onImage={setZoom} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="nxh-section">
        <div className="nxh-wrap">
          <R>
            <div className="nxh-head">
              <span className="nxh-kicker">HOW IT WORKS</span>
              <h2>Share in <span>4 steps</span></h2>
            </div>
          </R>

          <motion.div className="nxh-steps" variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {STEPS.map(([n, h, t]) => (
              <motion.div key={n} className="nxh-step" variants={cardVariants} whileHover={{ y: -6 }}>
                <b>{n}</b>
                <h3>{h}</h3>
                <p>{t}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= STYLE INSPIRATION ================= */}
      <section className="nxh-section nxh-section-soft">
        <div className="nxh-wrap">
          <R>
            <div className="nxh-head">
              <span className="nxh-kicker">STYLE INSPIRATION</span>
              <h2>Wear it <span>your way</span></h2>
            </div>
          </R>
          <Mosaic items={[
            { src: NX_IMG.man1, label: 'Clean and sharp', sub: 'Formal', color: 'Navy' },
            { src: NX_IMG.man2, label: 'Easy weekend', sub: 'Casual', color: 'Olive' },
            { src: NX_IMG.man3, label: 'Function ready', sub: 'Formal', color: 'White' },
            { src: NX_IMG.man4, label: 'Everyday cool', sub: 'Half sleeve', color: 'Mustard' },
            { src: NX_IMG.shirtG, label: 'Classic checks', sub: 'Checked', color: 'Maroon', pattern: 'check' },
            { src: NX_IMG.shirtC, label: 'Light linen', sub: 'Linen', color: 'Beige' },
          ]} />
          <div className="nxh-center">
            <a className="nxh-btn-dark" href={`https://instagram.com/${nx.instagram}`} target="_blank" rel="noreferrer"><FaInstagram /> SEE MORE ON @{nx.instagram}</a>
          </div>
        </div>
      </section>

      {/* ================= SHARE FORM ================= */}
      <section className="nxh-section" id="nxh-share">
        <div className="nxh-wrap nxh-narrow">
          <div className="nxh-head">
            <span className="nxh-kicker">YOUR TURN</span>
            <h2>Share your <span>experience</span></h2>
          </div>

          {!user ? (
            <div className="nxh-login">
              <span className="nxh-empty-icon"><FiUser /></span>
              <p>Please <Link to="/menswear/login" state={{ from: '/menswear/happy-customers' }} className="nxh-link">login</Link> to write a review. You can review after your order is delivered.</p>
            </div>
          ) : (
            <form className="nxh-panel" onSubmit={submit}>
              <span className="nxh-field-label">YOUR RATING</span>
              <div className="nxh-rate" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <motion.button
                    type="button"
                    key={n}
                    className={n <= form.rating ? 'on' : ''}
                    onClick={() => setForm((f) => ({ ...f, rating: n }))}
                    whileHover={{ scale: 1.18, rotate: -6 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`${n} star`}
                    aria-checked={n === form.rating}
                    role="radio"
                  >
                    <FiStar />
                  </motion.button>
                ))}
              </div>

              <div className="nxh-form">
                <label className="nxh-field">
                  <span>YOUR CITY (OPTIONAL)</span>
                  <input value={form.city} maxLength={80} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                </label>
                <label className="nxh-field">
                  <span>YOUR REVIEW <em>{form.message.length}/600</em></span>
                  <textarea rows={4} value={form.message} maxLength={600} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                </label>
              </div>

              <span className="nxh-field-label">ADD A PHOTO WEARING YOUR SHIRT (OPTIONAL)</span>
              {form.image_url ? (
                <div className="nxh-photo-prev">
                  <img src={imgSrc(form.image_url)} alt="Your photo" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, image_url: '' }))} aria-label="Remove photo"><FiX /></button>
                </div>
              ) : (
                <ImageUploader multiple={false} limit={1} label="Choose a photo" onUploaded={(urls) => setForm((f) => ({ ...f, image_url: urls[0] }))} />
              )}

              {msg && <p className="nxh-notice">{msg}</p>}
              {error && <p className="nxh-warn">{error}</p>}

              <button className="nxh-submit" disabled={busy || (!form.message.trim() && !form.image_url)}>
                {busy ? 'Sending...' : <>Submit review <FiSend /></>}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ================= LIGHTBOX ================= */}
      <AnimatePresence>
        {zoom && (
          <motion.div className="nxh-lightbox" onClick={() => setZoom('')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="nxh-lightbox-close" aria-label="Close photo" onClick={() => setZoom('')}><FiX /></button>
            <motion.img
              src={zoom}
              alt="Customer photo"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}