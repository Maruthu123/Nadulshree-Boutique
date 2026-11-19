/**
 * Online photos for the Nexora pages (About, Services, Shop banner, Contact, Happy customers, Hero fallback).
 * They are free Unsplash photos. EDIT any link here to change a picture. If a link ever stops working, the page shows a
 * neat dark panel with a drawn shirt instead, so nothing looks broken.
 * Tip: on unsplash.com open a photo > right click the image > "Copy image address", paste it here.
 */
const local = (p) => (typeof window !== 'undefined' ? window.location.origin + p : p);
const u = (id, w = 1000) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const NX_IMG = {
  // shop / rail style photos
  store: u('1441984904996-e0b6ba687e04', 1400),
  rack: u('1489987707025-afc232f7ea0f', 1400),
  shirtsFolded: local('/nexora/shirts-row.jpg'),
  boutiqueInside: u('1490578474895-699cd4e2cf59', 1200),
  // men in shirts (lifestyle)
  man1: local('/nexora/hero-model.jpg'),
  man2: u('1552374196-1ab2a1c593e8'),
  man3: u('1507679799987-c73779587ccf'),
  man4: u('1594938298603-c8148c4dae35'),
  // shirt close-ups
  shirtA: u('1596755094514-f87e34085b2c'),
  shirtB: u('1602810318383-e386cc2a3ccf'),
  shirtC: u('1620012253295-c15cc3e65df4'),
  shirtD: u('1603252109303-2751441dd157'),
  shirtE: u('1598032895397-b9472444bf93'),
  shirtF: u('1607345366928-199ea26cfe3e'),
  shirtG: u('1516826957135-700dedea698c'),
};

/** [label, tag, image key, colour for the drawn fallback, pattern] used by style tiles and banners */
export const STYLE_PHOTOS = {
  'formal-shirts': NX_IMG.shirtA,
  'casual-shirts': NX_IMG.shirtB,
  'printed-shirts': NX_IMG.shirtD,
  'checked-shirts': NX_IMG.shirtG,
  'linen-shirts': NX_IMG.shirtC,
  'half-sleeve-shirts': NX_IMG.shirtE,
};
