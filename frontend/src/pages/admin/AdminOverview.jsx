import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api, { errMsg, fmtDate, inr } from '../../api';
import { STATUS_LABEL } from '../../components/StatusTimeline';

function Count({ to, money }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const end = Number(to) || 0;
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 800);
      setV(Math.round(end * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{money ? inr(v) : v}</>;
}

export default function AdminOverview({ go, store = 'all' }) {
  const [s, setS] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { setS(null); api.get('/admin/stats', { params: { store } }).then((r) => setS(r.data)).catch((e) => setError(errMsg(e))); }, [store]);

  if (error) return <p className="warn">{error}</p>;
  if (!s) return <div className="skeleton tall" />;

  const cards = [
    ['New orders', s.orders.new_orders, 'orders', false],
    ['In transit', s.orders.in_transit, 'orders', false],
    ['Delivered', s.orders.delivered, 'delivered', false],
    ['Revenue', s.orders.revenue, null, true],
    ['Products', s.products.total, 'products', false],
    ['Customers', s.customers, 'customers', false],
  ];
  const max = Math.max(1, ...s.daily.map((d) => d.orders));

  return (
    <>
      <div className="stat-grid">
        {cards.map(([label, value, target, money], i) => (
          <motion.button key={label} className="stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => target && go(target)} disabled={!target}>
            <small>{label}</small>
            <strong><Count to={value} money={money} /></strong>
          </motion.button>
        ))}
      </div>

      {s.products.low_stock > 0 && (
        <p className="notice" onClick={() => go('products')}>⚠️ {s.products.low_stock} product(s) have 3 or fewer pieces left. Tap to update stock.</p>
      )}

      <div className="admin-two">
        <div className="card">
          <h3>Orders in the last 7 days</h3>
          <div className="bars">
            {s.daily.map((d, i) => (
              <div key={d.day} className="bar">
                <span>{d.orders}</span>
                <motion.i initial={{ height: 0 }} animate={{ height: `${(d.orders / max) * 100}%` }} transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }} />
                <small>{d.day.slice(0, 6)}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Recent orders</h3>
          {s.recent.length === 0 ? <p className="muted">No orders yet.</p> : (
            <ul className="recent">
              {s.recent.map((o) => (
                <li key={o.id} onClick={() => go('orders')}>
                  <div><b>{o.order_no}</b><small>{o.ship_name} · {fmtDate(o.created_at)}{store === 'all' && o.store === 'menswear' ? ' · Nexora' : ''}</small></div>
                  <span className={`status s-${o.status}`}>{STATUS_LABEL[o.status]}</span>
                  <strong>{inr(o.total)}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
