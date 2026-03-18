/**
 * DoctorMasterPage — full doctor profile, edit, and statistics.
 * Route: /clinic/doctors/:doctorId
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Save, Clock, ToggleRight, ToggleLeft, Plus, Trash2 } from "lucide-react";
import { Input, Select, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useClinic, SPECIALIZATIONS } from "../context/ClinicContext.jsx";
import { formatINR } from "../../../shared/utils/currency.js";
import { formatDate } from "../../../shared/utils/date.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BLANK_TIMING = { slot: "", days: [] };

function buildFormFromDoctor(doc) {
  return {
    nameEn:          doc.nameEn          ?? "",
    nameTa:          doc.nameTa          ?? "",
    tnmcRegNo:       doc.tnmcRegNo       ?? "",
    qualification:   doc.qualification   ?? "",
    specialization:  doc.specialization  ?? SPECIALIZATIONS[0],
    consultationFee: String(doc.consultationFee ?? ""),
    experience:      doc.experience      ?? "",
    phone:           doc.phone           ?? "",
    email:           doc.email           ?? "",
    status:          doc.status          ?? "active",
  };
}

export function DoctorMasterPage() {
  const { doctorId } = useParams();
  const navigate     = useNavigate();
  const { lang }     = useI18n();
  const { success, error } = useToast();
  const { doctors, appointments, visits, bills, patients, updateDoctor, deleteDoctor } = useClinic();

  const doctor = doctors.find((d) => d.id === doctorId);

  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState(doctor ? buildFormFromDoctor(doctor) : {});
  const [timings, setTimings] = useState(doctor?.timings ? doctor.timings.map((t) => ({ ...t, days: [...t.days] })) : []);
  const [tab,     setTab]     = useState("overview");

  useEffect(() => {
    if (doctor) { setForm(buildFormFromDoctor(doctor)); setTimings(doctor.timings?.map((t) => ({ ...t, days: [...t.days] })) ?? []); }
  }, [doctorId]);

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-400">{lang === "en" ? "Doctor not found" : "மருத்துவர் கிடைக்கவில்லை"}</p>
        <Button variant="ghost" onClick={() => navigate("/clinic/doctors")}>← {lang === "en" ? "Back" : "திரும்பு"}</Button>
      </div>
    );
  }

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const addTimingRow    = () => setTimings((t) => [...t, { ...BLANK_TIMING }]);
  const removeTimingRow = (i) => setTimings((t) => t.filter((_, idx) => idx !== i));
  const toggleDay       = (rowIdx, day) => setTimings((rows) => rows.map((row, i) => {
    if (i !== rowIdx) return row;
    const days = row.days.includes(day) ? row.days.filter((d) => d !== day) : [...row.days, day];
    return { ...row, days };
  }));
  const setSlot = (rowIdx, val) => setTimings((rows) => rows.map((row, i) => i === rowIdx ? { ...row, slot: val } : row));

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.nameEn || !form.tnmcRegNo) { error(lang === "en" ? "Name and TNMC no. required" : "பெயர் மற்றும் TNMC எண் தேவை"); return; }
    updateDoctor(doctorId, { ...form, consultationFee: Number(form.consultationFee), timings });
    success(lang === "en" ? "Doctor updated" : "மருத்துவர் புதுப்பிக்கப்பட்டார்");
    setEditing(false);
  };

  const handleDelete = () => {
    if (!window.confirm(lang === "en" ? `Delete Dr. ${doctor.nameEn}? This cannot be undone.` : `மருத்துவர் ${doctor.nameEn} நீக்கவா? இதை மீட்க முடியாது.`)) return;
    deleteDoctor(doctorId);
    navigate("/clinic/doctors");
  };

  const toggleStatus = () => {
    const next = doctor.status === "active" ? "on-leave" : "active";
    updateDoctor(doctorId, { status: next });
    success(lang === "en" ? `Marked as ${next}` : `நிலை மாற்றப்பட்டது`);
  };

  // Stats
  const docAppts   = appointments.filter((a) => a.doctorId === doctorId);
  const docBills   = bills.filter((b) => b.doctorId === doctorId && b.paymentStatus === "paid");
  const docRevenue = docBills.reduce((s, b) => s + b.grandTotal, 0);
  const docVisits  = visits.filter((v) => v.doctorId === doctorId);

  const todayPrefix = new Date().toISOString().split("T")[0];
  const todayAppts  = docAppts.filter((a) => a.date?.startsWith(todayPrefix));

  const TABS = [
    { id: "overview",     en: "Overview",      ta: "கண்ணோட்டம்" },
    { id: "schedule",     en: "Schedule",      ta: "அட்டவணை" },
    { id: "appointments", en: "Appointments",  ta: "சந்திப்புகள்" },
    { id: "visits",       en: "Consultations", ta: "ஆலோசனைகள்" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/clinic/doctors")} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-slate-800">{doctor.nameEn}</h1>
          <p className="text-xs text-slate-400 font-tamil mt-0.5">{doctor.nameTa}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleStatus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
            {doctor.status === "active" ? <ToggleRight size={14} className="text-emerald-500" /> : <ToggleLeft size={14} />}
            {doctor.status === "active" ? (lang === "en" ? "Active" : "செயலில்") : (lang === "en" ? "On Leave" : "விடுப்பில்")}
          </button>
          {!editing && (
            <>
              <Button size="sm" icon={Edit2} onClick={() => setEditing(true)}>
                {lang === "en" ? "Edit" : "திருத்து"}
              </Button>
              <button onClick={handleDelete}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition" title={lang === "en" ? "Delete Doctor" : "மருத்துவரை நீக்கு"}>
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Doctor summary card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
            style={{ background: doctor.status === "on-leave" ? "#b86a10" : "var(--seg-primary)" }}>
            {doctor.nameEn.split(" ")[1]?.charAt(0) ?? "D"}
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              [lang === "en" ? "Qualification" : "தகுதி",          doctor.qualification],
              [lang === "en" ? "Specialization" : "நிபுணத்துவம்", doctor.specialization],
              ["TNMC Reg",                                           doctor.tnmcRegNo],
              [lang === "en" ? "Consult Fee" : "கட்டணம்",         formatINR(doctor.consultationFee)],
              [lang === "en" ? "Experience" : "அனுபவம்",           doctor.experience || "—"],
              [lang === "en" ? "Phone" : "தொலைபேசி",               doctor.phone || "—"],
              [lang === "en" ? "Email" : "மின்னஞ்சல்",             doctor.email || "—"],
              [lang === "en" ? "Status" : "நிலை",                   <Badge key="s" label={doctor.status === "active" ? (lang === "en" ? "Active" : "செயலில்") : (lang === "en" ? "On Leave" : "விடுப்பில்")} color={doctor.status === "active" ? "success" : "warning"} />],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            [lang === "en" ? "Total Appointments" : "மொத்த சந்திப்புகள்", docAppts.length],
            [lang === "en" ? "Today's Queue" : "இன்றைய வரிசை",            todayAppts.length],
            [lang === "en" ? "Consultations" : "ஆலோசனைகள்",              docVisits.length],
            [lang === "en" ? "Total Revenue" : "மொத்த வருவாய்",           formatINR(docRevenue)],
          ].map(([label, value]) => (
            <div key={label} className="text-center border border-slate-100 rounded-xl p-3">
              <p className="text-xl font-black text-slate-800">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px ${tab === t.id ? "" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            style={tab === t.id ? { borderColor: "var(--seg-primary)", color: "var(--seg-primary)" } : {}}>
            {lang === "en" ? t.en : t.ta}
          </button>
        ))}
      </div>

      {/* Tab: Overview (Edit form) */}
      {tab === "overview" && (
        editing ? (
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
            <h3 className="text-sm font-bold text-slate-700">{lang === "en" ? "Edit Doctor Profile" : "மருத்துவர் விவரம் திருத்து"}</h3>

            <FormSection title={lang === "en" ? "Personal & Professional" : "தனிப்பட்ட & தொழில்"}>
              <FormRow>
                <Input label="Full Name (English) *" value={form.nameEn} onChange={set("nameEn")} required />
                <Input label="பெயர் (தமிழ்)" value={form.nameTa} onChange={set("nameTa")} className="font-tamil" />
              </FormRow>
              <FormRow>
                <Input label="TNMC Reg No *" value={form.tnmcRegNo} onChange={set("tnmcRegNo")} required placeholder="TNMC-XXXXX" />
                <Input label={lang === "en" ? "Qualification *" : "தகுதி *"} value={form.qualification} onChange={set("qualification")} required placeholder="MBBS, MD" />
              </FormRow>
              <FormRow>
                <Select label={lang === "en" ? "Specialization *" : "நிபுணத்துவம் *"} value={form.specialization} onChange={set("specialization")}>
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Input label={lang === "en" ? "Experience" : "அனுபவம்"} value={form.experience} onChange={set("experience")} placeholder="e.g. 12 years" />
              </FormRow>
              <FormRow>
                <Input label={lang === "en" ? "Consultation Fee (₹) *" : "கட்டணம் (₹) *"} type="number" value={form.consultationFee} onChange={set("consultationFee")} required min="0" />
                <Select label={lang === "en" ? "Status" : "நிலை"} value={form.status} onChange={set("status")}>
                  <option value="active">{lang === "en" ? "Active" : "செயலில்"}</option>
                  <option value="on-leave">{lang === "en" ? "On Leave" : "விடுப்பில்"}</option>
                </Select>
              </FormRow>
            </FormSection>

            <FormSection title={lang === "en" ? "Contact" : "தொடர்பு"}>
              <FormRow>
                <Input label={lang === "en" ? "Phone" : "தொலைபேசி"} value={form.phone} onChange={set("phone")} type="tel" />
                <Input label={lang === "en" ? "Email" : "மின்னஞ்சல்"} value={form.email} onChange={set("email")} type="email" />
              </FormRow>
            </FormSection>

            <FormSection title={lang === "en" ? "Consultation Timings" : "நேர அட்டவணை"}>
              {timings.map((row, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input label={lang === "en" ? `Slot ${i + 1}` : `நேரம் ${i + 1}`}
                        value={row.slot} onChange={(e) => setSlot(i, e.target.value)} placeholder="09:00–12:00" />
                    </div>
                    {timings.length > 1 && (
                      <button type="button" onClick={() => removeTimingRow(i)} className="mt-5 text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2">{lang === "en" ? "Available Days" : "கிடைக்கும் நாட்கள்"}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {DAYS.map((day) => (
                        <button key={day} type="button" onClick={() => toggleDay(i, day)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${row.days.includes(day) ? "text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                          style={row.days.includes(day) ? { background: "var(--seg-primary)" } : {}}>
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addTimingRow}
                className="text-xs font-semibold px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-[--seg-primary] hover:text-[--seg-primary] transition w-fit">
                <Plus size={12} className="inline mr-1" />
                {lang === "en" ? "Add Slot" : "நேரம் சேர்"}
              </button>
            </FormSection>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>{lang === "en" ? "Cancel" : "ரத்து"}</Button>
              <Button type="submit" icon={Save}>{lang === "en" ? "Save Changes" : "சேமி"}</Button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-sm text-slate-500 text-center py-4">
              {lang === "en" ? "Click Edit to update doctor profile" : "மருத்துவர் விவரங்களை திருத்த Edit கிளிக் செய்யவும்"}
            </p>
          </div>
        )
      )}

      {/* Tab: Schedule */}
      {tab === "schedule" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">{lang === "en" ? "Weekly Schedule" : "வார அட்டவணை"}</h3>
          </div>
          {doctor.timings?.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {doctor.timings.map((t, i) => (
                <div key={i} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock size={14} style={{ color: "var(--seg-primary)" }} />
                    <span className="text-sm font-bold text-slate-800">{t.slot}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {DAYS.map((day) => (
                      <span key={day}
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${t.days.includes(day) ? "text-white" : "bg-slate-100 text-slate-300"}`}
                        style={t.days.includes(day) ? { background: "var(--seg-primary)" } : {}}>
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="🗓" title={lang === "en" ? "No timings configured" : "நேர அட்டவணை இல்லை"} />
          )}
        </div>
      )}

      {/* Tab: Appointments */}
      {tab === "appointments" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  {["Token", lang === "en" ? "Patient" : "நோயாளி", lang === "en" ? "Time" : "நேரம்", lang === "en" ? "Complaint" : "புகார்", lang === "en" ? "Status" : "நிலை"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {docAppts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-xs" style={{ color: "var(--seg-primary)" }}>{a.token}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{a.patient?.nameEn}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{a.time}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{a.complaint || "—"}</td>
                    <td className="px-4 py-3"><Badge label={a.consultStatus} color={a.consultStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {docAppts.length === 0 && <EmptyState icon="📅" title={lang === "en" ? "No appointments" : "சந்திப்புகள் இல்லை"} />}
          </div>
        </div>
      )}

      {/* Tab: Visits / Consultations */}
      {tab === "visits" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  {[lang === "en" ? "Visit No" : "வருகை எண்", lang === "en" ? "Patient" : "நோயாளி",
                    lang === "en" ? "Date" : "தேதி", lang === "en" ? "Type" : "வகை",
                    lang === "en" ? "Diagnosis" : "நோய் கண்டறிதல்",
                    lang === "en" ? "Rx Count" : "மருந்துகள்"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {docVisits.map((v) => {
                  const pt = visits && patients ? patients.find((p) => p.id === v.patientId) : null;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/clinic/consultation/${v.id}`)}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{v.visitNo}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{pt?.nameEn ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{v.date ? formatDate(new Date(v.date)) : "—"}</td>
                      <td className="px-4 py-3">
                        <Badge label={v.visitType === "new" ? (lang === "en" ? "New" : "புதிய") : (lang === "en" ? "Follow-up" : "மேல்நடவடிக்கை")}
                          color={v.visitType === "new" ? "inProgress" : "waiting"} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">{v.diagnosisEn || "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{v.prescription?.length ?? 0} {lang === "en" ? "medicines" : "மருந்துகள்"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {docVisits.length === 0 && <EmptyState icon="🩺" title={lang === "en" ? "No consultations recorded" : "ஆலோசனைகள் பதிவு இல்லை"} />}
          </div>
        </div>
      )}
    </div>
  );
}
