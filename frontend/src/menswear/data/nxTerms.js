import { buildTerms, DELIVERY_DAYS, RETURN_WINDOW_HOURS } from '../../data/terms';

/** Cancel reasons the customer can pick in My Orders. Must match CANCEL_REASONS in backend/routes/orders.js */
export const CANCEL_REASONS = [
  'Ordered by mistake',
  'Want to change size or colour',
  'Found a better price',
  'Delivery is taking too long',
  'Need to change the delivery address',
  'Payment problem',
  'Other',
];

/** Refund time shown to customers. Change this one line if your real refund time is different. */
export const REFUND_DAYS = '5 to 7 working days';

/**
 * Nexora Terms & Conditions = the shared terms, with a detailed Cancellation + Refund part for Nexora.
 * The boutique (Nadulshree) terms are not changed.
 */
export function buildNxTerms(shop) {
  const base = buildTerms(shop).filter(([title]) => title !== 'Cancellation and refund');
  const at = base.findIndex(([t]) => t === 'Delivery') + 1;
  const cancel = [
    ['Cancelling an order', [
      'Payment on Nexora Menswear is online only. There is no Cash on Delivery.',
      'You can cancel from My Orders > Cancel order while the order status is Order Placed or Confirmed. You will be asked to choose a reason (and write a few words if you choose Other).',
      'Once the order is Packed, Shipped or Out for delivery it cannot be cancelled on the website. Please WhatsApp us and we will see what is possible.',
      'A cancelled order cannot be re-opened. If you still want the shirt, please place a new order (stock is released as soon as you cancel).',
    ]],
    ['Refunds', [
      `If you cancel a paid order before it is packed, the full amount you paid (including delivery charge) is refunded to the same UPI, card or bank account you paid with.`,
      `Refunds are started within 2 working days of the cancellation and usually show in your account in ${REFUND_DAYS}. The exact time depends on your bank and Razorpay.`,
      'If the payment failed or you never completed the payment, nothing is charged. If money was deducted but the order shows unpaid, WhatsApp us your order number and we will check it.',
      'You can see the cancel reason and the refund note in My Orders > your order > tracking.',
    ]],
    ['When we cancel', [
      'We may cancel an order if the shirt is out of stock, the address cannot be delivered to, or payment could not be verified. We will tell you, and the full amount is refunded the same way.',
    ]],
    ['After delivery', [
      `Shirts cannot be cancelled after delivery. If a shirt is damaged, defective or wrong, WhatsApp us within ${RETURN_WINDOW_HOURS} hours of delivery (see Damaged or wrong item below). Approved replacements or refunds are handled within ${DELIVERY_DAYS} days.`,
    ]],
  ];
  return [...base.slice(0, at), ...cancel, ...base.slice(at)];
}
