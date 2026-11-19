import { useId } from 'react';

/* ------------------------------------------------------------------
   Colour helpers: the admin types colour NAMES ("Navy, Sky Blue").
   We turn a name into a real colour for swatches and for the drawn shirt.
------------------------------------------------------------------- */
const NAMED = {
  black: '#14161a', white: '#f4f4f1', 'off white': '#ece8dd', cream: '#efe6cf', ivory: '#f2ecda',
  navy: '#1f2b52', 'navy blue': '#1f2b52', blue: '#2563c9', 'royal blue': '#2349b5', 'sky blue': '#7cc4ec', 'light blue': '#9ccdf0',
  teal: '#12827f', green: '#2f8f4e', 'bottle green': '#175c3a', olive: '#5d6b3b', mint: '#9fdcc0',
  red: '#cf2e2e', maroon: '#6e1e30', wine: '#5a1a2c', burgundy: '#5a1a2c', pink: '#ec7fa4', peach: '#f5b794', orange: '#ee7a1c',
  mustard: '#d3a117', yellow: '#f0c623', gold: '#e0a21b', beige: '#d6c3a1', khaki: '#b7a77a', tan: '#b88b5a', brown: '#6b4528', coffee: '#4d3220',
  grey: '#8a8f98', gray: '#8a8f98', 'light grey': '#c4c8ce', charcoal: '#3b3f46', silver: '#c0c4cc',
  purple: '#6d3fb0', lavender: '#b4a3e0', violet: '#6d3fb0', cyan: '#19cfe8', aqua: '#2fd3d0',
};

