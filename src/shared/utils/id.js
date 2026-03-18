/**
 * ID generation — native crypto API, no package needed.
 */

/** UUID v4 */
export const genId = () => crypto.randomUUID();

/**
 * Human-readable bill number.
 * e.g. "OPD-2026-0042"
 */
export const genBillNo = (prefix, sequence) => {
  const year = new Date().getFullYear();
  const seq  = String(sequence).padStart(4, "0");
  return `${prefix}-${year}-${seq}`;
};

/**
 * UHID — unique hospital ID.
 * e.g. "CL-0019-4821"
 */
export const genUHID = (prefix = "PT") => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const rand2 = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${rand}-${rand2}`;
};
