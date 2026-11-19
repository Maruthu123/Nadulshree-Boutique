import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import PageHero from '../components/PageHero';
import ProductImage from '../components/ProductImage';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import { inr } from '../api';

export function useTotals() {
  const { subtotal } = useCart();
  const { shippingFee, freeShippingAbove } = useConfig();
  const shipping = subtotal === 0 || subtotal >= freeShippingAbove ? 0 : shippingFee;
  return { subtotal, shipping, total: subtotal + shipping, freeShippingAbove };
}

export default function Cart() {
  const { items, setQty, remove, lineKey } = useCart();
  const navigate = useNavigate();
  const { subtotal, shipping, total, freeShippingAbove } = useTotals();

  return (
    <>
      <PageHero title="Your Cart" subtitle={items.length ? `${items.length} item(s) in your bag` : 'Your bag is empty'} />
      <section className="section container">
        {items.length === 0 ? (
          <div className="empty"><span>🛍️</span><h3>Your cart is empty</h3><p>Add something beautiful to your bag.</p><Link to="/shop" className="btn btn-orange">Start shopping</Link></div>
        ) : (
          <div className="cart-layout">
            <div className="cart-list">
              <AnimatePresence>
                {items.map((i) => {
                  const k = lineKey(i);
                  return (
                    <motion.div key={k} layout className="cart-item" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -60 }}>
                      <Link to={`/product/${i.productId}`} className="cart-img"><ProductImage src={i.image} alt={i.name} /></Link>
                      <div className="cart-info">
                        <h4>{i.name}</h4>
                        <small>{[i.size && `Size: ${i.size}`, i.color && `Colour: ${i.color}`].filter(Boolean).join(' · ')}</small>
                        <strong>{inr(i.price)}</strong>
                        <div className="qty sm">
                          <button onClick={() => (i.qty <= 1 ? remove(k) : setQty(k, i.qty - 1))} aria-label={i.qty <= 1 ? 'Remove item' : 'Less'}>{i.qty <= 1 ? <FiTrash2 /> : <FiMinus />}</button>
                          <span>{i.qty}</span>
                          <button onClick={() => setQty(k, i.qty + 1)} aria-label="More"><FiPlus /></button>
                        </div>
                        <button type="button" onClick={() => remove(k)} style={{ marginTop: 6, background: 'none', border: 0, padding: 0, color: '#c0392b', cursor: 'pointer', fontSize: '.82rem', textDecoration: 'underline' }}>Remove from cart</button>
                      </div>
                      <div className="cart-side">
                        <b>{inr(i.price * i.qty)}</b>
                        <button className="icon-btn danger" onClick={() => remove(k)} aria-label="Remove"><FiTrash2 /></button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <aside className="summary">
              <h3>Order Summary</h3>
              <div className="row"><span>Subtotal</span><b>{inr(subtotal)}</b></div>
              <div className="row"><span>Delivery</span><b>{shipping === 0 ? 'FREE' : inr(shipping)}</b></div>
              {shipping > 0 && <small className="muted">Add {inr(freeShippingAbove - subtotal)} more for free delivery</small>}
              <div className="row total"><span>Total</span><b>{inr(total)}</b></div>
              <button className="btn btn-orange btn-block btn-lg" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
              <Link to="/shop" className="btn btn-ghost-dark btn-block">Continue shopping</Link>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}