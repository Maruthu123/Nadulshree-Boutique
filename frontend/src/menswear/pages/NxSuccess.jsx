import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

export default function NxSuccess() {
  const { orderNo } = useParams();
  return (
    <section className="nx-section">
      <div className="nx-container">
        <motion.div className="nx-success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25, type: 'spring', stiffness: 260 }}><FiCheck /></motion.span>
          <h2>Order placed successfully</h2>
          <p className="nx-muted">Your order number is</p>
          <div className="nx-orderno">{orderNo}</div>
          <p className="nx-muted">You can follow every update of your parcel on the tracking page.</p>
          <div className="nx-cta center">
            <Link to="/menswear/my-orders" className="nx-btn">Track my order</Link>
            <Link to="/menswear/shop" className="nx-btn nx-btn-ghost">Continue shopping</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
