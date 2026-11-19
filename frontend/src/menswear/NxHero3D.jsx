import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaLeaf, FaTshirt } from 'react-icons/fa';
import { FiArrowRight, FiWind, FiShield } from 'react-icons/fi';
import { useNx, waLink } from './nxUtils';
import { colorHex } from './ShirtArt';
import './NxHero3D.css';

const FEATS = [
  [FaLeaf, 'Soft', 'Cotton'],
  [FiWind, 'Breathable', 'Fabric'],
  [FiShield, 'Durable', 'Quality'],
  [FaTshirt, 'Perfect', 'Fit'],
];
const SHADES = ['White', 'Sky Blue', 'Olive', 'Black', 'Beige'];

/**
 * Home hero (white + black + gold, from the Nexora poster).
 * The photo stage is real 3D: layers sit at different depths and move with the mouse (or sway by themselves on phones).
 */
export default function NxHero3D() {
  const nx = useNx();
  const stage = useRef(null);
  const frame = useRef(0);

  useEffect(() => {
    const el = stage.current; if (!el) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const move = (e) => {
      if (e.pointerType === 'touch') return;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        el.classList.add('live');
      });
    };
    const leave = () => { el.style.setProperty('--mx', 0); el.style.setProperty('--my', 0); el.classList.remove('live'); };
    const host = el.parentElement.parentElement;
    host.addEventListener('pointermove', move); host.addEventListener('pointerleave', leave);
    return () => { host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); cancelAnimationFrame(frame.current); };
  }, []);

  return (
    <section className="nxh" aria-label="Nexora Menswear premium men's shirts">
      <div className="nxh-bg" aria-hidden>
        <i className="o1" /><i className="o2" /><i className="o3" />
        <span className="nxh-word">NEXORA</span>
      </div>

      <div className="nx-container nxh-grid">
        <div className="nxh-copy">
          <p className="nxh-kicker nxh-in" style={{ '--d': '.05s' }}>PREMIUM STYLE <i /> MODERN YOU</p>
          <h1 className="nxh-h1">
            <span className="nxh-brush nxh-in" style={{ '--d': '.15s' }}>Premium</span>
            <span className="nxh-line"><b style={{ '--d': '.25s' }}>Men&rsquo;s</b></span>
            <span className="nxh-line gold"><b style={{ '--d': '.4s' }}>Shirts</b></span>
          </h1>
          <p className="nxh-sub nxh-in" style={{ '--d': '.55s' }}>CLASSIC LOOKS <i /> EVERYDAY COMFORT</p>

          <ul className="nxh-feats nxh-in" style={{ '--d': '.65s' }}>
            {FEATS.map(([Icon, a, b]) => (
              <li key={a}>
                <span className="nxh-ico"><Icon /></span>
                <b>{a}</b><em>{b}</em>
              </li>
            ))}
          </ul>

          <div className="nxh-cta nxh-in" style={{ '--d': '.8s' }}>
            <Link to="/menswear/shop" className="nx-btn nx-btn-lg">Shop shirts <FiArrowRight /></Link>
            <a className="nx-btn nx-btn-lg nx-btn-wa" href={waLink(nx.whatsapp, 'Hi Nexora Menswear, I need details about your shirts.')} target="_blank" rel="noreferrer"><FaWhatsapp /> DM for orders</a>
          </div>

          <div className="nxh-dots nxh-in" style={{ '--d': '.95s' }} aria-label="Shirt colours">
            {SHADES.map((c) => <Link key={c} to={`/menswear/shop?q=${encodeURIComponent(c)}`} title={c} style={{ background: colorHex(c) }} aria-label={`${c} shirts`} />)}
            <small>5 shades. One standard.</small>
          </div>
        </div>

        <div className="nxh-stagewrap">
          <div className="nxh-stage" ref={stage}>
            <div className="nxh-ring" aria-hidden><i /><i /><i /></div>
            <div className="nxh-frame" aria-hidden />
            <div className="nxh-photo">
              <img src="/nexora/hero-model.jpg" alt="Man wearing a white Nexora Menswear cotton shirt" width="632" height="930" fetchPriority="high" />
            </div>
            <div className="nxh-card nxh-script" aria-hidden>
              <span>Style</span><span>Starts with</span><em>a Shirt</em>
            </div>
            <div className="nxh-card nxh-badge" aria-hidden>
              <b>Simple</b><b>Classy</b><b>Always</b>
            </div>
            <div className="nxh-chip" aria-hidden><FaLeaf /> Soft cotton, perfect fit</div>
          </div>
        </div>
      </div>

      <div className="nxh-scroll" aria-hidden><i /></div>
    </section>
  );
}
