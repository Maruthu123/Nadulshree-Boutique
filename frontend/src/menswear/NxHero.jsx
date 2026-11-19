import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { FiArrowLeft, FiArrowRight, FiX } from 'react-icons/fi';
import ShirtArt, { colorHex } from './ShirtArt';
import { discount, useNx, waLink } from './nxUtils';
import api, { imgSrc, inr } from '../api';
import './NxHero.css';
   
const EASE = [0.22, 1, 0.36, 1];

const VISIBLE = 2; /* 2 left + centre + 2 right = 5 shirts on screen */
const MAX_ITEMS = 60; /* every live dashboard shirt is shown, up to this many */
const MAX_DOTS = 12; /* above this many shirts, only the counter is shown */

/* default hero background; dashboard `hero_bg` overrides it. Replace with your own image URL if you like */
const DEFAULT_BG = '';

/* fallback silhouette (only when a photo is missing / fails to load) */
const SIL =
  'M158 38 L84 70 L12 156 Q8 162 14 166 L62 196 Q68 199 72 194 L100 152 L100 378 Q100 392 114 394 ' +
  'Q200 408 286 394 Q300 392 300 378 L300 152 L328 194 Q332 199 338 196 L386 166 Q392 162 388 156 ' +
  'L316 70 L242 38 Q200 64 158 38 Z';

/* only used while the dashboard has no shirts yet */
const FILLERS = [
  { name: 'Classic White', text: 'Crisp and clean for every day.', color: 'White' },
  { name: 'Sky Blue Oxford', text: 'Cool and calm for work.', color: 'Sky Blue' },
  { name: 'Olive Casual', text: 'Earthy and easy.', color: 'Olive' },
  { name: 'Midnight Black', text: 'Sharp, simple, always.', color: 'Black' },
  { name: 'Sand Linen', text: 'Light for hot days.', color: 'Beige' },
];

const isLive = (p) =>
  !!p && !(p.active === false || p.is_active === false || p.hidden || p.is_hidden || p.status === 'draft' || p.status === 'inactive');
const stamp = (p) => (p?.created_at ? new Date(p.created_at).getTime() || 0 : 0);

function buildItems(products) {
  const list = products
    .filter(isLive)
    .sort((a, b) => stamp(b) - stamp(a) || Number(!!b.images?.[0]) - Number(!!a.images?.[0]))
    .slice(0, MAX_ITEMS)
    .map((p) => ({
      key: `p${p.id}`,
      name: p.name,
      kind: p.category_name || 'Shirt',
      text: p.description || p.short_description || '',
      images: (p.images || []).filter(Boolean),
      product: p,
      color: p.colors?.[0],
      link: `/menswear/product/${p.id}`,
    }));
  if (list.length === 0) {
    FILLERS.slice(0, 5).forEach((f, i) => {
      list.push({
        key: `f${i}`, filler: true, name: f.name, kind: 'Shirt', text: f.text,
        images: [], product: null, color: f.color, link: '/menswear/shop',
      });
    });
  }
  return list;
}

/* full shirt photo (transparent PNG) hanging from a thin string + small wooden hanger */
const HangerShirt = memo(function HangerShirt({ src, hex, str, cardH }) {
  const [bad, setBad] = useState(false);
  useEffect(() => { setBad(false); }, [src]);
  const photo = !!src && !bad;

  return (
    <>
      <span className="nxr-string" style={{ height: str }} />
      <svg className="nxr-hanger" viewBox="0 0 120 44" aria-hidden>
        <path d="M60 16 L8 38 M60 16 L112 38" stroke="rgba(0,0,0,.3)" strokeWidth="6" strokeLinecap="round" transform="translate(0 2)" />
        <path d="M60 16 L8 38 M60 16 L112 38" stroke="#b8892a" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="60" cy="16" r="3.5" fill="#cfd6de" />
      </svg>
      {photo ? (
        <img
          className="nxr-img"
          style={{ height: cardH }}
          src={imgSrc(src)}
          alt=""
          draggable={false}
          loading="lazy"
          onError={() => setBad(true)}
        />
      ) : (
        <ShirtArt className="nxr-img nxr-drawn" color={hex} accent="#b8892a" />
      )}
    </>
  );
});

