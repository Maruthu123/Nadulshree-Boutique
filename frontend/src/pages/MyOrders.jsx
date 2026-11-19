import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import PageHero from '../components/PageHero';
import ProductImage from '../components/ProductImage';
import StatusTimeline, { STATUS_LABEL } from '../components/StatusTimeline';
import { useAuth } from '../context/AuthContext';
import { IMG } from '../data/images';
import api, { errMsg, fmtDate, inr } from '../api';
import { openRazorpay } from '../utils/razorpay';

// Must match CANCEL_REASONS in backend/routes/orders.js
const CANCEL_REASONS = ['Ordered by mistake', 'Want to change size or colour', 'Found a better price', 'Delivery is taking too long', 'Need to change the delivery address', 'Payment problem', 'Other'];

export default function MyOrders() {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState(null);
  const [open, setOpen] = useState(null);
  const [msg, setMsg] = useState(location.state?.notice || '');
  const [busy, setBusy] = useState(null);
  const [cancelFor, setCancelFor] = useState(null);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(() => api.get('/orders/mine').then((r) => setOrders(r.data)).catch((e) => setMsg(errMsg(e))), []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // keeps tracking live
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => { if (orders?.length && open === null) setOpen(orders[0].id); }, [orders, open]);

  const openCancel = (o) => { setCancelFor(o); setReason(''); setNote(''); };
  const cancel = async () => {
    const o = cancelFor;
    if (!reason) { setMsg('Please choose a reason for cancelling.'); return; }
    if (reason === 'Other' && note.trim().length < 3) { setMsg('Please write a few words about why you are cancelling.'); return; }
    setBusy(o.id);
    try {
      await api.post(`/orders/${o.id}/cancel`, { reason, note: note.trim() });
      setCancelFor(null);
      setMsg(o.payment_status === 'paid' ? 'Order cancelled. Your refund will be processed.' : 'Order cancelled.');
      await load();
    } catch (e) { setMsg(errMsg(e)); } finally { setBusy(null); }
  };

  const payNow = async (o) => {
    setBusy(o.id);
    try {
      const { data } = await api.get(`/orders/${o.id}/pay-info`);
      const res = await openRazorpay({ ...data.razorpay, prefill: { name: user.name, email: user.email, contact: o.ship_phone } });
      await api.post('/orders/verify-payment', { orderId: o.id, ...res });
      setMsg('Payment received. Thank you!');
      await load();
    } catch (e) {
      setMsg(e.message === 'cancelled' ? 'Payment was not completed.' : (e.response ? errMsg(e) : e.message));
    } finally { setBusy(null); }
  };

  return (
    <>
      <PageHero title="My Dashboard" subtitle={`Hi ${user?.name?.split(' ')[0] || ''}, track your parcels here`} image={IMG.banner.shop} />
      <section className="section container narrow">
        {msg && <motion.p className="notice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setMsg('')}>{msg}</motion.p>}

        {orders && orders.length > 0 && (
          <div className="stat-grid dash-stats">
            {[
              ['Total orders', orders.length],
              ['On the way', orders.filter((o) => ['packed', 'shipped', 'out_for_delivery'].includes(o.status)).length],
              ['Delivered', orders.filter((o) => o.status === 'delivered').length],
              ['Total spent', inr(orders.filter((o) => o.status !== 'cancelled').reduce((n, o) => n + o.total, 0))],
            ].map(([label, value]) => (
              <div key={label} className="stat"><small>{label}</small><strong>{value}</strong></div>
            ))}
          </div>
        )}
        <div className="account-card">
          <div><b>{user?.name}</b><small>{user?.email}{user?.phone ? ` · ${user.phone}` : ''}</small></div>
          <Link to="/shop" className="btn btn-orange btn-sm">Shop more</Link>
        </div>

        {orders === null ? (
          <div className="skeleton tall" />
        ) : orders.length === 0 ? (
          <div className="empty"><span>📦</span><h3>No orders yet</h3><p>Your orders and their tracking will appear here.</p><Link to="/shop" className="btn btn-orange">Start shopping</Link></div>
        ) : (
          orders.map((o) => {
            const isOpen = open === o.id;
            const needsPay = o.payment_method === 'online' && o.payment_status !== 'paid' && o.status !== 'cancelled';
            return (
              <motion.div key={o.id} layout className="order-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <button className="order-head" onClick={() => setOpen(isOpen ? null : o.id)}>
                  <div>
                    <b>{o.order_no}</b>
                    <small>Placed on {fmtDate(o.created_at)} · {o.items.length} item(s)</small>
                  </div>
                  <span className={`status s-${o.status}`}>{STATUS_LABEL[o.status]}</span>
                  <strong>{inr(o.total)}</strong>
                  <FiChevronDown className={isOpen ? 'chev up' : 'chev'} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div className="order-body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <StatusTimeline order={o} />

                      <div className="order-meta">
                        <div>
                          <h5>Delivery details</h5>
                          <p><b>{o.ship_name}</b> · {o.ship_phone}<br />{o.ship_address}, {o.ship_city}, {o.ship_state} - {o.ship_pincode}</p>
                          {o.status === 'delivered'
                            ? <p>Delivered on <b>{fmtDate(o.delivered_at)}</b></p>
                            : o.status !== 'cancelled' && o.expected_delivery && <p>Expected by <b>{fmtDate(o.expected_delivery)}</b></p>}
                        </div>
                        <div>
                          <h5>Payment</h5>
                          <p>{o.payment_method === 'cod' ? 'Cash on Delivery' : 'Online payment'} · <b className={o.payment_status === 'paid' ? 'ok' : ''}>{o.payment_status.toUpperCase()}</b></p>
                        </div>
                      </div>

                      <div className="order-items">
                        {o.items.map((it) => (
                          <div key={it.id} className="mini">
                            <div className="mini-img"><ProductImage src={it.image} alt={it.name} /></div>
                            <div><b>{it.name}</b><small>{[it.size, it.color].filter(Boolean).join(' · ')} × {it.qty}</small></div>
                            <span>{inr(it.price * it.qty)}</span>
                          </div>
                        ))}
                        <div className="row"><span>Delivery</span><b>{o.shipping_fee === 0 ? 'FREE' : inr(o.shipping_fee)}</b></div>
                        <div className="row total"><span>Total</span><b>{inr(o.total)}</b></div>
                      </div>

                      <div className="order-actions">
                        {needsPay && <button className="btn btn-orange btn-sm" disabled={busy === o.id} onClick={() => payNow(o)}>Pay now</button>}
                        {['placed', 'confirmed'].includes(o.status) && <button className="btn btn-ghost-dark btn-sm" disabled={busy === o.id} onClick={() => openCancel(o)}>Cancel order</button>}
                        {o.status === 'delivered' && <Link to="/happy-customers" className="btn btn-dark btn-sm">Write a review</Link>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}

        {cancelFor && (
          <div role="dialog" aria-modal="true" aria-label="Cancel order" onClick={() => setCancelFor(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: '#222', borderRadius: 16, padding: 24, width: 'min(440px, 100%)', display: 'grid', gap: 12 }}>
              <h3 style={{ margin: 0 }}>Cancel order {cancelFor.order_no}?</h3>
              <p style={{ margin: 0, fontSize: '.9rem' }}>Please tell us why you want to cancel.</p>
              <select value={reason} onChange={(e) => setReason(e.target.value)} style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }}>
                <option value="">Choose a reason</option>
                {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {reason === 'Other' && <textarea rows="3" maxLength={300} placeholder="Write a few words" value={note} onChange={(e) => setNote(e.target.value)} style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }} />}
              {cancelFor.payment_status === 'paid' && <small>You already paid {inr(cancelFor.total)}. It will be refunded to your original payment method.</small>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost-dark btn-sm" onClick={() => setCancelFor(null)}>Keep order</button>
                <button type="button" className="btn btn-orange btn-sm" disabled={busy === cancelFor.id || !reason} onClick={cancel}>Yes, cancel order</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}