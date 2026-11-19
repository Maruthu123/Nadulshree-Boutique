import { motion } from 'framer-motion';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { useConfig } from '../context/ConfigContext';

/** Floating Instagram + WhatsApp buttons (bottom right) on every page. */
export default function FloatingContact() {
  const { whatsapp, instagram } = useConfig();
  return (
    <div className="float-contact">
      <motion.a
        href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" aria-label="Instagram"
        className="fc fc-ig" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: 'spring' }} whileHover={{ scale: 1.12 }}
      ><FaInstagram /></motion.a>
      <motion.a
        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hi Nadulshree Boutique, I need details about your collection.')}`}
        target="_blank" rel="noreferrer" aria-label="WhatsApp"
        className="fc fc-wa" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: 'spring' }} whileHover={{ scale: 1.12 }}
      ><FaWhatsapp /></motion.a>
    </div>
  );
}
