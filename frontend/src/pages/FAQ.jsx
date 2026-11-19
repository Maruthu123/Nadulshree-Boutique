import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiPlus, FiSearch, FiX, FiShoppingBag, FiCreditCard, FiTruck, FiRefreshCw, FiHeart, FiUser,
  FiHelpCircle, FiArrowRight, FiList,
} from 'react-icons/fi';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { IMG } from '../data/images';
import { useConfig } from '../context/ConfigContext';
import { inr } from '../api';


/**
 * EDIT the questions and answers any time to match your shop's rules.
 * Each group = [name, icon, [[question, answer], ...]]
 */
const buildGroups = ({ freeShippingAbove, shippingFee }) => [
  ['Ordering', FiShoppingBag, [
    ['How do I place an order?', 'Open any product, choose your size and colour, then tap Buy Now or Add to Cart. Login, enter your delivery address and complete the payment. You will see your order number on the success page.'],
    ['Can I order from Instagram instead of the website?', 'Yes. You can send us a DM on Instagram or a message on WhatsApp with the product photo and we will help you place the order. The website is the fastest way because you can pay and track your parcel yourself.'],
    ['How do I know if a size or colour is available?', 'Available sizes and colours are shown on every product page. If your size is not listed, message us on WhatsApp and we will tell you if it can be arranged.'],
    ['Can I order more than one item together?', 'Yes. Add all your favourites to the cart and check out once. You pay a single delivery charge for the whole order, and it is free above the free-delivery amount.'],
    ['What does "Only few left" mean?', 'Our stock is limited and every design has only a few pieces. When you see a low-stock message, it is better to order soon because we cannot always restock the same piece.'],
    ['Do the colours match the photos?', 'We use real photos of real stock. Colours may look slightly different on different phone screens, so message us on WhatsApp if you need a colour check before ordering.'],
  ]],
  ['Payment', FiCreditCard, [
    ['Which payment options are available?', 'Online payment with UPI, cards, net banking or wallets.' /* COD disabled: 'Cash on Delivery, or online with UPI, ...' */],
    ['Is online payment safe?', 'Yes. Payments are processed by Razorpay, a secure payment gateway. We never see or store your card, UPI or bank details, and every payment is verified before your order is confirmed.'],
    ['My payment failed or I closed the window. What now?', 'Do not worry. Your order is saved. Go to My Orders and tap "Pay now" to try again. If money was deducted and the order still shows pending, message us on WhatsApp with your order number.'],
    ['Money was deducted but my order shows unpaid.', 'This is usually a short bank delay. Please wait a few minutes and refresh My Orders. If it is still unpaid, WhatsApp us your order number and a screenshot of the payment and we will check it for you.'],
    ['Do I get a bill or payment receipt?', 'Your payment confirmation is shown in My Orders and Razorpay also sends a receipt to your email or phone. If you need a bill, message us on WhatsApp.'],
  ]],
  ['Delivery & tracking', FiTruck, [
    ['What are the delivery charges?', `Delivery is FREE on orders above ${inr(freeShippingAbove)}. For smaller orders a delivery charge of ${inr(shippingFee)} is added at checkout, so you always see the final amount before you pay.`],
    ['How long will my parcel take?', 'Delivery time depends on your city and the courier. We pack every order carefully and update the status in My Orders. If you need it by a particular date, message us before ordering.'],
    ['How can I track my order?', 'Login and open My Orders. You will see the current step of your order (placed, confirmed, packed, shipped, out for delivery, delivered) and where the parcel is now.'],
    ['Do you deliver all over India?', 'We ship to many parts of India. Enter your pincode at checkout, and if we cannot reach your area we will tell you on WhatsApp. You can also ask us before ordering.'],
    ['Can I change my delivery address after ordering?', 'You can change it only before the order is packed. Please message us on WhatsApp quickly with your order number and the new address.'],
  ]],
  ['Cancel & exchange', FiRefreshCw, [
    ['Can I cancel my order?', 'Yes, from the My Orders page until the order is packed. After that, please message us on WhatsApp and we will see what can be done.'],
    ['How do I get my money back after cancelling?', 'For a paid order that is cancelled before packing, the amount is refunded to the same payment method you used. Banks usually take a few working days to show it.'],
    ['Exchange and return?', 'Policies can differ by item (for example sarees and stitched wear). Please message us on WhatsApp before ordering and we will explain the details for your item.'],
    ['I received a wrong or damaged item. What should I do?', 'We are sorry about that. Please WhatsApp us within a day of delivery with your order number and clear photos or an unboxing video, and we will sort it out.'],
  ]],
  ['Products & care', FiHeart, [
    ['What do you sell?', 'Sarees, 3 piece set kurtis, 2 piece sets, single tops, leggings and straight cut pants, all hand-picked by Nadulshree Boutique.'],
    ['How do I choose my size?', 'Check the sizes on the product page. If you are between two sizes, we suggest going one size up for kurtis and tops. For help, send us your usual size on WhatsApp and we will guide you.'],
    ['How should I wash my outfits?', 'For sarees, silk and festive wear we suggest dry clean or a gentle cold hand wash in the shade. For daily wear tops, leggings and pants, a normal gentle wash is fine. Wash dark colours separately the first time.'],
    ['Will you restock sold-out designs?', 'Sometimes. Message us on WhatsApp or Instagram with the design name and we will tell you if it is coming back.'],
  ]],
  ['Account & support', FiUser, [
    ['Why do I need to login with an OTP?', 'We verify your email with a 6-digit OTP when you register. This keeps your account and your order tracking safe.'],
    ['I did not receive the OTP email.', 'Please check your spam or promotions folder and wait a minute before asking for a new code. Make sure you typed your email correctly. If it still does not arrive, WhatsApp us and we will help.'],
    ['I forgot my password.', 'Use the "Forgot password" link on the login page. We will send a verification code to your email so you can set a new password.'],
    ['How can I contact you?', 'Use the Contact page, WhatsApp, or send us a message on Instagram. We reply personally, usually within a few hours.'],
  ]],
];

