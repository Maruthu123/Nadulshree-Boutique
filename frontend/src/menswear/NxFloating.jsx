import { motion } from 'framer-motion';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { useNx, waLink } from './nxUtils';

export default function NxFloating() {
  const nx = useNx();
  return (
    <div className="nx-float">
      <motion.a href={`https://instagram.com/${nx.instagram}`} target="_blank" rel="noreferrer" aria-label="Instagram" className="nx-fab ig"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: 'spring' }} whileHover={{ scale: 1.12 }}><FaInstagram /></motion.a>
      <motion.a href={waLink(nx.whatsapp, 'Hi Nexora Menswear, I need details about your shirts.')} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="nx-fab wa"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: 'spring' }} whileHover={{ scale: 1.12 }}><FaWhatsapp /></motion.a>
    </div>
  );
}
