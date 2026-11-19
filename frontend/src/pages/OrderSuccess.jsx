import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import PageHero from '../components/PageHero';

export default function OrderSuccess() {
  const { orderNo } = useParams();
  return (
    <>
      <PageHero title="Thank you!" subtitle="Your order has been placed" />
      <section className="section container">
        <motion.div className="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
          <motion.span className="success-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25, type: 'spring', stiffness: 260 }}><FiCheck /></motion.span>
          <h2>Order placed successfully</h2>
          <p>Your order number is</p>
          <div className="order-no">{orderNo}</div>
          <p className="muted">You can see every update of your parcel in the tracking page.</p>
          <div className="hero-cta center-row">
            <Link to="/my-orders" className="btn btn-orange">Track my order</Link>
            <Link to="/shop" className="btn btn-ghost-dark">Continue shopping</Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}
