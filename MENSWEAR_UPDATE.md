# Nexora Menswear update (Nadulshree Boutique is NOT changed)

## What is new
- Home page hero: curved chrome rail with hanging shirts. Click any shirt: size, colour, Add to cart, Buy now, WhatsApp enquiry. Price tag under every shirt.
- Dashboard: /menswear/admin > new "Hero photos" tab (add, change, reorder, hide, delete photos; link a photo to a shirt).
- Page heads (About, Services, Happy Customers, FAQ, Contact) show hanging shirts. Real shirt photos from your Products are used automatically.
- About: photo collage + "How it works". Home: style tiles use your own shirt photos.
- Contact: enquiry form -> saved in dashboard Messages AND opens WhatsApp (6383718976) with the message filled. "Send as SMS" button too.

## Files changed (menswear + 3 safe additions)
frontend/src/menswear/  NxHero.jsx, NxPageHead.jsx (new), nxPro.css (new), NxApp.jsx, pages/NxHome.jsx, NxAbout.jsx, NxServices.jsx, NxContact.jsx, NxFaq.jsx, NxHappy.jsx
frontend/src/pages/admin/AdminHero.jsx (new), AdminDashboard.jsx (Hero tab only in the Menswear dashboard)
backend/schema.sql (+1 table hero_slides), backend/routes/public.js (+GET /api/hero), backend/routes/admin.js (+/api/admin/hero)
Nothing in the Nadulshree pages, styles, cart or orders was touched.

## Database: do you need a new one?
No. Same Neon database, same backend URL, same website URL. Menswear already uses the `store` column (boutique / menswear).
The new table `hero_slides` is created automatically when the backend starts (bootstrap runs schema.sql). No command to run.

## Go live (no npm on your computer needed)
1. Copy these files into your GitHub project (same paths) and commit. Do NOT upload backend/.env.
2. Render (backend) redeploys by itself. In the logs you should see "Database connected and ready".
3. Netlify / Firebase (frontend) redeploys by itself (or run the deploy you already use).
4. Open https://YOUR-SITE/menswear/admin-login > Hero photos > "Add hero photos" > choose shirt photos > give a name, link a shirt > Save.
5. Optional settings on Render: NEXORA_WHATSAPP=916383718976 (already the default), NEXORA_INSTAGRAM, NEXORA_ADDRESS.

## Notes
- Enquiry: the website cannot send SMS to you by itself (that needs a paid SMS service). The customer taps "Send on WhatsApp" or "Send as SMS" and the message goes to 6383718976 from their phone. Every enquiry is also saved in Dashboard > Messages.
- Use shirt photos only (flat shirt on plain background looks best, 4:5 size).
- If the Hero photos tab is empty, the rail shows your featured shirts (Products > Featured), then drawn shirts.
