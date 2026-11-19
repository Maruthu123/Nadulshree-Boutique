import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown, FiCheck, FiClipboard, FiPackage, FiTruck, FiMapPin, FiHome, FiXCircle } from 'react-icons/fi';
import NxImage from '../NxImage';
import { useAuth } from '../../context/AuthContext';
import api, { errMsg, fmtDate, inr } from '../../api';
import { openRazorpay } from '../../utils/razorpay';
import { CANCEL_REASONS, REFUND_DAYS } from '../data/nxTerms';

const STEPS = [
  ['placed', 'Order Placed', FiClipboard], ['confirmed', 'Confirmed', FiCheck], ['packed', 'Packed', FiPackage],
  ['shipped', 'Shipped', FiTruck], ['out_for_delivery', 'Out for Delivery', FiMapPin], ['delivered', 'Delivered', FiHome],
];
const LABEL = Object.fromEntries([...STEPS.map(([k, l]) => [k, l]), ['cancelled', 'Cancelled']]);

function Timeline({ order }) {
  if (order.status === 'cancelled') return (
    <div>
      <div className="nx-cancelled"><FiXCircle /> This order was cancelled.</div>
      {order.cancel_reason && <p className="nx-cancel-why">Reason: <b>{order.cancel_reason}</b>{order.cancel_note ? ` (${order.cancel_note})` : ''}{order.payment_status === 'paid' ? ` · Refund to your payment method in ${REFUND_DAYS}.` : ''}</p>}
    </div>
  );
  const cur = STEPS.findIndex((s) => s[0] === order.status);
  const events = [...(order.events || [])].reverse();
  return (
    <div>
      <div className="nx-steps">
        {STEPS.map(([k, l, Icon], i) => (
          <div key={k} className={`st ${i <= cur ? 'done' : ''} ${i === cur ? 'now' : ''}`}>
            <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08, type: 'spring' }}><Icon /></motion.span>
            <small>{l}</small>
          </div>
        ))}
        <div className="line"><motion.i initial={{ width: 0 }} animate={{ width: `${(cur / (STEPS.length - 1)) * 100}%` }} transition={{ duration: 0.9 }} /></div>
      </div>
      {order.current_location && order.status !== 'delivered' && <p className="nx-where"><FiMapPin /> Your parcel is now at <b>{order.current_location}</b></p>}
      <ul className="nx-events">
        {events.map((e, i) => (
          <li key={i}><b>{LABEL[e.status] || e.status}</b>{e.location && <span> · {e.location}</span>}{e.note && <p>{e.note}</p>}<small>{fmtDate(e.created_at, true)}</small></li>
        ))}
      </ul>
    </div>
  );
}

