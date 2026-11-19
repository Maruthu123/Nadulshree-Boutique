# Nexora Menswear: new white + black + gold design (Nadulshree Boutique is NOT changed)

Colours, fonts and look come from your Nexora poster. Only `frontend/src/menswear/`, `frontend/public/nexora/`, `frontend/scripts/` and 3 tiny lines in `frontend/src/App.jsx`, `frontend/package.json` changed.

## What is new
- **Home hero (3D)**: poster-style headline "Premium Men's Shirts", gold brush label, 4 feature icons that flip in 3D, and a photo stage made of layers (gold orbit rings, gold frame, arch photo, floating script card) that move with the mouse and sway by themselves on phones.
- **Pick your shade (3D carousel)**: five shirts (White, Sky Blue, Olive, Black, Beige) turning in a 3D ring. Drag / swipe to spin, tap a shirt to open that colour in the shop.
- **Shirt rail**: the curved steel rail with hanging shirts (from the reference), now on a white/gold sky. Dashboard shirts hang there automatically; with no products yet, 5 drawn shirts in the poster colours hang.
- **3D tilt** on product cards, style tiles and the About photo, with a gold light that follows the mouse. Black + gold marquee, black + gold footer with the white logo.
- Every page (Shop, Product, Cart, Checkout, Orders, About, Services, FAQ, Happy Customers, Contact, Terms, Login) uses the same white / ivory, black and gold theme.
- Brand files in `frontend/public/nexora/`: `logo.png` (N mark), `logo-full.png`, `logo-full-white.png`, `hero-model.jpg`, `shirts-row.jpg`, `og-image.jpg`, `favicon.png`. They were cut from your poster; replace any file with a sharper original (same name) any time.

## Search (SEO) for every Nexora page
- `frontend/src/menswear/data/seoPages.json`: title, description, keywords for every page. Edit the text there.
- Each page also gets Open Graph / Twitter tags, canonical link, JSON-LD (store, breadcrumbs, FAQ, and Product with price + stock on every shirt page).
- `npm run build` now also runs `scripts/seo-prerender.mjs`. It writes a real HTML file for each page (so Google, WhatsApp and Instagram previews see the right title without running JavaScript), `sitemap-menswear.xml` and the Nexora lines in `robots.txt`.
- **Set your site address** so links and the sitemap are complete: Netlify gives it automatically; on Firebase or elsewhere add the environment variable `SITE_URL=https://your-nexora-site` before `npm run build`.
- After you go live: open Google Search Console, add the site, submit `https://YOUR-SITE/sitemap-menswear.xml`, and use "Request indexing" for `/menswear`. Also add the site link to the Instagram bio and WhatsApp business profile.
- Private pages (cart, checkout, orders, login, admin) are set to noindex.

## Go live
1. Copy the changed files into your GitHub project (same paths). Do NOT upload `backend/.env`.
2. Frontend host (Netlify / Firebase) rebuilds with `npm run build`. Nothing changes on the backend or the database.
3. Open `/menswear` and check: hero, shirt carousel, rail, a product page and the footer.

## Notes
- No new npm package was added (3D is CSS 3D + the packages you already use).
- Animations stop for visitors who use "reduce motion" on their phone/computer.
- The hero photo is your poster photo. For a sharper hero, put a bigger original photo at `frontend/public/nexora/hero-model.jpg` (about 1000 x 1470 px, portrait).
