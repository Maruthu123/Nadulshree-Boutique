import { Link } from 'react-router-dom';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FiMapPin, FiPhone, FiArrowRight, FiArrowUp, FiShoppingBag, FiShield, FiTruck } from 'react-icons/fi';
import { useNx, waLink } from './nxUtils';

const CSS = `
.nxf{position:relative;overflow:hidden;isolation:isolate;margin-top:40px;color:#f3f5f9;background:#070a10}
.nxf *{box-sizing:border-box}
.nxf a{text-decoration:none}

/* animated top line + glow blobs */
.nxf::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;z-index:2;
  background:linear-gradient(90deg,#ffb020,#22d3ee,#ffb020,#22d3ee);background-size:300% 100%;animation:nxfLine 6s linear infinite}
.nxf-glow{position:absolute;z-index:-1;border-radius:50%;filter:blur(90px);pointer-events:none}
.nxf-glow.g1{width:360px;height:360px;left:-100px;top:20%;background:rgba(255,176,32,.14);animation:nxfDrift 11s ease-in-out infinite alternate}
.nxf-glow.g2{width:340px;height:340px;right:-90px;bottom:0;background:rgba(34,211,238,.13);animation:nxfDrift 13s ease-in-out infinite alternate-reverse}
.nxf-wrap{width:100%;max-width:1200px;margin:0 auto;padding:0 20px}

/* CTA band */
.nxf-cta{margin-top:-1px;padding:34px 0 0}
.nxf-cta-in{display:flex;flex-wrap:wrap;gap:18px;align-items:center;justify-content:space-between;padding:26px 28px;border-radius:22px;
  background:linear-gradient(120deg,rgba(255,176,32,.16),rgba(34,211,238,.12));border:1px solid rgba(255,176,32,.35)}
.nxf-cta h3{margin:0 0 4px;font-size:clamp(1.2rem,2.6vw,1.6rem);color:#fff}
.nxf-cta p{margin:0;color:rgba(243,245,249,.8);font-size:.95rem}
.nxf-cta-btns{display:flex;flex-wrap:wrap;gap:12px}
.nxf-btn{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:999px;font-weight:700;font-size:.92rem;cursor:pointer;
  transition:transform .25s,box-shadow .25s}
.nxf-btn:hover{transform:translateY(-3px)}
.nxf-btn.gold{color:#0b0f17;background:linear-gradient(135deg,#ffb020,#ffd36b);box-shadow:0 10px 24px -12px rgba(255,176,32,.8)}
.nxf-btn.wa{color:#fff;background:#25d366;box-shadow:0 10px 24px -12px rgba(37,211,102,.8)}

/* grid */
.nxf-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr 1.3fr;gap:34px;padding:50px 0 36px}
.nxf-logo{display:block;width:auto;max-width:200px;height:auto;margin-bottom:14px}
.nxf-about{margin:0 0 18px;line-height:1.75;font-size:.93rem;color:rgba(243,245,249,.78)}
.nxf-h{position:relative;margin:0 0 18px;padding-bottom:10px;font-size:.82rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#fff}
.nxf-h::after{content:"";position:absolute;left:0;bottom:0;width:34px;height:2px;border-radius:2px;background:linear-gradient(90deg,#ffb020,#22d3ee);transition:width .4s}
.nxf-col:hover .nxf-h::after{width:64px}
.nxf-links{display:grid;gap:4px}
.nxf-links a{display:inline-flex;align-items:center;gap:0;width:fit-content;padding:5px 0;font-size:.93rem;color:rgba(243,245,249,.8);transition:color .25s,gap .25s,transform .25s}
.nxf-links a svg{width:0;opacity:0;color:#ffb020;transition:width .25s,opacity .25s}
.nxf-links a:hover{color:#ffb020;gap:8px}
.nxf-links a:hover svg{width:14px;opacity:1}

/* social */
.nxf-social{display:flex;gap:12px}
.nxf-social a{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;font-size:1.2rem;color:#fff;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);transition:transform .3s,background .3s,color .3s,border-color .3s}
.nxf-social a:hover{transform:translateY(-5px) rotate(-6deg);color:#0b0f17;border-color:transparent;background:linear-gradient(135deg,#ffb020,#ffd36b)}
.nxf-social a.wa:hover{background:#25d366;color:#fff}

/* contact cards */
.nxf-contact{display:grid;gap:10px;font-style:normal}
.nxf-ci{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:14px;color:rgba(243,245,249,.9);font-size:.9rem;line-height:1.5;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,176,32,.22);transition:transform .3s,border-color .3s}
a.nxf-ci:hover{transform:translateX(4px);border-color:#22d3ee}
.nxf-ci svg{flex:none;width:30px;height:30px;padding:7px;border-radius:9px;color:#0b0f17;background:linear-gradient(135deg,#ffb020,#ffd36b)}
.nxf-ci:nth-child(even) svg{background:linear-gradient(135deg,#22d3ee,#7be9f8)}

/* trust strip */
.nxf-trust{display:flex;flex-wrap:wrap;gap:12px 26px;align-items:center;justify-content:center;padding:18px 0;border-top:1px solid rgba(255,255,255,.1);
  font-size:.82rem;color:rgba(243,245,249,.75)}
.nxf-trust span{display:inline-flex;align-items:center;gap:8px}
.nxf-trust svg{color:#ffb020}

/* bottom bar */
.nxf-bar{border-top:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.35)}
.nxf-bar-in{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:space-between;padding:16px 0;font-size:.84rem;color:rgba(243,245,249,.7)}
.nxf-mini{display:flex;flex-wrap:wrap;gap:6px 18px}
.nxf-mini a{color:rgba(243,245,249,.7);transition:color .25s}
.nxf-mini a:hover{color:#ffb020}
.nxf-top{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;font-size:.82rem;font-weight:600;cursor:pointer;color:#fff;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);transition:transform .3s,background .3s,color .3s}
.nxf-top:hover{transform:translateY(-3px);color:#0b0f17;background:linear-gradient(135deg,#ffb020,#ffd36b)}
.nxf-top svg{animation:nxfBob 1.8s ease-in-out infinite}

@keyframes nxfLine{to{background-position:300% 0}}
@keyframes nxfDrift{from{transform:translate(0,0)}to{transform:translate(50px,-30px)}}
@keyframes nxfBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}

@media(max-width:1000px){.nxf-grid{grid-template-columns:1fr 1fr 1fr}.nxf-brand{grid-column:1/-1}}
@media(max-width:700px){.nxf-grid{grid-template-columns:1fr 1fr;gap:28px}.nxf-visit{grid-column:1/-1}.nxf-cta-in{padding:22px 20px}}
@media(max-width:460px){.nxf-grid{grid-template-columns:1fr}.nxf-cta-btns,.nxf-btn{width:100%;justify-content:center}.nxf-bar-in{justify-content:center;text-align:center}}
@media(prefers-reduced-motion:reduce){.nxf::before,.nxf-glow,.nxf-top svg{animation:none}}
`;