export default function NxOrders() {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState(null);
  const [open, setOpen] = useState(null);
  const [msg, setMsg] = useState(location.state?.notice || '');
  const [busy, setBusy] = useState(null);
  const [cancelFor, setCancelFor] = useState(null);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(() => api.get('/orders/mine', { params: { store: 'menswear' } }).then((r) => setOrders(r.data)).catch((e) => setMsg(errMsg(e))), []);
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
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
      setMsg(o.payment_status === 'paid' ? `Order cancelled. Your refund will reach you in ${REFUND_DAYS}.` : 'Order cancelled.');
      await load();
    } catch (e) { setMsg(errMsg(e)); } finally { setBusy(null); }
  };
  const payNow = async (o) => {
    setBusy(o.id);
    try {
      const { data } = await api.get(`/orders/${o.id}/pay-info`);
      const res = await openRazorpay({ ...data.razorpay, shopName: 'Nexora Menswear', color: '#b8892a', prefill: { name: user.name, email: user.email, contact: o.ship_phone } });
      await api.post('/orders/verify-payment', { orderId: o.id, ...res });
      setMsg('Payment received. Thank you!'); await load();
    } catch (e) { setMsg(e.message === 'cancelled' ? 'Payment was not completed.' : (e.response ? errMsg(e) : e.message)); } finally { setBusy(null); }
  };

  return (
    <>
      <section className="nx-pagehead"><div className="nx-container"><small>NEXORA MENSWEAR</small><h1>My Orders</h1><p className="nx-muted">Hi {user?.name?.split(' ')[0]}, track your parcels here.</p></div></section>
      <section className="nx-section nx-tight">
        <div className="nx-container nx-narrow">
          {msg && <p className="nx-notice" onClick={() => setMsg('')}>{msg}</p>}
          {orders === null ? <div className="nx-skel tall" /> : orders.length === 0 ? (
            <div className="nx-empty"><h3>No orders yet</h3><p>Your Nexora orders and their tracking will appear here.</p><Link to="/menswear/shop" className="nx-btn">Start shopping</Link></div>
          ) : orders.map((o) => {
            const isOpen = open === o.id;
            const needsPay = o.payment_method === 'online' && o.payment_status !== 'paid' && o.status !== 'cancelled';
            return (
              <motion.div key={o.id} layout className="nx-order" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <button className="nx-order-head" onClick={() => setOpen(isOpen ? null : o.id)}>
                  <div><b>{o.order_no}</b><small>Placed {fmtDate(o.created_at)} · {o.items.length} item(s)</small></div>
                  <span className={`nx-status s-${o.status}`}>{LABEL[o.status]}</span>
                  <strong>{inr(o.total)}</strong>
                  <FiChevronDown className={isOpen ? 'chev up' : 'chev'} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div className="nx-order-body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <Timeline order={o} />
                      <div className="nx-meta">
                        <div><h5>Delivery details</h5><p><b>{o.ship_name}</b> · {o.ship_phone}<br />{o.ship_address}, {o.ship_city}, {o.ship_state} - {o.ship_pincode}</p>
                          {o.status === 'delivered' ? <p>Delivered on <b>{fmtDate(o.delivered_at)}</b></p> : o.status !== 'cancelled' && o.expected_delivery && <p>Expected by <b>{fmtDate(o.expected_delivery)}</b></p>}</div>
                        <div><h5>Payment</h5><p>Online · <b className={o.payment_status === 'paid' ? 'ok' : ''}>{o.payment_status.toUpperCase()}</b></p></div>
                      </div>
                      <div className="nx-mini-list">
                        {o.items.map((it) => (
                          <div key={it.id} className="nx-mini">
                            <div className="nx-mini-img"><NxImage src={it.image} color={it.color} alt={it.name} p={{ name: it.name, colors: [it.color] }} /></div>
                            <div><b>{it.name}</b><small>{[it.size, it.color].filter(Boolean).join(' · ')} × {it.qty}</small></div>
                            <span>{inr(it.price * it.qty)}</span>
                          </div>
                        ))}
                        <div className="row"><span>Delivery</span><b>{o.shipping_fee === 0 ? 'FREE' : inr(o.shipping_fee)}</b></div>
                        <div className="row total"><span>Total</span><b>{inr(o.total)}</b></div>
                      </div>
                      <div className="nx-actions-row">
                        {needsPay && <button className="nx-btn nx-btn-sm" disabled={busy === o.id} onClick={() => payNow(o)}>Pay now</button>}
                        {['placed', 'confirmed'].includes(o.status) && <button className="nx-btn nx-btn-ghost nx-btn-sm" disabled={busy === o.id} onClick={() => openCancel(o)}>Cancel order</button>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>
      <AnimatePresence>
        {cancelFor && (
          <motion.div className="nxm-modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCancelFor(null)}>
            <motion.div className="nxm-modal" role="dialog" aria-modal="true" aria-label="Cancel order" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <h3>Cancel order {cancelFor.order_no}?</h3>
              <p>Tell us why you want to cancel. It takes 5 seconds and helps us improve.</p>
              <div className="nxm-reasons" role="radiogroup" aria-label="Reason">
                {CANCEL_REASONS.map((r) => (
                  <label key={r} className={reason === r ? 'on' : ''}><input type="radio" name="why" checked={reason === r} onChange={() => setReason(r)} /> {r}</label>
                ))}
              </div>
              {reason && <textarea rows={3} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder={reason === 'Other' ? 'Please write your reason' : 'Anything else you want to tell us? (optional)'} />}
              <div className="nxm-refund">
                {cancelFor.payment_status === 'paid'
                  ? <>You paid <b>{inr(cancelFor.total)}</b>. The full amount is refunded to the same UPI, card or bank account in {REFUND_DAYS}.</>
                  : 'You have not paid for this order, so nothing will be charged.'}
                {' '}<Link to="/menswear/terms" target="_blank" className="nx-link">Cancellation policy</Link>
              </div>
              <div className="nxm-modal-actions">
                <button type="button" className="nx-btn nx-btn-ghost nx-btn-sm" onClick={() => setCancelFor(null)}>Keep my order</button>
                <button type="button" className="nx-btn nx-btn-sm" disabled={busy === cancelFor.id || !reason} onClick={cancel}>{busy === cancelFor.id ? 'Cancelling...' : 'Cancel order'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
