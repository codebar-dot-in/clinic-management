/**
 * WhatsApp deep-link utilities.
 * Uses wa.me — free, no API key, no cost.
 * Opens WhatsApp with a pre-filled Tamil/English message.
 * Staff taps "Send" — receipt delivered.
 */

import { formatDate, formatTime } from "./date.js";
import { formatINR } from "./currency.js";

/** Normalise phone to E.164 India format */
const normalisePhone = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("91") ? digits : `91${digits}`;
};

/** Build the wa.me URL */
export const buildWhatsAppLink = (phone, message) => {
  const e164 = normalisePhone(phone);
  return `https://wa.me/${e164}?text=${encodeURIComponent(message)}`;
};

/**
 * Open WhatsApp with pre-filled receipt message.
 * @param {string} phone
 * @param {string} message
 */
export const sendWhatsApp = (phone, message) => {
  window.open(buildWhatsAppLink(phone, message), "_blank");
};

// ─── Message Builders ─────────────────────────────────────────────────────────

/**
 * Clinic OPD receipt message (Tamil + English)
 */
export function clinicReceiptMessage({ bill, patient, facility, lang = "ta" }) {
  const name = lang === "ta" ? (patient.nameTa || patient.nameEn) : patient.nameEn;
  const facName = facility?.name ?? "Our Clinic";
  const items = (bill.items ?? [])
    .map((i) => `  • ${i.name} — ${formatINR(i.lineTotal)}`)
    .join("\n");

  if (lang === "ta") {
    return [
      `🏥 *${facName}*`,
      `━━━━━━━━━━━━━━━`,
      `வணக்கம் ${name}! 🙏`,
      ``,
      `🧾 ரசீது: *${bill.billNo}*`,
      `📅 தேதி: ${formatDate(bill.createdAt, "ta")}`,
      bill.doctor ? `👨‍⚕️ மருத்துவர்: ${bill.doctor}` : null,
      ``,
      `📋 *சேவைகள்:*`,
      items,
      ``,
      `──────────────`,
      `💰 *மொத்தம்: ${formatINR(bill.grandTotal)}*`,
      bill.totalGst > 0 ? `   (GST உட்பட: ${formatINR(bill.totalGst)})` : null,
      `💳 கட்டண முறை: ${bill.paymentMode?.toUpperCase()} ✅`,
      bill.nextVisit ? `📅 அடுத்த சந்திப்பு: ${formatDate(bill.nextVisit, "ta")}` : null,
      ``,
      `நன்றி! நலமாக இருங்கள் 😊`,
    ].filter(Boolean).join("\n");
  }

  return [
    `🏥 *${facName}*`,
    `━━━━━━━━━━━━━━━`,
    `Hello ${name}! 🙏`,
    ``,
    `🧾 Receipt: *${bill.billNo}*`,
    `📅 Date: ${formatDate(bill.createdAt)}`,
    bill.doctor ? `👨‍⚕️ Doctor: ${bill.doctor}` : null,
    ``,
    `📋 *Services:*`,
    items,
    ``,
    `──────────────`,
    `💰 *Total: ${formatINR(bill.grandTotal)}*`,
    bill.totalGst > 0 ? `   (Incl. GST: ${formatINR(bill.totalGst)})` : null,
    `💳 Payment: ${bill.paymentMode?.toUpperCase()} ✅`,
    bill.nextVisit ? `📅 Next Visit: ${formatDate(bill.nextVisit)}` : null,
    ``,
    `Thank you! Get well soon 😊`,
  ].filter(Boolean).join("\n");
}

/**
 * Lab report ready message
 */
export function labReportMessage({ request, patient, facility, lang = "ta" }) {
  const name = lang === "ta" ? (patient.nameTa || patient.nameEn) : patient.nameEn;
  const facName = facility?.name ?? "Our Lab";
  const abnormalTests = (request.tests ?? []).filter((t) => t.isAbnormal);

  if (lang === "ta") {
    return [
      `🔬 *${facName}*`,
      `━━━━━━━━━━━━━━━`,
      `${name}, உங்கள் சோதனை அறிக்கை தயார்! 📊`,
      ``,
      `🧾 கோரிக்கை: *${request.reqNo}*`,
      `📅 தேதி: ${formatDate(new Date())}`,
      ``,
      abnormalTests.length > 0
        ? `⚠️ *அசாதாரண மதிப்புகள் உள்ளன — மருத்துவரை சந்திக்கவும்*`
        : `✅ அனைத்து மதிப்புகளும் சாதாரண வரம்பில் உள்ளன`,
      ``,
      `உங்கள் மருத்துவரிடம் அறிக்கையை காட்டவும். 🙏`,
      ``,
      `நன்றி!`,
    ].filter(Boolean).join("\n");
  }

  return [
    `🔬 *${facName}*`,
    `━━━━━━━━━━━━━━━`,
    `${name}, your test report is ready! 📊`,
    ``,
    `🧾 Request: *${request.reqNo}*`,
    `📅 Date: ${formatDate(new Date())}`,
    ``,
    abnormalTests.length > 0
      ? `⚠️ *Some values are abnormal — please consult your doctor*`
      : `✅ All values are within normal range`,
    ``,
    `Please share this report with your doctor. 🙏`,
    ``,
    `Thank you!`,
  ].filter(Boolean).join("\n");
}

