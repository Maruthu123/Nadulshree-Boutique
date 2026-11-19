import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { imgSrc } from '../api';

/**
 * "What Our Customers Experience?" - one big testimonial card at a time
 * (avatar on top, review box with quote marks, star badge at the bottom).
 * Uses the same /testimonials data as before.
 */
export default function TestimonialSpotlight({ reviews, onOpenImage }) {
  const n = reviews.length;
  const [i, setI] = useState(0);
  const paused = useRef(false);
  const touchX = useRef(null);

  const go = useCallback((d) => setI((v) => (n ? (v + d + n) % n : 0)), [n]);

  useEffect(() => {
    if (n < 2) return undefined;
    const id = setInterval(() => { if (!paused.current) go(1); }, 6000);
    return () => clearInterval(id);
  }, [n, go]);

  if (!n) return null;
  const r = reviews[i % n];
  const initial = (r.name || '?').trim().charAt(0).toUpperCase();
  const stars = Math.max(1, Math.min(5, Number(r.rating) || 5));

  return (
    <section className="tm-section">
      {/* decorative wave */}
      <svg className="tm-wave" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="tmWave" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff7a1a" />
            <stop offset="1" stopColor="#e8650a" />
          </linearGradient>
        </defs>
        <path fill="url(#tmWave)" fillOpacity=".92" d="M0,224 C240,120 420,150 640,236 C860,322 1060,300 1260,230 C1340,202 1400,208 1440,220 L1440,320 L0,320 Z" />
        <path fill="#fff" fillOpacity=".18" d="M0,262 C220,200 420,214 640,272 C860,330 1080,310 1440,252 L1440,320 L0,320 Z" />
      </svg>

      <div className="container tm-wrap">
        <h2 className="tm-title">What Our Customers <em>Experience?</em></h2>

        <div
          className="tm-stage"
          onMouseEnter={() => { paused.current = true; }}
          onMouseLeave={() => { paused.current = false; }}
          onTouchStart={(e) => { paused.current = true; touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            touchX.current = null;
            setTimeout(() => { paused.current = false; }, 4000);
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={r.id ?? i}
              className="tm-card"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="tm-avatar-wrap"><span className="tm-avatar">{initial}</span></div>
              <h3 className="tm-name">{r.name}</h3>
              <p className="tm-role">{r.city ? r.city : 'Verified Customer'}</p>

              <div className="tm-review-row">
                <span className="tm-q tm-q-l" aria-hidden>“</span>
                <div className="tm-review">
                  <div className="tm-rv-head">
                    <span className="tm-mini">{initial}</span>
                    <div><b>{r.name}</b><small>Verified purchase</small></div>
                  </div>
                  <div className="tm-rv-stars">
                    <span className="stars">{[...Array(stars)].map((_, k) => <FiStar key={k} />)}</span>
                    <small>Nadulshree customer</small>
                  </div>
                  {r.message && <p>{r.message}</p>}
                  {r.image_url && (
                    <button type="button" className="tm-shot" onClick={() => onOpenImage?.(imgSrc(r.image_url))} aria-label="Open photo">
                      <img src={imgSrc(r.image_url)} alt={`Feedback from ${r.name}`} loading="lazy" />
                    </button>
                  )}
                </div>
                <span className="tm-q tm-q-r" aria-hidden>”</span>
              </div>

              <div className="tm-badge" aria-label={`${stars} out of 5 stars`}>
                {[...Array(stars)].map((_, k) => <FiStar key={k} />)}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="tm-controls">
          <button type="button" className="tm-arrow" onClick={() => go(-1)} aria-label="Previous review"><FiChevronLeft /></button>
          <div className="tm-dots">
            {reviews.map((x, k) => (
              <button key={x.id ?? k} type="button" className={k === i % n ? 'on' : ''} onClick={() => setI(k)} aria-label={`Review ${k + 1}`} />
            ))}
          </div>
          <button type="button" className="tm-arrow" onClick={() => go(1)} aria-label="Next review"><FiChevronRight /></button>
        </div>
      </div>
    </section>
  );
}
