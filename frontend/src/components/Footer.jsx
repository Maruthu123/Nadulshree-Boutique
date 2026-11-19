import { Link } from 'react-router-dom';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FiPhone, FiArrowUpRight, FiArrowUp, FiShield, FiTruck, FiMapPin, FiChevronRight } from 'react-icons/fi';
import { useConfig } from '../context/ConfigContext';

const CATS = [
  ['saree', 'Saree'],
  ['3-piece-set-kurtis', '3 Piece Set Kurtis'],
  ['2-piece-set', '2 Piece Set'],
  ['single-top', 'Single Top'],
  ['legging', 'Legging'],
  ['straight-cut-pant', 'Straight Cut Pant'],
];

const LINKS = [
  ['/about', 'About Us'],
  ['/services', 'Services'],
  ['/happy-customers', 'Happy Customers'],
  ['/faq', 'FAQ'],
  ['/contact', 'Contact'],
  ['/terms', 'Terms & Conditions'],
  ['/my-orders', 'Track Order'],
];

const PERKS = [
  [FiShield, 'Secure online payment'],
  [FiTruck, 'Careful packing & delivery'],
  [FiMapPin, 'Live order tracking'],
];

const PAY = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking'];

export default function Footer() {
  const { whatsapp, instagram } = useConfig();
  const phone = whatsapp.replace(/^91/, '');
  const top = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="ft">
      {/* ---------- call-to-action card that overlaps the footer top ---------- */}
      <div className="container">
        <div className="ft-cta">
          <div>
            <h3>Need help choosing your outfit?</h3>
            <p>Message us any time. We reply personally on WhatsApp and Instagram.</p>
          </div>
          <div className="ft-cta-btns">
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="ft-btn ft-btn-wa"><FaWhatsapp /> Chat on WhatsApp</a>
            <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" className="ft-btn ft-btn-ghost"><FaInstagram /> Follow us</a>
          </div>
        </div>
      </div>

      {/* ---------- main columns ---------- */}
      <div className="container ft-grid">
        <div className="ft-brandcol">
          <div className="brand brand-light">
            <span className="brand-mark">N</span>
            <span className="brand-text">Nadulshree<small>Boutique</small></span>
          </div>
          <p className="ft-about">Sarees, kurti sets, tops, leggings and pants, picked with love and delivered to your doorstep.</p>
          <div className="ft-social">
            <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" aria-label="Instagram" className="ft-soc ig"><FaInstagram /></a>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="ft-soc wa"><FaWhatsapp /></a>
            <a href={`tel:+${whatsapp}`} aria-label="Call" className="ft-soc ph"><FiPhone /></a>
          </div>
        </div>

        <nav className="ft-col" aria-label="Shop">
          <h4>Shop</h4>
          {CATS.map(([slug, name]) => (
            <Link key={slug} to={`/shop?category=${slug}`}><FiChevronRight />{name}</Link>
          ))}
        </nav>

        <nav className="ft-col" aria-label="Quick links">
          <h4>Quick Links</h4>
          {LINKS.map(([to, name]) => (
            <Link key={to} to={to}><FiChevronRight />{name}</Link>
          ))}
        </nav>

        <div className="ft-col">
          <h4>Contact</h4>
          <a className="ft-contact" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
            <span className="wa"><FaWhatsapp /></span>
            <div><small>WhatsApp</small><b>{phone}</b></div><FiArrowUpRight />
          </a>
          <a className="ft-contact" href={`tel:+${whatsapp}`}>
            <span className="ph"><FiPhone /></span>
            <div><small>Call us</small><b>{phone}</b></div><FiArrowUpRight />
          </a>
          <a className="ft-contact" href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer">
            <span className="ig"><FaInstagram /></span>
            <div><small>Instagram</small><b>@{instagram}</b></div><FiArrowUpRight />
          </a>
        </div>
      </div>

      {/* ---------- perks + payment ---------- */}
      <div className="container">
        <div className="ft-strip">
          <ul className="ft-perks">
            {PERKS.map(([Icon, t]) => <li key={t}><Icon />{t}</li>)}
          </ul>
          <div className="ft-pay" aria-label="Accepted payments">
            <small>We accept</small>
            {PAY.map((p) => <span key={p}>{p}</span>)}
          </div>
        </div>
      </div>

      {/* ---------- bottom bar ---------- */}
      <div className="ft-bottom">
        <div className="container ft-bottom-in">
          <span>© {new Date().getFullYear()} Nexora Solution - Thiruchuli. All rights reserved.</span>
          <button type="button" className="ft-top" onClick={top} aria-label="Back to top">Back to top <FiArrowUp /></button>
        </div>
      </div>
    </footer>
  );
}