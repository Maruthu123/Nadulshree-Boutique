import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Footer from './components/Footer';
import FloatingContact from './components/FloatingContact';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import HappyCustomers from './pages/HappyCustomers';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import api from './api';
import { useBoutiqueSeo } from './utils/useBoutiqueSeo';

// Nexora Menswear (/menswear/...) has its own look; it loads only when someone opens it
const NxApp = lazy(() => import('./menswear/NxApp'));

// Render free servers sleep when idle. Show a small note while one wakes up (about 30 seconds).
function WakeNotice() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    let done = false;
    const t = setTimeout(() => { if (!done) setSlow(true); }, 3500);
    api.get('/health').catch(() => {}).finally(() => { done = true; clearTimeout(t); setSlow(false); });
    return () => clearTimeout(t);
  }, []);
  return slow ? <div className="wake"><i />Starting the server, please wait a few seconds...</div> : null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

// public pages: fade transition + footer + floating Instagram/WhatsApp buttons
const Page = ({ children }) => (
  <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
    {children}
    <Footer />
    <FloatingContact />
  </motion.main>
);

export default function App() {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');
  const isNexora = location.pathname.startsWith('/menswear');
  useBoutiqueSeo(location.pathname);

  return (
    <>
      <ScrollToTop />
      <WakeNotice />
      {isNexora ? (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#ffffff' }} />}><NxApp /></Suspense>
      ) : isAdminArea ? (
        <Routes>
          <Route path="/admin/*" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/shop" element={<Page><Shop /></Page>} />
            <Route path="/product/:id" element={<Page><ProductDetail /></Page>} />
            <Route path="/cart" element={<Page><Cart /></Page>} />
            <Route path="/checkout" element={<Page><ProtectedRoute><Checkout /></ProtectedRoute></Page>} />
            <Route path="/order-success/:orderNo" element={<Page><ProtectedRoute><OrderSuccess /></ProtectedRoute></Page>} />
            <Route path="/my-orders" element={<Page><ProtectedRoute><MyOrders /></ProtectedRoute></Page>} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<Page><About /></Page>} />
            <Route path="/services" element={<Page><Services /></Page>} />
            <Route path="/contact" element={<Page><Contact /></Page>} />
            <Route path="/faq" element={<Page><FAQ /></Page>} />
            <Route path="/terms" element={<Page><Terms /></Page>} />
            <Route path="/happy-customers" element={<Page><HappyCustomers /></Page>} />
            <Route path="*" element={<Page><NotFound /></Page>} />
          </Routes>
        </AnimatePresence>
      )}
    </>
  );
}
