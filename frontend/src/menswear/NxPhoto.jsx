import { useEffect, useState } from 'react';
import ShirtArt from './ShirtArt';
import { imgSrc } from '../api';

/**
 * A photo that never looks broken: while it loads a soft shimmer shows, and if the link fails
 * a dark panel with a drawn shirt (in your gold) is shown instead.
 */
export default function NxPhoto({ src, alt = '', color = 'Navy', pattern = 'plain', className = '', ...rest }) {
  const [state, setState] = useState(src ? 'load' : 'bad');
  useEffect(() => { setState(src ? 'load' : 'bad'); }, [src]);
  return (
    <span className={`nx-photo ${state} ${className}`} {...rest}>
      {state !== 'bad' && (
        <img src={imgSrc(src)} alt={alt} loading="lazy" decoding="async" onLoad={() => setState('ok')} onError={() => setState('bad')} />
      )}
      {state === 'bad' && <span className="nx-photo-fb" role="img" aria-label={alt}><ShirtArt color={color} pattern={pattern} sleeve="long" accent="#b8892a" /></span>}
    </span>
  );
}
