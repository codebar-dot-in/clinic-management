import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CalendarPlus, ReceiptText, Printer, Phone, Edit2, Trash2 } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useClinic } from "../context/ClinicContext.jsx";
import { formatINR } from "../../../shared/utils/currency.js";
import { formatDate, getAge } from "../../../shared/utils/date.js";
import { printReceipt, generateClinicReceipt } from "../../../shared/utils/receipt.js";
import { sendWhatsApp, clinicReceiptMessage } from "../../../shared/utils/whatsapp.js";

const TABS = [
  { id: "overview",     en: "Overview",      ta: "கண்ணோட்டம்" },
  { id: "appointments", en: "Appointments",   ta: "சந்திப்புகள்" },
  { id: "bills",        en: "Bills",          ta: "பில்கள்" },
];

export function PatientDetailPage() {
  const { patientId } = useParams();
  const navigate      = useNavigate();
  const { lang }      = useI18n();
  const { patients, appointments, bills, deletePatient } = useClinic();

  const handleDelete = () => {
    if (!window.confirm(lang === "en" ? `Delete patient ${patient?.nameEn}? This cannot be undone.` : `இந்த நோயாளியை நீக்கவா? இதை மீட்க முடியாது.`)) return;
    deletePatient(patientId);
    navigate("/clinic/patients");
  };

  const [tab, setTab] = useState("overview");

  const patient = patients.find((p) => p.id === patientId);
  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-400">{lang === "en" ? "Patient not found" : "நோயாளி கிடைக்கவில்லை"}</p>
        <Button variant="ghost" onClick={() => navigate("/clinic/patients")}>
          {lang === "en" ? "← Back to Patients" : "← நோயாளிகளுக்கு திரும்பு"}
        </Button>
      </div>
    );
  }

  const patientAppts = appointments.filter((a) => a.patientId === patientId);
  const patientBills = bills.filter((b) => b.patient?.id === patientId);
  const lastVisit    = patientAppts.filter((a) => a.consultStatus === "done").slice(-1)[0];
  const totalSpent   = patientBills.filter((b) => b.paymentStatus === "paid").reduce((s, b) => s + b.grandTotal, 0);

  const handlePrint = (bill) => {
    const facility = { nameEn: "Clinic", nameTa: "கிளினிக்" };
    printReceipt(generateClinicReceipt(bill, facility));
  };

  const handleWhatsApp = (bill) => {
    const msg = clinicReceiptMessage(bill, { nameEn: "Clinic" });
    sendWhatsApp(patient.phone, msg);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate("/clinic/patients")}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition mt-0.5">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          {/* Patient header card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
                  style={{ background: "var(--seg-primary)" }}>
                  {patient.nameEn.charAt(0)}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800">{patient.nameEn}</h1>
                  {patient.nameTa && <p className="text-sm font-tamil text-slate-500">{patient.nameTa}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{patient.uhid}</span>
                    {patient.abhaNumber && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-semibold">
                        ABHA: {patient.abhaNumber}
                      </span>
                    )}
                    <span className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded">
                      {patient.gender === "M" ? (lang === "en" ? "Male" : "ஆண்") : (lang === "en" ? "Female" : "பெண்")}
                      {patient.dob ? `, ${getAge(patient.dob)} yrs` : ""}
                    </span>
                    {patient.bloodGroup && (
                      <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded font-bold">{patient.bloodGroup}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <a href={`tel:${patient.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                  <Phone size={12} /> {patient.phone}
                </a>
                <Button size="sm" variant="secondary" icon={CalendarPlus} onClick={() => navigate(`/clinic/appointments/new?patientId=${patient.id}`)}>
                  {lang === "en" ? "Book Appt" : "சந்திப்பு"}
                </Button>
                <Button size="sm" onClick={() => navigate(`/clinic/consultation?patientId=${patient.id}`)}>
                  {lang === "en" ? "New Visit" : "புதிய வருகை"}
                </Button>
                <Button size="sm" variant="secondary" icon={Edit2} onClick={() => navigate(`/clinic/patients/${patient.id}/edit`)}>
                  {lang === "en" ? "Edit" : "திருத்து"}
                </Button>
                <button onClick={handleDelete}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition" title={lang === "en" ? "Delete Patient" : "நோயாளியை நீக்கு"}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition -mb-px ${
              tab === t.id ? "border-[--seg-primary] text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
            style={tab === t.id ? { borderColor: "var(--seg-primary)", color: "var(--seg-primary)" } : {}}>
            {lang === "en" ? t.en : t.ta}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">{lang === "en" ? "Personal Information" : "தனிப்பட்ட தகவல்"}</h3>
            <dl className="space-y-3">
              {[
                [lang === "en" ? "Date of Birth" : "பிறந்த தேதி",     patient.dob ? formatDate(new Date(patient.dob)) : "—"],
                [lang === "en" ? "Blood Group"   : "இரத்த வகை",       patient.bloodGroup || "—"],
                [lang === "en" ? "Phone"         : "தொலைபேசி",         patient.phone],
                [lang === "en" ? "ABHA Number"   : "ABHA எண்",         patient.abhaNumber || "—"],
                [lang === "en" ? "Registered On" : "பதிவு செய்த தேதி", formatDate(new Date(patient.createdAt))],
                [lang === "en" ? "Last Visit"    : "கடைசி வருகை",      lastVisit ? formatDate(new Date(lastVisit.date ?? lastVisit.createdAt ?? TODAY)) : "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="font-semibold text-slate-700 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Medical */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3">{lang === "en" ? "Drug Allergies" : "மருந்து ஒவ்வாமை"}</h3>
              {patient.drugAllergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {patient.drugAllergies.map((a) => <Badge key={a} label={a} color="error" />)}
                </div>
              ) : (
                <p className="text-sm text-slate-400">{lang === "en" ? "No known allergies" : "ஒவ்வாமை இல்லை"}</p>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3">{lang === "en" ? "Chronic Conditions" : "நாட்பட்ட நோய்கள்"}</h3>
              {patient.chronicConditions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {patient.chronicConditions.map((c) => <Badge key={c} label={c} color="warning" />)}
                </div>
              ) : (
                <p className="text-sm text-slate-400">{lang === "en" ? "None recorded" : "நோய்கள் பதிவு இல்லை"}</p>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">{lang === "en" ? "Total Spent" : "மொத்த செலவு"}</p>
                <p className="text-2xl font-black" style={{ color: "var(--seg-primary)" }}>{formatINR(totalSpent)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">{lang === "en" ? "Visits" : "வருகைகள்"}</p>
                <p className="text-2xl font-black text-slate-700">{patientAppts.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Appointments */}
      {tab === "appointments" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">{lang === "en" ? "Appointment History" : "சந்திப்பு வரலாறு"}</h3>
            <Button size="sm" icon={CalendarPlus} onClick={() => navigate("/clinic/appointments")}>
              {lang === "en" ? "New" : "புதிய"}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  {["Token", lang === "en" ? "Doctor" : "மருத்துவர்", lang === "en" ? "Complaint" : "புகார்", lang === "en" ? "Status" : "நிலை", lang === "en" ? "Notes" : "குறிப்புகள்"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patientAppts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-xs" style={{ color: "var(--seg-primary)" }}>{a.token}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{a.doctor || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{a.complaint || "—"}</td>
                    <td className="px-4 py-3"><Badge label={a.consultStatus} color={a.consultStatus} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{a.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {patientAppts.length === 0 && <EmptyState icon="📅" title={lang === "en" ? "No appointments" : "சந்திப்புகள் இல்லை"} />}
          </div>
        </div>
      )}

      {/* Tab: Bills */}
      {tab === "bills" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">{lang === "en" ? "Billing History" : "பில் வரலாறு"}</h3>
            <Link to="/clinic/billing" className="text-xs font-semibold hover:underline" style={{ color: "var(--seg-primary)" }}>
              {lang === "en" ? "New Bill →" : "புதிய பில் →"}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  {[lang === "en" ? "Bill No" : "பில் எண்", lang === "en" ? "Doctor" : "மருத்துவர்",
                    lang === "en" ? "Items" : "பொருட்கள்", lang === "en" ? "Amount" : "தொகை",
                    lang === "en" ? "Mode" : "முறை", lang === "en" ? "Status" : "நிலை",
                    lang === "en" ? "Actions" : "செயல்கள்"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patientBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{bill.billNo}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{bill.doctor || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{bill.items?.length ?? 0} items</td>
                    <td className="px-4 py-3 font-bold text-sm" style={{ color: "var(--seg-primary)" }}>{formatINR(bill.grandTotal)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 capitalize">{bill.paymentMode}</td>
                    <td className="px-4 py-3"><Badge label={bill.paymentStatus} color={bill.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handlePrint(bill)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500" title="Print"><Printer size={13} /></button>
                        <button onClick={() => handleWhatsApp(bill)} className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600" title="WhatsApp">
                          <span className="text-xs font-bold">WA</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {patientBills.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <td colSpan={3} className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase">Total</td>
                    <td className="px-4 py-2.5 font-black text-sm" style={{ color: "var(--seg-primary)" }}>{formatINR(totalSpent)}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              )}
            </table>
            {patientBills.length === 0 && <EmptyState icon="🧾" title={lang === "en" ? "No bills" : "பில்கள் இல்லை"} />}
          </div>
        </div>
      )}
    </div>
  );
}
