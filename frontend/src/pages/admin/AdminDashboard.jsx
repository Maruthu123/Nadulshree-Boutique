import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiHome, FiBox, FiShoppingBag, FiCheckCircle, FiUsers, FiMessageSquare, FiStar, FiLogOut, FiExternalLink, FiMenu, FiImage } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminCustomers from './AdminCustomers';
import AdminMessages from './AdminMessages';
import AdminReviews from './AdminReviews';
import AdminHero from './AdminHero';

const TABS = [
  ['overview', 'Overview', FiHome],
  ['products', 'Products', FiBox],
  ['orders', 'Orders', FiShoppingBag],
  ['delivered', 'Delivered', FiCheckCircle],
  ['customers', 'Customers', FiUsers],
  ['messages', 'Messages', FiMessageSquare],
  ['reviews', 'Reviews', FiStar],
];
// Only the Nexora Menswear dashboard has the home-page hero photos
const HERO_TAB = ['hero', 'Hero photos', FiImage];

/** fixedStore="menswear" -> the Nexora Menswear dashboard (opened at /menswear/admin): only that shop, no shop switch. */
export default function AdminDashboard({ fixedStore }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [nav, setNav] = useState(false);
  const [pickedStore, setStore] = useState(() => localStorage.getItem('admin_store') || 'all'); // all | boutique | menswear
  const store = fixedStore || pickedStore;
  const tabs = fixedStore === 'menswear' ? [TABS[0], TABS[1], HERO_TAB, ...TABS.slice(2)] : TABS;
  const pickStore = (s) => { setStore(s); try { localStorage.setItem('admin_store', s); } catch { /* blocked */ } };

  const view = {
    overview: <AdminOverview go={setTab} store={store} />,
    products: <AdminProducts store={store} />,
    orders: <AdminOrders mode="all" store={store} />,
    delivered: <AdminOrders mode="delivered" store={store} />,
    customers: <AdminCustomers />,
    messages: <AdminMessages />,
    reviews: <AdminReviews store={store} />,
    hero: <AdminHero />,
  }[tab];

  return (
    <div className={store === 'menswear' ? 'admin is-nx' : 'admin'}>
      <aside className={nav ? 'admin-side open' : 'admin-side'}>
        {fixedStore === 'menswear' ? (
          <Link to="/menswear" className="brand brand-light">
            <img src="/nexora/favicon.png" alt="" width="40" height="40" style={{ borderRadius: '50%' }} />
            <span className="brand-text">Nexora<small>Menswear Admin</small></span>
          </Link>
        ) : (
          <Link to="/" className="brand brand-light">
            <span className="brand-mark">N</span>
            <span className="brand-text">Nadulshree<small>Admin Panel</small></span>
          </Link>
        )}
        <nav>
          {tabs.map(([key, label, Icon]) => (
            <button key={key} className={tab === key ? 'active' : ''} onClick={() => { setTab(key); setNav(false); }}>
              <Icon /> {label}
              {tab === key && <motion.i layoutId="admin-ind" className="admin-ind" />}
            </button>
          ))}
        </nav>
        <div className="admin-side-foot">
          {fixedStore === 'menswear'
            ? <Link to="/menswear" target="_blank"><FiExternalLink /> View Nexora Menswear</Link>
            : <><Link to="/" target="_blank"><FiExternalLink /> View Nadulshree site</Link><Link to="/menswear" target="_blank"><FiExternalLink /> View Nexora Menswear</Link></>}
          <button onClick={() => { logout(); navigate(fixedStore === 'menswear' ? '/menswear/admin-login' : '/login'); }}><FiLogOut /> Logout</button>
        </div>
      </aside>
      {nav && <div className="drawer-bg" onClick={() => setNav(false)} />}

      <div className="admin-main">
        <header className="admin-top">
          <button className="icon-btn admin-burger" onClick={() => setNav(true)} aria-label="Menu"><FiMenu /></button>
          <h1>{tabs.find((t) => t[0] === tab)[1]}</h1>
          {!fixedStore && ['overview', 'products', 'orders', 'delivered', 'reviews'].includes(tab) && (
            <div className="store-switch" role="tablist" aria-label="Choose shop">
              {[['all', 'All'], ['boutique', 'Nadulshree'], ['menswear', 'Nexora Menswear']].map(([k, l]) => (
                <button key={k} role="tab" aria-selected={store === k} className={store === k ? 'on' : ''} onClick={() => pickStore(k)}>{l}</button>
              ))}
            </div>
          )}
          <span className="admin-user">{user?.email}</span>
        </header>
        <AnimatePresence mode="wait">
          <motion.div key={tab} className="admin-body" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {view}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
