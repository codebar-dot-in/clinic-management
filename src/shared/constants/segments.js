import { SEGMENT_THEME } from "./tokens.js";

/**
 * Segment registry — single config drives routing, sidebar, theming, billing.
 */
export const SEGMENTS = [
  {
    id: "clinic",
    labelEn: "Clinic & Hospital",
    labelTa: "கிளினிக் & மருத்துவமனை",
    icon: "🏥",
    theme: SEGMENT_THEME.clinic,
    descEn: "OPD billing, prescriptions, doctor view, appointments",
    descTa: "OPD பில்லிங், மருந்துச்சீட்டு, மருத்துவர் பார்வை",
    billPrefix: "OPD",
    nav: [
      { path: "dashboard",    labelEn: "Dashboard",       labelTa: "டாஷ்போர்டு",         icon: "LayoutDashboard" },
      { path: "patients",     labelEn: "Patients",         labelTa: "நோயாளிகள்",           icon: "Users" },
      { path: "doctors",      labelEn: "Doctors",          labelTa: "மருத்துவர்கள்",         icon: "Stethoscope" },
      { path: "appointments", labelEn: "Appointments",     labelTa: "சந்திப்புகள்",          icon: "CalendarDays" },
      { path: "billing",      labelEn: "OPD Billing",      labelTa: "OPD பில்லிங்",         icon: "ReceiptText" },
      { path: "consultation", labelEn: "Consultation",     labelTa: "ஆலோசனை",               icon: "ClipboardCheck" },
      { path: "history",      labelEn: "Billing History",  labelTa: "பில் வரலாறு",          icon: "History" },
    ],
  },
  {
    id: "lab",
    labelEn: "Diagnostic Lab",
    labelTa: "கண்டறியும் ஆய்வகம்",
    icon: "🔬",
    theme: SEGMENT_THEME.lab,
    descEn: "Test requests, report entry, WhatsApp report delivery",
    descTa: "சோதனை கோரிக்கை, அறிக்கை உள்ளீடு, WhatsApp வழங்கல்",
    billPrefix: "LAB",
    nav: [
      { path: "requests", labelEn: "Test Requests",   labelTa: "சோதனை கோரிக்கைகள்", icon: "ClipboardList" },
      { path: "reports",  labelEn: "Report Delivery", labelTa: "அறிக்கை வழங்கல்",    icon: "FileText" },
    ],
  },
  {
    id: "pharmacy",
    labelEn: "Pharmacy",
    labelTa: "மருந்தகம்",
    icon: "💊",
    theme: SEGMENT_THEME.pharmacy,
    descEn: "Drug billing, multi-slab GST, Schedule H logging, inventory",
    descTa: "மருந்து பில்லிங், GST, Schedule H பதிவு, சரக்கு",
    billPrefix: "PH",
    nav: [
      { path: "billing",   labelEn: "Drug Billing", labelTa: "மருந்து பில்லிங்", icon: "ReceiptText" },
      { path: "inventory", labelEn: "Inventory",    labelTa: "சரக்கு",           icon: "Package" },
    ],
  },
  {
    id: "ayush",
    labelEn: "AYUSH / Siddha",
    labelTa: "ஆயுஷ் / சித்தா",
    icon: "🌿",
    theme: SEGMENT_THEME.ayush,
    descEn: "Tamil treatment notes, kashayam prescriptions, herbal inventory",
    descTa: "தமிழ் சிகிச்சை குறிப்புகள், கஷாயம் மருந்துச்சீட்டு",
    billPrefix: "SID",
    nav: [
      { path: "treatment", labelEn: "Treatments",       labelTa: "சிகிச்சைகள்",     icon: "Leaf" },
      { path: "inventory", labelEn: "Herbal Inventory",  labelTa: "மூலிகை சரக்கு",  icon: "Archive" },
    ],
  },
];

export const getSegment = (id) => SEGMENTS.find((s) => s.id === id) ?? null;
