/**
 * Receipt HTML generator — used with window.print() via hidden iframe.
 * Generates a complete HTML document (with Tamil font + print CSS).
 * No PDF library needed.
 */

import { formatDate } from "./date.js";
import { formatINR } from "./currency.js";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+Tamil:wght@400;600;700&display=swap";

const baseStyle = `
  <style>
    @import url('${FONT_URL}');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', 'Noto Sans Tamil', sans-serif;
      font-size: 13px;
      color: #111918;
      background: #fff;
      padding: 24px;
      max-width: 380px;
      margin: 0 auto;
    }
    .header { text-align: center; margin-bottom: 16px; }
    .header h1 { font-size: 18px; font-weight: 700; }
    .header p  { font-size: 11px; color: #5a7a74; margin-top: 2px; }
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-top: 6px;
    }
    hr { border: none; border-top: 1px dashed #dce8e4; margin: 12px 0; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; margin-bottom: 12px; }
    .meta-item .label { font-size: 10px; color: #8aa39d; text-transform: uppercase; letter-spacing: 0.08em; }
    .meta-item .value { font-weight: 600; font-size: 12px; margin-top: 1px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th { font-size: 10px; color: #5a7a74; text-align: left; padding: 4px 0; border-bottom: 1px solid #dce8e4; }
    td { font-size: 12px; padding: 6px 0; border-bottom: 1px solid #f4f7f6; vertical-align: top; }
    td.right { text-align: right; }
    .totals { background: #f4f7f6; border-radius: 6px; padding: 10px 12px; margin-top: 8px; }
    .totals .row { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; }
    .totals .grand { font-weight: 700; font-size: 14px; border-top: 1px solid #dce8e4; padding-top: 6px; margin-top: 4px; }
    .footer { text-align: center; margin-top: 16px; font-size: 11px; color: #8aa39d; }
    .footer .tamil { font-family: 'Noto Sans Tamil', serif; font-size: 13px; color: #5a7a74; margin-bottom: 4px; }
    .abnormal { color: #b52a2a; font-weight: 700; }
    .normal   { color: #1a7a4a; }
    @media print {
      body { padding: 0; }
    }
  </style>
`;

/** Inject receipt HTML into hidden div and print via iframe */
export function printReceipt(html) {
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
    visibility: "hidden",
  });
  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  // Wait for fonts to load then print
  iframe.contentWindow.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 2000);
  };

  // Fallback if onload doesn't fire
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (_) {}
    setTimeout(() => {
      try { document.body.removeChild(iframe); } catch (_) {}
    }, 2000);
  }, 800);
}

// ─── HTML Generators ──────────────────────────────────────────────────────────

