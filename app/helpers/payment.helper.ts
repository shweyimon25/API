export function formatPaymentReference(
  paymentId: number,
  date = new Date()
) {
  const year = String(date.getFullYear()).slice(-2);
  return `YC/${year}/${String(paymentId).padStart(6, "0")}`;
}
