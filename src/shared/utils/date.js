/**
 * Date utilities — native Intl, no library.
 */

const DATE_EN = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const DATE_TA = new Intl.DateTimeFormat("ta-IN", { day: "numeric", month: "long", year: "numeric" });
const TIME_EN = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
const FULL_EN = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** "18 Mar 2026" */
export const formatDate = (date, lang = "en") =>
  (lang === "ta" ? DATE_TA : DATE_EN).format(new Date(date));

/** "09:30 AM" */
export const formatTime = (date) => TIME_EN.format(new Date(date));

/** "Tuesday, 18 March 2026" */
export const formatFullDate = (date) => FULL_EN.format(new Date(date));

/** ISO date string "2026-03-18" → used as input value */
export const toISODate = (date) => new Date(date).toISOString().split("T")[0];

/** Age from DOB */
export const getAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
};

/** Is date within N days of expiry? */
export const isNearExpiry = (dateStr, days = 90) => {
  const exp = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return exp <= cutoff;
};

/** Is date already expired? */
export const isExpired = (dateStr) => new Date(dateStr) < new Date();
