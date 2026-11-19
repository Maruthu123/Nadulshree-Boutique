/**
 * Runs automatically after `npm run build` (see "postbuild" in package.json).
 *
 * For every Nexora Menswear page it writes a real HTML file (dist/menswear/<page>/index.html) with the right
 * <title>, description, canonical link, Open Graph / Twitter tags, JSON-LD and a short text for crawlers that do not run JavaScript
 * (Google's first pass, WhatsApp, Facebook, Instagram link previews). It also writes dist/sitemap-menswear.xml and
 * adds the Nexora lines to dist/robots.txt.
 *
 * The Nadulshree pages and dist/index.html are not changed.
 *
 * Site address: set SITE_URL (for example https://nexora-menswear.netlify.app) in your host's environment variables.
 * Netlify also provides URL automatically, so on Netlify nothing needs to be set.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const seo = JSON.parse(readFileSync(join(root, 'src/menswear/data/seoPages.json'), 'utf8'));

if (!existsSync(join(dist, 'index.html'))) { console.log('[seo] dist/index.html not found, skipped'); process.exit(0); }

const site = (process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || '').replace(/\/+$/, '');
if (!site) console.log('[seo] SITE_URL is not set: canonical links, sitemap and share images use relative paths. Set SITE_URL on your host for best results.');
const abs = (p) => (/^https?:/i.test(p) ? p : `${site}${p}`);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const base = readFileSync(join(dist, 'index.html'), 'utf8');
const FONTS = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700&family=Yellowtail&display=swap';

const orgLd = {
  '@context': 'https://schema.org', '@type': 'ClothingStore', name: seo.site.name, url: abs('/menswear'), image: abs(seo.site.image), logo: abs(seo.site.logo),
  telephone: seo.site.phone, email: seo.site.email, sameAs: [seo.site.instagram], priceRange: '₹₹',
  address: { '@type': 'PostalAddress', streetAddress: seo.site.address.street, addressLocality: seo.site.address.locality, addressRegion: seo.site.address.region, addressCountry: seo.site.address.country },
};

function build(path, page) {
  const url = abs(path);
  const robots = page.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';
  const ld = [];
  if (path === '/menswear') ld.push(orgLd);
  if (path === '/menswear/faq') ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: seo.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  if (path !== '/menswear' && !page.noindex) ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/menswear') }, { '@type': 'ListItem', position: 2, name: page.h1 || page.title, item: url }] });

  const head = [
    `<meta name="description" content="${esc(page.description)}" data-nx-seo="1" />`,
    `<meta name="keywords" content="${esc(seo.site.keywords)}" data-nx-seo="1" />`,
    `<meta name="robots" content="${robots}" data-nx-seo="1" />`,
    `<link rel="canonical" href="${esc(url)}" data-nx-seo="1" />`,
    `<meta property="og:site_name" content="${esc(seo.site.name)}" data-nx-seo="1" />`,
    `<meta property="og:type" content="website" data-nx-seo="1" />`,
    `<meta property="og:title" content="${esc(page.title)}" data-nx-seo="1" />`,
    `<meta property="og:description" content="${esc(page.description)}" data-nx-seo="1" />`,
    `<meta property="og:url" content="${esc(url)}" data-nx-seo="1" />`,
    `<meta property="og:image" content="${esc(abs(seo.site.image))}" data-nx-seo="1" />`,
    `<meta property="og:locale" content="en_IN" data-nx-seo="1" />`,
    `<meta name="twitter:card" content="summary_large_image" data-nx-seo="1" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" data-nx-seo="1" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" data-nx-seo="1" />`,
    `<meta name="twitter:image" content="${esc(abs(seo.site.image))}" data-nx-seo="1" />`,
    `<link rel="apple-touch-icon" href="/nexora/apple-touch-icon.png" />`,
    `<link rel="stylesheet" href="${FONTS}" />`,
    ...ld.map((o) => `<script type="application/ld+json" data-nx-ld="1">${JSON.stringify(o)}</script>`),
  ].join('\n    ');

  const nav = [['/menswear', 'Home'], ['/menswear/shop', 'Shop'], ['/menswear/about', 'About'], ['/menswear/services', 'Services'], ['/menswear/happy-customers', 'Happy Customers'], ['/menswear/faq', 'FAQ'], ['/menswear/contact', 'Contact'], ['/menswear/terms', 'Terms & Conditions']]
    .map(([h, t]) => `<a href="${h}">${t}</a>`).join(' ');
  const noscript = `<noscript><div style="font-family:Georgia,serif;max-width:760px;margin:40px auto;padding:0 16px"><h1>${esc(page.h1 || page.title)}</h1><p>${esc(page.text || page.description)}</p><p>${nav}</p><p>${esc(seo.site.name)}, Poduru, Thiruchuli, Erode, Tamil Nadu. WhatsApp 6383718976.</p></div></noscript>`;

  let html = base
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(page.title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i, '')
    .replace(/<meta\s+name="theme-color"[^>]*>/i, '<meta name="theme-color" content="#ffffff" />')
    .replace(/<link\s+rel="icon"[^>]*>/i, '<link rel="icon" type="image/png" href="/nexora/favicon.png" />')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`);
  return html;
}

const urls = [];
for (const [path, page] of Object.entries(seo.pages)) {
  if (path === '/menswear/admin') continue;
  const dir = join(dist, path.replace(/^\//, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), build(path, page));
  if (!page.noindex) urls.push([path, page]);
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([p, pg]) => `  <url><loc>${esc(abs(p))}</loc><lastmod>${today}</lastmod><changefreq>${pg.changefreq || 'monthly'}</changefreq><priority>${pg.priority || '0.5'}</priority></url>`).join('\n')}\n</urlset>\n`;
writeFileSync(join(dist, 'sitemap-menswear.xml'), sitemap);

const robotsPath = join(dist, 'robots.txt');
let robots = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf8').trimEnd() + '\n\n' : 'User-agent: *\nAllow: /\n\n';
if (!robots.includes('/menswear/cart')) {
  robots += 'User-agent: *\nDisallow: /menswear/cart\nDisallow: /menswear/checkout\nDisallow: /menswear/my-orders\nDisallow: /menswear/login\nDisallow: /menswear/admin\nDisallow: /menswear/admin-login\n';
}
if (site && !robots.includes('sitemap-menswear.xml')) robots += `\nSitemap: ${site}/sitemap-menswear.xml\n`;
writeFileSync(robotsPath, robots);

console.log(`[seo] Nexora Menswear: ${Object.keys(seo.pages).length - 1} pages written, sitemap-menswear.xml (${urls.length} urls), robots.txt updated`);

// ---- Nadulshree Boutique: sitemap.xml (public pages) + robots lines -------------------------------------------------
{
  const pages = ['/', '/shop', '/about', '/services', '/contact', '/faq', '/terms', '/happy-customers'];
  const day = new Date().toISOString().slice(0, 10);
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${esc(abs(p))}</loc><lastmod>${day}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  let r = readFileSync(robotsPath, 'utf8');
  if (!r.includes('Disallow: /admin')) r += '\nUser-agent: *\nDisallow: /admin\nDisallow: /cart\nDisallow: /checkout\nDisallow: /my-orders\nDisallow: /login\nDisallow: /order-success\n';
  if (site && !/Sitemap: [^\n]*\/sitemap\.xml/.test(r)) r += `\nSitemap: ${site}/sitemap.xml\n`;
  writeFileSync(robotsPath, r);
  console.log('[seo] Nadulshree Boutique: sitemap.xml written, robots.txt updated');
}