export function generateClinicReceipt({ bill, patient, facility }) {
  const theme = "#0d7a6e";
  const items = (bill.items ?? [])
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td class="right">${item.qty}</td>
        <td class="right">${formatINR(item.unitPrice)}</td>
        <td class="right">${item.gstSlab}%</td>
        <td class="right">${formatINR(item.lineTotal)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyle}</head><body>
    <div class="header">
      <h1 style="color:${theme}">${facility?.name ?? "Clinic"}</h1>
      <p>${facility?.address ?? ""}</p>
      ${facility?.gstin ? `<p>GSTIN: ${facility.gstin}</p>` : ""}
      <span class="badge" style="background:#e6f5f3;color:${theme}">OPD Receipt</span>
    </div>
    <hr/>
    <div class="meta-grid">
      <div class="meta-item"><div class="label">Receipt No.</div><div class="value">${bill.billNo}</div></div>
      <div class="meta-item"><div class="label">Date</div><div class="value">${formatDate(bill.createdAt)}</div></div>
      <div class="meta-item"><div class="label">Patient</div><div class="value">${patient.nameEn}</div></div>
      <div class="meta-item"><div class="label">UHID</div><div class="value">${patient.uhid ?? "—"}</div></div>
      ${bill.doctor ? `<div class="meta-item"><div class="label">Doctor</div><div class="value">${bill.doctor}</div></div>` : ""}
      ${patient.phone ? `<div class="meta-item"><div class="label">Phone</div><div class="value">${patient.phone}</div></div>` : ""}
    </div>
    <hr/>
    <table>
      <thead><tr><th>Service</th><th class="right">Qty</th><th class="right">Price</th><th class="right">GST</th><th class="right">Amount</th></tr></thead>
      <tbody>${items}</tbody>
    </table>
    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${formatINR(bill.subtotal)}</span></div>
      ${bill.totalGst > 0 ? `<div class="row"><span>GST</span><span>${formatINR(bill.totalGst)}</span></div>` : ""}
      <div class="row grand"><span>Total Paid</span><span style="color:${theme}">${formatINR(bill.grandTotal)}</span></div>
    </div>
    <div style="text-align:center;margin-top:8px;font-size:11px;color:#5a7a74;">
      ${bill.paymentMode?.toUpperCase()} · ${bill.paymentStatus?.toUpperCase()}
    </div>
    ${bill.nextVisit ? `<div style="text-align:center;margin-top:6px;font-size:11px;color:#0d7a6e;font-weight:600;">Next Visit: ${formatDate(bill.nextVisit)}</div>` : ""}
    <hr/>
    <div class="footer">
      <div class="tamil">நன்றி! நலமாக இருங்கள் 🙏</div>
      <div>Thank you for visiting us. Get well soon!</div>
    </div>
  </body></html>`;
}

export function generateLabReport({ request, patient, facility }) {
  const theme = "#1a5c8a";
  const tests = (request.tests ?? [])
    .map(
      (t) => `
      <tr>
        <td>${t.testName}</td>
        <td class="${t.isAbnormal ? "abnormal" : "normal"}">${t.resultValue ?? "—"} ${t.unit ?? ""} ${t.isAbnormal ? "⚠" : "✓"}</td>
        <td>${t.normalRange ?? "—"}</td>
        <td class="right">${formatINR(t.price ?? 0)}</td>
      </tr>`
    )
    .join("");

  const hasAbnormal = (request.tests ?? []).some((t) => t.isAbnormal);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyle}</head><body>
    <div class="header">
      <h1 style="color:${theme}">${facility?.name ?? "Diagnostic Lab"}</h1>
      <p>${facility?.address ?? ""}</p>
      ${facility?.nabl ? `<p style="color:${theme};font-weight:600">NABL Accredited</p>` : ""}
      <span class="badge" style="background:#e6f0f8;color:${theme}">Lab Report</span>
    </div>
    <hr/>
    <div class="meta-grid">
      <div class="meta-item"><div class="label">Report No.</div><div class="value">${request.reqNo}</div></div>
      <div class="meta-item"><div class="label">Date</div><div class="value">${formatDate(request.createdAt)}</div></div>
      <div class="meta-item"><div class="label">Patient</div><div class="value">${patient.nameEn}</div></div>
      <div class="meta-item"><div class="label">Age / Gender</div><div class="value">${patient.age ?? "—"} / ${patient.gender ?? "—"}</div></div>
      ${request.referringDoctor ? `<div class="meta-item"><div class="label">Referred By</div><div class="value">${request.referringDoctor}</div></div>` : ""}
    </div>
    ${hasAbnormal ? `<div style="background:#fdeaea;border:1px solid #b52a2a;border-radius:6px;padding:8px 12px;margin-bottom:10px;font-size:12px;color:#b52a2a;font-weight:600;">⚠ Some values are outside normal range. Please consult your doctor.</div>` : ""}
    <hr/>
    <table>
      <thead><tr><th>Test</th><th>Result</th><th>Normal Range</th><th class="right">Price</th></tr></thead>
      <tbody>${tests}</tbody>
    </table>
    <div class="totals">
      <div class="row grand"><span>Total</span><span style="color:${theme}">${formatINR(request.bill?.grandTotal ?? 0)}</span></div>
    </div>
    <hr/>
    <div class="footer">
      <div class="tamil">மேனா, உங்கள் அறிக்கை தயார். மருத்துவரை சந்திக்கவும் 🙏</div>
      <div>Report ready. Please consult your doctor for interpretation.</div>
    </div>
  </body></html>`;
}

