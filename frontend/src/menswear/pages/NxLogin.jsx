import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api, { errMsg } from '../../api';

const TITLES = {
  login: ['Welcome back', 'Login to see your orders and tracking'],
  register: ['Create your account', 'Takes less than a minute'],
  otp: ['Verify your email', 'Enter the OTP we sent you'],
  forgot: ['Forgot password?', 'We will send an OTP to your email'],
  reset: ['Set a new password', 'Enter the OTP and your new password'],
};

function Pass({ value, onChange, name = 'password', ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <span className="nx-pass">
      <input type={show ? 'text' : 'password'} name={name} value={value} onChange={onChange} required {...rest} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <FiEyeOff /> : <FiEye />}</button>
    </span>
  );
}

/** Same accounts as the Nadulshree site (one customer login), with the Nexora look. */
export default function NxLogin() {
  const { user, saveSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', newPassword: '' });
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const dest = (u) => (u.role === 'admin' ? '/menswear/admin' : (from || '/menswear/my-orders'));
  if (user) return <Navigate to={dest(user)} replace />;

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const switchMode = (m, message = '') => { setMode(m); setError(''); setInfo(message); setOtp(''); setDevOtp(''); };
  const toOtp = (next, email, dev, text) => { setForm((f) => ({ ...f, email })); switchMode(next, text); setDevOtp(dev || ''); setCooldown(30); };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      if (mode === 'login') {
        const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
        saveSession(data.token, data.user); navigate(dest(data.user), { replace: true });
      } else if (mode === 'register') {
        const { data } = await api.post('/auth/register', form);
        toOtp('otp', data.email, data.devOtp, `We sent a 6-digit OTP to ${data.email}`);
      } else if (mode === 'otp') {
        const { data } = await api.post('/auth/verify-otp', { email: form.email, otp });
        saveSession(data.token, data.user); navigate(dest(data.user), { replace: true });
      } else if (mode === 'forgot') {
        const { data } = await api.post('/auth/forgot-password', { email: form.email });
        toOtp('reset', data.email, data.devOtp, data.message);
      } else if (mode === 'reset') {
        const { data } = await api.post('/auth/reset-password', { email: form.email, otp, password: form.newPassword });
        setForm((f) => ({ ...f, password: '', newPassword: '' }));
        switchMode('login', data.message);
      }
    } catch (err) {
      if (err.response?.data?.needsVerification) toOtp('otp', err.response.data.email, err.response.data.devOtp, 'Please verify your email. We sent you an OTP.');
      else setError(errMsg(err));
    } finally { setBusy(false); }
  };

  const resend = async () => {
    setError(''); setBusy(true);
    try {
      const { data } = await api.post(mode === 'reset' ? '/auth/forgot-password' : '/auth/resend-otp', { email: form.email });
      setDevOtp(data.devOtp || ''); setInfo('A new OTP has been sent'); setCooldown(30);
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  const isOtp = mode === 'otp' || mode === 'reset';
  const [title, subtitle] = TITLES[mode];
  const button = { login: 'Login', register: 'Send OTP', otp: 'Verify & Continue', forgot: 'Send OTP', reset: 'Change password' }[mode];
  const otpOk = otp.length === 6 && (mode !== 'reset' || form.newPassword.length >= 6);

  return (
    <section className="nx-login">
      <motion.div className="nx-auth" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/menswear" className="nx-back"><FiArrowLeft /> Back to shop</Link>
        <img src="/nexora/logo.png" alt="Nexora Menswear" width="110" height="110" className="nx-auth-logo" />
        {(mode === 'login' || mode === 'register') && (
          <div className="nx-authtabs">
            <button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => switchMode('login')}>Login</button>
            <button type="button" className={mode === 'register' ? 'on' : ''} onClick={() => switchMode('register')}>Register</button>
          </div>
        )}
        <h1>{title}</h1>
        <p className="nx-muted">{subtitle}</p>
        <form onSubmit={submit} className="nx-form one">
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.18 }}>
              {info && <p className="nx-notice">{info}</p>}
              {mode === 'register' && (
                <>
                  <label>Full name<input name="name" value={form.name} onChange={change} required autoComplete="name" /></label>
                  <label>Mobile number<input name="phone" value={form.phone} onChange={change} required inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" title="10 digit mobile number" autoComplete="tel" /></label>
                </>
              )}
              {['login', 'register', 'forgot'].includes(mode) && <label>Email<input type="email" name="email" value={form.email} onChange={change} required autoComplete="email" /></label>}
              {(mode === 'login' || mode === 'register') && <label>Password<Pass value={form.password} onChange={change} minLength={mode === 'register' ? 6 : undefined} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>}
              {mode === 'login' && <div className="nx-right"><button type="button" className="nx-link" onClick={() => switchMode('forgot')}>Forgot password?</button></div>}
              {isOtp && (
                <>
                  <label>Enter 6-digit OTP<input className="nx-otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" autoFocus required placeholder="••••••" /></label>
                  {devOtp && <p className="nx-notice">Test mode: your OTP is <b>{devOtp}</b></p>}
                </>
              )}
              {mode === 'reset' && <label>New password<Pass name="newPassword" value={form.newPassword} onChange={change} minLength={6} autoComplete="new-password" placeholder="At least 6 characters" /></label>}
            </motion.div>
          </AnimatePresence>
          {error && <p className="nx-warn">{error}</p>}
          <button className="nx-btn nx-btn-lg nx-block" disabled={busy || (isOtp && !otpOk)}>{busy ? 'Please wait...' : button}</button>
          {isOtp && (
            <div className="nx-between">
              <button type="button" className="nx-link" disabled={cooldown > 0 || busy} onClick={resend}>{cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}</button>
              <button type="button" className="nx-link" onClick={() => switchMode('login')}>Back to login</button>
            </div>
          )}
          {mode === 'forgot' && <div className="nx-between"><button type="button" className="nx-link" onClick={() => switchMode('login')}>Back to login</button></div>}
        </form>
      </motion.div>
    </section>
  );
}
