import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

/** Password box with a show / hide eye icon. */
export default function PasswordInput({ value, onChange, name = 'password', autoComplete, minLength, placeholder, required = true }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input
        type={show ? 'text' : 'password'} name={name} value={value} onChange={onChange}
        autoComplete={autoComplete} minLength={minLength} placeholder={placeholder} required={required}
      />
      <button type="button" className="pw-eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} tabIndex={-1}>
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
}
