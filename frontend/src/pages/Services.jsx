import { Link } from 'react-router-dom';
import { FiTruck, FiCreditCard, FiMapPin, FiMessageCircle, FiShoppingBag, FiLock, FiArrowRight } from 'react-icons/fi';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Reveal from '../components/Reveal';
import { IMG } from '../data/images';

const ROWS = [
  [IMG.svc.collection, FiShoppingBag, 'A wide, fresh collection', 'Sarees, kurti sets, tops, leggings and pants in many colours and sizes, with new styles added every week.', ['Real photos of real stock', 'Sizes and colours on every product']],
  [IMG.svc.delivery, FiTruck, 'Delivery to your door', 'We pack every order with care and ship it to your address. Pay securely online.', [/* 'Cash on Delivery', */ 'Secure online payment', 'Free delivery above the checkout amount']],
  [IMG.svc.support, FiMessageCircle, 'Personal support', 'Not sure about size or colour? Message us on Instagram or WhatsApp and we will help you choose.', ['Fast replies', 'Help before and after you order']],
];
const MORE = [
  [FiCreditCard, 'Secure online payment', 'UPI, cards, net banking and wallets, verified securely.'],
  [FiMapPin, 'Live order tracking', 'Follow your parcel step by step after you login.'],
  [FiLock, 'OTP verified accounts', 'Email OTP keeps your account and orders safe.'],
];

export default function Services() {
  return (
    <>
      <PageHero title="Our Services" subtitle="Everything that makes shopping easy" image={IMG.banner.services} />

      <section className="section container">
        <div className="svc-rows">
          {ROWS.map(([img, Icon, title, text, points], i) => (
            <Reveal key={title} y={36}>
              <div className={`svc-row ${i % 2 ? 'flip' : ''}`}>
                <div className="svc-photo"><img src={img} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.opacity = 0; }} /><span><Icon /></span></div>
                <div className="svc-body">
                  <span className="svc-no">0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <ul className="tick-list">{points.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionHead kicker="And more" text="Small things that make a big difference.">Built for <em>peace of mind</em></SectionHead>
          <div className="service-grid">
            {MORE.map(([Icon, title, text], i) => (
              <Reveal key={title} delay={i * 0.08}><div className="service-card"><span><Icon /></span><h3>{title}</h3><p>{text}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <SectionHead kicker="Good to know">Delivery & <em>payment</em></SectionHead>
        <div className="info-split">
          <Reveal x={-30}><div className="info-box"><h3>Delivery</h3><ul className="tick-list"><li>Orders are packed and shipped from our boutique</li><li>Live tracking after login</li><li>Expected delivery date shown on every order</li><li>Free delivery above the amount shown at checkout</li></ul></div></Reveal>
          <Reveal x={30}><div className="info-box"><h3>Payment</h3><ul className="tick-list">{/* <li>Cash on Delivery: pay when you receive</li> */}<li>Online: UPI, cards, net banking, wallets</li><li>Payments are verified securely</li><li>Cancel from My Orders before your parcel is packed</li></ul></div></Reveal>
        </div>
        <div className="center mt"><Link to="/shop" className="btn btn-orange btn-lg">Start shopping <FiArrowRight /></Link></div>
      </section>
    </>
  );
}
