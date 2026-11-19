import { createContext, useContext, useEffect, useMemo, useState } from 'react';

/** Cart of Nexora Menswear. It is kept separate from the Nadulshree cart (different storage key). */
const NxCartContext = createContext(null);
export const useNxCart = () => useContext(NxCartContext);

const KEY = 'nx_cart';
const lineKey = (i) => `${i.productId}|${i.size || ''}|${i.color || ''}`;

export function NxCartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage blocked */ }
  }, [items]);

  const value = useMemo(() => {
    const add = (item, qty = 1) => setItems((prev) => {
      const k = lineKey(item);
      const found = prev.find((p) => lineKey(p) === k);
      if (found) return prev.map((p) => (lineKey(p) === k ? { ...p, qty: Math.min(10, p.qty + qty) } : p));
      return [...prev, { ...item, qty }];
    });
    const setQty = (k, qty) => setItems((prev) => prev.map((p) => (lineKey(p) === k ? { ...p, qty: Math.max(1, Math.min(10, qty)) } : p)));
    const remove = (k) => setItems((prev) => prev.filter((p) => lineKey(p) !== k));
    const clear = () => setItems([]);
    return {
      items, add, setQty, remove, clear, lineKey,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.price * i.qty, 0),
    };
  }, [items]);

  return <NxCartContext.Provider value={value}>{children}</NxCartContext.Provider>;
}
