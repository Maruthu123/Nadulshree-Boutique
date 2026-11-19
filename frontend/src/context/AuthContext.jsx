import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('ns_token')));

  useEffect(() => {
    if (!localStorage.getItem('ns_token')) return;
    api.get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem('ns_token'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('ns-logout', onLogout);
    return () => window.removeEventListener('ns-logout', onLogout);
  }, []);

  const saveSession = useCallback((token, u) => {
    localStorage.setItem('ns_token', token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ns_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, saveSession, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}
