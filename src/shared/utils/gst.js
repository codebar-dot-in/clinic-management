/**
 * GST Engine — multi-slab calculation for all 4 healthcare segments.
 *
 * Indian GST reference (simplified for MVP):
 *  0%  — Essential drugs (NLEM list), AYUSH services, consultation (exempt)
 *  5%  — Most generic medicines, basic diagnostics supplies
 * 12%  — Branded medicines, medical devices (basic)
 * 18%  — Diagnostic lab services (private), medical equipment
 *
 * Per facility type, configure applicable slabs. Facility staff selects slab per item.
 */

import { round2 } from "./currency.js";

export const GST_SLABS = [0, 5, 12, 18];

/**
 * Default GST slabs per segment — staff can override per item.
 */
export const DEFAULT_GST_BY_SEGMENT = {
  clinic:   0,    // Consultation services — GST exempt
  lab:      18,   // Private diagnostic lab services
  pharmacy: 5,    // Most generic medicines (override per drug)
  ayush:    0,    // AYUSH services — exempt
};

/**
 * Calculate GST for a single line item.
 * @param {number} unitPrice
 * @param {number} qty
 * @param {number} slab  0 | 5 | 12 | 18
 * @returns {{ subtotal, gstAmount, lineTotal }}
 */
export function calcLineGST(unitPrice, qty, slab) {
  const subtotal  = round2(unitPrice * qty);
  const gstAmount = round2(subtotal * slab / 100);
  return { subtotal, gstAmount, lineTotal: round2(subtotal + gstAmount) };
}

/**
 * Calculate totals for a full bill.
 * @param {Array<{ unitPrice, qty, gstSlab }>} items
 * @returns {{ subtotal, totalGst, grandTotal }}
 */
export function calcBillTotals(items) {
  let subtotal = 0;
  let totalGst = 0;

  for (const item of items) {
    const qty   = Number(item.qty ?? 1);
    const price = Number(item.unitPrice ?? 0);
    const slab  = Number(item.gstSlab ?? 0);
    subtotal += price * qty;
    totalGst += (price * qty * slab) / 100;
  }

  return {
    subtotal:   round2(subtotal),
    totalGst:   round2(totalGst),
    grandTotal: round2(subtotal + totalGst),
  };
}

/**
 * HSN / SAC code hints — for future GSTR-1 export
 */
export const HSN_HINTS = {
  consultation: { code: "998311", desc: "Medical consultation services (exempt)" },
  diagnostic:   { code: "998312", desc: "Laboratory diagnostic services" },
  medicine:     { code: "3004",   desc: "Pharmaceutical preparations" },
  ayush:        { code: "998319", desc: "AYUSH healthcare services (exempt)" },
};
