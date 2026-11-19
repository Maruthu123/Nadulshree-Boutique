import Reveal from './Reveal';

/** Small label + big serif title (+ optional text). Wrap the highlighted word in <em>. */
export default function SectionHead({ kicker, children, text, align = 'center', light = false }) {
  return (
    <Reveal>
      <div className={`sec-head ${align} ${light ? 'light' : ''}`}>
        {kicker && <span className="kicker">{kicker}</span>}
        <h2>{children}</h2>
        {text && <p>{text}</p>}
      </div>
    </Reveal>
  );
}
