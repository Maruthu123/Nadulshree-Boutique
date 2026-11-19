import { motion } from 'framer-motion';
import { UPDATED_ON } from '../../data/terms';
import { buildNxTerms } from '../data/nxTerms';
import { useNx } from '../nxUtils';

export default function NxTerms() {
  const nx = useNx();
  const sections = buildNxTerms({
    name: 'Nexora Menswear', product: 'shirt', whatsapp: nx.whatsapp.slice(-10), instagram: nx.instagram,
    address: nx.address, freeAbove: nx.freeShippingAbove, fee: nx.shippingFee,
  });
  return (
    <>
      <section className="nx-pagehead"><div className="nx-container"><small>LAST UPDATED {UPDATED_ON.toUpperCase()}</small><h1>Terms & Conditions</h1></div></section>
      <section className="nx-section nx-tight">
        <div className="nx-container nx-narrow">
          {sections.map(([title, points], i) => (
            <motion.div key={title} className="nx-panel" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}>
              <h3><span className="nx-num">{String(i + 1).padStart(2, '0')}</span> {title}</h3>
              {points.map((p) => <p key={p} className="nx-muted">{p}</p>)}
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
