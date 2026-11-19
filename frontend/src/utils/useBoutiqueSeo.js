import { useEffect } from 'react';

const NAME = 'Nadulshree Boutique';
const P = {
  '/': [`${NAME} | Sarees, Kurti Sets, Tops, Leggings & Pants Online`, 'Shop sarees, kurti sets, tops, leggings and pants at Nadulshree Boutique. Latest ladies fashion, secure online payment, delivery across India.', 'boutique, ladies boutique, sarees online, kurti sets, tops, leggings, pants, women fashion, Nadulshree Boutique'],
  '/shop': [`Shop Ladies Wear Online | ${NAME}`, 'Browse sarees, kurti sets, tops, leggings and pants. Easy ordering, secure Razorpay payment, WhatsApp support.', 'buy sarees online, buy kurti online, ladies tops, leggings'],
  '/about': [`About Us | ${NAME}`, 'The story of Nadulshree Boutique and our promise of quality ladies wear at fair prices.', 'about Nadulshree Boutique'],
  '/services': [`Services | ${NAME}`, 'Ready-made ladies wear, easy ordering and doorstep delivery from Nadulshree Boutique.', 'boutique services'],
  '/contact': [`Contact | ${NAME}`, 'Call, WhatsApp or message Nadulshree Boutique for orders and enquiries.', 'contact boutique, order sarees on whatsapp'],
  '/faq': [`FAQ | ${NAME}`, 'Ordering, payment, delivery, size and return questions answered.', 'boutique faq, delivery, returns'],
  '/terms': [`Terms & Conditions | ${NAME}`, 'Terms for orders, payments, delivery and returns at Nadulshree Boutique.', 'terms and conditions'],
  '/happy-customers': [`Happy Customers | ${NAME}`, 'Reviews and photos from happy Nadulshree Boutique customers.', 'boutique reviews'],
};
const PRIVATE = ['/admin', '/cart', '/checkout', '/my-orders', '/login', '/order-success'];

function setTag(sel, tagName, attrs) {
  let el = document.head.querySelector(sel);
  if (!el) { el = document.createElement(tagName); el.setAttribute('data-bq-seo', '1'); document.head.appendChild(el); }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
}

/** Title / description / canonical / Open Graph / JSON-LD for every Nadulshree page. Not used on /menswear (it has its own NxSeo). */
export function useBoutiqueSeo(pathname) {
  useEffect(() => {
    if (pathname.startsWith('/menswear')) return;
    const path = pathname.replace(/\/+$/, '') || '/';
    const [title, desc, kw] = P[path] || (path.startsWith('/product/') ? [`Ladies Wear | ${NAME}`, 'Ladies wear from Nadulshree Boutique. Order online with secure payment.', 'ladies wear'] : P['/']);
    const url = window.location.origin + path;
    const priv = PRIVATE.some((x) => path === x || path.startsWith(`${x}/`));
    document.title = title;
    setTag('meta[name="description"]', 'meta', { name: 'description', content: desc });
    setTag('meta[name="keywords"]', 'meta', { name: 'keywords', content: kw });
    setTag('meta[name="robots"]', 'meta', { name: 'robots', content: priv ? 'noindex, nofollow' : 'index, follow, max-image-preview:large' });
    setTag('link[rel="canonical"]', 'link', { rel: 'canonical', href: url });
    const og = { 'og:title': title, 'og:description': desc, 'og:url': url, 'og:type': 'website', 'og:site_name': NAME, 'og:image': `${window.location.origin}/favicon.svg` };
    Object.entries(og).forEach(([k, v]) => setTag(`meta[property="${k}"]`, 'meta', { property: k, content: v }));
    setTag('script#bq-ld', 'script', { id: 'bq-ld', type: 'application/ld+json' });
    document.getElementById('bq-ld').textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ClothingStore', name: NAME, url: window.location.origin, description: desc, areaServed: 'IN' });
  }, [pathname]);
}