export function generatePharmacyReceipt({ bill, patient, facility }) {
  const theme = "#b86a10";
  const items = (bill.items ?? [])
    .map(
      (item) => `
      <tr>
        <td>
          <div>${item.name}</div>
          ${item.batchNo ? `<div style="font-size:10px;color:#8aa39d">Batch: ${item.batchNo} · Exp: ${item.expiry ?? "—"}</div>` : ""}
          ${item.scheduleType !== "OTC" ? `<div style="font-size:10px;color:#b52a2a">Sched. ${item.scheduleType}</div>` : ""}
        </td>
        <td class="right">${item.qty}</td>
        <td class="right">${item.gstSlab}%</td>
        <td class="right">${formatINR(item.lineTotal)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyle}</head><body>
    <div class="header">
      <h1 style="color:${theme}">${facility?.name ?? "Pharmacy"}</h1>
      <p>${facility?.address ?? ""}</p>
      ${facility?.drugLicence ? `<p>DL: ${facility.drugLicence}</p>` : ""}
      ${facility?.gstin ? `<p>GSTIN: ${facility.gstin}</p>` : ""}
      <span class="badge" style="background:#fdf2e6;color:${theme}">Medicine Bill</span>
    </div>
    <hr/>
    <div class="meta-grid">
      <div class="meta-item"><div class="label">Bill No.</div><div class="value">${bill.billNo}</div></div>
      <div class="meta-item"><div class="label">Date</div><div class="value">${formatDate(bill.createdAt)}</div></div>
      <div class="meta-item"><div class="label">Patient</div><div class="value">${patient.nameEn}</div></div>
      ${bill.rxDoctorReg ? `<div class="meta-item"><div class="label">Rx Doctor Reg.</div><div class="value">${bill.rxDoctorReg}</div></div>` : ""}
    </div>
    <hr/>
    <table>
      <thead><tr><th>Medicine</th><th class="right">Qty</th><th class="right">GST</th><th class="right">Amount</th></tr></thead>
      <tbody>${items}</tbody>
    </table>
    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${formatINR(bill.subtotal)}</span></div>
      <div class="row"><span>GST (multiple slabs)</span><span>${formatINR(bill.totalGst)}</span></div>
      <div class="row grand"><span>Total Paid</span><span style="color:${theme}">${formatINR(bill.grandTotal)}</span></div>
    </div>
    <div style="text-align:center;margin-top:8px;font-size:11px;color:#5a7a74;">${bill.paymentMode?.toUpperCase()}</div>
    <hr/>
    <div class="footer">
      <div class="tamil">மருந்துகளை தவறாமல் சாப்பிடுங்கள்! 💊</div>
      <div>Take your medicines regularly as prescribed.</div>
    </div>
  </body></html>`;
}

export function generateAyushReceipt({ visit, patient, facility }) {
  const theme = "#6b3a7a";
  const kashayam = (visit.kashayamRx ?? [])
    .map((k) => `<tr><td>${k.name}</td><td>${k.dosage}</td><td>${k.duration}</td></tr>`)
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyle}</head><body>
    <div class="header">
      <h1 style="color:${theme}">${facility?.name ?? "AYUSH Clinic"}</h1>
      <p>${facility?.address ?? ""}</p>
      ${facility?.ayushReg ? `<p>AYUSH Reg: ${facility.ayushReg}</p>` : ""}
      <span class="badge" style="background:#f3edf7;color:${theme}">Treatment Summary</span>
    </div>
    <hr/>
    <div class="meta-grid">
      <div class="meta-item"><div class="label">Visit No.</div><div class="value">${visit.visitNo}</div></div>
      <div class="meta-item"><div class="label">Date</div><div class="value">${formatDate(visit.createdAt)}</div></div>
      <div class="meta-item"><div class="label">Patient</div><div class="value">${patient.nameEn}</div></div>
      <div class="meta-item"><div class="label">Patient (Tamil)</div><div class="value" style="font-family:'Noto Sans Tamil',serif">${patient.nameTa ?? patient.nameEn}</div></div>
      ${visit.practitioner ? `<div class="meta-item"><div class="label">Vaidhyar</div><div class="value">${visit.practitioner}</div></div>` : ""}
      ${visit.prakruthi ? `<div class="meta-item"><div class="label">Prakruthi</div><div class="value">${visit.prakruthi}</div></div>` : ""}
    </div>
    ${visit.diagnosisTa ? `
    <hr/>
    <div><div style="font-size:10px;color:#8aa39d;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">Diagnosis (Tamil)</div>
    <div style="font-family:'Noto Sans Tamil',serif;font-size:13px;color:#111918">${visit.diagnosisTa}</div></div>` : ""}
    ${kashayam ? `
    <hr/>
    <div style="font-size:10px;color:#8aa39d;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;">Kashayam Prescription / கஷாயம்</div>
    <table>
      <thead><tr><th>Name</th><th>Dosage</th><th>Duration</th></tr></thead>
      <tbody>${kashayam}</tbody>
    </table>` : ""}
    ${visit.bill ? `
    <hr/>
    <div class="totals">
      <div class="row grand"><span>Total Paid</span><span style="color:${theme}">${formatINR(visit.bill.grandTotal)}</span></div>
    </div>` : ""}
    ${visit.nextVisit ? `<div style="text-align:center;margin-top:8px;font-size:12px;color:${theme};font-weight:600;">அடுத்த சந்திப்பு / Next Visit: ${formatDate(visit.nextVisit)}</div>` : ""}
    <hr/>
    <div class="footer">
      <div class="tamil">விரைவில் குணமடைவீர்கள்! 🌿</div>
      <div>Wishing you a speedy recovery!</div>
    </div>
  </body></html>`;
}
