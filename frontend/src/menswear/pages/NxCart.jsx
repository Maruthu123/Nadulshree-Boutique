import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import NxImage from '../NxImage';
import { useNxCart } from '../NxCartContext';
import { useNx, waLink, productUrl } from '../nxUtils';
import { inr } from '../../api';

export function useNxTotals() {
  const { subtotal } = useNxCart();
  const { shippingFee, freeShippingAbove } = useNx();
  const shipping = subtotal === 0 || subtotal >= freeShippingAbove ? 0 : shippingFee;
  return { subtotal, shipping, total: subtotal + shipping, freeShippingAbove };
}

export default function NxCart() {
  const { items, setQty, remove, lineKey } = useNxCart();
  const nx = useNx();
  const navigate = useNavigate();
  const { subtotal, shipping, total, freeShippingAbove } = useNxTotals();

  const waText = () => [
    'Hi Nexora Menswear, I want to order these shirts:',
    ...items.map((i, n) => `${n + 1}. ${i.name}${i.size ? ` | Size ${i.size}` : ''}${i.color ? ` | ${i.color}` : ''} x${i.qty} = ₹${(i.price * i.qty).toLocaleString('en-IN')}\n   ${productUrl(i.productId)}`),
    `Total: ₹${subtotal.toLocaleString('en-IN')}`,
  ].join('\n');

  return (
    <>
      <section className="nx-pagehead"><div className="nx-container"><small>NEXORA MENSWEAR</small><h1>Your Cart</h1></div></section>
      <section className="nx-section nx-tight">
        <div className="nx-container">
          {items.length === 0 ? (
            <div className="nx-empty"><h3>Your cart is empty</h3><p>Pick a shirt you like and add it to your bag.</p><Link to="/menswear/shop" className="nx-btn">Start shopping</Link></div>
          ) : (
            <div className="nx-cart">
              <div className="nx-cart-list">
                <AnimatePresence>
                  {items.map((i) => {
                    const k = lineKey(i);
                    return (
                      <motion.div key={k} layout className="nx-cart-item" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -60 }}>
                        <Link to={`/menswear/product/${i.productId}`} className="nx-cart-img"><NxImage src={i.image} color={i.color} alt={i.name} p={{ name: i.name, colors: [i.color] }} /></Link>
                        <div className="nx-cart-info">
                          <h4>{i.name}</h4>
                          <small>{[i.size && `Size: ${i.size}`, i.color && `Colour: ${i.color}`].filter(Boolean).join(' · ')}</small>
                          <strong>{inr(i.price)}</strong>
                          <div className="nx-qty sm">
                            <button onClick={() => setQty(k, i.qty - 1)} aria-label="Less"><FiMinus /></button><span>{i.qty}</span><button onClick={() => setQty(k, i.qty + 1)} aria-label="More"><FiPlus /></button>
                          </div>
                        </div>
                        <div className="nx-cart-side"><b>{inr(i.price * i.qty)}</b><button className="nx-icon danger" onClick={() => remove(k)} aria-label="Remove"><FiTrash2 /></button></div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              <aside className="nx-summary">
                <h3>Order Summary</h3>
                <div className="row"><span>Subtotal</span><b>{inr(subtotal)}</b></div>
                <div className="row"><span>Delivery</span><b>{shipping === 0 ? 'FREE' : inr(shipping)}</b></div>
                {shipping > 0 && <small className="nx-muted">Add {inr(freeShippingAbove - subtotal)} more for free delivery</small>}
                <div className="row total"><span>Total</span><b>{inr(total)}</b></div>
                <button className="nx-btn nx-btn-lg nx-block" onClick={() => navigate('/menswear/checkout')}>Pay online · Checkout</button>
                <a className="nx-btn nx-btn-wa nx-block" href={waLink(nx.whatsapp, waText())} target="_blank" rel="noreferrer"><FaWhatsapp /> Enquire on WhatsApp</a>
                <Link to="/menswear/shop" className="nx-btn nx-btn-ghost nx-block">Continue shopping</Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
