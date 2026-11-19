import { Link } from 'react-router-dom';
import { FiHeart, FiAward, FiSmile, FiTruck, FiArrowRight } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Reveal from '../components/Reveal';
import { useConfig } from '../context/ConfigContext';
import { IMG } from '../data/images';

const STATS = [['6', 'Collections'], ['100%', 'Checked before packing'], ['UPI', 'Secure online payment'] /* ['COD', 'Cash on Delivery'] - COD disabled */, ['24/7', 'Instagram & WhatsApp']];
const VALUES = [
  [FiHeart, 'Made with love', 'Every piece is chosen with care for colour, fabric and fit.'],
  [FiAward, 'Quality first', 'We check each item before it is packed for you.'],
  [FiSmile, 'Personal service', 'You talk to us directly on Instagram and WhatsApp.'],
  [FiTruck, 'Easy delivery', 'Secure online payment, with live tracking.'],
];
const RANGE = ['Sarees', '3 Piece Set Kurtis', '2 Piece Sets', 'Single Tops', 'Leggings', 'Straight Cut Pants'];
const JOURNEY = [
  ['Started on Instagram', 'Customers saw our new arrivals on Instagram and ordered by message.'],
  ['A growing collection', 'From sarees to leggings, we added more styles, sizes and colours.'],
  ['Now fully online', 'Browse, pay and track your parcel on your own, any time.'],
];

export default function About() {
  const { instagram } = useConfig();
  return (
    <>
      <PageHero title="About Us" subtitle="The story behind Nadulshree Boutique" image={IMG.banner.about} />

      <section className="section container">
        <div className="about-grid">
          <Reveal x={-30}>
            <div className="about-photos">
              <img className="ap-1" src={IMG.aboutA} alt="Saree collection" loading="lazy" onError={(e) => { e.currentTarget.style.opacity = 0; }} />
              <img className="ap-2" src={IMG.aboutB} alt="Fabric collection" loading="lazy" onError={(e) => { e.currentTarget.style.opacity = 0; }} />
              <span className="ap-badge">N</span>
            </div>
          </Reveal>
          <Reveal x={30}>
            <span className="kicker left">Our story</span>
            <h2 className="promo-title">Fashion that <em>feels like you</em></h2>
            <p className="lead">Nadulshree Boutique brings you sarees, kurti sets, tops, leggings and pants for every day and every celebration.</p>
            <p>We started on Instagram, where customers see new arrivals first and order by message. This website makes it easier: browse everything, pick your size, pay online or on delivery, and follow your parcel to your door.</p>
            <div className="range-chips">{RANGE.map((r) => <span key={r}>{r}</span>)}</div>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-orange">Explore collection <FiArrowRight /></Link>
              <a className="btn btn-ghost-dark" href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer"><FaInstagram /> @{instagram}</a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container">
        <div className="stat-band">
          {STATS.map(([n, l], i) => (
            <Reveal key={l} delay={i * 0.07} y={20}><div className="stat"><b>{n}</b><span>{l}</span></div></Reveal>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container narrow">
          <SectionHead kicker="Our journey">How we <em>grew</em></SectionHead>
          <div className="timeline">
            {JOURNEY.map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.1} x={i % 2 ? 30 : -30}>
                <div className="tl-item"><span className="tl-dot">{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <SectionHead kicker="What we stand for" light>Our <em>promise</em></SectionHead>
          <div className="feature-grid">
            {VALUES.map(([Icon, title, text], i) => (
              <Reveal key={title} delay={i * 0.08}><div className="feature"><span><Icon /></span><h3>{title}</h3><p>{text}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