export default function NxRail({ products = [] }) {
  const nx = useNx();
  const reduce = useReducedMotion();
  const stage = useRef(null);
  const drag = useRef({ x: 0, moved: false, down: false });
  const paused = useRef(false);
  const lastTouch = useRef(0);
  const intro = useRef(true);

  const [fresh, setFresh] = useState(null);
  const [w, setW] = useState(1200);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [shot, setShot] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => { intro.current = false; }, 1800);
    return () => clearTimeout(id);
  }, []);

  /* live products from the dashboard (refresh every 45s and when the tab is focused) */
  useEffect(() => {
    let live = true;
    const load = () => {
      api.get('/products', { params: { store: 'menswear' } })
        .then((r) => {
          const list = Array.isArray(r.data) ? r.data : r.data?.products;
          if (live && Array.isArray(list)) setFresh(list);
        })
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 45000);
    const vis = () => { if (!document.hidden) load(); };
    document.addEventListener('visibilitychange', vis);
    return () => { live = false; clearInterval(id); document.removeEventListener('visibilitychange', vis); };
  }, []);

  const items = useMemo(() => buildItems(fresh || products), [fresh, products]);
  const n = items.length;
  const cur = items[active % n];
  const p = cur.product;

  /* if shirts are removed from the dashboard, keep the index in range */
  useEffect(() => { if (active >= n) setActive(0); }, [active, n]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setW(el.clientWidth || 1200));
    ro.observe(el);
    setW(el.clientWidth || 1200);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || n < 2) return undefined;
    const id = setInterval(() => {
      if (!paused.current && !open && Date.now() - lastTouch.current > 9000) setActive((a) => (a + 1) % n);
    }, 5600);
    return () => clearInterval(id);
  }, [reduce, n, open]);

  useEffect(() => { setShot(0); }, [active, open]);

  useEffect(() => {
    if (!open) return undefined;
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open]);

  /* layout */
  const mobile = w < 720;
  const cardW = Math.max(120, Math.min(230, w * (mobile ? 0.46 : 0.19)));
  const cardH = cardW * 1.25; /* photo height */
  const str = Math.max(36, cardW * 0.32); /* string length */
  const pieceH = str + cardW * 0.13 + cardH; /* string + hanger + photo */
  const spacing = mobile ? Math.max(96, w / 3.2) : Math.max(92, Math.min(205, (w / 2 - cardW * 0.75) / 2.6));
  const sag = 34;
  const top = 30;
  const pad = 30;
  const railH = top + sag + pieceH + 12;
  const height = railH + 215;

  const go = (d) => { lastTouch.current = Date.now(); setActive((a) => (a + d + n) % n); };
  const offset = (i) => { const raw = (i - active + n) % n; return raw > n / 2 ? raw - n : raw; };

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  };
  const down = (e) => { drag.current = { x: e.clientX, moved: false, down: true }; };
  const up = (e) => {
    if (!drag.current.down) return;
    drag.current.down = false;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 50) { drag.current.moved = true; go(dx < 0 ? 1 : -1); }
  };

  /* side shirt -> centre; centre shirt -> open product panel */
  const pick = (i) => {
    if (drag.current.moved) { drag.current.moved = false; return; }
    if (i !== active) { go(offset(i)); return; }
    setOpen(true);
  };

  const hex = colorHex(cur.color) || '#3b4a66';
  const off = p ? discount(p) : 0;
  const shots = cur.images.length ? cur.images : [];
  const bg = nx?.hero_bg || DEFAULT_BG;

  return (
    <section className="nxr" aria-label="Nexora Menswear shirt rail" style={{ '--tintx': hex }}>
      <div className="nxr-bg" aria-hidden>
        {bg && <i className="photo" style={{ backgroundImage: `url(${bg})` }} />}
        <i className="shade" />
        <i className="glow" />
        <i className="floor" />
        <i className="wash" />
      </div>

      {/* heading above the rail */}
      <motion.div
        className="nxr-logo"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.9, ease: EASE }}
      >
        <small>THE COLLECTION</small>
        <span>The Shirt <b>Rail</b></span>   
        <em>DRAG, SWIPE OR TAP A SHIRT TO OPEN IT</em>
      </motion.div>

      <div
        ref={stage}
        className="nxr-stage"
        style={{ height }}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured shirts. Use the arrow keys to move."
        onKeyDown={onKey}
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={() => { drag.current.down = false; }}
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
        onFocus={() => { paused.current = true; }}
        onBlur={() => { paused.current = false; }}
      >
        <div className="nxr-halo" aria-hidden style={{ width: cardW * 2.4, height: cardW * 2.4, top: top + sag + pieceH * 0.5 }} />

        <svg className="nxr-rail" width={w} height={top + sag + 24} viewBox={`0 0 ${w} ${top + sag + 24}`} aria-hidden>
          <defs>
            <linearGradient id="nxrsteel" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#4a5461" />
              <stop offset=".3" stopColor="#e9eef3" />
              <stop offset=".55" stopColor="#8d98a6" />
              <stop offset=".8" stopColor="#dfe6ec" />
              <stop offset="1" stopColor="#4a5461" />
            </linearGradient>
          </defs>
          {[0.2, 0.8].map((k) => (
            <g key={k}>
              <line x1={w * k} y1="0" x2={w * k} y2={top + 14} stroke="#8a94a0" strokeWidth="3" />
              <rect x={w * k - 8} y={top + 8} width="16" height="12" rx="3" fill="url(#nxrsteel)" />
            </g>
          ))}
          <path d={`M${pad} ${top + 16} Q${w / 2} ${top + 2 * sag + 16} ${w - pad} ${top + 16}`} fill="none" stroke="rgba(90,60,10,.28)" strokeWidth="14" strokeLinecap="round" style={{ filter: 'blur(9px)' }} />
          <path d={`M${pad} ${top} Q${w / 2} ${top + 2 * sag} ${w - pad} ${top}`} fill="none" stroke="#262d36" strokeWidth="10" strokeLinecap="round" />
          <path d={`M${pad} ${top} Q${w / 2} ${top + 2 * sag} ${w - pad} ${top}`} fill="none" stroke="url(#nxrsteel)" strokeWidth="7" strokeLinecap="round" />
          <path d={`M${pad} ${top - 2} Q${w / 2} ${top + 2 * sag - 2} ${w - pad} ${top - 2}`} fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>

        {items.map((it, i) => {
          const d = offset(i);
          const ad = Math.abs(d);
          const maxD = mobile ? 1 : VISIBLE;
          const px = d * spacing + Math.sign(d) * cardW * 0.2;
          const t = Math.min(1, Math.max(0, (w / 2 + px - pad) / (w - 2 * pad)));
          const ry = top + 4 * sag * t * (1 - t);
          const slope = (4 * sag * (1 - 2 * t)) / (w - 2 * pad);
          const ang = Math.atan(slope) * (180 / Math.PI) * 0.7;
          const sc = d === 0 ? 1 : Math.max(0.5, 0.78 - 0.08 * (ad - 1));
          const visible = ad <= maxD;
          /* only load photos for shirts on screen and the ones about to arrive */
          const near = ad <= VISIBLE + 1;

          return (
            <motion.div
              key={it.key}
              className={`nxr-piece${d === 0 ? ' on' : ''}${d < 0 ? ' l' : d > 0 ? ' r' : ''}`}
              style={{
                width: cardW, marginLeft: -cardW / 2, zIndex: 20 - ad,
                originX: 0.5, originY: 0,
                pointerEvents: visible ? 'auto' : 'none',
              }}
              initial={{ x: px, y: ry - 220, scale: sc, opacity: 0, rotate: 0 }}
              animate={{ x: px, y: ry, scale: sc, rotate: ang, opacity: visible ? 1 : 0 }}
              transition={reduce ? { duration: 0 } : {
                type: 'spring', stiffness: 120, damping: 20, mass: 0.9,
                delay: intro.current ? 0.5 + ad * 0.14 : 0,
              }}
            >
              <div className="nxr-swing" style={{ animationDelay: `${-i * 1.1}s` }}>
                <button
                  type="button"
                  className="nxr-card"
                  style={{ height: pieceH }}
                  onClick={() => pick(i)}
                  tabIndex={visible ? 0 : -1}
                  aria-label={d === 0 ? `Open ${it.name}` : `${it.name}${it.product ? `, ${inr(it.product.price)}` : ''}`}
                >
                  <HangerShirt src={near ? it.images[0] : undefined} hex={colorHex(it.color) || '#3b4a66'} str={str} cardH={cardH} />
                </button>
              </div>
            </motion.div>
          );
        })}

        <button type="button" className="nxr-nav l" onClick={() => go(-1)} aria-label="Previous shirt"><FiArrowLeft /></button>
        <button type="button" className="nxr-nav r" onClick={() => go(1)} aria-label="Next shirt"><FiArrowRight /></button>

        <div className="nxr-meta" style={{ top: railH + 30 }} aria-live="polite">
          <span className="nxr-count">{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
          <h2>{cur.name}</h2>
          {p && (
            <p>
              {inr(p.price)}
              {off > 0 && <s>{inr(p.mrp)}</s>}
            </p>
          )}
          <button type="button" className="nx-btn nx-btn-sm" onClick={() => setOpen(true)}>
            View product <FiArrowRight />
          </button>
        </div>
      </div>

      {n <= MAX_DOTS && (
        <div className="nxr-dots" role="tablist" aria-label="Choose shirt">
          {items.map((it, i) => (
            <button
              key={it.key} type="button" role="tab" aria-selected={i === active} aria-label={it.name}
              className={i === active ? 'on' : ''}
              onClick={() => { lastTouch.current = Date.now(); setActive(i); }}
            />
          ))}
        </div>
      )}

      <div className="nxr-cta">
        <Link to="/menswear/shop" className="nx-btn nx-btn-lg">Shop shirts <FiArrowRight /></Link>
        <a
          className="nx-btn nx-btn-lg nx-btn-wa"
          href={waLink(nx.whatsapp, 'Hi Nexora Menswear, I need details about your shirts.')}
          target="_blank" rel="noreferrer"
        >
          <FaWhatsapp /> Enquire on WhatsApp
        </a>
      </div>

      {/* product panel: opens when the centre shirt is clicked */}
      <div className={`nxr-scrim${open ? ' on' : ''}`} onClick={() => setOpen(false)} aria-hidden />
      <aside className={`nxr-panel${open ? ' on' : ''}`} aria-hidden={!open} aria-label={`${cur.name} details`}>
        <button type="button" className="nxr-close" onClick={() => setOpen(false)} aria-label="Close"><FiX /></button>

        <div className="nxr-gal">
          <div className="nxr-gview">
            {shots.length > 0 ? (
              <img src={imgSrc(shots[shot % shots.length])} alt={cur.name} draggable={false} />
            ) : (
              <div className="nxr-ph" style={{ background: hex }} />
            )}
            {shots.length > 1 && (
              <>
                <button type="button" className="nxr-gn l" onClick={() => setShot((s) => (s - 1 + shots.length) % shots.length)} aria-label="Previous photo"><FiArrowLeft /></button>
                <button type="button" className="nxr-gn r" onClick={() => setShot((s) => (s + 1) % shots.length)} aria-label="Next photo"><FiArrowRight /></button>
              </>
            )}
          </div>
          {shots.length > 1 && (
            <div className="nxr-thumbs">
              {shots.map((s, i) => (
                <button key={s + i} type="button" className={i === shot % shots.length ? 'on' : ''} onClick={() => setShot(i)} aria-label={`Photo ${i + 1}`}>
                  <img src={imgSrc(s)} alt="" draggable={false} />
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="nxr-eyebrow">{cur.kind}</span>
        <h3>{cur.name}</h3>
        {p && (
          <p className="nxr-price">
            {inr(p.price)}
            {off > 0 && <s>{inr(p.mrp)}</s>}
          </p>
        )}
        {cur.text && <p className="nxr-text">{cur.text}</p>}
        {p?.colors?.length > 0 && (
          <div className="nxr-sw" aria-label="Available colours">
            {p.colors.map((c) => (<span key={c} title={c} style={{ background: colorHex(c) }} />))}
          </div>
        )}
        <Link className="nx-btn nx-btn-lg nxr-go" to={cur.link}>
          {cur.filler ? 'Browse shirts' : 'View full product'} <FiArrowRight />
        </Link>
      </aside>
    </section>
  );
}