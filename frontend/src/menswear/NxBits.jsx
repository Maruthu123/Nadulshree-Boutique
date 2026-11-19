import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import NxPhoto from './NxPhoto';

/** Fade-and-rise when it scrolls into view */
export const R = ({ children, className = '', delay = 0, y = 36 }) => (
  <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay }}>{children}</motion.div>
);

/** Wide photo band with a slow parallax and text on top */
export function PhotoBand({ src, kicker, title, text, children, color = 'Navy' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-8%', '8%']);
  return (
    <section ref={ref} className="nxm-band">
      <motion.div className="nxm-band-bg" style={{ y }}><NxPhoto src={src} color={color} alt="" /></motion.div>
      <div className="nxm-band-shade" />
      <div className="nx-container nxm-band-in">
        <R>
          {kicker && <small>{kicker}</small>}
          <h2>{title}</h2>
          {text && <p>{text}</p>}
          {children}
        </R>
      </div>
    </section>
  );
}

/** Row of facts. items = [[big, small], ...] */
export function Facts({ items }) {
  return (
    <div className="nxm-facts">
      {items.map(([big, small], i) => (
        <R key={small} delay={i * 0.07} className="nxm-fact"><b>{big}</b><span>{small}</span></R>
      ))}
    </div>
  );
}

/** Photo cards in a staggered mosaic. items = [{src, label, sub, color, pattern}] */
export function Mosaic({ items }) {
  return (
    <div className="nxm-mosaic">
      {items.map((it, i) => (
        <motion.figure key={it.label} className={`m${i % 6}`} initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: (i % 3) * 0.08, duration: 0.55 }} whileHover={{ y: -6 }}>
          <NxPhoto src={it.src} alt={it.label} color={it.color} pattern={it.pattern} />
          <figcaption><b>{it.label}</b>{it.sub && <small>{it.sub}</small>}</figcaption>
        </motion.figure>
      ))}
    </div>
  );
}

/** Never-ending text strip */
export const Strip = ({ words }) => (
  <div className="nx-marquee" aria-hidden>
    <div className="nx-marquee-track">
      {[0, 1].map((k) => <span key={k}>{words.map((t) => <em key={t + k}>{t}<i /></em>)}</span>)}
    </div>
  </div>
);