export default function FAQ() {
  const { whatsapp, instagram, freeShippingAbove, shippingFee } = useConfig();
  const groups = useMemo(() => buildGroups({ freeShippingAbove, shippingFee }), [freeShippingAbove, shippingFee]);

  const [group, setGroup] = useState(-1);          // -1 = all
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState('0-0');

  // flat list so search and "All" are easy
  const all = useMemo(
    () => groups.flatMap(([name, , items], g) => items.map(([q, a], i) => ({ key: `${g}-${i}`, g, name, q, a }))),
    [groups],
  );

  const term = query.trim().toLowerCase();
  const shown = all.filter((x) => (term ? `${x.q} ${x.a}`.toLowerCase().includes(term) : group === -1 || x.g === group));

  const pick = (g) => { setGroup(g); setQuery(''); setOpen(''); };

  return (
    <>
      <PageHero title="FAQ" subtitle="Quick answers to common questions" image={IMG.banner.faq} />

      <section className="section container fq">
        {/* ---------------- search ---------------- */}
        <Reveal>
          <div className="fq-search">
            <FiSearch />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(''); }}
              placeholder="Search your question... (payment, size, tracking)"
              aria-label="Search FAQ"
            />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><FiX /></button>}
          </div>
        </Reveal>

        <div className="fq-layout">
          {/* ---------------- left: categories + help ---------------- */}
          <Reveal x={-30}>
            <aside className="fq-side">
              <nav className="fq-cats" aria-label="FAQ topics">
                <button type="button" className={!term && group === -1 ? 'on' : ''} onClick={() => pick(-1)}>
                  <span><FiList /></span>All questions<em>{all.length}</em>
                </button>
                {groups.map(([name, Icon, items], g) => (
                  <button type="button" key={name} className={!term && group === g ? 'on' : ''} onClick={() => pick(g)}>
                    <span><Icon /></span>{name}<em>{items.length}</em>
                  </button>
                ))}
              </nav>

              <div className="fq-help">
                <div className="fq-help-img">
                  <img src={IMG.faq} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.opacity = 0; }} />
                </div>
                <div className="fq-help-body">
                  <b>Still have a question?</b>
                  <span>We reply personally, usually within a few hours.</span>
                  <a className="btn btn-orange btn-block" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><FaWhatsapp /> WhatsApp us</a>
                  <a className="btn btn-ghost-dark btn-block" href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer"><FaInstagram /> Instagram DM</a>
                </div>
              </div>
            </aside>
          </Reveal>

          {/* ---------------- right: questions ---------------- */}
          <div className="fq-main">
            <div className="fq-bar">
              <h2>{term ? <>Results for “<em>{query.trim()}</em>”</> : group === -1 ? 'All questions' : groups[group][0]}</h2>
              <span>{shown.length} {shown.length === 1 ? 'question' : 'questions'}</span>
            </div>

            {shown.length === 0 ? (
              <div className="fq-empty">
                <FiHelpCircle />
                <h3>No answer found</h3>
                <p>We could not find “{query.trim()}”. Ask us directly and we will help you.</p>
                <a className="btn btn-orange" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi, I have a question: ${query.trim()}`)}`} target="_blank" rel="noreferrer"><FaWhatsapp /> Ask on WhatsApp</a>
              </div>
            ) : (
              <div className="fq-list">
                {shown.map((x, n) => {
                  const isOpen = open === x.key;
                  return (
                    <motion.div
                      key={x.key}
                      layout="position"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(n, 6) * 0.04 }}
                      className={isOpen ? 'fq-item open' : 'fq-item'}
                    >
                      <button type="button" onClick={() => setOpen(isOpen ? '' : x.key)} aria-expanded={isOpen}>
                        <span className="fq-n">{String(n + 1).padStart(2, '0')}</span>
                        <span className="fq-q">
                          {x.q}
                          {(term || group === -1) && <small>{x.name}</small>}
                        </span>
                        <span className="fq-plus"><FiPlus /></span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div className="fq-a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }}>
                            <p>{x.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ---------------- bottom CTA ---------------- */}
        <Reveal>
          <div className="fq-cta">
            <div>
              <h3>Can’t find what you need?</h3>
              <p>Send us a message and we will get back to you personally.</p>
            </div>
            <div className="fq-cta-btns">
              <Link to="/contact" className="btn btn-orange btn-lg">Contact us <FiArrowRight /></Link>
              <Link to="/shop" className="btn btn-ghost btn-lg">Browse the shop</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}