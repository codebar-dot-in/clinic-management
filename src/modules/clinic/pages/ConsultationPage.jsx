/**
 * ConsultationPage — full visit/consultation recording.
 * Route: /clinic/consultation               (new)
 *        /clinic/consultation/:visitId      (view / edit existing)
 *
 * Pre-fill via URL search params:
 *   ?patientId=p1&appointmentId=a1&doctorId=d1
 */
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Printer, MessageCircle, Activity, ClipboardList, Pill, Wrench, CreditCard } from "lucide-react";
import { Input, Select, Textarea, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useClinic, RX_FREQUENCY, RX_ROUTES, RX_DURATION } from "../context/ClinicContext.jsx";
import { formatINR } from "../../../shared/utils/currency.js";
import { formatDate, getAge } from "../../../shared/utils/date.js";
import { printReceipt } from "../../../shared/utils/receipt.js";
import { sendWhatsApp } from "../../../shared/utils/whatsapp.js";

// ─── Prescription receipt HTML generator ────────────────────────────────────
function generatePrescriptionHTML(visit, patient, doctor, facility, lang) {
  const rxRows = (visit.prescription ?? []).map((rx, i) => `
    <tr>
      <td style="padding:6px 0; border-bottom:1px solid #eee; font-weight:600">${i + 1}. ${rx.name}</td>
      <td style="padding:6px 4px; border-bottom:1px solid #eee; text-align:center">${rx.dosage}</td>
      <td style="padding:6px 4px; border-bottom:1px solid #eee; text-align:center">${rx.frequency}</td>
      <td style="padding:6px 4px; border-bottom:1px solid #eee; text-align:center">${rx.duration}</td>
      <td style="padding:6px 4px; border-bottom:1px solid #eee; color:#555">${rx.instructions}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+Tamil:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Inter','Noto Sans Tamil',sans-serif; font-size:12px; color:#111; background:#fff; padding:24px; max-width:680px; margin:0 auto; }
    .header { border-bottom:2px solid #0d7a6e; padding-bottom:12px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:flex-start; }
    .clinic-name { font-size:18px; font-weight:700; color:#0d7a6e; }
    .doc-info { text-align:right; font-size:11px; color:#555; }
    .doc-name { font-size:14px; font-weight:700; color:#111; }
    .patient-box { background:#f4f7f6; border-radius:8px; padding:12px 16px; margin-bottom:16px; display:flex; gap:24px; flex-wrap:wrap; }
    .patient-box p { font-size:11px; color:#555; margin-top:2px; }
    .patient-box strong { font-size:12px; font-weight:600; color:#111; }
    .diagnosis-box { border:1.5px solid #0d7a6e; border-radius:6px; padding:10px 14px; margin-bottom:16px; }
    .diagnosis-box .label { font-size:10px; font-weight:700; color:#0d7a6e; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
    .rx-symbol { font-size:28px; color:#0d7a6e; font-family:serif; margin-bottom:8px; }
    table { width:100%; border-collapse:collapse; }
    th { text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:.5px; color:#888; padding:6px 4px; border-bottom:2px solid #0d7a6e; }
    .footer { margin-top:24px; display:flex; justify-content:space-between; font-size:11px; color:#555; border-top:1px solid #eee; padding-top:12px; }
    .sig-box { border-top:1px solid #111; margin-top:32px; padding-top:6px; text-align:center; font-size:11px; font-weight:600; width:160px; }
    @media print { body { padding:16px; } }
  </style></head><body>
  <div class="header">
    <div>
      <div class="clinic-name">${facility?.nameEn ?? "Clinic"}</div>
      <div style="font-size:11px; color:#555; margin-top:2px;">${lang === "ta" ? "மருத்துவமனை" : "Healthcare"} · Tamil Nadu</div>
    </div>
    <div class="doc-info">
      <div class="doc-name">${doctor?.nameEn ?? visit.doctor}</div>
      <div>${doctor?.qualification ?? ""}</div>
      <div>${doctor?.specialization ?? ""}</div>
      <div>TNMC: ${doctor?.tnmcRegNo ?? "—"}</div>
    </div>
  </div>

  <div class="patient-box">
    <div><p>Patient</p><strong>${patient?.nameEn ?? ""}</strong>${patient?.nameTa ? `<br><span style="font-family:'Noto Sans Tamil',sans-serif;font-size:11px;color:#888">${patient.nameTa}</span>` : ""}</div>
    <div><p>UHID</p><strong>${patient?.uhid ?? "—"}</strong></div>
    <div><p>Age / Gender</p><strong>${patient?.dob ? getAge(patient.dob) + " yrs" : "—"} / ${patient?.gender === "M" ? "Male" : "Female"}</strong></div>
    <div><p>Date</p><strong>${formatDate(new Date(visit.date ?? visit.createdAt))}</strong></div>
    <div><p>Visit Type</p><strong style="text-transform:capitalize">${visit.visitType ?? "—"}</strong></div>
    ${visit.visitNo ? `<div><p>Visit No</p><strong>${visit.visitNo}</strong></div>` : ""}
  </div>

  ${visit.diagnosisEn ? `<div class="diagnosis-box"><div class="label">Diagnosis</div><div style="font-size:13px;font-weight:600">${visit.diagnosisEn}</div></div>` : ""}

  <div class="rx-symbol">℞</div>
  <table>
    <thead><tr><th>Medicine</th><th>Dose</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
    <tbody>${rxRows}</tbody>
  </table>

  ${visit.notes ? `<div style="margin-top:16px;padding:10px;background:#f4f7f6;border-radius:6px;font-size:11px;"><strong>Advice:</strong> ${visit.notes}</div>` : ""}

  <div class="footer">
    <div>
      ${visit.nextVisit ? `<strong>Next Visit:</strong> ${formatDate(new Date(visit.nextVisit))}` : ""}
      ${visit.sickLeave?.enabled ? `<br><strong>Sick Leave:</strong> ${visit.sickLeave.from} to ${visit.sickLeave.to}` : ""}
    </div>
    <div class="sig-box">
      ${doctor?.nameEn ?? visit.doctor}<br>
      <span style="font-weight:400;color:#888">${doctor?.qualification ?? ""}</span>
    </div>
  </div>
</body></html>`;
}

const BLANK_RX = { name: "", dosage: "", frequency: "BD", duration: "5 Days", route: "Oral", instructions: "After food" };
const BLANK_PROC = { name: "", price: "" };

const PAYMENT_MODES = ["cash", "upi", "card", "insurance", "free"];

export function ConsultationPage() {
  const { visitId }       = useParams();
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const { lang }          = useI18n();
  const { success, error } = useToast();
  const { patients, appointments, doctors, visits, bills, addVisit, updateVisit, createBill } = useClinic();

  const isView   = !!visitId;
  const existing = isView ? visits.find((v) => v.id === visitId) : null;

  // Pre-fill from URL params or existing visit
  const prePatientId = searchParams.get("patientId")     ?? existing?.patientId ?? "";
  const preApptId    = searchParams.get("appointmentId") ?? existing?.appointmentId ?? "";
  const preDoctorId  = searchParams.get("doctorId")      ?? existing?.doctorId ?? "";

  const [patientSearch, setPS] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor,  setSelectedDoctor]  = useState(null);
  const [activeSection,   setActiveSection]   = useState("vitals");

  // Form state
  const [visitType,  setVisitType]  = useState(existing?.visitType  ?? "new");
  const [date,       setDate]       = useState(existing?.date?.split("T")[0] ?? new Date().toISOString().split("T")[0]);
  const [apptId,     setApptId]     = useState(preApptId);
  const [vitals,     setVitals]     = useState(existing?.vitals     ?? { bp: "", pulse: "", temp: "", weight: "", height: "", spo2: "", rbs: "", rr: "" });
  const [complaint,  setComplaint]  = useState(existing?.chiefComplaint ?? "");
  const [hopi,       setHopi]       = useState(existing?.hopi       ?? "");
  const [examination,setExam]       = useState(existing?.examination ?? "");
  const [diagnosis,  setDiagnosis]  = useState(existing?.diagnosisEn ?? "");
  const [prescription, setPrescription] = useState(existing?.prescription ?? []);
  const [procedures,   setProcedures]   = useState(existing?.procedures   ?? []);
  const [nextVisit,    setNextVisit]    = useState(existing?.nextVisit ?? "");
  const [sickLeave,    setSickLeave]    = useState(existing?.sickLeave ?? { enabled: false, from: "", to: "" });
  const [notes,        setNotes]        = useState(existing?.notes ?? "");
  const [payMode,      setPayMode]      = useState("cash");
  const [saving,       setSaving]       = useState(false);

  // Init patient + doctor from pre-fill
  useEffect(() => {
    if (prePatientId) setSelectedPatient(patients.find((p) => p.id === prePatientId) ?? null);
    if (preDoctorId)  setSelectedDoctor(doctors.find((d) => d.id === preDoctorId) ?? null);
    if (preApptId) {
      const appt = appointments.find((a) => a.id === preApptId);
      if (appt) {
        setSelectedPatient(patients.find((p) => p.id === appt.patientId) ?? null);
        setSelectedDoctor(doctors.find((d) => d.id === appt.doctorId) ?? null);
        if (!complaint) setComplaint(appt.complaint ?? "");
      }
    }
  }, []);

  const filteredPts = patientSearch
    ? patients.filter((p) => p.nameEn.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone.includes(patientSearch) || p.uhid.toLowerCase().includes(patientSearch.toLowerCase()))
    : [];

  const setV = (f) => (e) => setVitals((v) => ({ ...v, [f]: e.target.value }));

  // Prescription row helpers
  const addRx   = () => setPrescription((r) => [...r, { ...BLANK_RX, id: crypto.randomUUID() }]);
  const removeRx = (i) => setPrescription((r) => r.filter((_, idx) => idx !== i));
  const setRx   = (i, f, val) => setPrescription((rows) => rows.map((r, idx) => idx === i ? { ...r, [f]: val } : r));

  // Procedure row helpers
  const addProc    = () => setProcedures((p) => [...p, { ...BLANK_PROC, id: crypto.randomUUID() }]);
  const removeProc = (i) => setProcedures((p) => p.filter((_, idx) => idx !== i));
  const setProc    = (i, f, val) => setProcedures((rows) => rows.map((r, idx) => idx === i ? { ...r, [f]: val } : r));

  // Billing calculation
  const consultFee  = selectedDoctor?.consultationFee ?? 0;
  const procsTotal  = procedures.reduce((s, p) => s + (Number(p.price) || 0), 0);
  const grandTotal  = consultFee + procsTotal;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedPatient) { error(lang === "en" ? "Select a patient" : "நோயாளியை தேர்வு செய்யவும்"); return; }
    if (!selectedDoctor)  { error(lang === "en" ? "Select a doctor"  : "மருத்துவரை தேர்வு செய்யவும்"); return; }
    setSaving(true);
    try {
      const visitData = {
        patientId: selectedPatient.id, appointmentId: apptId || null,
        doctorId: selectedDoctor.id, doctor: selectedDoctor.nameEn,
        visitType, date, vitals, chiefComplaint: complaint, hopi, examination,
        diagnosisEn: diagnosis, prescription, procedures, nextVisit, sickLeave, notes,
      };
      const saved = isView ? (updateVisit(visitId, visitData), existing) : addVisit(visitData);

      // Auto-create bill
      if (grandTotal > 0 && !isView) {
        const billItems = [
          { name: "Consultation Fee", qty: 1, unitPrice: consultFee, gstSlab: 0 },
          ...procedures.filter((p) => p.name && Number(p.price) > 0).map((p) => ({ name: p.name, qty: 1, unitPrice: Number(p.price), gstSlab: 0 })),
        ];
        createBill({ patient: selectedPatient, doctorId: selectedDoctor.id, doctor: selectedDoctor.nameEn, visitId: saved?.id, items: billItems, paymentMode: payMode, nextVisit }, bills.length + 1);
      }

      success(lang === "en" ? "Consultation saved" : "ஆலோசனை சேமிக்கப்பட்டது");
      navigate(`/clinic/patients/${selectedPatient.id}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    if (!selectedPatient) return;
    const visitData = { prescription, diagnosisEn: diagnosis, nextVisit, sickLeave, notes, visitType, visitNo: existing?.visitNo ?? "—", date, chiefComplaint: complaint };
    printReceipt(generatePrescriptionHTML(visitData, selectedPatient, selectedDoctor, { nameEn: "Clinic" }, lang));
  };

  const handleWhatsApp = () => {
    if (!selectedPatient?.phone) return;
    const msg = `*Prescription*\nPatient: ${selectedPatient.nameEn}\nDoctor: ${selectedDoctor?.nameEn ?? ""}\nDate: ${formatDate(new Date(date))}\n\n*Medicines:*\n${prescription.map((r, i) => `${i+1}. ${r.name} — ${r.frequency} × ${r.duration} (${r.instructions})`).join("\n")}\n\n*Diagnosis:* ${diagnosis}\n${nextVisit ? `*Next Visit:* ${formatDate(new Date(nextVisit))}` : ""}`;
    sendWhatsApp(selectedPatient.phone, msg);
  };

  const SECTIONS_NAV = [
    { id: "vitals",      icon: Activity,      en: "Vitals",         ta: "உடல் அளவீடுகள்" },
    { id: "clinical",    icon: ClipboardList,  en: "Clinical Notes", ta: "மருத்துவ குறிப்புகள்" },
    { id: "prescription",icon: Pill,           en: "Prescription",   ta: "மருந்துச்சீட்டு" },
    { id: "procedures",  icon: Wrench,         en: "Procedures",     ta: "சிகிச்சை முறைகள்" },
    { id: "billing",     icon: CreditCard,     en: "Billing",        ta: "பில்லிங்" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-slate-800">
            {isView ? (lang === "en" ? "View Consultation" : "ஆலோசனை பார்வை") : (lang === "en" ? "New Consultation" : "புதிய ஆலோசனை")}
          </h1>
          {existing && <p className="text-xs text-slate-400 font-mono mt-0.5">{existing.visitNo}</p>}
        </div>
        <div className="flex gap-2">
          {(isView || selectedPatient) && (
            <>
              <Button size="sm" variant="ghost" icon={Printer} onClick={handlePrint}>
                {lang === "en" ? "Print Rx" : "அச்சிடு"}
              </Button>
              <Button size="sm" variant="secondary" icon={MessageCircle} onClick={handleWhatsApp}>
                WhatsApp
              </Button>
            </>
          )}
          <Button size="sm" type="submit" form="consultation-form" icon={Save} loading={saving}>
            {isView ? (lang === "en" ? "Update" : "புதுப்பி") : (lang === "en" ? "Save" : "சேமி")}
          </Button>
        </div>
      </div>

      <form id="consultation-form" onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Top strip — Patient + Doctor + Meta */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Patient selector */}
            <div className="lg:col-span-2 relative">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                {lang === "en" ? "Patient *" : "நோயாளி *"}
              </label>
              {selectedPatient ? (
                <div className="flex items-center gap-3 border border-emerald-200 rounded-lg px-3 py-2 bg-emerald-50">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: "var(--seg-primary)" }}>
                    {selectedPatient.nameEn.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{selectedPatient.nameEn}</p>
                    <p className="text-xs text-slate-500">{selectedPatient.uhid} · {selectedPatient.phone}</p>
                  </div>
                  {!isView && <button type="button" onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-red-400 text-xs">✕</button>}
                </div>
              ) : (
                <div>
                  <input value={patientSearch} onChange={(e) => setPS(e.target.value)}
                    placeholder={lang === "en" ? "Search by name, phone, UHID…" : "பெயர், தொலைபேசி, UHID தேட…"}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]" />
                  {filteredPts.length > 0 && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredPts.slice(0, 8).map((pt) => (
                        <button key={pt.id} type="button" onClick={() => { setSelectedPatient(pt); setPS(""); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0">
                          <span className="font-semibold">{pt.nameEn}</span>
                          <span className="text-slate-400 text-xs ml-2">{pt.uhid} · {pt.phone}</span>
                          {pt.chronicConditions?.length > 0 && (
                            <span className="ml-2 text-xs text-amber-500">{pt.chronicConditions.slice(0,2).join(", ")}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Drug allergy alert */}
              {selectedPatient?.drugAllergies?.length > 0 && (
                <div className="mt-1 text-xs text-red-600 font-semibold bg-red-50 rounded px-2 py-1">
                  ⚠ Allergy: {selectedPatient.drugAllergies.join(", ")}
                </div>
              )}
            </div>

            {/* Doctor selector */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                {lang === "en" ? "Doctor *" : "மருத்துவர் *"}
              </label>
              <select value={selectedDoctor?.id ?? ""}
                onChange={(e) => setSelectedDoctor(doctors.find((d) => d.id === e.target.value) ?? null)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]">
                <option value="">— {lang === "en" ? "Select" : "தேர்வு"} —</option>
                {doctors.filter((d) => d.status === "active").map((d) => (
                  <option key={d.id} value={d.id}>{d.nameEn}</option>
                ))}
              </select>
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-2">
              <Select label={lang === "en" ? "Visit Type" : "வருகை வகை"} value={visitType} onChange={(e) => setVisitType(e.target.value)}>
                <option value="new">{lang === "en" ? "New Visit" : "புதிய வருகை"}</option>
                <option value="followup">{lang === "en" ? "Follow-up" : "மேல்நடவடிக்கை"}</option>
              </Select>
              <Input label={lang === "en" ? "Date" : "தேதி"} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* Patient info strip (if selected) */}
          {selectedPatient && (
            <div className="mt-4 flex flex-wrap gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>DOB: <strong>{selectedPatient.dob ? formatDate(new Date(selectedPatient.dob)) : "—"}</strong></span>
              <span>Age: <strong>{selectedPatient.dob ? getAge(selectedPatient.dob) + " yrs" : "—"}</strong></span>
              <span>Blood: <strong className="text-red-600">{selectedPatient.bloodGroup || "—"}</strong></span>
              <span>Conditions: <strong>{selectedPatient.chronicConditions?.join(", ") || "None"}</strong></span>
              {selectedPatient.abhaNumber && <span>ABHA: <strong>{selectedPatient.abhaNumber}</strong></span>}
            </div>
          )}
        </div>

        {/* Section nav */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-0">
          {SECTIONS_NAV.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition shrink-0 -mb-px ${
                  activeSection === s.id ? "border-[--seg-primary]" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
                style={activeSection === s.id ? { borderColor: "var(--seg-primary)", color: "var(--seg-primary)" } : {}}>
                <Icon size={14} />
                {lang === "en" ? s.en : s.ta}
              </button>
            );
          })}
        </div>

        {/* ── VITALS ── */}
        {activeSection === "vitals" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Activity size={15} style={{ color: "var(--seg-primary)" }} />
              {lang === "en" ? "Vital Signs" : "உடல் அளவீடுகள்"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: "bp",     label: "BP (mmHg)",            placeholder: "120/80" },
                { key: "pulse",  label: "Pulse (bpm)",           placeholder: "72" },
                { key: "temp",   label: "Temp (°F)",             placeholder: "98.6" },
                { key: "spo2",   label: "SpO₂ (%)",              placeholder: "98" },
                { key: "weight", label: lang === "en" ? "Weight (kg)" : "எடை (kg)", placeholder: "65" },
                { key: "height", label: lang === "en" ? "Height (cm)" : "உயரம் (cm)", placeholder: "165" },
                { key: "rbs",    label: "RBS (mg/dL)",           placeholder: "110" },
                { key: "rr",     label: "RR (/min)",             placeholder: "16" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">{label}</label>
                  <input value={vitals[key]} onChange={setV(key)} placeholder={placeholder}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary] text-center font-semibold" />
                </div>
              ))}
            </div>
            {/* BMI auto-calc */}
            {vitals.weight && vitals.height && (
              <div className="mt-4 text-sm text-slate-500 bg-slate-50 rounded-lg px-4 py-2">
                BMI: <strong className="text-slate-800">
                  {(Number(vitals.weight) / Math.pow(Number(vitals.height) / 100, 2)).toFixed(1)}
                </strong>
                {(() => {
                  const bmi = Number(vitals.weight) / Math.pow(Number(vitals.height) / 100, 2);
                  if (bmi < 18.5) return <span className="ml-2 text-blue-500">— Underweight</span>;
                  if (bmi < 25)   return <span className="ml-2 text-emerald-500">— Normal</span>;
                  if (bmi < 30)   return <span className="ml-2 text-amber-500">— Overweight</span>;
                  return <span className="ml-2 text-red-500">— Obese</span>;
                })()}
              </div>
            )}
          </div>
        )}

        {/* ── CLINICAL NOTES ── */}
        {activeSection === "clinical" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-5">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <ClipboardList size={15} style={{ color: "var(--seg-primary)" }} />
              {lang === "en" ? "Clinical Notes" : "மருத்துவ குறிப்புகள்"}
            </h3>
            <Textarea
              label={lang === "en" ? "Chief Complaint *" : "முக்கிய புகார் *"}
              value={complaint} onChange={(e) => setComplaint(e.target.value)} rows={3}
              placeholder={lang === "en" ? "e.g. Fever and headache for 3 days" : "உ.ம்: 3 நாட்களாக காய்ச்சல் மற்றும் தலைவலி"}
            />
            <Textarea
              label={lang === "en" ? "History of Present Illness (HOPI)" : "நோய் வரலாறு (HOPI)"}
              value={hopi} onChange={(e) => setHopi(e.target.value)} rows={4}
              placeholder={lang === "en" ? "Onset, duration, severity, associated symptoms…" : "தொடக்கம், காலம், தீவிரம், தொடர்பான அறிகுறிகள்…"}
            />
            <Textarea
              label={lang === "en" ? "Clinical Examination Findings" : "மருத்துவ பரிசோதனை"}
              value={examination} onChange={(e) => setExam(e.target.value)} rows={4}
              placeholder={lang === "en" ? "General condition, systemic examination…" : "பொது நிலை, உறுப்பு பரிசோதனை…"}
            />
            <Input
              label={lang === "en" ? "Diagnosis / Provisional Diagnosis" : "நோய் கண்டறிதல்"}
              value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
              placeholder={lang === "en" ? "e.g. Viral Fever, Type 2 Diabetes — uncontrolled" : "உ.ம்: வைரல் காய்ச்சல்"}
            />
            <Textarea
              label={lang === "en" ? "Advice / Special Instructions" : "அறிவுரை / சிறப்பு அறிவுறுத்தல்கள்"}
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder={lang === "en" ? "Diet advice, activity restrictions, special instructions…" : "உணவு அறிவுரை, செயல்பாடு கட்டுப்பாடுகள்…"}
            />
          </div>
        )}

        {/* ── PRESCRIPTION ── */}
        {activeSection === "prescription" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Pill size={15} style={{ color: "var(--seg-primary)" }} />
                {lang === "en" ? "Prescription" : "மருந்துச்சீட்டு (℞)"}
              </h3>
              <Button size="sm" variant="secondary" icon={Plus} type="button" onClick={addRx}>
                {lang === "en" ? "Add Medicine" : "மருந்து சேர்"}
              </Button>
            </div>

            {prescription.length === 0 && (
              <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <Pill size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{lang === "en" ? "No medicines added yet" : "மருந்துகள் சேர்க்கப்படவில்லை"}</p>
              </div>
            )}

            {prescription.map((rx, i) => (
              <div key={rx.id ?? i} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: "var(--seg-primary)" }}>
                    {lang === "en" ? "Medicine" : "மருந்து"} #{i + 1}
                  </span>
                  <button type="button" onClick={() => removeRx(i)} className="text-red-400 hover:text-red-600 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
                <FormRow>
                  <div className="sm:col-span-2">
                    <Input label={lang === "en" ? "Medicine Name *" : "மருந்து பெயர் *"}
                      value={rx.name} onChange={(e) => setRx(i, "name", e.target.value)}
                      placeholder="e.g. Paracetamol 500mg, Amoxicillin 250mg" required />
                  </div>
                </FormRow>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <Input label={lang === "en" ? "Dosage" : "அளவு"}
                    value={rx.dosage} onChange={(e) => setRx(i, "dosage", e.target.value)} placeholder="500mg" />
                  <Select label={lang === "en" ? "Frequency" : "அலைவரிசை"} value={rx.frequency} onChange={(e) => setRx(i, "frequency", e.target.value)}>
                    {RX_FREQUENCY.map((f) => <option key={f} value={f}>{f}</option>)}
                  </Select>
                  <Select label={lang === "en" ? "Duration" : "காலம்"} value={rx.duration} onChange={(e) => setRx(i, "duration", e.target.value)}>
                    {RX_DURATION.map((d) => <option key={d} value={d}>{d}</option>)}
                  </Select>
                  <Select label={lang === "en" ? "Route" : "வழி"} value={rx.route} onChange={(e) => setRx(i, "route", e.target.value)}>
                    {RX_ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </Select>
                  <Input label={lang === "en" ? "Instructions" : "அறிவுரைகள்"}
                    value={rx.instructions} onChange={(e) => setRx(i, "instructions", e.target.value)} placeholder="After food" />
                </div>
              </div>
            ))}

            {prescription.length > 0 && (
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="ghost" icon={Printer} onClick={handlePrint}>
                  {lang === "en" ? "Print Prescription" : "மருந்துச்சீட்டு அச்சிடு"}
                </Button>
                <Button type="button" size="sm" variant="ghost" icon={MessageCircle} onClick={handleWhatsApp}>
                  WhatsApp
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── PROCEDURES ── */}
        {activeSection === "procedures" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Wrench size={15} style={{ color: "var(--seg-primary)" }} />
                {lang === "en" ? "Procedures / Investigations" : "சிகிச்சை முறைகள் / பரிசோதனைகள்"}
              </h3>
              <Button size="sm" variant="secondary" icon={Plus} type="button" onClick={addProc}>
                {lang === "en" ? "Add" : "சேர்"}
              </Button>
            </div>
            {procedures.length === 0 && (
              <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl text-sm">
                {lang === "en" ? "No procedures added" : "சிகிச்சை முறைகள் இல்லை"}
              </div>
            )}
            {procedures.map((proc, i) => (
              <div key={proc.id ?? i} className="flex items-end gap-3 border border-slate-200 rounded-xl p-3">
                <div className="flex-1">
                  <Input label={lang === "en" ? `Procedure ${i + 1}` : `சிகிச்சை ${i + 1}`}
                    value={proc.name} onChange={(e) => setProc(i, "name", e.target.value)}
                    placeholder="e.g. ECG, X-Ray Chest, Dressing" />
                </div>
                <div className="w-32 shrink-0">
                  <Input label={lang === "en" ? "Price (₹)" : "கட்டணம் (₹)"} type="number"
                    value={proc.price} onChange={(e) => setProc(i, "price", e.target.value)} min="0" />
                </div>
                <button type="button" onClick={() => removeProc(i)} className="pb-2 text-red-400 hover:text-red-600 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── BILLING & SAVE ── */}
        {activeSection === "billing" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-5">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CreditCard size={15} style={{ color: "var(--seg-primary)" }} />
              {lang === "en" ? "Billing & Payment" : "பில்லிங் & கட்டணம்"}
            </h3>

            {/* Bill items */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
                    <th className="text-left px-4 py-2.5">{lang === "en" ? "Item" : "பொருள்"}</th>
                    <th className="text-right px-4 py-2.5">{lang === "en" ? "Amount" : "தொகை"}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50">
                    <td className="px-4 py-2.5 text-slate-700">{lang === "en" ? "Consultation Fee" : "ஆலோசனை கட்டணம்"} — {selectedDoctor?.nameEn ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{formatINR(consultFee)}</td>
                  </tr>
                  {procedures.filter((p) => p.name && Number(p.price) > 0).map((p, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="px-4 py-2.5 text-slate-700">{p.name}</td>
                      <td className="px-4 py-2.5 text-right font-semibold">{formatINR(Number(p.price))}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <td className="px-4 py-2.5 font-bold text-slate-800">{lang === "en" ? "Grand Total" : "மொத்தம்"}</td>
                    <td className="px-4 py-2.5 text-right font-black text-lg" style={{ color: "var(--seg-primary)" }}>{formatINR(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Select label={lang === "en" ? "Payment Mode" : "கட்டண முறை"} value={payMode} onChange={(e) => setPayMode(e.target.value)}>
              {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
            </Select>

            {/* Next visit + sick leave */}
            <FormRow>
              <Input label={lang === "en" ? "Next Visit Date" : "அடுத்த வருகை தேதி"} type="date" value={nextVisit} onChange={(e) => setNextVisit(e.target.value)} />
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                  <input type="checkbox" checked={sickLeave.enabled}
                    onChange={(e) => setSickLeave((s) => ({ ...s, enabled: e.target.checked }))} />
                  {lang === "en" ? "Issue Sick Leave" : "நோய் விடுப்பு வழங்கு"}
                </label>
                {sickLeave.enabled && (
                  <div className="flex gap-2">
                    <Input type="date" label="From" value={sickLeave.from} onChange={(e) => setSickLeave((s) => ({ ...s, from: e.target.value }))} />
                    <Input type="date" label="To"   value={sickLeave.to}   onChange={(e) => setSickLeave((s) => ({ ...s, to: e.target.value }))} />
                  </div>
                )}
              </div>
            </FormRow>
          </div>
        )}

        {/* Save bar — sticky */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center justify-between sticky bottom-4 z-10">
          <div className="text-xs text-slate-400">
            {selectedPatient ? <span className="text-emerald-600 font-semibold">✓ {selectedPatient.nameEn}</span> : <span>{lang === "en" ? "No patient selected" : "நோயாளி தேர்வு இல்லை"}</span>}
            {selectedDoctor && <span className="ml-3 text-slate-500">· {selectedDoctor.nameEn}</span>}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
              {lang === "en" ? "Cancel" : "ரத்து"}
            </button>
            <Button type="submit" icon={Save} loading={saving}>
              {isView ? (lang === "en" ? "Update" : "புதுப்பி") : (lang === "en" ? "Save Consultation" : "ஆலோசனை சேமி")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
