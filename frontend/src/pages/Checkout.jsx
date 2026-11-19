import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCreditCard } from 'react-icons/fi';
// import { FiDollarSign } from 'react-icons/fi'; // used only by the COD option (disabled)
import PageHero from '../components/PageHero';
import ProductImage from '../components/ProductImage';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { useTotals } from './Cart';
import api, { errMsg, inr } from '../api';
import { openRazorpay } from '../utils/razorpay';
import { payProblem } from '../utils/payStatus';

const STATES = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Puducherry', 'Maharashtra', 'Delhi', 'Gujarat', 'Rajasthan', 'West Bengal', 'Other'];

export default function Checkout() {
  const { items, clear } = useCart();
  const { user } = useAuth();
  const cfg = useConfig();
  const { razorpayEnabled, configState } = cfg;
  const problem = payProblem(cfg);
  const navigate = useNavigate();
  const { subtotal, shipping, total } = useTotals();

  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: '', city: '', state: 'Tamil Nadu', pincode: '' });
  // const [payment, setPayment] = useState('cod'); // COD disabled - online payment only
  const [payment, setPayment] = useState('online');
  const [notes, setNotes] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // fill the address of the previous order (saves typing)
  useEffect(() => {
    api.get('/orders/last-address').then((r) => {
      const a = r.data;
      if (a) setForm({ name: a.ship_name, phone: a.ship_phone, address: a.ship_address, city: a.ship_city, state: a.ship_state, pincode: a.ship_pincode });
    }).catch(() => {});
  }, []);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (items.length === 0) {
    return (<><PageHero title="Checkout" /><div className="container section empty"><h3>Your cart is empty</h3><Link to="/shop" className="btn btn-orange">Go to shop</Link></div></>);
  }

  const finish = (orderNo) => { clear(); navigate(`/order-success/${orderNo}`, { replace: true }); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ productId: i.productId, qty: i.qty, size: i.size, color: i.color })),
        shipping: form, paymentMethod: payment, notes,
      });

      // COD disabled - online payment only
      // if (payment === 'cod') return finish(data.order.order_no);

      // online payment
      try {
        const res = await openRazorpay({ ...data.razorpay, prefill: { name: form.name, email: user?.email, contact: form.phone } });
        await api.post('/orders/verify-payment', { orderId: data.order.id, ...res });
        finish(data.order.order_no);
      } catch (payErr) {
        clear(); // order exists already; the person can pay again from My Orders
        const reason = payErr.message === 'cancelled' ? 'Payment was not completed.' : (payErr.response ? errMsg(payErr) : payErr.message);
        navigate('/my-orders', { replace: true, state: { notice: `${reason} Your order ${data.order.order_no} is saved. Use "Pay now" to try again.` } });
      }
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHero title="Checkout" subtitle="Delivery address and payment" />
      <section className="section container">
        <form className="cart-layout" onSubmit={submit}>
          <div>
            <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3>Delivery Address</h3>
              <div className="form-grid">
                <label>Full name<input name="name" value={form.name} onChange={change} required autoComplete="name" /></label>
                <label>Mobile number<input name="phone" value={form.phone} onChange={change} required inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" title="10 digit mobile number" autoComplete="tel" /></label>
                <label className="span2">Address (house no, street, area)<textarea name="address" value={form.address} onChange={change} required rows={3} autoComplete="street-address" /></label>
                <label>City / Town<input name="city" value={form.city} onChange={change} required autoComplete="address-level2" /></label>
                <label>State
                  <select name="state" value={form.state} onChange={change}>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
                </label>
                <label>Pincode<input name="pincode" value={form.pincode} onChange={change} required inputMode="numeric" maxLength={6} pattern="[0-9]{6}" title="6 digit pincode" autoComplete="postal-code" /></label>
                <label className="span2">Note for us (optional)<input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} placeholder="Landmark, preferred colour, etc." /></label>
              </div>
              {problem && <p className="warn" style={{ marginTop: 12 }}>{problem.customer}{import.meta.env.DEV && <><br /><small>[dev] {problem.dev}</small></>}</p>}
            </motion.div>

            <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3>Payment Method</h3>
              <div className="pay-options">
                {/* COD disabled - online payment only
                <label className={payment === 'cod' ? 'pay active' : 'pay'}>
                  <input type="radio" name="pay" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
                  <FiDollarSign /><div><b>Cash on Delivery</b><small>Pay when you receive the parcel</small></div>
                </label>
                */}
                <label className={`${payment === 'online' ? 'pay active' : 'pay'} `}>
                  <input type="radio" name="pay" checked={payment === 'online'} onChange={() => setPayment('online')} />
                  <FiCreditCard /><div><b>Pay Online</b><small>UPI, cards, net banking, wallets</small></div>
                </label>
              </div>
            </motion.div>
          </div>

          <aside className="summary">
            <h3>Your Order</h3>
            <div className="mini-list">
              {items.map((i) => (
                <div key={`${i.productId}${i.size}${i.color}`} className="mini">
                  <div className="mini-img"><ProductImage src={i.image} alt={i.name} /></div>
                  <div><b>{i.name}</b><small>{[i.size, i.color].filter(Boolean).join(' · ')} × {i.qty}</small></div>
                  <span>{inr(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="row"><span>Subtotal</span><b>{inr(subtotal)}</b></div>
            <div className="row"><span>Delivery</span><b>{shipping === 0 ? 'FREE' : inr(shipping)}</b></div>
            <div className="row total"><span>Total</span><b>{inr(total)}</b></div>
            <label className="check" style={{ margin: '10px 0', fontSize: '.88rem' }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
              <span>I agree to the <Link to="/terms" target="_blank" className="link">Terms & Conditions</Link></span>
            </label>
            {error && <p className="warn">{error}</p>}
            <button className="btn btn-orange btn-block btn-lg" disabled={busy || !!problem || !agree}>
              {/* {busy ? 'Please wait...' : payment === 'cod' ? 'Place Order' : `Pay ${inr(total)}`} */}
              {busy ? 'Please wait...' : `Pay ${inr(total)}`}
            </button>
          </aside>
        </form>
      </section>
    </>
  );
}
