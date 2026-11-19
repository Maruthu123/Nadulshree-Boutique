# Nexora Menswear: what changed and how to go live

Nadulshree Boutique pages, styles, cart and orders are NOT touched. Only `frontend/src/menswear/`, a few admin/backend files and the new files below changed.

## 1. Products not showing on Nexora (most likely cause)
Nexora and the boutique use the same backend. The backend only answers websites listed in `CLIENT_URL`.
If Nexora opens on a different address (another domain, a `*.web.app`, a Netlify preview link, `www.` vs no `www.`), its products are blocked ("CORS blocked").

Fix on Render > your backend > Environment:
- `CLIENT_URL` = `https://boutique-address,https://nexora-address` (comma separated, no `/` at the end)
  (or put the Nexora address in the new `NEXORA_CLIENT_URL`)
- Save, wait for the redeploy, open `https://YOUR-API.onrender.com/api/health`. It now lists `allowedOrigins`. Your Nexora address must be in that list.
- Frontend: `VITE_API_URL` must be your Render link, then redeploy with "Clear cache".

The shop and home pages now show a clear "Shirts could not be loaded" box with Try again, instead of a silent empty page.
Also check: Dashboard > Products > the shirt's Category must be one of the Nexora categories (Formal Shirts, Casual Shirts ...), and "Show on website" must be ON.

## 2. Nexora admin (separate from the boutique admin and from customers)
- Login page: `/menswear/admin-login`  Dashboard: `/menswear/admin`
- Email: `nexorasolutions06@gmail.com`
- Password: set it as `NEXORA_ADMIN_PASSWORD` on Render (or in `backend/.env`). It is created automatically when the backend starts. The password is stored only as a bcrypt hash in the database, never in the website code.
- This account sees ONLY Nexora products, orders, customers, messages and reviews. The server blocks it from boutique data even if someone tries.
- Customers cannot open the dashboard. The boutique admin keeps working as before.
- Please change the password after your first login, because it was shared in a chat.

## 3. Hero section
`frontend/src/menswear/NxHero.jsx` + `NxHero.css`: curved steel rail, hanging shirts, hover turn, drag/swipe/arrow keys, centre shirt opens a product view (photo gallery, colour, size, Add to cart, Buy now, WhatsApp).
Dashboard > Hero photos controls what hangs there. If it is empty, your shirts are used, then online demo shirts.
(`NxHero.jsx` has an `ONLINE_SHIRTS` list: change those links any time.)

## 4. Payment and cancellation
- Online payment only (Razorpay). No Cash on Delivery anywhere. Checkout needs the Terms tick.
- My Orders > Cancel order: customer picks a reason (list below) and can add a note. "Other" needs a few words. Allowed while the order is Placed or Confirmed.
- The reason is shown to the customer in tracking and to you in Dashboard > Orders.
- Terms & Conditions (Nexora) now have: Cancelling an order, Refunds, When we cancel, After delivery.
- Refund time text is `REFUND_DAYS` in `frontend/src/menswear/data/nxTerms.js` (set to "5 to 7 working days"). Change it to what you really follow.
- Refunds themselves are still done by you in the Razorpay dashboard, then set Payment status = refunded in Dashboard > Orders.

Cancel reasons: Ordered by mistake / Want to change size or colour / Found a better price / Delivery is taking too long / Need to change the delivery address / Payment problem / Other.

## 5. Pages with new content, photos and animation
Shop, About, Services, FAQ (fabric, cancel, refund groups), Happy Customers, Contact (map + quick answers), Terms.
Photos are online (Unsplash) in `frontend/src/menswear/data/nxImages.js`. If a link fails, a drawn shirt shows. Replace links there any time.
Happy Customers shows only real approved reviews. No made-up reviews were added.

## 6. Go live
1. Copy the files into your GitHub project (same paths). Do NOT upload `backend/.env`.
2. Render: add `NEXORA_ADMIN_PASSWORD`, update `CLIENT_URL`. Deploy. Logs should say `Nexora admin: ... (created)`.
3. Netlify / Firebase: redeploy the frontend.
4. Open `/menswear/admin-login`, add products with the Nexora categories, add Hero photos.
New database tables/columns (admin_store, cancel_reason, cancel_note, cancelled_at) are added automatically when the backend starts. No new database.

## Security note
The zip you sent contained `backend/.env` with your real database link and keys. It is NOT in this package. Because it was shared, reset your Neon database password and the Razorpay/Gmail keys, then update them on Render.
