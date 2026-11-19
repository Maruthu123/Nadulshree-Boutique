import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import seo from './data/seoPages.json';

/**
 * Search + social meta for every Nexora Menswear page.
 *  - <NxRouteSeo/> (used once in NxApp) picks the title/description for the current page from data/seoPages.json
 *  - <NxSeo/> can be placed inside a page to override it (the product page does this with Product data)
 * The same data is also written into static HTML for every page at build time (scripts/seo-prerender.mjs),
 * so Google, WhatsApp and Facebook previews see it even without running JavaScript.
 */

const ATTR = 'data-nx-seo';
const abs = (p) => (/^https?:/i.test(p) ? p : `${window.location.origin}${p}`);

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
  el.setAttribute(ATTR, '1');
}
function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
  el.setAttribute('href', href);
  el.setAttribute(ATTR, '1');
}

export const siteJsonLd = () => {
  const s = seo.site;
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: s.name,
    url: `${window.location.origin}/menswear`,
    image: abs(s.image),
    logo: abs(s.logo),
    telephone: s.phone,
    email: s.email,
    sameAs: [s.instagram],
    priceRange: '₹₹',
    address: { '@type': 'PostalAddress', streetAddress: s.address.street, addressLocality: s.address.locality, addressRegion: s.address.region, addressCountry: s.address.country },
    areaServed: ['Thiruchuli', 'Erode', 'Tamil Nadu', 'India'],
  };
};

export function NxSeo({ title, description, path, image, type = 'website', noindex = false, jsonLd = [] }) {
  useEffect(() => {
    const url = abs(path || window.location.pathname);
    const img = abs(image || seo.site.image);
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', seo.site.keywords);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    setMeta('property', 'og:site_name', seo.site.name);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('property', 'og:locale', 'en_IN');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', img);
    setLink('canonical', url);

    document.head.querySelectorAll('script[data-nx-ld]').forEach((n) => n.remove());
    jsonLd.filter(Boolean).forEach((obj) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json'; s.dataset.nxLd = '1'; s.text = JSON.stringify(obj);
      document.head.appendChild(s);
    });
  }, [title, description, path, image, type, noindex, JSON.stringify(jsonLd)]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** Removes everything NxSeo added when the visitor leaves /menswear (so the Nadulshree pages keep their own tags). */
export function clearNxSeo() {
  document.head.querySelectorAll(`[${ATTR}], script[data-nx-ld]`).forEach((n) => n.remove());
}

export function NxRouteSeo() {
  const { pathname } = useLocation();
  const key = pathname.replace(/\/+$/, '') || '/menswear';
  if (key.startsWith('/menswear/product/')) return null; // the product page sets its own
  const adminKey = key.startsWith('/menswear/admin') ? '/menswear/admin' : key;
  const page = seo.pages[adminKey] || seo.pages['/menswear'];
  const ld = [];
  if (adminKey === '/menswear') ld.push(siteJsonLd());
  if (adminKey === '/menswear/faq') {
    ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: seo.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  }
  if (adminKey !== '/menswear') {
    ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/menswear') },
      { '@type': 'ListItem', position: 2, name: page.h1 || page.title, item: abs(adminKey) },
    ] });
  }
  return <NxSeo title={page.title} description={page.description} path={adminKey} noindex={!!page.noindex} jsonLd={ld} />;
}

/** Product page: title, description, image and Product schema from the real product. */
export function productSeo(p, inr) {
  const price = Number(p.price) || 0;
  const url = abs(`/menswear/product/${p.id}`);
  const img = p.images?.[0] ? abs(/^\//.test(p.images[0]) ? `${(import.meta.env?.VITE_API_URL || '').replace(/\/$/, '')}${p.images[0]}` : p.images[0]) : abs(seo.site.image);
  const desc = (p.description || `${p.name} from Nexora Menswear. Soft, breathable shirt with a perfect fit.`).replace(/\s+/g, ' ').slice(0, 155);
  return {
    title: `${p.name} | ${p.category_name || 'Men\'s Shirt'} | Nexora Menswear`,
    description: `${desc}${desc.endsWith('.') ? '' : '.'} ${inr ? inr(price) : `₹${price}`}.`.slice(0, 200),
    image: img,
    path: `/menswear/product/${p.id}`,
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'Product', name: p.name, image: [img], description: desc,
      brand: { '@type': 'Brand', name: 'Nexora Menswear' }, category: p.category_name || 'Shirts',
      color: (p.colors || []).join(', ') || undefined,
      offers: { '@type': 'Offer', url, priceCurrency: 'INR', price: String(price), availability: p.stock === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition' },
    }],
  };
}
