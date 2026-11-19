# Nadulshree Boutique - React + Node.js + Neon SQL

> Local + live (Render, Netlify, Firebase) steps are in **DEPLOY.md**.

## Folder
- backend/  -> Node.js + Express API (deploy on Render)
- frontend/ -> React (Vite) website + admin dashboard (deploy on Netlify / Firebase)

## 1. Neon database (free)
1. neon.tech -> Sign up -> Create project "nadulshree".
2. Dashboard -> Connection Details -> copy the connection string (postgresql://...neon.tech/neondb?sslmode=require).
3. Paste it as DATABASE_URL in backend/.env.

## 2. Run locally
Backend:
  cd backend
  cp .env.example .env        (edit DATABASE_URL, JWT_SECRET)
  npm install
  npm run db:setup            (creates ALL tables + categories + admin account + demo products)
  npm run dev                 (http://localhost:5000/api/health should say db connected)

Frontend (new terminal):
  cd frontend
  cp .env.example .env        (VITE_API_URL=http://localhost:5000)
  npm install
  npm run dev                 (http://localhost:5173)

## 3. Login
Same /login page for everyone:
- Admin: nadulshreeboutique@gmail.com / Nadulshree@123  -> opens /admin dashboard
- Customers: Register -> email OTP -> opens My Orders (tracking) or checkout
CHANGE the admin password after going live (edit ADMIN_PASSWORD on Render, run npm run db:setup again).

## 4. OTP email (Gmail)
Google Account -> Security -> turn on 2-Step Verification -> App passwords -> create one.
Put it as EMAIL_PASS. Without it, OTP is shown on screen only in local test mode (never in production).

## 5. Payment (Razorpay)
razorpay.com -> sign up -> Settings -> API Keys (Test mode first). Put RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.
Empty = only Cash on Delivery is shown.

## 6. Product photos and feedback photos (no link needed)
Admin > Products > Add product > "Choose photos from phone / computer". On a phone it opens the gallery or camera.
Photos are shrunk automatically and saved inside your Neon database (about 100-200 KB each), so nothing else to set up.
Admin > Reviews > "Add a real customer review" lets you upload a WhatsApp / Instagram feedback screenshot.
Customers can also add one photo with their review after delivery (admin approves it first).
Website design photos come from Unsplash (free licence). To change one, edit frontend/src/data/images.js.

## 6b. Forgot password
Login page > "Forgot password?" > email > 6-digit OTP > new password. Works for admin and customers.
(Needs EMAIL_PASS in backend/.env to send real mails. Without it the OTP shows on screen in local test mode only.)

## 6c. Updating an older install
If you already ran db:setup before, run `npm run db:setup` again in backend/ once. It safely adds the new tables/columns
and puts photos on the demo products.

## 7. Deploy backend on Render
1. Push the project to GitHub.
2. Render -> New Web Service -> select repo -> Root Directory: backend
   Build: npm install    Start: npm start
3. Environment: all values from backend/.env, with NODE_ENV=production and CLIENT_URL=<your frontend URL(s), comma separated>.
4. Open https://YOUR-API.onrender.com/api/health

## 8. Deploy frontend
Set VITE_API_URL=https://YOUR-API.onrender.com and build: npm run build
- Netlify: connect repo, Base directory frontend, Build npm run build, Publish dir dist (netlify.toml included). Add VITE_ vars in Site settings.
- Firebase: npm i -g firebase-tools; firebase login; cd frontend; firebase init hosting (public dir: dist, SPA: yes); npm run build; firebase deploy.
After the frontend URL is known, add it to CLIENT_URL on Render (CORS).

## Tables
users, otps, categories, products, orders, order_items, tracking_events, testimonials, contact_messages  (see backend/schema.sql)

## 8. Nexora Menswear (second website inside the same project, shirts only)
Open: http://localhost:5173/menswear  (live: yourwebsite.com/menswear). Nadulshree stays at / exactly as before.
Pages: Home, Shop, Product, About, Services, Happy Customers, FAQ, Contact, Terms & Conditions, Cart, Checkout, My Orders (tracking).
- Hero shirts = YOUR product photos: Admin > Products > add a shirt with photos and tick "Featured on home page". The first 7 shirts with photos
  hang on the neon rail automatically (click one to open it). Until you add photos, drawn shirts are shown. Photos on a plain light background look best.
- Every shirt: "Enquire on WhatsApp" (message pre-filled) + online payment (Razorpay). Terms tick-box at checkout.
- Logins (same accounts for both sites):
    Customer: /menswear/login  -> My Orders (order tracking)
    Owner:    /menswear/admin-login -> /menswear/admin (Nexora dashboard: only menswear products, orders, reviews, delivered list)
    Nadulshree owner: /login -> /admin (has the switch All | Nadulshree | Nexora Menswear)
- Order tracking: owner updates status/location in Orders; customer sees it in My Orders (both sites). Order numbers: NS... (Nadulshree), NX... (Nexora).
- Happy Customers: separate reviews per shop (customer reviews after delivery, you approve in Admin > Reviews).
- Terms & Conditions (both sites: /terms and /menswear/terms): text is in frontend/src/data/terms.js. READ IT ONCE and edit return time,
  delivery days and any rule that is different in your shop.
- Numbers / Instagram / address / delivery charge: backend/.env (NEXORA_WHATSAPP, NEXORA_PHONE_2, NEXORA_INSTAGRAM, NEXORA_ADDRESS,
  NEXORA_SHIPPING_FEE, NEXORA_FREE_SHIPPING_ABOVE). Default: WhatsApp 6383718976, call 9942148763, @nexora_menswear_.
- Updating an older install: run `npm run db:setup` once in backend/ (adds shirt categories + 8 demo shirts; delete demo shirts later).
  The server also adds the new columns automatically when it starts.
