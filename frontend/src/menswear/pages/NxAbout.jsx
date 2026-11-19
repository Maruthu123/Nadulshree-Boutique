import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiAward, FiHeart, FiMapPin, FiScissors, FiCheck, FiShoppingBag, FiPackage, FiTruck, FiMessageCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import NxPhoto from '../NxPhoto';
import { NX_IMG } from '../data/nxImages';
import { useNx, waLink } from '../nxUtils';
import { useShowcase } from '../NxPageHead';
import { imgSrc } from '../../api';
import './NxAbout.css';

const FABRICS = [
  ['Cotton', 'Soft and easy for everyday wear. Gets better with every wash.'],
  ['Poplin', 'Crisp, smooth and sharp. The first choice for office and functions.'],
  ['Linen', 'Light and airy for hot days. A relaxed, natural crease is part of the look.'],
  ['Blends', 'Cotton mixed with a little polyester for prints and checks that hold their shape.'],
];
const CARE = [
  'Wash dark colours inside out in cold water.',
  'Dry in shade, not in direct sun, to keep the colour.',
  'Iron on the reverse side. Linen is best ironed slightly damp.',
  'Hang formal shirts on a hanger as soon as they are dry.',
];
const STYLES = [
  ['Formal', 'Office & functions', NX_IMG.shirtA, 'Navy', undefined],
  ['Casual', 'Everyday easy', NX_IMG.shirtB, 'Olive', undefined],
  ['Printed', 'Stand out', NX_IMG.shirtD, 'Black', 'print'],
  ['Checked', 'Classic checks', NX_IMG.shirtG, 'Maroon', 'check'],
  ['Linen', 'Cool & breathable', NX_IMG.shirtC, 'Beige', 'stripe'],
  ['Half sleeve', 'Daily comfort', NX_IMG.shirtE, 'Mustard', undefined],
];
const WORDS = ['ONLY SHIRTS', 'FIT FIRST', 'GOOD FABRIC', 'HONEST PRICES', 'TRACK YOUR ORDER'];

