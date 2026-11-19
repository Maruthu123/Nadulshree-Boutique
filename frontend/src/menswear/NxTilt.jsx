import { useRef } from 'react';

/**
 * 3D tilt: the element leans towards the mouse, with a soft gold light that follows it.
 * Works for cards, tiles, photos. On touch screens and with "reduce motion" nothing moves.
 *   <NxTilt as={Link} to="/menswear/shop" max={9} className="nx-card">...</NxTilt>
 */
export default function NxTilt({ as: Tag = 'div', max = 9, glare = true, className = '', children, ...rest }) {
  const ref = useRef(null);
  const frame = useRef(0);

  const move = (e) => {
    if (e.pointerType === 'touch') return;
    const el = ref.current; if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width; const py = (clientY - r.top) / r.height;
      el.style.setProperty('--rx', `${((0.5 - py) * max * 2).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((px - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      el.classList.add('is-tilting');
    });
  };
  const leave = () => {
    const el = ref.current; if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
    el.classList.remove('is-tilting');
  };

  return (
    <Tag ref={ref} className={`nx-tilt ${className}`} onPointerMove={move} onPointerLeave={leave} {...rest}>
      {children}
      {glare && <i className="nx-glare" aria-hidden="true" />}
    </Tag>
  );
}