export default function NxFooter() {
  const nx = useNx();
  const wa10 = String(nx.whatsapp || '').slice(-10);
  const phone2 = nx.phone2 ? String(nx.phone2) : '';
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const shop = [
    ['All shirts', '/menswear/shop'],
    ['Formal shirts', '/menswear/shop?category=formal-shirts'],
    ['Casual shirts', '/menswear/shop?category=casual-shirts'],
    ['Printed shirts', '/menswear/shop?category=printed-shirts'],
    ['Checked shirts', '/menswear/shop?category=checked-shirts'],
    ['Linen shirts', '/menswear/shop?category=linen-shirts'],
  ];
  const company = [
    ['About us', '/menswear/about'],
    ['Services', '/menswear/services'],
    ['Happy customers', '/menswear/happy-customers'],
    ['FAQ', '/menswear/faq'],
    ['Terms & Conditions', '/menswear/terms'],
    ['Contact us', '/menswear/contact'],
  ];
  const account = [
    ['Track my order', '/menswear/my-orders'],
    ['My cart', '/menswear/cart'],
    ['Login / Register', '/menswear/login'],
  ];

  return (
    <footer className="nxf" aria-label="Nexora Menswear footer">
      <style>{CSS}</style>
      <div className="nxf-glow g1" /><div className="nxf-glow g2" />

      <div className="nxf-wrap">
        {/* CTA band */}
        <div className="nxf-cta">
          <div className="nxf-cta-in">
            <div>
              <h3>Not sure about size or colour?</h3>
              <p>Send us a message. We help you choose the right shirt before you pay.</p>
            </div>
            <div className="nxf-cta-btns">
              <a className="nxf-btn wa" href={waLink(nx.whatsapp, 'Hi Nexora Menswear, I need details about your shirts.')} target="_blank" rel="noreferrer"><FaWhatsapp /> Chat on WhatsApp</a>
              <Link className="nxf-btn gold" to="/menswear/shop"><FiShoppingBag /> Shop shirts</Link>
            </div>
          </div>
        </div>

        {/* main grid */}
        <div className="nxf-grid">
          <div className="nxf-brand nxf-col">
            <img src="/nexora/logo-full-white.png" alt="Nexora Menswear" width="220" height="146" className="nxf-logo" loading="lazy" />
            <p className="nxf-about">Premium style, modern you. Soft cotton, breathable fabric, durable quality and a perfect fit: simple, classy shirts, always.</p>
            <div className="nxf-social">
              <a href={`https://instagram.com/${nx.instagram}`} target="_blank" rel="noreferrer" aria-label="Nexora Menswear on Instagram"><FaInstagram /></a>
              <a className="wa" href={waLink(nx.whatsapp, 'Hi Nexora Menswear, I need details about your shirts.')} target="_blank" rel="noreferrer" aria-label="Nexora Menswear on WhatsApp"><FaWhatsapp /></a>
            </div>
          </div>

          <nav className="nxf-col" aria-label="Shop">
            <h4 className="nxf-h">Shop</h4>
            <div className="nxf-links">
              {shop.map(([t, to]) => <Link key={to} to={to}><FiArrowRight />{t}</Link>)}
            </div>
          </nav>

          <nav className="nxf-col" aria-label="Company">
            <h4 className="nxf-h">Company</h4>
            <div className="nxf-links">
              {company.map(([t, to]) => <Link key={to} to={to}><FiArrowRight />{t}</Link>)}
            </div>
          </nav>

          <nav className="nxf-col" aria-label="My account">
            <h4 className="nxf-h">My account</h4>
            <div className="nxf-links">
              {account.map(([t, to]) => <Link key={to} to={to}><FiArrowRight />{t}</Link>)}
            </div>
          </nav>

          <div className="nxf-col nxf-visit">
            <h4 className="nxf-h">Visit &amp; call</h4>
            <address className="nxf-contact">
              <div className="nxf-ci"><FiMapPin /><span>{nx.address}</span></div>
              {wa10 && <a className="nxf-ci" href={`tel:+91${wa10}`}><FiPhone /><span>{wa10}</span></a>}
              {phone2 && <a className="nxf-ci" href={`tel:+91${phone2}`}><FiPhone /><span>{phone2}</span></a>}
              {nx.instagram && <a className="nxf-ci" href={`https://instagram.com/${nx.instagram}`} target="_blank" rel="noreferrer"><FaInstagram /><span>@{nx.instagram}</span></a>}
            </address>
          </div>
        </div>

        {/* trust strip */}
        <div className="nxf-trust">
          <span><FiShield /> Secure online payment</span>
          <span><FiTruck /> Delivery across Tamil Nadu</span>
          <span><FaWhatsapp /> WhatsApp size help</span>
        </div>
      </div>

      {/* bottom bar */}
      <div className="nxf-bar">
        <div className="nxf-wrap nxf-bar-in">
          <span>© {new Date().getFullYear()} Nexora Menswear · Thiruchuli. All rights reserved.</span>
          <div className="nxf-mini">
            <Link to="/">Nadulshree Boutique →</Link>
            <Link to="/menswear/admin-login">Admin login</Link>
          </div>
          <button type="button" className="nxf-top" onClick={scrollTop} aria-label="Back to top">Back to top <FiArrowUp /></button>
        </div>
      </div>
    </footer>
  );
}