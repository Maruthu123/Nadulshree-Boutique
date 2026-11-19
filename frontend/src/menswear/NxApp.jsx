import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { NxCartProvider } from './NxCartContext';
import NxHeader from './NxHeader';
import NxFooter from './NxFooter';
import NxFloating from './NxFloating';
import NxHome from './pages/NxHome';
import NxShop from './pages/NxShop';
import NxProduct from './pages/NxProduct';
import NxCart from './pages/NxCart';
import NxCheckout from './pages/NxCheckout';
import NxSuccess from './pages/NxSuccess';
import NxOrders from './pages/NxOrders';
import NxLogin from './pages/NxLogin';
import NxContact from './pages/NxContact';
import NxAbout from './pages/NxAbout';
import NxServices from './pages/NxServices';
import NxFaq from './pages/NxFaq';
import NxHappy from './pages/NxHappy';
import NxTerms from './pages/NxTerms';
import NxAdminLogin from './pages/NxAdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import { NxRouteSeo, clearNxSeo } from './NxSeo';
import './nexora.css';
import './nxPro.css';
import './nxMore.css';
import './nxLuxe.css';

const FONTS = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700&family=Yellowtail&display=swap';

/** Needs a customer login. Sends the person to the Nexora login page (not the Nadulshree one). */
function Guard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="nx-loading"><i /></div>;
  if (!user) return <Navigate to="/menswear/login" state={{ from: location.pathname + location.search }} replace />;
  return children;
}

/** Owner only. Not logged in -> admin login page. A customer account is sent back to the shop. */
function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="nx-loading"><i /></div>;
  if (!user) return <Navigate to="/menswear/admin-login" replace />;
  if (user.role !== 'admin') return <Navigate to="/menswear" replace />;
  return children;
}

const Page = ({ children }) => (
  <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
    {children}
    <NxFooter />
    <NxFloating />
  </motion.main>
);

/** Everything under /menswear: its own look, header, footer and cart. */
export default function NxApp() {
  const location = useLocation();
  const onLogin = ['/menswear/login', '/menswear/admin-login'].includes(location.pathname);
  const onAdmin = location.pathname.startsWith('/menswear/admin') && !onLogin;

  // Nexora fonts, tab title and tab icon (put back when you leave /menswear)
  useEffect(() => {
    const font = document.createElement('link');
    font.rel = 'stylesheet'; font.href = FONTS; font.dataset.nx = '1';
    document.head.appendChild(font);
    const icon = document.querySelector('link[rel="icon"]');
    const oldHref = icon?.getAttribute('href'); const oldType = icon?.getAttribute('type');
    const oldTitle = document.title; const theme = document.querySelector('meta[name="theme-color"]'); const oldTheme = theme?.getAttribute('content');
    icon?.setAttribute('href', '/nexora/favicon.png'); icon?.setAttribute('type', 'image/png');
    theme?.setAttribute('content', '#ffffff');
    return () => {
      font.remove();
      if (icon && oldHref) { icon.setAttribute('href', oldHref); if (oldType) icon.setAttribute('type', oldType); }
      clearNxSeo(); document.title = oldTitle; if (theme && oldTheme) theme.setAttribute('content', oldTheme);
    };
  }, []);

  // the owner dashboard uses the shared admin look (not the shop look)
  if (onAdmin) return <><NxRouteSeo /><AdminGuard><AdminDashboard fixedStore="menswear" /></AdminGuard></>;

  return (
    <NxCartProvider>
      <div className="nx">
        <NxRouteSeo />
        {!onLogin && <NxHeader />}
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/menswear" element={<Page><NxHome /></Page>} />
            <Route path="/menswear/shop" element={<Page><NxShop /></Page>} />
            <Route path="/menswear/product/:id" element={<Page><NxProduct /></Page>} />
            <Route path="/menswear/cart" element={<Page><NxCart /></Page>} />
            <Route path="/menswear/checkout" element={<Page><Guard><NxCheckout /></Guard></Page>} />
            <Route path="/menswear/order-success/:orderNo" element={<Page><Guard><NxSuccess /></Guard></Page>} />
            <Route path="/menswear/my-orders" element={<Page><Guard><NxOrders /></Guard></Page>} />
            <Route path="/menswear/about" element={<Page><NxAbout /></Page>} />
            <Route path="/menswear/services" element={<Page><NxServices /></Page>} />
            <Route path="/menswear/faq" element={<Page><NxFaq /></Page>} />
            <Route path="/menswear/happy-customers" element={<Page><NxHappy /></Page>} />
            <Route path="/menswear/terms" element={<Page><NxTerms /></Page>} />
            <Route path="/menswear/admin-login" element={<NxAdminLogin />} />
            <Route path="/menswear/contact" element={<Page><NxContact /></Page>} />
            <Route path="/menswear/login" element={<NxLogin />} />
            <Route path="/menswear/*" element={<Navigate to="/menswear" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </NxCartProvider>
  );
}
