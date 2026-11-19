import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './nexoraLink.css';

/** Highlight card on the Boutique home page. The whole card opens the Nexora Menswear website. */
export default function NexoraBanner() {
  return (
    <section className="container nxb-wrap" aria-label="Nexora Menswear">
      <Link to="/menswear" className="nxb" aria-label="Visit Nexora Menswear website">
        <div className="nxb-copy">
          <span className="nxb-kick">NEW &middot; OUR MEN&rsquo;S STORE</span>
          <h2>Nexora <b>Menswear</b></h2>
          <p className="nxb-line">Premium Men&rsquo;s Shirts &middot; Soft Cotton &middot; Perfect Fit</p>
          <p className="nxb-sub">Formal, casual, linen, printed and checked shirts. Order online with secure UPI payment.</p>
          <span className="nxb-btn">Visit Nexora Menswear <FiArrowRight /></span>
        </div>
        <div className="nxb-pics" aria-hidden="true">
          <img src="/shirt2.jpg" alt="" loading="lazy" />
          <img src="/shirt1.jpg" alt="" loading="lazy" />
          <img src="/shirt4.jpg" alt="" loading="lazy" />
        </div>
      </Link>
    </section>
  );
}