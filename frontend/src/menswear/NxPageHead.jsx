import { useEffect, useState } from 'react';
import ShirtArt from './ShirtArt';
import api, { imgSrc } from '../api';

// One request for the whole visit: the shop's shirts, used for pictures on the inner pages
let cache = null;
const load = () => { if (!cache) cache = api.get('/products', { params: { store: 'menswear', limit: 24 } }).then((r) => r.data).catch(() => { cache = null; return []; }); return cache; };

/** Shirts of the shop that have a photo (added in the admin dashboard). Empty until loaded / when there are no photos yet. */
export function useShowcase(max = 4) {
  const [list, setList] = useState([]);
  useEffect(() => {
    let alive = true;
    load().then((all) => { if (alive) setList(all.filter((p) => p.images?.[0]).slice(0, max)); });
    return () => { alive = false; };
  }, [max]);
  return list;
}

const Hanger = () => (
  <svg className="nx-ph-hanger" viewBox="0 0 220 90" aria-hidden>
    <g fill="none" stroke="#b8892a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M110 40 L110 26 Q110 10 124 11 Q136 13 133 25" />
      <path d="M110 40 L22 74 Q14 78 22 80 L198 80 Q206 78 198 74 L110 40" />
    </g>
  </svg>
);

function Hung({ side, photo, art }) {
  return (
    <div className={`nx-ph-art ${side}`} aria-hidden>
      <i />
      <Hanger />
      <div className="nx-ph-card">
        {photo ? <img src={imgSrc(photo)} alt="" loading="lazy" /> : <ShirtArt color={art.color} pattern={art.pattern} sleeve="long" accent="#b8892a" />}
      </div>
    </div>
  );
}

/** Page title with two hanging shirts on the sides: the owner's real photos if there are any, drawn shirts if not. */
export default function NxPageHead({ kicker, title, children }) {
  const photos = useShowcase(4);
  const pair = title.length % 2; // different pair on different pages
  const a = photos[pair % Math.max(photos.length, 1)];
  const b = photos[(pair + 1) % Math.max(photos.length, 1)];
  return (
    <section className="nx-pagehead nx-ph">
      <Hung side="l" photo={a?.images?.[0]} art={{ color: 'Navy', pattern: 'stripe' }} />
      <div className="nx-container">
        <small>{kicker}</small>
        <h1>{title}</h1>
        {children}
      </div>
      <Hung side="r" photo={b?.images?.[0]} art={{ color: 'Maroon', pattern: 'check' }} />
    </section>
  );
}
