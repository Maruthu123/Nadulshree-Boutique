import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const defaults = {
  razorpayEnabled: false,
  configState: 'loading', // loading | ok | error
  shippingFee: 60,
  freeShippingAbove: 1500,
  whatsapp: '919342728248',
  instagram: 'na_ndhini8288',
};

const ConfigContext = createContext(defaults);
export const useConfig = () => useContext(ConfigContext);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(defaults);
  useEffect(() => {
    api.get('/config').then((r) => setConfig({ ...defaults, ...r.data, configState: 'ok' })).catch(() => setConfig((c) => ({ ...c, configState: 'error' })));
  }, []);
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}