export function colorHex(name = '') {
  const key = String(name).trim().toLowerCase();
  if (NAMED[key]) return NAMED[key];
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(key)) return key;
  // unknown name -> stable colour made from the text
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 45% 42%)`;
}

function toRgb(c) {
  if (c.startsWith('#')) {
    let h = c.slice(1);
    if (h.length === 3) h = [...h].map((x) => x + x).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = c.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
  if (m) {
    const [h, s, l] = [Number(m[1]) / 360, Number(m[2]) / 100, Number(m[3]) / 100];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const f = (t) => {
      let x = t; if (x < 0) x += 1; if (x > 1) x -= 1;
      if (x < 1 / 6) return p + (q - p) * 6 * x;
      if (x < 1 / 2) return q;
      if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
      return p;
    };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255));
  }
  return [90, 90, 90];
}
export function shade(color, pct) {
  const [r, g, b] = toRgb(color);
  const t = pct < 0 ? 0 : 255;
  const k = Math.abs(pct);
  const mix = (v) => Math.round(v + (t - v) * k);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
export const isLight = (color) => { const [r, g, b] = toRgb(color); return (r * 299 + g * 587 + b * 114) / 1000 > 150; };

/* ------------------------------------------------------------------
   ShirtArt: an original vector shirt (used in the hero, category tiles
   and as the picture of a product that has no photo yet).
------------------------------------------------------------------- */
const BODY_SHORT = 'M110 66 L150 54 L206 84 L188 132 L163 118 L163 250 Q110 262 57 250 L57 118 L32 132 L14 84 L70 54 Z';
const BODY_LONG = 'M110 66 L150 54 L198 78 L216 216 L187 224 L165 134 L163 250 Q110 262 57 250 L55 134 L33 224 L4 216 L22 78 L70 54 Z';

export default function ShirtArt({
  color = 'Navy', accent = '#19e3ff', pattern = 'plain', sleeve = 'long',
  hanger = false, neon = false, className = '', title = '',
}) {
  const uid = useId().replace(/[:]/g, '');
  const base = colorHex(color);
  const light = isLight(base);
  const hi = shade(base, light ? 0.5 : 0.22);
  const lo = shade(base, -0.38);
  const line = light ? 'rgba(0,0,0,.22)' : 'rgba(255,255,255,.14)';
  const body = sleeve === 'short' ? BODY_SHORT : BODY_LONG;
  const stroke = neon ? accent : (light ? 'rgba(0,0,0,.28)' : 'rgba(255,255,255,.18)');
  const pat = light ? 'rgba(0,0,0,.28)' : accent;

  return (
    <svg
      className={`nx-shirt ${neon ? 'neon' : ''} ${className}`}
      viewBox="0 0 220 280" role={title ? 'img' : 'presentation'} aria-label={title || undefined} aria-hidden={title ? undefined : true}
      style={neon ? { '--glow': accent } : undefined}
    >
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset=".5" stopColor={base} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
        <clipPath id={`c${uid}`}><path d={body} /></clipPath>
        <pattern id={`k${uid}`} width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="3" y="9" fill={pat} opacity=".5" />
          <rect width="3" height="22" x="9" fill={pat} opacity=".5" />
        </pattern>
        <pattern id={`s${uid}`} width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="3" height="14" x="5" fill={pat} opacity=".55" />
        </pattern>
        <pattern id={`p${uid}`} width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M17 5 L23 17 L17 29 L11 17 Z" fill={pat} opacity=".6" />
          <circle cx="0" cy="0" r="3" fill={pat} opacity=".5" /><circle cx="34" cy="34" r="3" fill={pat} opacity=".5" />
          <circle cx="34" cy="0" r="3" fill={pat} opacity=".5" /><circle cx="0" cy="34" r="3" fill={pat} opacity=".5" />
        </pattern>
      </defs>

      {hanger && (
        <g fill="none" stroke={neon ? '#b8892a' : '#9aa0a8'} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="nx-hanger">
          <path d="M110 40 L110 26 Q110 10 124 11 Q136 13 133 25" />
          <path d="M110 40 L22 74 Q14 78 22 80 L198 80 Q206 78 198 74 L110 40" />
        </g>
      )}

      <g>
        <path d={body} fill={`url(#g${uid})`} stroke={stroke} strokeWidth={neon ? 2.4 : 1.4} strokeLinejoin="round" />
        <g clipPath={`url(#c${uid})`}>
          {pattern === 'check' && <rect width="220" height="280" fill={`url(#k${uid})`} />}
          {pattern === 'stripe' && <rect width="220" height="280" fill={`url(#s${uid})`} />}
          {pattern === 'print' && <rect width="220" height="280" fill={`url(#p${uid})`} />}
          {/* soft folds */}
          <path d="M75 110 Q82 180 70 252" stroke={line} strokeWidth="2" fill="none" />
          <path d="M145 112 Q138 182 150 252" stroke={line} strokeWidth="2" fill="none" />
          <path d="M60 62 Q80 96 62 128" stroke={line} strokeWidth="1.6" fill="none" />
          <path d="M160 62 Q140 96 158 128" stroke={line} strokeWidth="1.6" fill="none" />
          <rect x="0" y="0" width="110" height="280" fill="#fff" opacity={light ? 0.0 : 0.04} />
        </g>
        {/* placket */}
        <rect x="105" y="96" width="10" height="160" fill={lo} opacity=".55" />
        {[118, 150, 182, 214, 244].map((y) => (
          <g key={y}>
            <circle cx="110" cy={y} r="3.6" fill={light ? '#2b2e34' : '#e8e8e8'} opacity=".92" />
            <circle cx="110" cy={y} r="1" fill={light ? '#000' : '#888'} opacity=".6" />
          </g>
        ))}
        {/* pocket */}
        <path d="M128 116 L156 116 L156 142 L142 150 L128 142 Z" fill="none" stroke={line} strokeWidth="1.8" />
        {sleeve === 'long' && (
          <>
            <path d="M6 214 L35 222" stroke={line} strokeWidth="5" strokeLinecap="round" />
            <path d="M214 214 L185 222" stroke={line} strokeWidth="5" strokeLinecap="round" />
          </>
        )}
        {/* collar */}
        <path d="M88 50 Q110 40 132 50 L110 100 Z" fill="#000" opacity=".5" />
        <path d="M110 100 L86 46 L66 62 L90 102 Z" fill={hi} stroke={stroke} strokeWidth={neon ? 1.8 : 1.2} strokeLinejoin="round" />
        <path d="M110 100 L134 46 L154 62 L130 102 Z" fill={shade(base, light ? 0.2 : 0.1)} stroke={stroke} strokeWidth={neon ? 1.8 : 1.2} strokeLinejoin="round" />
      </g>
      {title && <title>{title}</title>}
    </svg>
  );
}
