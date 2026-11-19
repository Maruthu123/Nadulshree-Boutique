import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiShield, FiTruck, FiRefreshCcw, FiSliders, FiSearch, FiX, FiArrowRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import NxProductCard from '../NxProductCard';
import { NX_IMG } from '../data/nxImages';
import { useNx, waLink } from '../nxUtils';
import api, { errMsg } from '../../api';
import './NxShop.css';

const TRUST = [
  [FiShield, 'Secure payment', 'UPI, cards, net banking'],
  [FiTruck, 'Track your parcel', 'Every step in My Orders'],
  [FiRefreshCcw, 'Easy cancellation', 'Before it is packed'],
  [FiSliders, 'Size help', 'Chart + WhatsApp'],
];

/* ---------- scroll reveal (safe) ---------- */
function Reveal({ delay = 0, className = '', children }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setOn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`ns-rv ${on ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}s` }}>{children}</div>;
}

/* ---------- SEO (no extra package needed) ---------- */
function useSeo({ title, description, path, noindex, ld }) {
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
    setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');
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
  }, [title, description, path, noindex]); // eslint-disable-line
}

export default function NxShop() {
  const nx = useNx();
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const q = params.get('q') || '';
  const sort = params.get('sort') || '';
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [tick, setTick] = useState(0);
  const [qText, setQText] = useState(q);

  useEffect(() => { api.get('/categories', { params: { store: 'menswear' } }).then((r) => setCats(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true); setErr('');
    api.get('/products', { params: { store: 'menswear', category: category || undefined, q: q || undefined, sort: sort || undefined } })
      .then((r) => setProducts(r.data))
      .catch((e) => { setProducts([]); setErr(errMsg(e, 'Could not load the shirts.')); console.error('Shop load failed. Check CLIENT_URL on the server (NEXORA_SETUP.md).', e); })
      .finally(() => setLoading(false));
  }, [category, q, sort, tick]);
  useEffect(() => { setQText(q); }, [q]);

  const set = (k, v) => { const n = new URLSearchParams(params); if (v) n.set(k, v); else n.delete(k); setParams(n); };
  const catName = cats.find((c) => c.slug === category)?.name;
  const title = q ? `Results for “${q}”` : (catName || 'All Shirts');

  useSeo({
    title: q
      ? `Search: ${q} | Nexora Menswear`
      : catName
        ? `${catName} Shirts for Men Online | Nexora Menswear Thiruchuli`
        : 'Buy Men’s Shirts Online | Formal, Casual, Printed & Linen | Nexora Menswear',
    description: catName
      ? `Shop ${catName.toLowerCase()} shirts for men at Nexora Menswear, Thiruchuli. Size guide, secure online payment, order tracking and delivery across Tamil Nadu.`
      : 'Shop formal, casual, printed, checked and linen shirts for men at Nexora Menswear, Thiruchuli. Size help on WhatsApp, secure online payment, order tracking and easy cancellation.',
    path: `/menswear/shop${category ? `?category=${encodeURIComponent(category)}` : ''}`,
    noindex: !!q,
    ld: (url) => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: catName ? `${catName} shirts` : 'Men’s shirts',
          url,
          isPartOf: { '@type': 'WebSite', name: 'Nexora Menswear' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin + '/menswear' },
            { '@type': 'ListItem', position: 2, name: 'Shop', item: window.location.origin + '/menswear/shop' },
            ...(catName ? [{ '@type': 'ListItem', position: 3, name: catName, item: url }] : []),
          ],
        },
      ],
    }),
  });

  const submitSearch = (e) => { e.preventDefault(); set('q', qText.trim()); };

  return (
    <div className="ns-root">
      {/* ===== HERO ===== */}
      <header className="nsh">
        <img className="nsh-bg" src={NX_IMG.rack} alt="" loading="eager" />
        <div className="nsh-shade" />
        <div className="nsh-glow g1" /><div className="nsh-glow g2" />
        <div className="nx-container nsh-in">
          <nav className="nsh-crumb" aria-label="Breadcrumb">
            <Link to="/menswear">Home</Link><span>/</span>
            {catName || q ? <><Link to="/menswear/shop" onClick={() => setParams({})}>Shop</Link><span>/</span><b>{catName || 'Search'}</b></> : <b>Shop</b>}
          </nav>
          <span className="nsh-kicker"><i /> NEXORA MENSWEAR</span>
          <h1 className="nsh-title">{title}</h1>
          <p className="nsh-sub">
            {q || category
              ? 'Handpicked for fit, fabric and finish. Pay online, track your parcel and cancel before it is packed.'
              : 'Shirts for every mood. Formal, casual, printed, checked and linen. Pay online, track your parcel, cancel before it is packed.'}
          </p>
          <form className="nsh-search" onSubmit={submitSearch} role="search">
            <FiSearch aria-hidden="true" />
            <input value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Search shirts: linen, checked, white..." aria-label="Search shirts" />
            {qText && <button type="button" className="clr" aria-label="Clear search" onClick={() => { setQText(''); set('q', ''); }}><FiX /></button>}
            <button type="submit" className="go">Search</button>
          </form>
        </div>
        <svg className="nsh-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,40 C240,90 480,0 720,30 C960,60 1200,10 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </header>

      {/* ===== LISTING ===== */}
      <section className="nx-section nx-tight" aria-label="Shirts">
        <div className="nx-container">
          <div className="ns-bar">
            <div className="ns-chips" role="group" aria-label="Filter by style">
              <button className={!category ? 'on' : ''} onClick={() => set('category', '')}>All</button>
              {cats.map((c) => <button key={c.id} className={category === c.slug ? 'on' : ''} onClick={() => set('category', c.slug)}>{c.name}</button>)}
            </div>
            <div className="ns-right">
              {!loading && !err && <span className="ns-count"><b>{products.length}</b> {products.length === 1 ? 'shirt' : 'shirts'}</span>}
              <select value={sort} onChange={(e) => set('sort', e.target.value)} aria-label="Sort shirts">
                <option value="">Featured</option><option value="new">Newest</option>
                <option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="nx-grid">{[...Array(8)].map((_, i) => <div key={i} className="nx-skel" />)}</div>
          ) : err ? (
            <div className="ns-state err">
              <h3>Shirts could not be loaded</h3>
              <p>{err} If the server was idle, wait about 30 seconds and try again.</p>
              <button className="nx-btn" onClick={() => setTick((t) => t + 1)}>Try again</button>
            </div>
          ) : products.length === 0 ? (
            <div className="ns-state">
              <h3>No shirts found</h3>
              <p>Try another style or search word, or ask us on WhatsApp and we will help you find one.</p>
              <div className="nx-cta center">
                <button className="nx-btn" onClick={() => { setQText(''); setParams({}); }}>Show all shirts</button>
                <a className="nx-btn nx-btn-wa" href={waLink(nx.whatsapp, 'Hi Nexora Menswear, I am looking for a shirt.')} target="_blank" rel="noreferrer"><FaWhatsapp /> Ask on WhatsApp</a>
              </div>
            </div>
          ) : (
            <div className="nx-grid">{products.map((p, i) => <NxProductCard key={p.id} p={p} index={i} />)}</div>
          )}

          {/* trust cards */}
          <div className="ns-trust">
            {TRUST.map(([Icon, h, t], i) => (
              <Reveal key={h} delay={i * 0.08} className="ns-trust-i">
                <span className="ns-ti"><Icon /></span>
                <div><b>{h}</b><small>{t}</small></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SEO CONTENT ===== */}
      {!q && (
        <section className="nx-section nx-alt ns-seo" aria-labelledby="ns-seo-h">
          <div className="nx-container nx-narrow">
            <Reveal>
              <h2 id="ns-seo-h" className="ns-seo-h">Buy men’s shirts online from <span>Thiruchuli</span></h2>
              <p>
                Nexora Menswear is a shirt-only store in Thiruchuli, Tamil Nadu. Browse formal shirts for office and functions,
                easy casual shirts for everyday, bold printed shirts, classic checks and breathable linen shirts for hot days.
                Every shirt has a size guide, and you can ask about size or colour on WhatsApp before you pay.
              </p>
              <p>
                Pay securely online with UPI, cards or net banking, follow your parcel in My Orders, and cancel before it is packed.
                We deliver to your door across Tamil Nadu.
              </p>
              {cats.length > 0 && (
                <ul className="ns-links" aria-label="Shirt styles">
                  {cats.map((c) => (
                    <li key={c.id}><Link to={`/menswear/shop?category=${encodeURIComponent(c.slug)}`}>{c.name} shirts <FiArrowRight /></Link></li>
                  ))}
                </ul>
              )}
            </Reveal>
          </div>
        </section>
      )}
    </div>
  );
}