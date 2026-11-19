import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import {
  FiMapPin,
  FiPhone,
  FiMessageSquare,
  FiCheck,
  FiSend,
  FiArrowUpRight,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { R, PhotoBand } from '../NxBits';
import { NX_IMG } from '../data/nxImages';
import { useNx, waLink } from '../nxUtils';
import api, { errMsg } from '../../api';
import './NxContact.css';

const TOPICS = ['Shirt enquiry', 'Size help', 'Order or delivery', 'Function / bulk order', 'Something else'];

/* Hero background photo (online). To change it, paste any other image link here. */
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=2000&q=80';

const MARQUEE = ['WHATSAPP', 'CALL US', 'VISIT THE SHOP', 'INSTAGRAM', 'SIZE HELP', 'NEXORA MENSWEAR'];

const THREAD = 'M30 310 C 90 110, 150 380, 205 210 S 320 40, 372 150';

const particles = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${(i * 41 + 6) % 96}%`,
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

const listVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const rowVariants = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

/** The text the shop owner receives on WhatsApp / SMS (the owner number comes from the website settings: 6383718976). */
const enquiryMessage = (f) => [
  'Hi Nexora Menswear, I have an enquiry.',
  `Name: ${f.name}`,
  `Mobile: ${f.phone}`,
  `Topic: ${f.topic}`,
  `Message: ${f.message}`,
].join('\n');

function ThreadArt() {
  return (
    <svg className="nxc-thread" viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <linearGradient id="nxcGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3dc9c" />
          <stop offset="0.5" stopColor="#c99a45" />
          <stop offset="1" stopColor="#96702f" />
        </linearGradient>
      </defs>

      {/* faint full path */}
      <path d={THREAD} fill="none" stroke="#e6c77a" strokeOpacity="0.2" strokeWidth="1.6" strokeDasharray="4 7" strokeLinecap="round" />

      {/* thread being sewn */}
      <path
        d={THREAD}
        pathLength="100"
        fill="none"
        stroke="url(#nxcGold)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="100"
        strokeDashoffset="100"
      >
        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="6s" repeatCount="indefinite" />
      </path>

      {/* needle */}
      <g>
        <path d="M-18 0 L16 0" stroke="url(#nxcGold)" strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="-13" cy="0" rx="3" ry="1.1" fill="#0b1018" />
        <circle cx="16" cy="0" r="2.2" fill="#fff4cf" />
        <animateMotion dur="6s" repeatCount="indefinite" rotate="auto" path={THREAD} />
      </g>
    </svg>
  );
}

export default function NxContact() {
  const nx = useNx();
  const [f, setF] = useState({ name: '', phone: '', topic: TOPICS[0], message: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null); // { text, saved }
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    const text = enquiryMessage(f);
    let saved = true;
    // 1) saved in the dashboard (Messages), tagged as Nexora Menswear
    try { await api.post('/contact', { name: f.name, phone: f.phone, message: `[Nexora Menswear] [${f.topic}] ${f.message}` }); }
    catch (err) { saved = false; setError(errMsg(err)); }
    // 2) the same enquiry goes to the owner on WhatsApp / SMS with one tap (works even if the server is asleep)
    setSent({ text, saved });
    setBusy(false);
    try { window.open(waLink(nx.whatsapp, text), '_blank', 'noopener'); } catch { /* the buttons below still work */ }
  };
  const ch = (e) => setF((x) => ({ ...x, [e.target.name]: e.target.value }));
  const smsHref = sent ? `sms:+${nx.whatsapp}?&body=${encodeURIComponent(sent.text)}` : '#';

  const waHref = waLink(nx.whatsapp, 'Hi Nexora Menswear, I need details about your shirts.');
  const callHref = `tel:+91${nx.phone2}`;
  const igHref = `https://instagram.com/${nx.instagram}`;

  const heroCards = [
    { id: 'wa', icon: FaWhatsapp, label: 'WHATSAPP', value: nx.whatsapp.slice(-10), href: waHref, ext: true, cls: 'nxc-card-1', dur: 5.4 },
    { id: 'call', icon: FiPhone, label: 'CALL', value: nx.phone2, href: callHref, ext: false, cls: 'nxc-card-2', dur: 6.3 },
    { id: 'ig', icon: FaInstagram, label: 'INSTAGRAM', value: `@${nx.instagram}`, href: igHref, ext: true, cls: 'nxc-card-3', dur: 5.8 },
  ];

  return (
    <main className="nxc-page">
      {/* ================= HERO ================= */}
      <section className="nxc-hero">
        <div className="nxc-hero-bg" aria-hidden="true">
          <img
            className="nxc-hero-photo"
            src={HERO_IMAGE}
            alt=""
            loading="eager"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="nxc-hero-shade" />
          <div className="nxc-hero-weave" />
          <div className="nxc-hero-aurora" />
          <div className="nxc-hero-grid" />
        </div>

        <div className="nxc-particles" aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              style={{ left: p.left, width: p.size, height: p.size, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }}
            />
          ))}
        </div>

        <div className="nxc-hero-inner">
          <motion.div className="nxc-hero-copy" initial="hidden" animate="visible">
            <motion.div className="nxc-eyebrow" variants={heroItem} custom={0}>
              <span className="nxc-eyebrow-line" />
              NEXORA MENSWEAR
            </motion.div>

            <motion.h1 variants={heroItem} custom={1}>
              LET'S TALK
              <br />
              <span>SHIRTS &amp; FIT.</span>
            </motion.h1>

            <motion.p variants={heroItem} custom={2}>
              Questions about a shirt, size or order? Message us on WhatsApp,
              call, or send an enquiry below.
            </motion.p>

            <motion.div className="nxc-hero-actions" variants={heroItem} custom={3}>
              <a href={waHref} target="_blank" rel="noreferrer" className="nxc-btn-primary">
                <FaWhatsapp /> WHATSAPP US
              </a>
              <a href="#nxc-form" className="nxc-btn-ghost">
                SEND ENQUIRY <FiArrowUpRight />
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            className="nxc-stage"
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.25, ease: 'easeOut' }}
          >
            <div className="nxc-stage-glow" />
            <div className="nxc-stage-ring" />
            <div className="nxc-stage-ring nxc-stage-ring-2" />
            <ThreadArt />

            {heroCards.map((c) => {
              const Icon = c.icon;
              return (
                <motion.a
                  key={c.id}
                  href={c.href}
                  className={`nxc-card ${c.cls}`}
                  target={c.ext ? '_blank' : undefined}
                  rel={c.ext ? 'noreferrer' : undefined}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: c.dur, repeat: Infinity, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.06 }}
                >
                  <span className="nxc-card-icon"><Icon /></span>
                  <span className="nxc-card-text">
                    <small>{c.label}</small>
                    <strong>{c.value}</strong>
                  </span>
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ================= MEASURING TAPE ================= */}
      <div className="nxc-marquee" aria-hidden="true">
        <div className="nxc-marquee-track">
          {[0, 1].map((g) => (
            <div className="nxc-marquee-group" key={g}>
              {[0, 1].map((rep) =>
                MARQUEE.map((w) => (
                  <span key={`${g}-${rep}-${w}`}>{w}<i>✳</i></span>
                ))
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ================= CONTACT + FORM ================= */}
      <section className="nxc-section">
        <div className="nxc-wrap nxc-two">
          <motion.div
            className="nxc-info"
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <span className="nxc-kicker">GET IN TOUCH</span>
            <h3>Talk to us</h3>

            <motion.a className="nxc-row nxc-row-wa" href={waHref} target="_blank" rel="noreferrer" variants={rowVariants}>
              <span className="nxc-row-icon"><FaWhatsapp /></span>
              <div><b>WhatsApp</b><small>{nx.whatsapp.slice(-10)}</small></div>
              <FiArrowUpRight className="nxc-row-arrow" />
            </motion.a>

            <motion.a className="nxc-row" href={callHref} variants={rowVariants}>
              <span className="nxc-row-icon"><FiPhone /></span>
              <div><b>Call</b><small>{nx.phone2}</small></div>
              <FiArrowUpRight className="nxc-row-arrow" />
            </motion.a>

            <motion.a className="nxc-row nxc-row-ig" href={igHref} target="_blank" rel="noreferrer" variants={rowVariants}>
              <span className="nxc-row-icon"><FaInstagram /></span>
              <div><b>Instagram</b><small>@{nx.instagram}</small></div>
              <FiArrowUpRight className="nxc-row-arrow" />
            </motion.a>

            <motion.div className="nxc-row nxc-row-static" variants={rowVariants}>
              <span className="nxc-row-icon"><FiMapPin /></span>
              <div><b>Address</b><small>{nx.address}</small></div>
            </motion.div>

            <p className="nxc-note">Fastest reply: WhatsApp. Your enquiry on the right also reaches us there.</p>
          </motion.div>

          {sent ? (
            <motion.div className="nxc-panel nxc-done" id="nxc-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="nxc-tick"><FiCheck /></span>
              <h3>{sent.saved ? 'Enquiry received' : 'Almost done'}</h3>
              <p className="nxc-muted">{sent.saved
                ? 'Thank you! Send it to us on WhatsApp now and we will reply as soon as we can.'
                : 'We could not save it on the website right now, but you can still send it to us directly.'}</p>
              <div className="nxc-done-actions">
                <a className="nxc-submit nxc-submit-wa" href={waLink(nx.whatsapp, sent.text)} target="_blank" rel="noreferrer"><FaWhatsapp /> Send on WhatsApp</a>
                <a className="nxc-outline" href={smsHref}><FiMessageSquare /> Send as SMS</a>
                <button type="button" className="nxc-link" onClick={() => { setSent(null); setError(''); setF({ name: '', phone: '', topic: TOPICS[0], message: '' }); }}>Write another enquiry</button>
              </div>
            </motion.div>
          ) : (
            <motion.form className="nxc-panel" id="nxc-form" onSubmit={submit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="nxc-kicker">ENQUIRY FORM</span>
              <h3>Send an enquiry</h3>

              <div className="nxc-form">
                <label className="nxc-field">
                  <span>YOUR NAME</span>
                  <input name="name" value={f.name} onChange={ch} required autoComplete="name" />
                </label>

                <label className="nxc-field">
                  <span>MOBILE NUMBER</span>
                  <input name="phone" value={f.phone} onChange={ch} required inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" autoComplete="tel-national" />
                </label>

                <div className="nxc-field">
                  <span>WHAT IS IT ABOUT?</span>
                  <div className="nxc-chips" role="radiogroup" aria-label="Topic">
                    {TOPICS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={f.topic === t}
                        className={`nxc-chip ${f.topic === t ? 'is-on' : ''}`}
                        onClick={() => setF((x) => ({ ...x, topic: t }))}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="nxc-field">
                  <span>MESSAGE</span>
                  <textarea name="message" rows={4} value={f.message} onChange={ch} required minLength={5} placeholder="Shirt name, size, colour or your question" />
                </label>
              </div>

              {error && <p className="nxc-warn">{error}</p>}

              <button className="nxc-submit" disabled={busy}>
                {busy ? 'Sending...' : <>Send enquiry <FiSend /></>}
              </button>
              <p className="nxc-note nxc-note-dark">After you send, WhatsApp opens with your message ready for us.</p>
            </motion.form>
          )}
        </div>
      </section>

      {/* ================= MAP + QUICK ANSWERS ================= */}
      <section className="nxc-section nxc-section-tight">
        <div className="nxc-wrap nxc-two">
          <R className="nxc-map">
            <div className="nxc-map-frame">
              <iframe title="Nexora Menswear on the map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(nx.address)}&output=embed`} />
              <span className="nxc-corner nxc-corner-tl" />
              <span className="nxc-corner nxc-corner-br" />
            </div>
          </R>

          <R delay={0.1} className="nxc-panel nxc-quick">
            <span className="nxc-kicker">GOOD TO KNOW</span>
            <h3>Quick answers</h3>
            <ul className="nxc-list">
              {[
                ['Fastest reply', 'WhatsApp. Send the shirt name or photo and your size.'],
                ['Order help', 'Open My Orders to track, pay again or cancel before it is packed.'],
                ['Payment', 'Online only: UPI, cards, net banking.'],
                ['Damaged shirt', 'WhatsApp photos within 48 hours of delivery.'],
              ].map(([h, t], i) => (
                <li key={h}>
                  <span className="nxc-num">{String(i + 1).padStart(2, '0')}</span>
                  <div><b>{h}.</b> {t}</div>
                </li>
              ))}
            </ul>
            <div className="nxc-links">
              <Link to="/menswear/faq" className="nxc-outline">Read the FAQ <FiArrowUpRight /></Link>
              <Link to="/menswear/terms" className="nxc-outline">Terms &amp; cancellation <FiArrowUpRight /></Link>
            </div>
          </R>
        </div>
      </section>

      <PhotoBand src={NX_IMG.shirtsFolded} kicker="VISIT OR MESSAGE" title="We are easy to reach" text={`Find us at ${nx.address}. Not nearby? WhatsApp us and we will send the shirt to your door.`} />
    </main>
  );
}