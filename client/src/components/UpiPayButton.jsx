/**
 * UpiPayButton — Generates a UPI deeplink and renders a styled pay button.
 *
 * UPI Deeplink format:
 *   upi://pay?pa={payee_upi_id}&pn={payee_name}&am={amount}&cu=INR&tn={note}
 *
 * On mobile, tapping this link opens the user's UPI app (GPay, PhonePe, etc).
 * On desktop, it still provides the link but may not open an app.
 */
import { Smartphone } from "lucide-react";

export default function UpiPayButton({ payeeName, payeeUpiId, amount, onSetUpi }) {
  if (!payeeUpiId) {
    return (
      <button
        onClick={() => onSetUpi && onSetUpi(payeeName)}
        className="btn-ghost flex items-center gap-2 text-xs"
      >
        <Smartphone size={14} />
        Set UPI ID for {payeeName}
      </button>
    );
  }

  // Build the UPI deeplink URL
  const upiLink =
    `upi://pay?pa=${encodeURIComponent(payeeUpiId)}` +
    `&pn=${encodeURIComponent(payeeName)}` +
    `&am=${(amount || 0).toFixed(2)}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent("Group Bill Split")}`;

  return (
    <a
      href={upiLink}
      className="btn-success flex items-center gap-2 no-underline text-sm"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Smartphone size={14} />
      Pay ₹{(amount || 0).toFixed(2)} via UPI
    </a>
  );
}
