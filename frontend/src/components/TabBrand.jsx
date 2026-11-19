import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* ============================================================
   BROWSER TAB LOGO (favicon) SETTING
   public folder la irukkura logo file path inga podunga.
   ?v=1  -> logo maathina ?v=2, ?v=3 nu maathunga (browser cache clear aagum)
   ============================================================ */
const BOUTIQUE_ICON = '/ns.png?v=1';           // Nadulshree Boutique logo
const MENSWEAR_ICON = '/nexora/logo.png?v=1';  // Nexora Menswear logo

export default function TabBrand() {
  const { pathname } = useLocation();

  useEffect(() => {
    const href = pathname.startsWith('/menswear') ? MENSWEAR_ICON : BOUTIQUE_ICON;

    // pazhaya icon links ellam remove pannitu puthusa podum
    document.querySelectorAll("link[rel~='icon']").forEach((l) => l.remove());
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = href;
    document.head.appendChild(link);
  }, [pathname]);

  return null;
}