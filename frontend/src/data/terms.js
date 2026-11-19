/**
 * TERMS & CONDITIONS text for both shops (Nadulshree Boutique and Nexora Menswear).
 * EDIT anything below to match your real shop rules. The page, the checkout tick-box and the footer link update by themselves.
 * Please read it once and change the points (return time, refund time, delivery time) to what you really follow.
 */
export const RETURN_WINDOW_HOURS = 48;   // how long after delivery a customer can report a damaged / wrong item
export const DELIVERY_DAYS = 7;          // normal delivery time (the order page shows "expected by" = order date + 7 days)
export const UPDATED_ON = 'November 2026';

/** shop = { name, product, whatsapp, instagram, address, freeAbove, fee } */
export function buildTerms(shop) {
  const { name, product, whatsapp, instagram, address, freeAbove, fee } = shop;
  const rupee = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  return [
    ['Using this website', [
      `These terms apply when you browse or buy from ${name} (this website, our WhatsApp and our Instagram page). By placing an order you agree to them.`,
      `We may update these terms from time to time. The date at the top of this page shows the last update.`,
    ]],
    ['Products and prices', [
      `All prices are in Indian Rupees (₹) and are shown on each ${product} page. The price you see when you pay is the price you are charged.`,
      `We show real photos, but colours can look slightly different on different phone screens.`,
      `Stock is limited. If a ${product} sells out while you are paying, we will tell you and refund any amount paid.`,
      `Sizes and measurements are approximate. If you are unsure, message us on WhatsApp before ordering.`,
    ]],
    ['Orders and payment', [
      `You need an account (email OTP login) to place an order, so that you can track it.`,
      `Payment is online only (UPI, cards, net banking, wallets) through Razorpay. We never see or store your card, UPI or bank details.`,
      `An order is confirmed only after the payment is received and verified. If money is deducted but the order shows unpaid, message us with your order number and we will check it.`,
      `You can also enquire or order through WhatsApp or Instagram. Orders placed there follow the same terms.`,
    ]],
    ['Delivery', [
      `We deliver from ${address}. Delivery is free above ${rupee(freeAbove)}; below that a delivery charge of ${rupee(fee)} is shown at checkout.`,
      `Expected delivery is about ${DELIVERY_DAYS} days after the order. Courier delays, weather or festival rush can add time. You can follow every step in My Orders.`,
      `Please give a complete address, pincode and a working mobile number. We are not responsible for delays or loss caused by a wrong address.`,
    ]],
    ['Cancellation and refund', [
      `You can cancel an order from My Orders until it is packed. After it is packed or shipped, please contact us on WhatsApp.`,
      `If you cancel a paid order, or we cancel it (for example out of stock), the amount is refunded to the original payment method. The time the money takes to show depends on your bank and Razorpay.`,
    ]],
    ['Damaged or wrong item', [
      `If you receive a damaged, defective or wrong ${product}, message us on WhatsApp within ${RETURN_WINDOW_HOURS} hours of delivery with your order number and clear photos (please keep the parcel and record the opening if you can).`,
      `After checking, we will offer a replacement or refund. ${product.charAt(0).toUpperCase() + product.slice(1)}s that are worn, washed, altered or damaged after delivery cannot be returned.`,
    ]],
    ['Your account and privacy', [
      `We collect your name, mobile number, email and delivery address only to run your orders, deliver your parcel and contact you about it.`,
      `We do not sell your details. They are shared only with the courier and payment gateway as needed to complete your order.`,
      `Keep your password and OTP private. You are responsible for activity on your account.`,
    ]],
    ['Reviews and photos', [
      `Reviews you write are shown only after we approve them. By sending a photo or feedback you allow us to show it on this website and our Instagram page. Tell us if you want it removed.`,
    ]],
    ['Contact us', [
      `Questions about these terms or an order? WhatsApp ${whatsapp}, or message @${instagram} on Instagram. Address: ${address}.`,
    ]],
  ];
}
