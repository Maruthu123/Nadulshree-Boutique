import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown, FiDownload } from 'react-icons/fi';
import api, { errMsg, fmtDate, inr } from '../../api';
import { STATUS_LABEL } from '../../components/StatusTimeline';

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

function exportCsv(rows, delivered) {
  const head = ['Order No', 'Customer', 'Phone', 'Address', 'Items', 'Total', 'Payment', 'Payment Status', 'Status', 'Ordered On', delivered ? 'Delivered On' : 'Expected By'];
  const lines = rows.map((o) => [
    o.order_no, o.ship_name, o.ship_phone, `${o.ship_address}, ${o.ship_city}, ${o.ship_state} - ${o.ship_pincode}`,
    o.items.map((i) => `${i.name}${i.size ? ` (${i.size})` : ''} x${i.qty}`).join('; '),
    o.total, o.payment_method.toUpperCase(), o.payment_status, STATUS_LABEL[o.status],
    fmtDate(o.created_at), delivered ? fmtDate(o.delivered_at) : fmtDate(o.expected_delivery),
  ]);
  const csv = [head, ...lines].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
  a.download = `${delivered ? 'delivered' : 'orders'}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function OrderEditor({ order, onSaved, setMsg }) {
  const [f, setF] = useState({
    status: order.status,
    current_location: order.current_location || '',
    note: '',
    expected_delivery: order.expected_delivery ? order.expected_delivery.slice(0, 10) : '',
    payment_status: order.payment_status,
  });
  const [busy, setBusy] = useState(false);
  const locked = order.status === 'cancelled';

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.patch(`/admin/orders/${order.id}`, f);
      setMsg(`Order ${order.order_no} updated`);
      onSaved(data);
    } catch (err) { setMsg(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <form className="editor" onSubmit={save}>
      {order.status === 'cancelled' && order.cancel_reason && (
        <p className="notice" style={{ marginBottom: 12 }}><b>Cancel reason:</b> {order.cancel_reason}{order.cancel_note ? ` — ${order.cancel_note}` : ''}</p>
      )}
      <h5>Update order & tracking</h5>
      <div className="form-grid">
        <label>Status
          <select value={f.status} disabled={locked} onChange={(e) => setF({ ...f, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </label>
        <label>Parcel is now at (location)
          <input value={f.current_location} placeholder="e.g. Madurai hub" onChange={(e) => setF({ ...f, current_location: e.target.value })} />
        </label>
        <label>Expected delivery date
          <input type="date" value={f.expected_delivery} onChange={(e) => setF({ ...f, expected_delivery: e.target.value })} />
        </label>
        <label>Payment status
          <select value={f.payment_status} onChange={(e) => setF({ ...f, payment_status: e.target.value })}>
            {['pending', 'paid', 'failed', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="span2">Note for customer (shown in tracking)
          <input value={f.note} placeholder="e.g. Handed over to courier, tracking ID 12345" onChange={(e) => setF({ ...f, note: e.target.value })} />
        </label>
      </div>
      <button className="btn btn-orange btn-sm" disabled={busy}>{busy ? 'Saving...' : 'Save update'}</button>
    </form>
  );
}

export default function AdminOrders({ mode, store = 'all' }) {
  const delivered = mode === 'delivered';
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    const url = delivered ? '/admin/delivered' : '/admin/orders';
    return api.get(url, { params: { store, status: status || undefined, q: q || undefined, from: from || undefined, to: to || undefined } })
      .then((r) => setRows(r.data)).catch((e) => setMsg(errMsg(e)));
  }, [delivered, store, status, q, from, to]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const replace = (o) => setRows((rs) => rs.map((r) => (r.id === o.id ? o : r)));
  const total = (rows || []).reduce((n, o) => n + (o.status === 'cancelled' ? 0 : o.total), 0);

  return (
    <>
      <div className="toolbar wrap">
        {!delivered && (
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        )}
        {!delivered && <input className="search-in" placeholder="Order no / name / phone" value={q} onChange={(e) => setQ(e.target.value)} />}
        <label className="date-f">{delivered ? 'Delivered from' : 'Ordered from'}<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="date-f">to<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <button className="btn btn-ghost-dark btn-sm" disabled={!rows?.length} onClick={() => exportCsv(rows, delivered)}><FiDownload /> Export CSV</button>
      </div>
      {msg && <p className="notice" onClick={() => setMsg('')}>{msg}</p>}

      {rows === null ? <div className="skeleton tall" /> : rows.length === 0 ? (
        <div className="empty"><span>{delivered ? '✅' : '🧾'}</span><h3>{delivered ? 'No delivered orders' : 'No orders found'}</h3></div>
      ) : (
        <>
          <p className="muted">{rows.length} order(s) · Value {inr(total)}</p>
          <div className="orders-admin">
            {rows.map((o) => {
              const isOpen = open === o.id;
              return (
                <div key={o.id} className="order-card">
                  <button className="order-head" onClick={() => setOpen(isOpen ? null : o.id)}>
                    <div>
                      <b>{o.order_no}{o.store === 'menswear' && <em className="store-tag">Nexora</em>}</b>
                      <small>{o.ship_name} · {o.ship_phone}</small>
                    </div>
                    <div className="dates">
                      <small>Ordered: {fmtDate(o.created_at)}</small>
                      <small>{o.status === 'delivered' ? `Delivered: ${fmtDate(o.delivered_at)}` : o.status === 'cancelled' ? '—' : `Expected: ${fmtDate(o.expected_delivery)}`}</small>
                    </div>
                    <span className={`status s-${o.status}`}>{STATUS_LABEL[o.status]}</span>
                    <strong>{inr(o.total)}</strong>
                    <FiChevronDown className={isOpen ? 'chev up' : 'chev'} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div className="order-body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <div className="order-meta">
                          <div>
                            <h5>Deliver to</h5>
                            <p><b>{o.ship_name}</b> · {o.ship_phone}<br />{o.ship_address}, {o.ship_city}, {o.ship_state} - {o.ship_pincode}</p>
                            {o.customer_email && <p className="muted">{o.customer_email}</p>}
                            {o.notes && <p><i>Note: {o.notes}</i></p>}
                          </div>
                          <div>
                            <h5>Payment</h5>
                            <p>{o.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'} · <b className={o.payment_status === 'paid' ? 'ok' : ''}>{o.payment_status.toUpperCase()}</b></p>
                            {o.razorpay_payment_id && <p className="muted">Ref: {o.razorpay_payment_id}</p>}
                          </div>
                        </div>
                        <table className="table slim">
                          <thead><tr><th>Item</th><th>Size</th><th>Colour</th><th>Qty</th><th>Price</th></tr></thead>
                          <tbody>{o.items.map((i, k) => <tr key={k}><td>{i.name}</td><td>{i.size || '-'}</td><td>{i.color || '-'}</td><td>{i.qty}</td><td>{inr(i.price * i.qty)}</td></tr>)}</tbody>
                        </table>
                        {!delivered && <OrderEditor order={o} onSaved={replace} setMsg={setMsg} />}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
