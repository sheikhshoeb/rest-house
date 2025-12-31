const GST_RATE = 0.18;

module.exports = function calculatePricing({
  checkIn,
  checkOut,
  adults,
  children,
  role,
  pricing,
}) {
  const MS_PER_HOUR = 1000 * 60 * 60;

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const hours = Math.ceil((end - start) / MS_PER_HOUR);
  const days = Math.max(1, Math.ceil(hours / 24));

  const totalGuests = Number(adults) + Number(children || 0);

  let pricePerGuest = pricing.guest;
  if (role === "employee") pricePerGuest = pricing.employee;
  if (role === "ex-employee") pricePerGuest = pricing.exEmployee;

  const baseAmount = days * totalGuests * pricePerGuest;
  const gst = Math.round(baseAmount * GST_RATE);
  const totalAmount = baseAmount + gst;

  return {
    days,
    totalGuests,
    baseAmount,
    gst,
    totalAmount,
  };
};
