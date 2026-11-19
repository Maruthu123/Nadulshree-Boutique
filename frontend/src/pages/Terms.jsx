import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { useConfig } from '../context/ConfigContext';
import { buildTerms, UPDATED_ON } from '../data/terms';
import { IMG } from '../data/images';

/** Nadulshree Boutique: Terms & Conditions page (/terms). The text lives in data/terms.js */
export default function Terms() {
  const c = useConfig();
  const sections = buildTerms({
    name: 'Nadulshree Boutique', product: 'item', whatsapp: c.whatsapp.replace(/^91/, ''), instagram: c.instagram,
    address: 'Thiruchuli', freeAbove: c.freeShippingAbove, fee: c.shippingFee,
  });
  return (
    <>
      <PageHero title="Terms & Conditions" subtitle={`Last updated ${UPDATED_ON}`} image={IMG.banner.shop} />
      <section className="section container narrow">
        {sections.map(([title, points], i) => (
          <Reveal key={title}>
            <div className="card" style={{ marginBottom: 18 }}>
              <h3>{i + 1}. {title}</h3>
              {points.map((p) => <p key={p} className="muted" style={{ marginBottom: '.7em' }}>{p}</p>)}
            </div>
          </Reveal>
        ))}
      </section>
    </>
  );
}
