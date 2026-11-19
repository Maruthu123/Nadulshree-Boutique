import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiTruck, FiMapPin, FiShield, FiMessageCircle, FiArrowLeft } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { IMG } from '../data/images';
import api, { errMsg } from '../api';

const PERKS = [
  // [FiTruck, 'Cash on Delivery or online payment'], // COD disabled
  [FiTruck, 'Secure online payment'],
  [FiMapPin, 'Track your parcel step by step'],
  [FiShield, 'Safe account with email OTP'],
  [FiMessageCircle, 'Instagram & WhatsApp support'],
];

const TITLES = {
  login: ['Welcome back', 'Login to see your orders and tracking'],
  register: ['Create your account', 'Takes less than a minute'],
  otp: ['Verify your email', 'Enter the OTP we sent you'],
  forgot: ['Forgot password?', 'We will send an OTP to your email'],
  reset: ['Set a new password', 'Enter the OTP and your new password'],
};

/**
 * ONE login page for everyone.
 *  - owner (admin) email -> /admin dashboard
 *  - customer            -> where they came from (e.g. checkout) or /my-orders (their tracking dashboard)
 */
export default function Login() {
  const { user, saveSession } = useAuth();
  const { instagram } = useConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [mode, setMode] = useState('login'); // login | register | otp | forgot | reset
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

  const go = (u) => navigate(u.role === 'admin' ? '/admin' : (from || '/my-orders'), { replace: true });

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : (from || '/my-orders')} replace />;

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const switchMode = (m, message = '') => { setMode(m); setError(''); setInfo(message); setOtp(''); setDevOtp(''); };

  const toOtp = (next, email, dev, text) => {
    setForm((f) => ({ ...f, email }));
    switchMode(next, text);
    setDevOtp(dev || '');
    setCooldown(30);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      if (mode === 'login') {
        const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
        saveSession(data.token, data.user);
        go(data.user);
      } else if (mode === 'register') {
        const { data } = await api.post('/auth/register', form);
        toOtp('otp', data.email, data.devOtp, `We sent a 6-digit OTP to ${data.email}`);
      } else if (mode === 'otp') {
        const { data } = await api.post('/auth/verify-otp', { email: form.email, otp });
        saveSession(data.token, data.user);
        go(data.user);
      } else if (mode === 'forgot') {
        const { data } = await api.post('/auth/forgot-password', { email: form.email });
        toOtp('reset', data.email, data.devOtp, data.message);
      } else if (mode === 'reset') {
        const { data } = await api.post('/auth/reset-password', { email: form.email, otp, password: form.newPassword });
        setForm((f) => ({ ...f, password: '', newPassword: '' }));
        switchMode('login', data.message);
      }
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        toOtp('otp', err.response.data.email, err.response.data.devOtp, 'Please verify your email. We sent you an OTP.');
      } else {
        setError(errMsg(err));
      }
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError(''); setBusy(true);
    try {
      const path = mode === 'reset' ? '/auth/forgot-password' : '/auth/resend-otp';
      const { data } = await api.post(path, { email: form.email });
      setDevOtp(data.devOtp || '');
      setInfo('A new OTP has been sent');
      setCooldown(30);
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  const isOtpStep = mode === 'otp' || mode === 'reset';
  const [title, subtitle] = TITLES[mode];
  const button = { login: 'Login', register: 'Send OTP', otp: 'Verify & Continue', forgot: 'Send OTP', reset: 'Change password' }[mode];
  const otpOk = otp.length === 6 && (mode !== 'reset' || form.newPassword.length >= 6);

  return (
    <section className="login-page">
      <div className="login-side" style={{ backgroundImage: `url(${IMG.login})` }}>
        <div className="login-side-shade" />
        <div className="login-side-body">
          <Link to="/" className="brand brand-light">
            <span className="brand-mark">N</span>
            <span className="brand-text">Nadulshree<small>Boutique</small></span>
          </Link>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2>Style that <span className="grad">feels like you</span></h2>
            <p>Sarees, kurti sets, tops, leggings and pants. Login to place orders and track every step of your parcel.</p>
            <ul className="perks">
              {PERKS.map(([Icon, text], i) => (
                <motion.li key={text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <span><Icon /></span>{text}
                </motion.li>
              ))}
            </ul>
            <a className="insta-pill" href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer"><FaInstagram /> Follow @{instagram}</a>
          </motion.div>
        </div>
      </div>

      <div className="login-main">
        <div className="login-top">
          <Link to="/" className="back-link"><FiArrowLeft /> Back to shop</Link>
        </div>
        <motion.div className="auth-card plain" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          {(mode === 'login' || mode === 'register') && (
            <div className="tabs">
              <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Login</button>
              <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Register</button>
              <i className={`tab-ind ${mode === 'register' ? 'right' : ''}`} />
            </div>
          )}

          <h1 className="auth-title">{title}</h1>
          <p className="muted auth-sub">{subtitle}</p>

          <form onSubmit={submit} className="auth-form">
            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.18 }}>
                {info && <p className="notice">{info}</p>}

                {mode === 'register' && (
                  <>
                    <label>Full name<input name="name" value={form.name} onChange={change} required autoComplete="name" /></label>
                    <label>Mobile number<input name="phone" value={form.phone} onChange={change} required inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" title="10 digit mobile number" autoComplete="tel" /></label>
                  </>
                )}

                {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
                  <label>Email<input type="email" name="email" value={form.email} onChange={change} required autoComplete="email" /></label>
                )}

                {(mode === 'login' || mode === 'register') && (
                  <label>Password
                    <PasswordInput value={form.password} onChange={change} minLength={mode === 'register' ? 6 : undefined} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                  </label>
                )}

                {mode === 'login' && (
                  <div className="forgot-row"><button type="button" className="link-btn" onClick={() => switchMode('forgot')}>Forgot password?</button></div>
                )}

                {isOtpStep && (
                  <>
                    <label>Enter 6-digit OTP
                      <input className="otp-input" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" autoFocus required placeholder="••••••" />
                    </label>
                    {devOtp && <p className="dev-otp">Test mode: your OTP is <b>{devOtp}</b></p>}
                  </>
                )}

                {mode === 'reset' && (
                  <label>New password
                    <PasswordInput name="newPassword" value={form.newPassword} onChange={change} minLength={6} autoComplete="new-password" placeholder="At least 6 characters" />
                  </label>
                )}
              </motion.div>
            </AnimatePresence>

            {error && <p className="warn">{error}</p>}

            <button className="btn btn-orange btn-block btn-lg" disabled={busy || (isOtpStep && !otpOk)}>
              {busy ? 'Please wait...' : button}
            </button>

            {isOtpStep && (
              <div className="otp-links">
                <button type="button" className="link-btn" disabled={cooldown > 0 || busy} onClick={resend}>{cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}</button>
                <button type="button" className="link-btn" onClick={() => switchMode('login')}>Back to login</button>
              </div>
            )}
            {mode === 'forgot' && (
              <div className="otp-links"><button type="button" className="link-btn" onClick={() => switchMode('login')}>Back to login</button></div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
