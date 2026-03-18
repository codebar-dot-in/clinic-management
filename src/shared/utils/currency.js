/**
 * Currency utilities — Indian Rupee formatting.
 * Uses native Intl — no library needed.
 */

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const INR_COMPACT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/** Format as ₹1,23,456 */
export const formatINR = (amount) => INR_FORMATTER.format(amount ?? 0);

/** Format as ₹1.2L for large numbers in stats */
export const formatINRCompact = (amount) => INR_COMPACT.format(amount ?? 0);

/** Round to 2 decimal places (for tax calculations) */
export const round2 = (n) => Math.round(n * 100) / 100;
