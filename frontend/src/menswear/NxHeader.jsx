import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX, FiLogOut, FiGrid, FiPackage } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNxCart } from './NxCartContext';
import { useNx, waLink } from './nxUtils';

const LINKS = [
  ['/menswear', 'Home', true],
  ['/menswear/shop', 'Shop', false],
  ['/menswear/about', 'About', false],
  ['/menswear/services', 'Services', false],
  ['/menswear/happy-customers', 'Happy Customers', false],
  ['/menswear/faq', 'FAQ', false],
  ['/menswear/contact', 'Contact', false],
];

export default function NxHeader() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useNxCart();
  const nx = useNx();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState('');
  const menuRef = useRef(null);

  useEffect(() => { setDrawer(false); setMenu(false); setSearch(false); }, [location.pathname, location.search]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const t = q.trim();
    navigate(t ? `/menswear/shop?q=${encodeURIComponent(t)}` : '/menswear/shop');
  };

  const isActive = (to, end) => {
    const [path, qs] = to.split('?');
    if (qs) return location.pathname === path && location.search.includes(qs);
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path) && !location.search.includes('category=');
  };

  return (
    <>
      <div className="nx-topbar">
        <span>Free delivery above ₹{nx.freeShippingAbove.toLocaleString('en-IN')}</span>
        <i />
        <a href={waLink(nx.whatsapp, 'Hi Nexora Menswear, I need details about your shirts.')} target="_blank" rel="noreferrer"><FaWhatsapp /> Order / enquire: {nx.whatsapp.slice(-10)}</a>
      </div>
      <header className={`nx-hdr ${scrolled ? 'solid' : ''}`}>
        <div className="nx-hdr-row">
          <Link to="/menswear" className="nx-brand" aria-label="Nexora Menswear home">
            <img src="/nexora/logo.png" alt="Nexora Menswear" width="64" height="64" />
            <span>NE<i>X</i>ORA<small>MENSWEAR</small></span>
          </Link>

          <nav className="nx-links" aria-label="Main">
            {LINKS.map(([to, label, end]) => (
              <Link key={to} to={to} className={isActive(to, end) ? 'active' : ''}>{label}</Link>
            ))}
          </nav>

          <div className="nx-actions">
            <button className="nx-icon" onClick={() => setSearch((v) => !v)} aria-label="Search"><FiSearch /></button>
            <Link to="/menswear/cart" className="nx-icon" aria-label="Cart">
              <FiShoppingBag />
              {count > 0 && <motion.span key={count} className="nx-badge" initial={{ scale: 0.4 }} animate={{ scale: 1 }}>{count}</motion.span>}
            </Link>
            {user ? (
              <div className="nx-user" ref={menuRef}>
                <button className="nx-btn nx-btn-sm" onClick={() => setMenu((v) => !v)}><FiUser /> <span className="nx-hide-sm">{user.name.split(' ')[0]}</span></button>
                <AnimatePresence>
                  {menu && (
                    <motion.div className="nx-drop" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      {isAdmin
                        ? <Link to="/menswear/admin"><FiGrid /> Admin Dashboard</Link>
                        : <Link to="/menswear/my-orders"><FiPackage /> My Orders & Tracking</Link>}
                      <button onClick={() => { logout(); navigate('/menswear'); }}><FiLogOut /> Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/menswear/login" className="nx-btn nx-btn-sm"><FiUser /> <span className="nx-hide-sm">Login</span></Link>
            )}
            <button className="nx-icon nx-burger" onClick={() => setDrawer(true)} aria-label="Open menu"><FiMenu /></button>
          </div>
        </div>

        <AnimatePresence>
          {search && (
            <motion.form className="nx-search" onSubmit={submit} role="search" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <FiSearch aria-hidden />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shirts: formal, checked, linen, white..." aria-label="Search shirts" />
              <button className="nx-btn nx-btn-sm" type="submit">Search</button>
            </motion.form>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div className="nx-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside className="nx-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
              <button className="nx-icon nx-drawer-x" onClick={() => setDrawer(false)} aria-label="Close menu"><FiX /></button>
              <img src="/nexora/logo.png" alt="" width="96" height="96" />
              {LINKS.map(([to, label], i) => (
                <motion.div key={to} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link to={to}>{label}</Link>
                </motion.div>
              ))}
              <Link to="/">Nadulshree Boutique</Link>
              <Link to="/menswear/cart">Cart ({count})</Link>
              {user
                ? <>
                    <Link to={isAdmin ? '/menswear/admin' : '/menswear/my-orders'}>{isAdmin ? 'Admin Dashboard' : 'My Orders & Tracking'}</Link>
                    <button className="nx-btn" onClick={() => { logout(); navigate('/menswear'); }}>Logout</button>
                  </>
                : <Link to="/menswear/login" className="nx-btn">Login / Register</Link>}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
