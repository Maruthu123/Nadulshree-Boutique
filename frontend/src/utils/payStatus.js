/** Why online payment cannot be used right now (null = ready). Shown to the customer instead of silently hiding the option. */
export function payProblem({ razorpayEnabled, configState }) {
  if (configState === 'loading' || razorpayEnabled) return null;
  if (configState === 'error') {
    return { customer: 'Could not reach the server. Please check your internet and refresh the page.',
      dev: 'Frontend cannot reach the backend. Check VITE_API_URL (frontend/.env) and that the backend is running; also add this site to CLIENT_URL on the backend (CORS).' };
  }
  return { customer: 'Online payment is being set up. Please order on WhatsApp for now.',
    dev: 'Backend has no Razorpay keys. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env (local) or Render Environment (live), then restart the backend.' };
}
