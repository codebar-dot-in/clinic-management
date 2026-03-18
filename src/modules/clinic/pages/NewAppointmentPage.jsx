/**
 * NewAppointmentPage — full-page appointment booking.
 * Route: /clinic/appointments/new
 */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, CalendarPlus, Search } from "lucide-react";
import { Input, Select, Textarea, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useClinic } from "../context/ClinicContext.jsx";
import { formatDate, getAge } from "../../../shared/utils/date.js";

const SLOT_TIMES = [
  "08:00","08:20","08:40","09:00","09:20","09:40",
  "10:00","10:20","10:40","11:00","11:20","11:40",
  "12:00","14:00","14:20","14:40","15:00","15:20",
  "15:40","16:00","16:20","16:40","17:00","17:20","17:40","18:00",
];

export function NewAppointmentPage() {
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();
  const { lang }          = useI18n();
  const { success, error } = useToast();
  const { patients, doctors, addAppointment } = useClinic();

  const prePatientId = searchParams.get("patientId") ?? "";

  const [patientSearch, setPS]    = useState("");
  const [selectedPatient, setSP]  = useState(prePatientId ? patients.find((p) => p.id === prePatientId) ?? null : null);
  const [selectedDoctor, setSD]   = useState(null);
  const [date,   setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [time,   setTime]         = useState("09:00");
  const [customTime, setCustomTime] = useState(false);
  const [type,   setType]         = useState("booked");
  const [complaint, setComplaint] = useState("");
  const [notes, setNotes]         = useState("");
  const [saving, setSaving]       = useState(false);

  const filteredPts = patientSearch
    ? patients.filter((p) =>
        p.nameEn.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.phone.includes(patientSearch) ||
        p.uhid.toLowerCase().includes(patientSearch.toLowerCase())
      )
    : [];

  const activeDoctors = doctors.filter((d) => d.status === "active");

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedPatient) { error(lang === "en" ? "Select a patient" : "நோயாளியை தேர்வு செய்யவும்"); return; }
    if (!selectedDoctor)  { error(lang === "en" ? "Select a doctor"  : "மருத்துவரை தேர்வு செய்யவும்"); return; }
    if (!time)            { error(lang === "en" ? "Select a time slot" : "நேரத்தை தேர்வு செய்யவும்"); return; }

    setSaving(true);
    try {
      addAppointment({
        patient:   selectedPatient,
        doctorId:  selectedDoctor.id,
        doctor:    selectedDoctor.nameEn,
        time, type, complaint, notes,
        date,
      });
      success(lang === "en" ? "Appointment booked!" : "சந்திப்பு பதிவு செய்யப்பட்டது!");
      navigate("/clinic/appointments");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/clinic/appointments")}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-800">
            {lang === "en" ? "Book Appointment" : "சந்திப்பு பதிவு செய்"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === "en" ? "Schedule a new patient appointment" : "புதிய நோயாளி சந்திப்பை திட்டமிடுங்கள்"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">

        {/* Step 1 — Patient */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full text-xs font-black text-white flex items-center justify-center shrink-0" style={{ background: "var(--seg-primary)" }}>1</span>
            <h2 className="text-sm font-bold text-slate-700">{lang === "en" ? "Select Patient" : "நோயாளியை தேர்வு செய்"}</h2>
            <button type="button" onClick={() => navigate("/clinic/patients/new")}
              className="ml-auto text-xs font-semibold hover:underline" style={{ color: "var(--seg-primary)" }}>
              + {lang === "en" ? "Register New" : "புதிய பதிவு"}
            </button>
          </div>

          {selectedPatient ? (
            <div className="flex items-center gap-4 p-3 rounded-xl border border-emerald-200 bg-emerald-50">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0"
                style={{ background: "var(--seg-primary)" }}>
                {selectedPatient.nameEn.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800">{selectedPatient.nameEn}</p>
                {selectedPatient.nameTa && <p className="text-xs font-tamil text-slate-400">{selectedPatient.nameTa}</p>}
                <div className="flex gap-3 mt-1 text-xs text-slate-500">
                  <span>{selectedPatient.uhid}</span>
                  <span>{selectedPatient.phone}</span>
                  {selectedPatient.dob && <span>{getAge(selectedPatient.dob)} yrs</span>}
                  {selectedPatient.bloodGroup && <span className="text-red-600 font-bold">{selectedPatient.bloodGroup}</span>}
                </div>
                {selectedPatient.drugAllergies?.length > 0 && (
                  <p className="text-xs text-red-600 font-semibold mt-1">⚠ Allergy: {selectedPatient.drugAllergies.join(", ")}</p>
                )}
                {selectedPatient.chronicConditions?.length > 0 && (
                  <p className="text-xs text-amber-600 mt-0.5">{selectedPatient.chronicConditions.join(", ")}</p>
                )}
              </div>
              <button type="button" onClick={() => setSP(null)} className="text-slate-400 hover:text-red-400 text-sm font-bold p-1">✕</button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={patientSearch} onChange={(e) => setPS(e.target.value)}
                  placeholder={lang === "en" ? "Search by name, phone, or UHID…" : "பெயர், தொலைபேசி அல்லது UHID தேட…"}
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--seg-primary]" />
              </div>
              {filteredPts.length > 0 && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                  {filteredPts.slice(0, 8).map((pt) => (
                    <button key={pt.id} type="button" onClick={() => { setSP(pt); setPS(""); }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0"
                        style={{ background: "var(--seg-primary)" }}>
                        {pt.nameEn.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{pt.nameEn}</p>
                        <p className="text-xs text-slate-400">{pt.uhid} · {pt.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {patientSearch && filteredPts.length === 0 && (
                <p className="text-xs text-slate-400 mt-2 text-center py-3 border border-dashed border-slate-200 rounded-xl">
                  {lang === "en" ? "No patient found." : "நோயாளி கிடைக்கவில்லை."}{" "}
                  <button type="button" onClick={() => navigate("/clinic/patients/new")}
                    className="font-semibold hover:underline" style={{ color: "var(--seg-primary)" }}>
                    {lang === "en" ? "Register?" : "பதிவு செய்யவுமா?"}
                  </button>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Step 2 — Doctor */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full text-xs font-black text-white flex items-center justify-center shrink-0" style={{ background: "var(--seg-primary)" }}>2</span>
            <h2 className="text-sm font-bold text-slate-700">{lang === "en" ? "Select Doctor" : "மருத்துவரை தேர்வு செய்"}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeDoctors.map((doc) => (
              <button key={doc.id} type="button" onClick={() => setSD(doc)}
                className={`text-left p-3 rounded-xl border-2 transition ${selectedDoctor?.id === doc.id ? "border-[--seg-primary] bg-[--seg-bg]" : "border-slate-100 hover:border-slate-300"}`}
                style={selectedDoctor?.id === doc.id ? { borderColor: "var(--seg-primary)", background: "var(--seg-bg)" } : {}}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm text-white shrink-0"
                    style={{ background: selectedDoctor?.id === doc.id ? "var(--seg-primary)" : "#94a3b8" }}>
                    {doc.nameEn.split(" ")[1]?.charAt(0) ?? "D"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{doc.nameEn}</p>
                    <p className="text-xs text-slate-400">{doc.specialization} · ₹{doc.consultationFee}</p>
                  </div>
                  {selectedDoctor?.id === doc.id && <span className="ml-auto text-emerald-500 font-bold">✓</span>}
                </div>
                {doc.timings?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {doc.timings.map((t, i) => (
                      <span key={i} className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{t.slot}</span>
                    ))}
                  </div>
                )}
              </button>
            ))}
            {activeDoctors.length === 0 && (
              <p className="text-sm text-slate-400 col-span-2 text-center py-4">
                {lang === "en" ? "No active doctors. " : "செயலில் மருத்துவர் இல்லை. "}
                <button type="button" onClick={() => navigate("/clinic/doctors/new")} className="font-semibold hover:underline" style={{ color: "var(--seg-primary)" }}>
                  {lang === "en" ? "Add doctor?" : "சேர்க்கவுமா?"}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Step 3 — Date & Time */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full text-xs font-black text-white flex items-center justify-center shrink-0" style={{ background: "var(--seg-primary)" }}>3</span>
            <h2 className="text-sm font-bold text-slate-700">{lang === "en" ? "Date & Time Slot" : "தேதி & நேரம்"}</h2>
          </div>

          <FormRow>
            <Input label={lang === "en" ? "Appointment Date" : "சந்திப்பு தேதி"} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <Select label={lang === "en" ? "Appointment Type" : "சந்திப்பு வகை"} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="booked">{lang === "en" ? "Pre-booked" : "முன்பதிவு"}</option>
              <option value="walkIn">{lang === "en" ? "Walk-in" : "நடை வருகை"}</option>
              <option value="emergency">{lang === "en" ? "Emergency" : "அவசரம்"}</option>
            </Select>
          </FormRow>

          {/* Time slot grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {lang === "en" ? "Time Slot" : "நேர இடம்"}
              </label>
              <button type="button" onClick={() => setCustomTime((v) => !v)}
                className="text-xs font-semibold hover:underline" style={{ color: "var(--seg-primary)" }}>
                {customTime ? (lang === "en" ? "Use slots" : "இடங்கள் பயன்படுத்து") : (lang === "en" ? "Custom time" : "தனிப்பயன் நேரம்")}
              </button>
            </div>
            {customTime ? (
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                {SLOT_TIMES.map((slot) => (
                  <button key={slot} type="button" onClick={() => setTime(slot)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition ${time === slot ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    style={time === slot ? { background: "var(--seg-primary)" } : {}}>
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 4 — Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full text-xs font-black text-white flex items-center justify-center shrink-0" style={{ background: "var(--seg-primary)" }}>4</span>
            <h2 className="text-sm font-bold text-slate-700">{lang === "en" ? "Visit Details" : "வருகை விவரங்கள்"}</h2>
          </div>
          <Input
            label={lang === "en" ? "Chief Complaint / Reason for Visit" : "முக்கிய புகார் / வருகையின் காரணம்"}
            value={complaint} onChange={(e) => setComplaint(e.target.value)}
            placeholder={lang === "en" ? "e.g. Fever and headache for 3 days" : "உ.ம்: 3 நாட்களாக காய்ச்சல் மற்றும் தலைவலி"}
          />
          <Textarea
            label={lang === "en" ? "Additional Notes (optional)" : "கூடுதல் குறிப்புகள் (விருப்பம்)"}
            value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            placeholder={lang === "en" ? "Any special instructions or context…" : "சிறப்பு அறிவுறுத்தல்கள்…"}
          />
        </div>

        {/* Summary + Save */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          {selectedPatient && selectedDoctor && (
            <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm flex flex-wrap gap-4">
              <div><span className="text-slate-400 text-xs">{lang === "en" ? "Patient" : "நோயாளி"}</span><p className="font-bold text-slate-800">{selectedPatient.nameEn}</p></div>
              <div><span className="text-slate-400 text-xs">{lang === "en" ? "Doctor" : "மருத்துவர்"}</span><p className="font-bold text-slate-800">{selectedDoctor.nameEn}</p></div>
              <div><span className="text-slate-400 text-xs">{lang === "en" ? "Date & Time" : "தேதி & நேரம்"}</span><p className="font-bold text-slate-800">{formatDate(new Date(date))} · {time}</p></div>
              <div><span className="text-slate-400 text-xs">{lang === "en" ? "Fee" : "கட்டணம்"}</span><p className="font-bold" style={{ color: "var(--seg-primary)" }}>₹{selectedDoctor.consultationFee}</p></div>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => navigate("/clinic/appointments")}>
              {lang === "en" ? "Cancel" : "ரத்து"}
            </Button>
            <Button type="submit" icon={CalendarPlus} loading={saving}>
              {lang === "en" ? "Confirm Appointment" : "சந்திப்பை உறுதிப்படுத்து"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
