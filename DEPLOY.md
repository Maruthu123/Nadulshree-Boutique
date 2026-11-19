# Nadulshree Boutique – Local + Live guide

## A) Run on your computer
1. `backend/` folder: copy `.env.example` to `.env`, paste your Neon `DATABASE_URL` (delete `&channel_binding=require` if present).
2. PowerShell 1: `cd backend` → `npm install` → `npm run db:setup` (once, adds demo products) → `npm run dev`
3. PowerShell 2: `cd frontend` → copy `.env.example` to `.env` → `npm install` → `npm run dev`
4. Open http://localhost:5173. Admin: login with the admin email and password (same login page).

Tables, categories and the admin account are created automatically every time the backend starts.

## B) Backend on Render
1. Push the project to GitHub.
2. Render → New → Web Service → pick the repo. Root Directory: `backend`. Build: `npm install`. Start: `npm start`. (Or use `render.yaml` as a Blueprint.)
3. Environment tab:
   - `NODE_ENV` = production
   - `DATABASE_URL` = Neon string (reset your Neon password first, and never share it)
   - `JWT_SECRET` = long random text
   - `ADMIN_EMAIL` = nadulshreeboutique@gmail.com, `ADMIN_PASSWORD` = a strong password
   - `CLIENT_URL` = your site links, comma separated, no trailing slash, e.g. `https://nadulshree.netlify.app,https://nadulshree-boutique.web.app`  (wildcard allowed: `https://*.netlify.app`)
   - `EMAIL_USER`, `EMAIL_PASS` (Gmail app password), optional `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
4. Deploy. Open `https://YOUR-API.onrender.com/api/health` → must show `{"ok":true}`.
5. No `db:setup` needed on Render. Add products from the admin panel.
6. Free plan sleeps when idle (first load ~30 sec). Keep it awake: uptimerobot.com → HTTP monitor on `/api/health` every 5 min.

## C) Frontend on Netlify
Base directory `frontend`, build `npm run build`, publish `frontend/dist` (already in `netlify.toml`).
Site settings → Environment variables: `VITE_API_URL` = `https://YOUR-API.onrender.com`. Then Deploys → Trigger deploy → Clear cache and deploy.

## D) Frontend on Firebase (instead of / along with Netlify)
```
cd frontend
echo VITE_API_URL=https://YOUR-API.onrender.com > .env.production
npm install
npm run build
npm i -g firebase-tools
firebase login
firebase init hosting   (public directory: dist, single-page app: Yes, don't overwrite index.html)
firebase deploy
```
Add the Firebase URL (`https://PROJECT.web.app`) to `CLIENT_URL` on Render.

## Problems
- "Cannot reach the server": Render is waking up, wait 30 sec; or `VITE_API_URL` is wrong (rebuild after changing it).
- "CORS blocked": add the exact site link to `CLIENT_URL` on Render and redeploy.
- Images broken: uploaded photos live in the database, so they work everywhere; online photo links need internet.
