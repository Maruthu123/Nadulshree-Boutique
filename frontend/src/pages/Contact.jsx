import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FiPhone, FiCheckCircle, FiUser, FiSmartphone, FiMail, FiClock, FiShoppingBag, FiShield, FiArrowUpRight, FiHelpCircle } from 'react-icons/fi';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { IMG } from '../data/images';
import { useConfig } from '../context/ConfigContext';
import api from '../api';


const TOPICS = ['Order help', 'Size & fit', 'Colour match', 'Delivery status', 'Payment', 'Other'];
const EMPTY = { name: '', phone: '', email: '', topic: TOPICS[0], message: '' };

export default function Contact() {
  const { whatsapp, instagram } = useConfig();
  const phone = whatsapp.replace(/^91/, '');
  const [form, setForm] = useState(EMPTY);
  const [sentUrl, setSentUrl] = useState('');
  const [error, setError] = useState('');

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  /** The exact text that will be sent to WhatsApp (also used for the live preview). */
  const text = useMemo(() => {
    const lines = [
      'Hi Nadulshree Boutique! 👋',
      '',
      `*Name:* ${form.name.trim() || '-'}`,
      `*Mobile:* ${form.phone.trim() || '-'}`,
    ];
    if (form.email.trim()) lines.push(`*Email:* ${form.email.trim()}`);
    lines.push(`*Topic:* ${form.topic}`, '', '*Message:*', form.message.trim() || '-');
    return lines.join('\n');
  }, [form]);

  const waUrl = (t) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(t)}`;

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 2) return setError('Please enter your name.');
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone.trim())) return setError('Enter a valid 10-digit mobile number (or leave it empty).');
    if (form.message.trim().length < 3) return setError('Please type your message.');

    const url = waUrl(text);
    window.open(url, '_blank', 'noopener'); // open WhatsApp straight from the click (so it is not blocked)

    // backup copy for the admin "Messages" tab. Remove this block if you only want WhatsApp.
    api.post('/contact', { name: form.name, phone: form.phone, email: form.email, message: `[${form.topic}] ${form.message}` }).catch(() => {});

    setSentUrl(url);
    setForm(EMPTY);
  };

  const CARDS = [
    ['wa', FaWhatsapp, 'WhatsApp', phone, 'Fastest way, we reply personally', `https://wa.me/${whatsapp}`],
    ['ig', FaInstagram, 'Instagram', `@${instagram}`, 'Our main shop. DM us to order!', `https://instagram.com/${instagram}`],
    ['ph', FiPhone, 'Call us', phone, 'Talk to us directly', `tel:+${whatsapp}`],
  ];

  const INFO = [
    [FiClock, 'Replies', 'Usually within a few hours'],
    [FiShoppingBag, 'Best way to order', 'Instagram DM or this website'],
    [FiShield, 'Payment', 'Secure online payment'],
  ];

  return (
    <>
      <PageHero title="Contact Us" subtitle="We would love to hear from you" image={IMG.banner.contact} />

      <section className="section container ct">
        <div className="ct-grid">
          {/* ---------------- LEFT: ways to reach us ---------------- */}
          <Reveal x={-30}>
            <div className="ct-left">
              <span className="kicker left">Get in touch</span>
              <h2 className="ct-h">Let’s talk <em>style</em></h2>
              <p className="ct-lead">Questions about size, colour, fabric or your order? Message us and we will help you pick the perfect outfit.</p>

              <div className="ct-cards">
                {CARDS.map(([cls, Icon, title, val, sub, href]) => (
                  <a key={title} href={href} target={href.startsWith('tel') ? undefined : '_blank'} rel="noreferrer" className={`ct-card ${cls}`}>
                    <span className="ct-ic"><Icon /></span>
                    <div><small>{title}</small><b>{val}</b><em>{sub}</em></div>
                    <FiArrowUpRight />
                  </a>
                ))}
              </div>

              <div className="ct-photo">
                <img src={IMG.contact} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.opacity = 0; }} />
                <span>Visit our Instagram for the latest styles</span>
              </div>
            </div>
          </Reveal>

          {/* ---------------- RIGHT: form -> WhatsApp ---------------- */}
          <Reveal x={30}>
            <div className="ct-form-card">
              <div className="ct-form-head">
                <span className="ct-wa-badge"><FaWhatsapp /></span>
                <div>
                  <h3>Send us a message</h3>
                  <p>Your message opens in WhatsApp, ready to send.</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {sentUrl ? (
                  <motion.div key="done" className="ct-done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                    <FiCheckCircle />
                    <h3>WhatsApp is opening…</h3>
                    <p>Just press <b>Send</b> in WhatsApp and we will reply soon. Nothing opened?</p>
                    <div className="ct-done-btns">
                      <a href={sentUrl} target="_blank" rel="noreferrer" className="btn btn-orange"><FaWhatsapp /> Open WhatsApp again</a>
                      <button type="button" className="btn btn-ghost-dark" onClick={() => setSentUrl('')}>Write another</button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} noValidate>
                    <div className="ct-fields">
                      <label className="ct-field">
                        <span>Your name *</span>
                        <div><FiUser /><input name="name" value={form.name} onChange={change} maxLength={60} placeholder="Your full name" autoComplete="name" /></div>
                      </label>
                      <label className="ct-field">
                        <span>Mobile number</span>
                        <div><FiSmartphone /><input name="phone" value={form.phone} onChange={change} inputMode="numeric" maxLength={10} placeholder="10 digit number" autoComplete="tel" /></div>
                      </label>
                      <label className="ct-field span2">
                        <span>Email (optional)</span>
                        <div><FiMail /><input type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" autoComplete="email" /></div>
                      </label>

                      <div className="ct-field span2">
                        <span>What is it about?</span>
                        <div className="ct-topics">
                          {TOPICS.map((t) => (
                            <button type="button" key={t} className={form.topic === t ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, topic: t }))}>{t}</button>
                          ))}
                        </div>
                      </div>

                      <label className="ct-field span2">
                        <span>Message *</span>
                        <textarea name="message" value={form.message} onChange={change} rows={4} maxLength={600} placeholder="Tell us what you need..." />
                        <small className="ct-count">{form.message.length}/600</small>
                      </label>
                    </div>

                    {/* live preview of what will arrive on WhatsApp */}
                    <div className="ct-preview" aria-label="WhatsApp preview">
                      <small>Preview on WhatsApp</small>
                      <div className="ct-bubble">{text.replace(/\*/g, '')}</div>
                    </div>

                    {error && <p className="warn ct-err">{error}</p>}

                    <button className="ct-send" type="submit"><FaWhatsapp /> Send on WhatsApp</button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>

        {/* ---------------- info band ---------------- */}
        <Reveal>
          <div className="ct-band">
            {INFO.map(([Icon, t, s]) => (
              <div key={t}><span><Icon /></span><div><b>{t}</b><small>{s}</small></div></div>
            ))}
            <Link to="/faq" className="ct-band-faq"><FiHelpCircle /><div><b>Read our FAQ</b><small>Quick answers</small></div><FiArrowUpRight /></Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}