/**
 * Pharmacy receipt message
 */
export function pharmacyReceiptMessage({ bill, patient, facility, lang = "ta" }) {
  const name = lang === "ta" ? (patient.nameTa || patient.nameEn) : patient.nameEn;
  const facName = facility?.name ?? "Our Pharmacy";
  const items = (bill.items ?? [])
    .map((i) => `  • ${i.name} ×${i.qty} — ${formatINR(i.lineTotal)}`)
    .join("\n");

  if (lang === "ta") {
    return [
      `💊 *${facName}*`,
      `━━━━━━━━━━━━━━━`,
      `வணக்கம் ${name}! 🙏`,
      ``,
      `🧾 பில்: *${bill.billNo}*`,
      `📅 தேதி: ${formatDate(bill.createdAt, "ta")}`,
      ``,
      `💊 *மருந்துகள்:*`,
      items,
      ``,
      `──────────────`,
      `💰 *மொத்தம்: ${formatINR(bill.grandTotal)}*`,
      `💳 ${bill.paymentMode?.toUpperCase()} ✅`,
      ``,
      `⏰ மருந்துகளை தவறாமல் சாப்பிடுங்கள்! 💪`,
      `நன்றி!`,
    ].filter(Boolean).join("\n");
  }

  return [
    `💊 *${facName}*`,
    `━━━━━━━━━━━━━━━`,
    `Hello ${name}! 🙏`,
    ``,
    `🧾 Bill: *${bill.billNo}*`,
    `📅 Date: ${formatDate(bill.createdAt)}`,
    ``,
    `💊 *Medicines:*`,
    items,
    ``,
    `──────────────`,
    `💰 *Total: ${formatINR(bill.grandTotal)}*`,
    `💳 ${bill.paymentMode?.toUpperCase()} ✅`,
    ``,
    `⏰ Take your medicines regularly! 💪`,
    `Thank you!`,
  ].filter(Boolean).join("\n");
}

/**
 * AYUSH treatment summary message
 */
export function ayushReceiptMessage({ visit, patient, facility, lang = "ta" }) {
  const name = lang === "ta" ? (patient.nameTa || patient.nameEn) : patient.nameEn;
  const facName = facility?.name ?? "Our Clinic";

  if (lang === "ta") {
    return [
      `🌿 *${facName}*`,
      `━━━━━━━━━━━━━━━`,
      `வணக்கம் ${name}! 🙏`,
      ``,
      `🌿 சிகிச்சை சுருக்கம்: *${visit.visitNo}*`,
      `📅 தேதி: ${formatDate(visit.createdAt, "ta")}`,
      visit.bill ? `💰 மொத்தம்: ${formatINR(visit.bill.grandTotal)}` : null,
      visit.nextVisit ? `📅 அடுத்த சந்திப்பு: ${formatDate(visit.nextVisit, "ta")}` : null,
      ``,
      `விரைவில் குணமடைவீர்கள்! 🌿`,
      `நன்றி!`,
    ].filter(Boolean).join("\n");
  }

  return [
    `🌿 *${facName}*`,
    `━━━━━━━━━━━━━━━`,
    `Hello ${name}! 🙏`,
    ``,
    `🌿 Treatment Summary: *${visit.visitNo}*`,
    `📅 Date: ${formatDate(visit.createdAt)}`,
    visit.bill ? `💰 Total: ${formatINR(visit.bill.grandTotal)}` : null,
    visit.nextVisit ? `📅 Next Visit: ${formatDate(visit.nextVisit)}` : null,
    ``,
    `Wishing you a speedy recovery! 🌿`,
    `Thank you!`,
  ].filter(Boolean).join("\n");
}
