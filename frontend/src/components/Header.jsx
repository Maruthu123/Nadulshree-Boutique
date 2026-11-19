import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTshirt } from 'react-icons/fa';
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX, FiLogOut, FiGrid, FiPackage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './nexoraLink.css';

// LOGO - unga logo path inga maathunga (public folder la file irukanum)
// public folder la irukkura "ns" image. Extension theriyala na, ella extension-um auto-a try pannum
const LOGO_NAME = '/ns';
const LOGO_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'PNG', 'JPG', 'JPEG', 'jfif', 'avif'];

const LINKS = [
  ['/', 'Home'],
  ['/shop', 'Shop'],
  ['/about', 'About'],
  ['/services', 'Services'],
  ['/happy-customers', 'Happy Customers'],
  ['/faq', 'FAQ'],
  ['/contact', 'Contact'],
  ['/menswear', 'Nexora Menswear'],
];

/**
 * The navigation lives INSIDE the hero (no separate navbar section):
 * logo on the left, search box in the center, login on the right.
 */
export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState(() => new URLSearchParams(location.search).get('q') || '');
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const [extIdx, setExtIdx] = useState(0);
  const logoSrc = extIdx < LOGO_EXTS.length ? `${LOGO_NAME}.${LOGO_EXTS[extIdx]}` : null;

  useEffect(() => { setDrawer(false); setMenu(false); }, [location.pathname]);

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
  };

  return (
    <header className="hdr">
      <style>{`
        .brand{display:flex;align-items:center;gap:10px}
        .brand-logo{height:44px;width:auto;max-width:90px;display:block;object-fit:contain;flex:none}
        @media(max-width:600px){.brand-logo{height:36px;max-width:70px}}
      `}</style>

      <div className="hdr-row">
        <Link to="/" className="brand" aria-label="Nadulshree Boutique home">
          {logoSrc && (
            <img
              key={logoSrc}
              src={logoSrc}
              alt=""
              className="brand-logo"
              onError={() => setExtIdx((i) => i + 1)}
            />
          )}
          <span className="brand-text">Nadulshree<small>Boutique</small></span>
        </Link>

        <form className="hdr-search" onSubmit={submit} role="search">
          <FiSearch aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search saree, kurti set, top, legging..."
            aria-label="Search products"
          />
          <button type="submit">Search</button>
        </form>

        <div className="hdr-actions">
          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <FiShoppingBag />
            {count > 0 && <motion.span key={count} className="badge" initial={{ scale: 0.4 }} animate={{ scale: 1 }}>{count}</motion.span>}
          </Link>

          {user ? (
            <div className="user-menu" ref={menuRef}>
              <button className="btn btn-orange btn-sm" onClick={() => setMenu((v) => !v)}>
                <FiUser /> <span className="hide-sm">{user.name.split(' ')[0]}</span>
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div className="dropdown" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    {isAdmin
                      ? <Link to="/admin"><FiGrid /> Admin Dashboard</Link>
                      : <Link to="/my-orders"><FiPackage /> My Orders & Tracking</Link>}
                    <button onClick={() => { logout(); navigate('/'); }}><FiLogOut /> Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn btn-orange btn-sm"><FiUser /> <span>Login</span></Link>
          )}

          <button className="icon-btn menu-btn" onClick={() => setDrawer(true)} aria-label="Open menu"><FiMenu /></button>
        </div>
      </div>

      <nav className="hdr-links" aria-label="Main">
        {LINKS.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => [isActive ? 'active' : '', to === '/menswear' ? 'nav-nx' : ''].join(' ').trim()}>
            {to === '/menswear' && <FaTshirt aria-hidden />}{label}
          </NavLink>
        ))}
      </nav>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div className="drawer-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
              <button className="icon-btn drawer-close" onClick={() => setDrawer(false)} aria-label="Close menu"><FiX /></button>
              {LINKS.map(([to, label], i) => (
                <motion.div key={to} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <NavLink to={to} end={to === '/'} className={({ isActive }) => [isActive ? 'active' : '', to === '/menswear' ? 'nav-nx' : ''].join(' ').trim()}>{to === '/menswear' && <FaTshirt aria-hidden />} {label}</NavLink>
                </motion.div>
              ))}
              <Link to="/cart">Cart ({count})</Link>
              {user
                ? <>
                    <Link to={isAdmin ? '/admin' : '/my-orders'}>{isAdmin ? 'Admin Dashboard' : 'My Orders & Tracking'}</Link>
                    <button className="btn btn-orange" onClick={() => { logout(); navigate('/'); }}>Logout</button>
                  </>
                : <Link to="/login" className="btn btn-orange">Login / Register</Link>}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}