const FREE_SHIPPING_THRESHOLD = 2000;
const STANDARD_SHIPPING_FEE = 50;
const BULK_SHIPPING_FEE = 70;

function calculateShippingFee(itemsTotal, itemCount) {
  const subtotal = Number(itemsTotal) || 0;
  const quantity = Number(itemCount) || 0;
  if (quantity <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return quantity >= 3 ? BULK_SHIPPING_FEE : STANDARD_SHIPPING_FEE;
}

module.exports = {
  BULK_SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  calculateShippingFee,
};
