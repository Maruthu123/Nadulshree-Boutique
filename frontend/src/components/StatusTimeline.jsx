import { motion } from 'framer-motion';
import { FiCheck, FiClipboard, FiPackage, FiTruck, FiMapPin, FiHome, FiXCircle } from 'react-icons/fi';
import { fmtDate } from '../api';

export const STEPS = [
  { key: 'placed', label: 'Order Placed', icon: FiClipboard },
  { key: 'confirmed', label: 'Confirmed', icon: FiCheck },
  { key: 'packed', label: 'Packed', icon: FiPackage },
  { key: 'shipped', label: 'Shipped', icon: FiTruck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: FiMapPin },
  { key: 'delivered', label: 'Delivered', icon: FiHome },
];

export const STATUS_LABEL = {
  placed: 'Order Placed', confirmed: 'Confirmed', packed: 'Packed', shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};

/** Progress bar of the 6 delivery steps + the list of tracking updates (where is my parcel). */
export default function StatusTimeline({ order }) {
  if (order.status === 'cancelled') {
    return <div className="cancelled-note"><FiXCircle /> This order was cancelled.</div>;
  }
  const current = STEPS.findIndex((s) => s.key === order.status);
  const events = [...(order.events || [])].reverse();

  return (
    <div>
      <div className="steps">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i <= current;
          return (
            <div key={s.key} className={`step ${done ? 'done' : ''} ${i === current ? 'now' : ''}`}>
              <motion.span
                className="step-dot"
                initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08, type: 'spring' }}
              ><Icon /></motion.span>
              <small>{s.label}</small>
            </div>
          );
        })}
        <div className="steps-line"><motion.i initial={{ width: 0 }} animate={{ width: `${(current / (STEPS.length - 1)) * 100}%` }} transition={{ duration: 0.9 }} /></div>
      </div>

      {order.current_location && order.status !== 'delivered' && (
        <p className="where"><FiMapPin /> Your parcel is now at <b>{order.current_location}</b></p>
      )}

      <ul className="events">
        {events.map((e, i) => (
          <li key={i}>
            <b>{STATUS_LABEL[e.status] || e.status}</b>
            {e.location && <span> · {e.location}</span>}
            {e.note && <p>{e.note}</p>}
            <small>{fmtDate(e.created_at, true)}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
