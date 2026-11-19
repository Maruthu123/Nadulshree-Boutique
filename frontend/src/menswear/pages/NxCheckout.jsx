import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCreditCard } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import NxImage from '../NxImage';
import { useNxCart } from '../NxCartContext';
import { useAuth } from '../../context/AuthContext';
import { useNxTotals } from './NxCart';
import { useNx, waLink } from '../nxUtils';
import api, { errMsg, inr } from '../../api';
import { openRazorpay } from '../../utils/razorpay';
import { payProblem } from '../../utils/payStatus';

const STATES = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Puducherry', 'Maharashtra', 'Delhi', 'Gujarat', 'Rajasthan', 'West Bengal', 'Other'];

export default function NxCheckout() {
  const { items, clear } = useNxCart();
  const { user } = useAuth();
  const nx = useNx();
  const problem = payProblem(nx);
  const navigate = useNavigate();
  const { subtotal, shipping, total } = useNxTotals();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: '', city: '', state: 'Tamil Nadu', pincode: '' });
  const [notes, setNotes] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders/last-address').then((r) => {
      const a = r.data;
      if (a) setForm({ name: a.ship_name, phone: a.ship_phone, address: a.ship_address, city: a.ship_city, state: a.ship_state, pincode: a.ship_pincode });
    }).catch(() => {});
  }, []);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (items.length === 0) {
    return <section className="nx-section"><div className="nx-container nx-empty"><h3>Your cart is empty</h3><Link to="/menswear/shop" className="nx-btn">Go to shop</Link></div></section>;
  }

  const finish = (orderNo) => { clear(); navigate(`/menswear/order-success/${orderNo}`, { replace: true }); };
  const pay = { shopName: 'Nexora Menswear', color: '#b8892a' };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ productId: i.productId, qty: i.qty, size: i.size, color: i.color })),
        shipping: form, paymentMethod: 'online', notes,
      });
      try {
        const res = await openRazorpay({ ...data.razorpay, ...pay, prefill: { name: form.name, email: user?.email, contact: form.phone } });
        await api.post('/orders/verify-payment', { orderId: data.order.id, ...res });
        finish(data.order.order_no);
      } catch (payErr) {
        clear();
        const reason = payErr.message === 'cancelled' ? 'Payment was not completed.' : (payErr.response ? errMsg(payErr) : payErr.message);
        navigate('/menswear/my-orders', { replace: true, state: { notice: `${reason} Your order ${data.order.order_no} is saved. Use "Pay now" to try again.` } });
      }
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="nx-pagehead"><div className="nx-container"><small>NEXORA MENSWEAR</small><h1>Checkout</h1></div></section>
      <section className="nx-section nx-tight">
        <div className="nx-container">
          <form className="nx-cart" onSubmit={submit}>
            <div>
              <motion.div className="nx-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3>Delivery address</h3>
                <div className="nx-form">
                  <label>Full name<input name="name" value={form.name} onChange={change} required autoComplete="name" /></label>
                  <label>Mobile number<input name="phone" value={form.phone} onChange={change} required inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" title="10 digit mobile number" autoComplete="tel" /></label>
                  <label className="span2">Address (house no, street, area)<textarea name="address" value={form.address} onChange={change} required rows={3} autoComplete="street-address" /></label>
                  <label>City / Town<input name="city" value={form.city} onChange={change} required autoComplete="address-level2" /></label>
                  <label>State<select name="state" value={form.state} onChange={change}>{STATES.map((s) => <option key={s}>{s}</option>)}</select></label>
                  <label>Pincode<input name="pincode" value={form.pincode} onChange={change} required inputMode="numeric" maxLength={6} pattern="[0-9]{6}" title="6 digit pincode" autoComplete="postal-code" /></label>
                  <label className="span2">Note for us (optional)<input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} placeholder="Landmark, preferred time, etc." /></label>
                </div>
              </motion.div>
              <motion.div className="nx-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3>Payment</h3>
                <div className="nx-pay">
                  <FiCreditCard /><div><b>Pay online</b><small>UPI, cards, net banking, wallets (Razorpay)</small></div>
                </div>
                {problem && <p className="nx-warn">{problem.customer}{import.meta.env.DEV && <><br /><small>[dev] {problem.dev}</small></>}</p>}
                <a className="nx-link" href={waLink(nx.whatsapp, 'Hi Nexora Menswear, I need help with my order.')} target="_blank" rel="noreferrer"><FaWhatsapp /> Need help? Chat with us on WhatsApp</a>
              </motion.div>
            </div>

            <aside className="nx-summary">
              <h3>Your order</h3>
              <div className="nx-mini-list">
                {items.map((i) => (
                  <div key={`${i.productId}${i.size}${i.color}`} className="nx-mini">
                    <div className="nx-mini-img"><NxImage src={i.image} color={i.color} alt={i.name} p={{ name: i.name, colors: [i.color] }} /></div>
                    <div><b>{i.name}</b><small>{[i.size, i.color].filter(Boolean).join(' · ')} × {i.qty}</small></div>
                    <span>{inr(i.price * i.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="row"><span>Subtotal</span><b>{inr(subtotal)}</b></div>
              <div className="row"><span>Delivery</span><b>{shipping === 0 ? 'FREE' : inr(shipping)}</b></div>
              <div className="row total"><span>Total</span><b>{inr(total)}</b></div>
              <label className="nx-agree">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
                <span>I agree to the <Link to="/menswear/terms" target="_blank" className="nx-link">Terms & Conditions</Link></span>
              </label>
              {error && <p className="nx-warn">{error}</p>}
              <button className="nx-btn nx-btn-lg nx-block" disabled={busy || !!problem || !agree}>{busy ? 'Please wait...' : `Pay ${inr(total)}`}</button>
            </aside>
          </form>
        </div>
      </section>
    </>
  );
}
