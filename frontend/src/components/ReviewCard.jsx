import { FiStar } from 'react-icons/fi';
import { fmtDate, imgSrc } from '../api';

/** Happy customer card. If the customer sent a photo / screenshot of their feedback, it is shown on top. */
export default function ReviewCard({ r, onOpenImage, showDate = false }) {
  return (
    <div className={r.image_url ? 'review has-img' : 'review'}>
      {r.image_url && (
        <button type="button" className="review-img" onClick={() => onOpenImage?.(imgSrc(r.image_url))} aria-label="Open photo">
          <img src={imgSrc(r.image_url)} alt={`Feedback from ${r.name}`} loading="lazy" />
        </button>
      )}
      <div className="review-body">
        <div className="stars">{[...Array(r.rating)].map((_, k) => <FiStar key={k} />)}</div>
        {r.message && <p>“{r.message}”</p>}
        <b>{r.name}</b>{r.city && <small> · {r.city}</small>}
        {showDate && <small className="muted block">{fmtDate(r.created_at)}</small>}
      </div>
    </div>
  );
}
