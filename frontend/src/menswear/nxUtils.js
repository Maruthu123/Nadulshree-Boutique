import { useCallback, useEffect, useState } from 'react';
import { useConfig } from '../context/ConfigContext';

/** Nexora settings (WhatsApp, phone, Instagram, address, delivery charge). Works even before the server answers. */
export function useNx() {
  const c = useConfig();
  return {
    whatsapp: '916383718976',
    phone2: '9942148763',
    instagram: 'nexora_menswear_',
    address: 'Poduru, Thiruchuli, Erode',
    shippingFee: 70,
    freeShippingAbove: 1999,
    ...(c.nexora || {}),
    razorpayEnabled: c.razorpayEnabled,
    configState: c.configState,
  };
}

export const waLink = (number, text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

export const productUrl = (id) => `${window.location.origin}/menswear/product/${id}`;

/** The message customers send on WhatsApp to enquire about one shirt. */
export function enquiryText(p, { size, color, qty } = {}) {
  const lines = [
    'Hi Nexora Menswear, I want to enquire about this shirt:',
    `*${p.name}*`,
    `Price: ₹${Number(p.price).toLocaleString('en-IN')}`,
    size ? `Size: ${size}` : null,
    color ? `Colour: ${color}` : null,
    qty && qty > 1 ? `Quantity: ${qty}` : null,
    productUrl(p.id),
  ].filter(Boolean);
  return lines.join('\n');
}

/** Wishlist (heart button), saved on the phone only. */
export function useWishlist() {
  const read = () => { try { return JSON.parse(localStorage.getItem('nx_wish')) || []; } catch { return []; } };
  const [ids, setIds] = useState(read);
  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener('nx-wish', sync);
    return () => window.removeEventListener('nx-wish', sync);
  }, []);
  const toggle = useCallback((id) => {
    const cur = read();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    try { localStorage.setItem('nx_wish', JSON.stringify(next)); } catch { /* blocked */ }
    window.dispatchEvent(new Event('nx-wish'));
  }, []);
  return { ids, has: (id) => ids.includes(id), toggle };
}

export const discount = (p) => (p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0);

// Shirt styles used for pictures when a product has no photo yet
export const STYLE_BY_CATEGORY = {
  'formal-shirts': { pattern: 'plain', sleeve: 'long' },
  'casual-shirts': { pattern: 'plain', sleeve: 'long' },
  'printed-shirts': { pattern: 'print', sleeve: 'long' },
  'checked-shirts': { pattern: 'check', sleeve: 'long' },
  'linen-shirts': { pattern: 'stripe', sleeve: 'long' },
  'half-sleeve-shirts': { pattern: 'plain', sleeve: 'short' },
};
