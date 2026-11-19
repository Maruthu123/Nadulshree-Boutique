import { useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { imgSrc } from '../api';

/** Shows the product photo, or a neat placeholder if there is no photo / it fails to load. */
export default function ProductImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`img-ph ${className}`} role="img" aria-label={alt}>
        <FiImage />
        <span>{alt}</span>
      </div>
    );
  }
  return <img className={className} src={imgSrc(src)} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
