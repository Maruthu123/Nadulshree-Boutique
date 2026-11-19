import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api, { errMsg } from '../../api';

/** Owner login for Nexora Menswear. Customers use /menswear/login. Only an admin account gets in. */
export default function NxAdminLogin() {
  const { user, saveSession, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user?.role === 'admin') return <Navigate to="/menswear/admin" replace />;

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.user.role !== 'admin') { setError('This is not an admin account. Customers can login from the Login button on the shop.'); return; }
      saveSession(data.token, data.user);
      navigate('/menswear/admin', { replace: true });
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <section className="nx-login">
      <motion.div className="nx-auth" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/menswear" className="nx-back"><FiArrowLeft /> Back to shop</Link>
        <img src="/nexora/logo.png" alt="Nexora Menswear" width="110" height="110" className="nx-auth-logo" />
        <span className="nx-pill nx-admin-pill"><FiShield /> Admin only</span>
        <h1>Admin login</h1>
        <p className="nx-muted">Manage Nexora Menswear products, orders and tracking.</p>
        <p className="nx-muted" style={{ fontSize: '.84rem' }}>This login is only for the Nexora owner and is separate from customer accounts. Customers cannot open the dashboard.</p>
        {user && <p className="nx-notice">You are logged in as a customer. <button type="button" className="nx-link" onClick={logout}>Logout</button> to use the admin login.</p>}
        <form onSubmit={submit} className="nx-form one">
          <label>Admin email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="username" /></label>
          <label>Password
            <span className="nx-pass">
              <input type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <FiEyeOff /> : <FiEye />}</button>
            </span>
          </label>
          {error && <p className="nx-warn">{error}</p>}
          <button className="nx-btn nx-btn-lg nx-block" disabled={busy}>{busy ? 'Please wait...' : 'Login to dashboard'}</button>
          <div className="nx-between"><Link to="/menswear/login" className="nx-link">Customer login</Link></div>
        </form>
      </motion.div>
    </section>
  );
}
