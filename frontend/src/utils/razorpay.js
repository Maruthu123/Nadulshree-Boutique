const SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement('script');
    s.src = SRC;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Could not load the payment window. Check your internet.'));
    document.body.appendChild(s);
  });
}

/**
 * Opens Razorpay checkout.
 * Resolves with { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Rejects with Error('cancelled') if the person closes the window.
 */
export async function openRazorpay({ key, orderId, amount, currency = 'INR', prefill = {}, shopName = 'Nadulshree Boutique', color = '#ff7a1a' }) {
  await loadScript();
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key,
      amount,
      currency,
      order_id: orderId,
      name: shopName,
      description: 'Order payment',
      prefill,
      theme: { color },
      // UPI first: on a phone it lists GPay / PhonePe / Paytm apps, tapping one opens that app directly.
      // On a computer there is no UPI app, so it shows a QR code + UPI ID instead.
      config: {
        display: {
          blocks: {
            upi: { name: 'Pay with UPI app', instruments: [{ method: 'upi', flows: ['intent', 'qr', 'collect'], apps: ['google_pay', 'phonepe', 'paytm'] }] },
            other: { name: 'Other ways to pay', instruments: [{ method: 'card' }, { method: 'netbanking' }, { method: 'wallet' }] },
          },
          sequence: ['block.upi', 'block.other'],
          preferences: { show_default_blocks: false },
        },
      },
      handler: (response) => resolve(response),
      modal: { ondismiss: () => reject(new Error('cancelled')) },
    });
    rzp.on('payment.failed', (r) => reject(new Error(r?.error?.description || 'Payment failed')));
    rzp.open();
  });
}