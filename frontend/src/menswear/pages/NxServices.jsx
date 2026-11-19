import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCreditCard, FiTruck, FiSliders, FiShoppingBag, FiGift, FiMapPin, FiRefreshCcw, FiShield, FiScissors, FiMessageCircle, FiPackage, FiPlus, FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import NxPhoto from '../NxPhoto';
import { NX_IMG } from '../data/nxImages';
import { useNx, waLink } from '../nxUtils';
import { REFUND_DAYS } from '../data/nxTerms';
import './NxServices.css';

const SERVICES = [
  [FaWhatsapp, 'WhatsApp enquiry', 'Ask about size, colour, stock or price on any shirt. The message is filled for you with one tap.'],
  [FiCreditCard, 'Secure online payment', 'Pay by UPI, cards or net banking through Razorpay. Your order is confirmed right after payment.'],
  [FiTruck, 'Order tracking', 'Follow your parcel step by step in My Orders: packed, shipped, out for delivery, delivered.'],
  [FiSliders, 'Size guidance', 'Chest, length and shoulder chart on every shirt. Still unsure? We will help you on WhatsApp.'],
  [FiGift, 'Occasion shirts', 'Wedding, function, office or party: tell us the occasion and we will suggest the right shirt.'],
  [FiMapPin, 'Delivery to your door', 'We pack and send from Thiruchuli to your address. Free delivery above the order value shown at checkout.'],
  [FiRefreshCcw, 'Easy cancellation', `Cancel from My Orders before it is packed. Paid orders are refunded in ${REFUND_DAYS}.`],
  [FiShield, 'Damaged item help', 'Got a damaged or wrong shirt? Send photos on WhatsApp within 48 hours and we will sort it out.'],
  [FiScissors, 'Function & bulk orders', 'Shirts for a group, a team or a family function? Message us for sizes and a combined order.'],
];
const PV = [
  [NX_IMG.rack, 'Navy'], [NX_IMG.shirtA, 'Maroon'], [NX_IMG.man1, 'Olive'], [NX_IMG.shirtB, 'Beige'], [NX_IMG.man3, 'White'],
  [NX_IMG.store, 'Navy'], [NX_IMG.shirtC, 'Mustard'], [NX_IMG.shirtD, 'Black'], [NX_IMG.man2, 'Olive'],
];

const OCCASIONS = [
  ['Office', 'Plain and fine-striped formals in crisp poplin.', NX_IMG.shirtA, 'Navy', 'stripe'],
  ['Wedding & function', 'Light, bright formals that photograph well.', NX_IMG.man3, 'White', 'plain'],
  ['Weekend & outings', 'Easy casuals and checks you can wear all day.', NX_IMG.shirtG, 'Maroon', 'check'],
  ['Hot days', 'Breathable linen and half sleeves for the Tamil Nadu sun.', NX_IMG.shirtC, 'Beige', 'plain'],
];

const STEPS = [
  [FiShoppingBag, 'Pick a shirt', 'Browse the shop or tell us the occasion.'],
  [FiMessageCircle, 'Confirm size', 'Check the size chart or ask us on WhatsApp.'],
  [FiCreditCard, 'Pay online', 'UPI, card or net banking. Order confirmed instantly.'],
  [FiPackage, 'Track & receive', 'Follow every step in My Orders until delivery.'],
];

const SIZES = [['S', '38', '28', '17'], ['M', '40', '29', '17.5'], ['L', '42', '30', '18'], ['XL', '44', '31', '18.5'], ['XXL', '46', '32', '19']];

const FAQS = [
  ['How do I order a shirt from Nexora Menswear?', 'Choose a shirt in the shop, select your size and pay online with UPI, card or net banking. Your order is confirmed right after payment and you can track it in My Orders.'],
  ['Which payment methods do you accept?', 'We accept UPI, debit and credit cards and net banking through Razorpay. Payment is online only.'],
  ['Can I cancel my order?', `Yes. Cancel from My Orders before the order is packed. Paid orders are refunded in ${REFUND_DAYS}.`],
  ['What if I receive a damaged or wrong shirt?', 'Send photos on WhatsApp within 48 hours of delivery and we will sort it out.'],
  ['How do I find my shirt size?', 'Use the size guide on this page or the chart on each shirt page. Between two sizes, take the bigger one. You can also ask us on WhatsApp.'],
  ['Do you take bulk or function orders?', 'Yes. Message us on WhatsApp with sizes and quantity for team, family function or wedding orders.'],
];

