import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';

/** Compact hero used on inner pages. The navigation sits inside it, same as the home hero. */
export default function PageHero({ title, subtitle, image, crumb }) {
  return (
    <section className="page-hero">
      {image && <div className="page-hero-bg" style={{ backgroundImage: `url(${image})` }} />}
      <div className="orb orb-a" /><div className="orb orb-b" />
      <Header />
      <div className="page-hero-body">
        <motion.nav className="crumbs" aria-label="Breadcrumb" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link to="/">Home</Link><span>/</span><b>{crumb || title}</b>
        </motion.nav>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>{title}</motion.h1>
        {subtitle && <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}>{subtitle}</motion.p>}
      </div>
    </section>
  );
}