/* ---------- scroll reveal (safe, no hidden content) ---------- */
function Reveal({ as: Tag = 'div', delay = 0, className = '', children }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setOn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect(); }
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`ab-rv ${on ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </Tag>
  );
}

/* ---------- SEO (no extra package needed) ---------- */
function useSeo({ title, description, path, ld }) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    const url = window.location.origin + path;
    const made = [];
    const setMeta = (attr, key, val) => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); made.push(el); }
      el.setAttribute('content', val);
    };
    setMeta('name', 'description', description);
    setMeta('name', 'robots', 'index, follow');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:card', 'summary_large_image');
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); made.push(link); }
    link.href = url;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(ld(url));
    document.head.appendChild(script);
    return () => { document.title = prevTitle; script.remove(); made.forEach((n) => n.remove()); };
  }, [title, description, path]); // eslint-disable-line
}

/* ---------- count-up number ---------- */
function Count({ to, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') { setV(to); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1400, 1);
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{Number(v).toLocaleString('en-IN')}{suffix}</span>;
}

export default function NxAbout() {
  const nx = useNx();
  const photos = useShowcase(3);

  useSeo({
    title: 'About Nexora Menswear | Men’s Shirt Shop in Thiruchuli, Tamil Nadu',
    description: 'Nexora Menswear is a shirt-only store in Thiruchuli, Tamil Nadu. Formal, casual, printed, checked and linen shirts with size help on WhatsApp, secure online payment and order tracking.',
    path: '/menswear/about',
    ld: (url) => ({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'AboutPage', name: 'About Nexora Menswear', url, about: { '@id': `${url.replace('/about', '')}#store` } },
        {
          '@type': 'ClothingStore',
          '@id': `${url.replace('/about', '')}#store`,
          name: 'Nexora Menswear',
          url: url.replace('/about', ''),
          description: 'Men’s shirt-only store in Thiruchuli, Tamil Nadu. Formal, casual, printed, checked and linen shirts with online ordering and delivery.',
          address: { '@type': 'PostalAddress', addressLocality: 'Thiruchuli', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
          ...(nx?.whatsapp ? { telephone: `+${String(nx.whatsapp).replace(/\D/g, '')}` } : {}),
          paymentAccepted: 'UPI, Credit Card, Debit Card, Net Banking',
          areaServed: 'Tamil Nadu, India',
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: url.replace('/menswear/about', '/menswear') },
            { '@type': 'ListItem', position: 2, name: 'About', item: url },
          ],
        },
      ],
    }),
  });

  const collage = photos.length >= 2
    ? photos.slice(0, 3).map((p) => ({ key: p.id, img: imgSrc(p.images[0]), alt: `${p.name} - Nexora Menswear shirt`, cap: p.name }))
    : [NX_IMG.man1, NX_IMG.shirtA, NX_IMG.man2].map((src, i) => ({ key: src, src, color: ['Navy', 'Maroon', 'Olive'][i], alt: 'Men’s shirt - Nexora Menswear Thiruchuli' }));

  return (
    <div className="ab-root">
      {/* ===== HERO ===== */}
      <header className="abh">
        <img className="abh-bg" src={NX_IMG.store} alt="" loading="eager" />
        <div className="abh-shade" />
        <div className="abh-glow g1" /><div className="abh-glow g2" />
        <div className="nx-container abh-in">
          <nav className="abh-crumb" aria-label="Breadcrumb"><Link to="/menswear">Home</Link><span>/</span><b>About</b></nav>
          <span className="abh-kicker"><i /> OUR STORY</span>
          <h1 className="abh-title">About <em>Nexora</em></h1>
          <p className="abh-sub">A shirt-only shop from {nx.address}. We pick every piece for fit, fabric and finish, and we are always one WhatsApp message away.</p>
          <div className="abh-cta">
            <Link to="/menswear/shop" className="nx-btn nx-btn-lg"><FiShoppingBag /> Shop shirts</Link>
            <a className="nx-btn nx-btn-lg nx-btn-wa" href={waLink(nx.whatsapp, 'Hi Nexora Menswear, I need help choosing a shirt.')} target="_blank" rel="noreferrer"><FaWhatsapp /> Ask on WhatsApp</a>
          </div>
        </div>
        <svg className="abh-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,50 C300,0 520,90 760,40 C1000,0 1220,70 1440,30 L1440,80 L0,80 Z" />
        </svg>
      </header>

      {/* ===== STORY ===== */}
      <section className="nx-section" aria-labelledby="ab-story">
        <div className="nx-container ab-story">
          <Reveal className="ab-collage">
            <div className="ab-collage-in">
              {collage.map((c, i) => (
                <figure key={c.key} className={`ab-ph p${i}`}>
                  {c.img ? <img src={c.img} alt={c.alt} loading="lazy" /> : <NxPhoto src={c.src} alt={c.alt} color={c.color} />}
                  {c.cap && <figcaption>{c.cap}</figcaption>}
                </figure>
              ))}
              <span className="ab-ring" aria-hidden="true" />
              <span className="ab-badge"><FiMapPin /><b>Thiruchuli</b><small>Tamil Nadu</small></span>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="ab-story-txt">
            <span className="ab-eyebrow">Who we are</span>
            <h2 id="ab-story" className="ab-h2">Only shirts. <span>Done right.</span></h2>
            <p>Nexora Menswear is a shirt shop from {nx.address}. We do one thing: shirts for every mood, from sharp formals for office and functions to easy casuals, bold prints, checks and breathable linen.</p>
            <p>We pick every shirt for fit, fabric and finish. Not sure about size or colour? Send us a message, we will help you choose before you pay.</p>
            <ul className="ab-ticks">
              <li><FiCheck /> Size guide on every shirt</li>
              <li><FiCheck /> Secure online payment</li>
              <li><FiCheck /> Step by step order tracking</li>
            </ul>
            <div className="nx-cta">
              <Link to="/menswear/shop" className="nx-btn">Shop shirts <FiArrowRight /></Link>
              <Link to="/menswear/contact" className="nx-btn nx-btn-ghost">Contact us</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== TICKER ===== */}
      <div className="ab-ticker" aria-hidden="true">
        <div className="ab-ticker-track">
          {[...WORDS, ...WORDS, ...WORDS].map((w, i) => (<span key={i}>{w}<i>✦</i></span>))}
        </div>
      </div>

      {/* ===== FACTS ===== */}
      <section className="nx-section nx-tight" aria-label="Nexora at a glance">
        <div className="nx-container ab-facts">
          {[
            [<Count key="a" to={6} />, 'shirt styles'],
            [<Count key="b" to={Number(nx.freeShippingAbove) || 0} prefix="₹" />, 'free delivery above'],
            ['UPI · Cards', 'secure online payment'],
            ['Step by step', 'order tracking'],
          ].map(([n, l], i) => (
            <Reveal key={l} delay={i * 0.08} className="ab-fact"><strong>{n}</strong><p>{l}</p></Reveal>
          ))}
        </div>
      </section>

      {/* ===== STYLES ===== */}
      <section className="nx-section nx-alt" aria-labelledby="ab-styles">
        <div className="nx-container">
          <Reveal><h2 className="nx-title" id="ab-styles"><small>Styles</small>One shirt for <span>every mood</span></h2></Reveal>
          <div className="ab-styles">
            {STYLES.map(([h, sub, src, color, pattern], i) => (
              <Reveal key={h} delay={(i % 3) * 0.08} className="ab-sty">
                <Link to="/menswear/shop" aria-label={`Shop ${h} shirts`}>
                  <div className="ab-sty-ph"><NxPhoto src={src} alt={`${h} men’s shirt - Nexora Menswear`} color={color} pattern={pattern} /></div>
                  <div className="ab-sty-t">
                    <h3>{h}</h3>
                    <p>{sub}</p>
                    <em>Shop now <FiArrowRight /></em>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROMISE ===== */}
      <section className="nx-section" aria-labelledby="ab-promise">
        <div className="nx-container">
          <Reveal><h2 className="nx-title" id="ab-promise"><small>What we stand for</small>Our <span>promise</span></h2></Reveal>
          <div className="ab-promise">
            {[
              [FiScissors, 'Fit first', 'Size guide on every shirt and help on WhatsApp so it fits right.'],
              [FiAward, 'Quality fabric', 'Soft cotton, crisp formals and cool linen, chosen to last.'],
              [FiHeart, 'Honest prices', 'Clear price and discount on every shirt, no hidden charges.'],
              [FiMapPin, 'Local & reachable', `Find us at ${nx.address}. Call or message any time.`],
            ].map(([Icon, h, t], i) => (
              <Reveal key={h} delay={i * 0.08} className="ab-pcard">
                <article>
                  <div className="ab-pico"><Icon /></div>
                  <h3>{h}</h3>
                  <p>{t}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FABRIC & CARE ===== */}
      <section className="nx-section nx-alt" aria-labelledby="ab-fabric">
        <div className="nx-container">
          <Reveal><h2 className="nx-title" id="ab-fabric"><small>Know your shirt</small>Fabric &amp; <span>care</span></h2></Reveal>
          <div className="ab-fc">
            <div className="ab-fabrics">
              {FABRICS.map(([h, t], i) => (
                <Reveal key={h} delay={i * 0.08} className="ab-fab">
                  <article><div className="ab-fab-l">{h[0]}</div><div><h3>{h}</h3><p>{t}</p></div></article>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.1} className="ab-care">
              <div className="ab-care-in">
                <h3>Make it last</h3>
                <ol>{CARE.map((t) => <li key={t}>{t}</li>)}</ol>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="nx-section" aria-labelledby="ab-how">
        <div className="nx-container">
          <Reveal><h2 className="nx-title" id="ab-how"><small>Simple and clear</small>How it <span>works</span></h2></Reveal>
          <ol className="ab-tl">
            {[
              [FiShoppingBag, 'Pick your shirt', 'Browse by style, check the size chart and colours on every shirt.'],
              [FiMessageCircle, 'Ask or order', 'Add to cart and pay online, or send us a WhatsApp message first.'],
              [FiPackage, 'We pack and send', `Your shirt is packed at ${nx.address} and sent to your address.`],
              [FiTruck, 'Track to your door', 'Follow every step in My Orders until it is delivered.'],
            ].map(([Icon, h, t], i) => (
              <Reveal as="li" key={h} className={`ab-tl-i ${i % 2 ? 'r' : 'l'}`}>
                <span className="ab-tl-dot"><Icon /></span>
                <div className="ab-tl-card"><span className="ab-tl-n">{String(i + 1).padStart(2, '0')}</span><h3>{h}</h3><p>{t}</p></div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="ab-final">
        <img src={NX_IMG.rack} alt="" loading="lazy" />
        <div className="ab-final-shade" />
        <Reveal className="ab-final-in">
          <span className="ab-eyebrow">READY WHEN YOU ARE</span>
          <h2>Find the shirt that fits <span>your mood</span></h2>
          <p>Wedding, office, a day out or a function: there is a Nexora shirt for it.</p>
          <div className="nx-cta center">
            <Link to="/menswear/shop" className="nx-btn nx-btn-lg"><FiShoppingBag /> See the collection</Link>
            <a className="nx-btn nx-btn-lg nx-btn-wa" href={waLink(nx.whatsapp, 'Hi Nexora Menswear, I need help choosing a shirt.')} target="_blank" rel="noreferrer"><FaWhatsapp /> Ask on WhatsApp</a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}