const WORDS = ['WHATSAPP HELP', 'ONLINE PAYMENT', 'ORDER TRACKING', 'EASY CANCEL', 'SIZE GUIDE', 'BULK ORDERS'];

/* ---------- safe scroll reveal ---------- */
function Reveal({ as: Tag = 'div', delay = 0, className = '', children }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setOn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`sx-rv ${on ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}s` }}>{children}</Tag>;
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

export default function NxServices() {
  const nx = useNx();
  const wa = (msg) => waLink(nx.whatsapp, msg);
  const [act, setAct] = useState(0);
  const [chest, setChest] = useState(41);

  const found = SIZES.findIndex((s) => Number(s[1]) >= chest);
  const si = found === -1 ? SIZES.length - 1 : found;
  const ActIcon = SERVICES[act][0];

  useSeo({
    title: 'Shirt Services in Thiruchuli | WhatsApp Help, Online Payment, Size Guide | Nexora Menswear',
    description: 'Nexora Menswear, Thiruchuli: men’s shirts with WhatsApp help, secure online payment, order tracking, size guide, easy cancellation and bulk function orders. Delivery across Tamil Nadu.',
    path: '/menswear/services',
    ld: (url) => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ClothingStore',
          name: 'Nexora Menswear',
          url: url.replace('/services', ''),
          description: 'Men’s shirt shop in Thiruchuli, Tamil Nadu with online ordering and delivery.',
          address: { '@type': 'PostalAddress', addressLocality: 'Thiruchuli', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
          ...(nx?.whatsapp ? { telephone: `+${String(nx.whatsapp).replace(/\D/g, '')}` } : {}),
          paymentAccepted: 'UPI, Credit Card, Debit Card, Net Banking',
          areaServed: 'Tamil Nadu, India',
        },
        { '@type': 'FAQPage', mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: url.replace('/menswear/services', '/menswear') },
            { '@type': 'ListItem', position: 2, name: 'Services', item: url },
          ],
        },
      ],
    }),
  });

  return (
    <div className="sx-root">
      {/* ================= HERO ================= */}
      <header className="sx-hero">
        <div className="sx-gridbg" aria-hidden="true" />
        <span className="sx-wm" aria-hidden="true">SERVICES</span>
        <div className="sx-wrap sx-hero-in">
          <div className="sx-hero-txt">
            <nav className="sx-crumb" aria-label="Breadcrumb"><Link to="/menswear">Home</Link><span>/</span><b>Services</b></nav>
            <span className="sx-kick"><i /> HOW WE HELP</span>
            <h1 className="sx-h1">Our <em>Services</em></h1>
            <p className="sx-sub">From choosing the right size to doorstep delivery, Nexora Menswear Thiruchuli is with you at every step of your shirt shopping.</p>
            <div className="sx-cta">
              <Link to="/menswear/shop" className="sx-btn gold"><FiShoppingBag /> Shop shirts</Link>
              <a className="sx-btn wa" href={wa('Hi Nexora Menswear, I need help choosing a shirt.')} target="_blank" rel="noreferrer"><FaWhatsapp /> Ask on WhatsApp</a>
            </div>
            <ul className="sx-stats">
              <li><b>{SERVICES.length}</b><span>services</span></li>
              <li><b>4</b><span>simple steps</span></li>
              <li><b>48h</b><span>damage help</span></li>
            </ul>
          </div>

          <div className="sx-vis">
            <div className="sx-arch"><NxPhoto src={NX_IMG.rack} alt="Men’s shirts at Nexora Menswear Thiruchuli" color="Navy" /></div>
            <div className="sx-circ"><NxPhoto src={NX_IMG.man3} alt="Nexora Menswear shirt styling help" color="White" /></div>
            <div className="sx-spin" aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <defs><path id="sx-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
                <text><textPath href="#sx-circle" textLength="284" lengthAdjust="spacing">WHATSAPP HELP • ONLINE PAYMENT • TRACKING • </textPath></text>
              </svg>
              <FaWhatsapp />
            </div>
            <span className="sx-pill p1"><FiShield /> Secure payment</span>
            <span className="sx-pill p2"><FiTruck /> Track every step</span>
          </div>
        </div>
      </header>

      {/* ================= RIBBON ================= */}
      <div className="sx-ribwrap" aria-hidden="true">
        <div className="sx-rib">
          <div className="sx-rib-track">
            {[...WORDS, ...WORDS, ...WORDS].map((w, i) => (<span key={i}>{w}<i>✦</i></span>))}
          </div>
        </div>
      </div>

      {/* ================= SERVICES INDEX ================= */}
      <section className="sx-sec sx-dark" aria-labelledby="sx-idx-h">
        <div className="sx-wrap">
          <Reveal className="sx-head">
            <span className="sx-eb">Everything we do</span>
            <h2 className="sx-h2" id="sx-idx-h">Every step, <em>covered.</em></h2>
            <p className="sx-lead">At <strong>Nexora Menswear, Thiruchuli</strong>, buying a shirt online is simple: WhatsApp help for size and colour, secure online payment, live order tracking, easy cancellation and delivery to your door across Tamil Nadu.</p>
          </Reveal>

          <div className="sx-idx">
            <aside className="sx-pv" aria-hidden="true">
              <div className="sx-pv-frame">
                {PV.map(([src, color], i) => (
                  <div key={i} className={`sx-pv-i ${act === i ? 'on' : ''}`}><NxPhoto src={src} alt="" color={color} /></div>
                ))}
                <div className="sx-pv-shade" />
                <div className="sx-pv-badge"><ActIcon /></div>
                <div className="sx-pv-cap">
                  <small>Service {String(act + 1).padStart(2, '0')} / {String(SERVICES.length).padStart(2, '0')}</small>
                  <b>{SERVICES[act][1]}</b>
                </div>
              </div>
            </aside>

            <ol className="sx-list">
              {SERVICES.map(([Icon, h, t], i) => (
                <li key={h} className={`sx-row ${act === i ? 'on' : ''}`} onMouseEnter={() => setAct(i)}>
                  <h3>
                    <button type="button" aria-expanded={act === i} onClick={() => setAct(i)} onFocus={() => setAct(i)}>
                      <em>{String(i + 1).padStart(2, '0')}</em>
                      <span className="t">{h}</span>
                      <Icon className="ic" />
                    </button>
                  </h3>
                  <div className="sx-desc">
                    <p>{t}</p>
                    <a href={wa(`Hi Nexora Menswear, I have a question about: ${h}.`)} target="_blank" rel="noreferrer"><FaWhatsapp /> Ask about this <FiArrowRight /></a>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ================= OCCASION BENTO ================= */}
      <section className="sx-sec sx-cream" aria-labelledby="sx-occ-h">
        <div className="sx-wrap">
          <Reveal className="sx-head">
            <span className="sx-eb">Not sure what to wear?</span>
            <h2 className="sx-h2" id="sx-occ-h">Shirts by <em>occasion</em></h2>
          </Reveal>
          <div className="sx-bento">
            {OCCASIONS.map(([h, t, src, color, pattern], i) => (
              <Reveal key={h} delay={i * 0.08} className={`sx-tile t${i}`}>
                <a href={wa(`Hi Nexora Menswear, I need a shirt for: ${h}.`)} target="_blank" rel="noreferrer" aria-label={`Ask about ${h} shirts on WhatsApp`}>
                  <div className="sx-tile-ph"><NxPhoto src={src} alt={`${h} men’s shirt - Nexora Menswear Thiruchuli`} color={color} pattern={pattern} /></div>
                  <div className="sx-tile-shade" />
                  <span className="sx-tile-go"><FiArrowUpRight /></span>
                  <div className="sx-tile-t"><h3>{h}</h3><p>{t}</p></div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STEPS / ROAD ================= */}
      <section className="sx-sec sx-dark2" aria-labelledby="sx-steps-h">
        <div className="sx-wrap">
          <Reveal className="sx-head center">
            <span className="sx-eb">Simple &amp; quick</span>
            <h2 className="sx-h2" id="sx-steps-h">From shop to <em>your door</em></h2>
          </Reveal>
          <div className="sx-road">
            <div className="sx-road-line" aria-hidden="true"><span className="sx-truck"><FiTruck /></span></div>
            <ol className="sx-steps">
              {STEPS.map(([Icon, h, t], i) => (
                <Reveal as="li" key={h} delay={i * 0.1} className="sx-step">
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ico"><Icon /></span>
                  <h3>{h}</h3>
                  <p>{t}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ================= SIZE FINDER ================= */}
      <section className="sx-sec sx-cream" aria-labelledby="sx-size-h">
        <div className="sx-wrap">
          <Reveal className="sx-head">
            <span className="sx-eb">Quick size guide</span>
            <h2 className="sx-h2" id="sx-size-h">Find your <em>size</em></h2>
          </Reveal>
          <div className="sx-size">
            <Reveal className="sx-finder">
              <label htmlFor="sx-chest">Your chest size: <b>{chest} in</b></label>
              <input id="sx-chest" type="range" min="36" max="48" step="1" value={chest} onChange={(e) => setChest(Number(e.target.value))} />
              <div className="sx-scale" aria-hidden="true"><span>36</span><span>42</span><span>48</span></div>
              <div className="sx-result">
                <div className="sx-shirt" aria-hidden="true">
                  <svg viewBox="0 0 100 100" style={{ transform: `scale(${0.74 + si * 0.07})` }}>
                    <path d="M35 8 L20 14 L6 32 L18 42 L26 34 L26 92 L74 92 L74 34 L82 42 L94 32 L80 14 L65 8 C60 16 40 16 35 8 Z" />
                  </svg>
                </div>
                <div>
                  <small>We suggest size</small>
                  <strong>{SIZES[si][0]}</strong>
                  <p>Length {SIZES[si][2]} in · Shoulder {SIZES[si][3]} in</p>
                </div>
              </div>
              <p className="sx-hint">{chest > 46 ? 'Your size is above our chart. Message us on WhatsApp and we will help.' : 'Between two sizes? Take the bigger one.'}</p>
              <a className="sx-btn dark" href={wa(`Hi Nexora Menswear, my chest is ${chest} inches. Which size should I take?`)} target="_blank" rel="noreferrer"><FaWhatsapp /> Confirm my size</a>
            </Reveal>

            <Reveal delay={0.1} className="sx-chart">
              <div className="sx-tablewrap">
                <table>
                  <caption>Men’s shirt size chart in inches</caption>
                  <thead><tr><th>Size</th><th>Chest (in)</th><th>Length (in)</th><th>Shoulder (in)</th></tr></thead>
                  <tbody>
                    {SIZES.map((r, i) => (
                      <tr key={r[0]} className={i === si ? 'on' : ''}>{r.map((c, j) => (j ? <td key={j}>{c}</td> : <th key={j} scope="row">{c}</th>))}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>Measurements are approximate and can differ by style. The exact chart is on every shirt page.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="sx-sec sx-dark" aria-labelledby="sx-faq-h">
        <div className="sx-wrap sx-faqgrid">
          <Reveal className="sx-faqhead">
            <span className="sx-eb">Got questions?</span>
            <h2 className="sx-h2" id="sx-faq-h">Frequently asked <em>questions</em></h2>
            <p className="sx-lead">Cannot find your answer? Message us and we will reply with the right one.</p>
            <a className="sx-btn wa" href={wa('Hi Nexora Menswear, I have a question.')} target="_blank" rel="noreferrer"><FaWhatsapp /> Ask on WhatsApp</a>
          </Reveal>
          <div className="sx-faq">
            {FAQS.map(([q, a], i) => (
              <Reveal key={q} delay={i * 0.04}>
                <details className="sx-qa">
                  <summary><span className="n">{String(i + 1).padStart(2, '0')}</span><span className="q">{q}</span><FiPlus /></summary>
                  <p>{a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="sx-final">
        <Reveal className="sx-wrap sx-final-in">
          <span className="sx-eb dk">Personal help</span>
          <h2>Need help choosing? <em>Just say hi.</em></h2>
          <p>Send your size, budget and the event on WhatsApp. We suggest shirts from the shop and you pay online only when you are happy.</p>
          <div className="sx-cta center">
            <a className="sx-btn dark" href={wa('Hi Nexora Menswear, I need help choosing a shirt for an occasion.')} target="_blank" rel="noreferrer"><FaWhatsapp /> Chat on WhatsApp</a>
            <Link to="/menswear/shop" className="sx-btn line"><FiShoppingBag /> Shop shirts</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}