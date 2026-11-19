// All website photos are Unsplash (free licence) and show clothes / fabrics only, no people.
// To change a photo, replace its ID here:  https://images.unsplash.com/photo-<ID>
const u = (id, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const IMG = {
  // Home hero collage (three arches)
  heroMain: u('1771074152971-7dba5f49bf93', 900),
  heroLeft: u('1616986491129-3e37cb654c82', 700),
  heroRight: u('1612423284934-2850a4ea6b0f', 700),

  // Collections (slug -> photo)
  cat: {
    saree: u('1616986491129-3e37cb654c82', 1000),
    '3-piece-set-kurtis': u('1612423284934-2850a4ea6b0f', 900),
    '2-piece-set': u('1774691799598-71e688b1bf7f', 700),
    'single-top': u('1573879500655-98f2012dd1db', 700),
    legging: u('1705248382836-3618e25706d0', 900),
    'straight-cut-pant': u('1788347102327-519a5454ff05', 900),
  },

  // Page banners (shown softly behind the page title)
  banner: {
    shop: u('1445205170230-053b83016050', 1600),
    about: u('1771098206695-a0c0c3d52ffd', 1600),
    services: u('1698755839162-b73e142c0284', 1600),
    faq: u('1603400521630-9f2de124b33b', 1600),
    contact: u('1645455637185-92f1038e9fd7', 1600),
    happy: u('1764779169348-353c6d99dbd0', 1600),
  },

  promoA: u('1771098403216-ca0c3c2858c0', 900),
  promoB: u('1783188223230-ebedb082d0bf', 700),
  aboutA: u('1771074152971-7dba5f49bf93', 900),
  aboutB: u('1578353022142-09264fd64295', 700),
  login: u('1771098206695-a0c0c3d52ffd', 1200),

  // Services rows
  svc: {
    collection: u('1788347102327-519a5454ff05', 900),
    delivery: u('1717585679395-bbe39b5fb6bc', 900),
    support: u('1560796952-f1c9b838544c', 900),
  },

  // FAQ / contact side photos
  faq: u('1540292370723-60cf448886c3', 900),
  contact: u('1507434745378-235a6297156b', 900),

  // Photo strip (home) and instagram style grid
  insta: [
    u('1588140686379-1b76a52103dc', 500),
    u('1762686130435-897de4b26aac', 500),
    u('1698657169210-9d6ec3860dc4', 500),
    u('1771098403201-58cdbbd1f03f', 500),
    u('1627052045672-be78a58fcd37', 500),
    u('1542044801-30d3e45ae49a', 500),
  ],
};
