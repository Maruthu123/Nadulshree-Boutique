import { useState } from 'react';
import { imgSrc } from '../api';
import ShirtArt from './ShirtArt';
import { STYLE_BY_CATEGORY } from './nxUtils';

/** Product photo. If there is no photo yet (or it fails), a drawn shirt in the product colour is shown. */
export default function NxImage({ p, src, color, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  const url = src ?? p?.images?.[0];
  if (!url || failed) {
    const st = STYLE_BY_CATEGORY[p?.category_slug] || {};
    return (
      <div className={`nx-art ${className}`}>
        <ShirtArt color={color || p?.colors?.[0] || 'Navy'} pattern={st.pattern} sleeve={st.sleeve} accent="#b8892a" title={alt || p?.name} />
      </div>
    );
  }
  return <img className={className} src={imgSrc(url)} alt={alt || p?.name || ''} loading="lazy" onError={() => setFailed(true)} />;
}
