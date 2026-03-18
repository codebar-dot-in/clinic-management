/**
 * NewDoctorPage — full-page doctor registration.
 * Route: /clinic/doctors/new
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Input, Select, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useClinic, SPECIALIZATIONS } from "../context/ClinicContext.jsx";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SECTIONS = [
  { id: "profile",   en: "Doctor Profile",        ta: "மருத்துவர் விவரம்" },
  { id: "contact",   en: "Contact Details",        ta: "தொடர்பு விவரங்கள்" },
  { id: "timings",   en: "Consultation Timings",   ta: "நேர அட்டவணை" },
];

export function NewDoctorPage() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { success, error } = useToast();
  const { addDoctor } = useClinic();

  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nameEn: "", nameTa: "", tnmcRegNo: "", qualification: "",
    specialization: SPECIALIZATIONS[0], consultationFee: "",
    experience: "", phone: "", email: "", status: "active",
  });
  const [timings, setTimings] = useState([{ slot: "", days: [] }]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const addTimingRow    = () => setTimings((t) => [...t, { slot: "", days: [] }]);
  const removeTimingRow = (i) => setTimings((t) => t.filter((_, idx) => idx !== i));
  const setSlot         = (i, val) => setTimings((rows) => rows.map((r, idx) => idx === i ? { ...r, slot: val } : r));
  const toggleDay       = (i, day) => setTimings((rows) => rows.map((r, idx) => {
    if (idx !== i) return r;
    const days = r.days.includes(day) ? r.days.filter((d) => d !== day) : [...r.days, day];
    return { ...r, days };
  }));

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.nameEn.trim())   { error(lang === "en" ? "Doctor name is required" : "மருத்துவர் பெயர் தேவை"); return; }
    if (!form.tnmcRegNo.trim()){ error(lang === "en" ? "TNMC Reg No is required" : "TNMC எண் தேவை"); return; }
    if (!form.consultationFee) { error(lang === "en" ? "Consultation fee is required" : "கட்டணம் தேவை"); return; }
    setSaving(true);
    try {
      const doc = addDoctor({ ...form, consultationFee: Number(form.consultationFee), timings });
      success(lang === "en" ? `Dr. ${form.nameEn} registered!` : `மருத்துவர் பதிவு செய்யப்பட்டார்!`);
      navigate(`/clinic/doctors/${doc.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/clinic/doctors")} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-slate-800">{lang === "en" ? "Register New Doctor" : "புதிய மருத்துவர் பதிவு"}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{lang === "en" ? "TNMC registration required for Tamil Nadu practice" : "தமிழ்நாடு பயிற்சிக்கு TNMC பதிவு தேவை"}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate("/clinic/doctors")}>
            {lang === "en" ? "Cancel" : "ரத்து"}
          </Button>
          <Button type="submit" form="doctor-form" icon={Save} loading={saving}>
            {lang === "en" ? "Register Doctor" : "மருத்துவர் பதிவு செய்"}
          </Button>
        </div>
      </div>

      <form id="doctor-form" onSubmit={handleSave} className="flex gap-6">
        {/* Section nav */}
        <div className="w-44 shrink-0 hidden md:block">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 sticky top-4 flex flex-col gap-1">
            {SECTIONS.map((s) => (
              <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium text-left transition ${activeSection === s.id ? "text-white" : "text-slate-500 hover:bg-slate-100"}`}
                style={activeSection === s.id ? { background: "var(--seg-primary)" } : {}}>
                {lang === "en" ? s.en : s.ta}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-5">
          {/* Doctor Profile */}
          {activeSection === "profile" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
              <h2 className="text-sm font-bold text-slate-700 pb-2 border-b border-slate-100">
                {lang === "en" ? "Doctor Profile" : "மருத்துவர் விவரம்"}
              </h2>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {lang === "en" ? "Profile Initial" : "ஆரம்ப எழுத்து"}
                </label>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                  style={{ background: "var(--seg-primary)" }}>
                  {form.nameEn.split(" ")[1]?.charAt(0) || form.nameEn.charAt(0) || "D"}
                </div>
                <p className="text-xs text-slate-400">{lang === "en" ? "Auto-generated from name" : "பெயரிலிருந்து தானாக உருவாக்கப்படும்"}</p>
              </div>

              <FormRow>
                <Input label={lang === "en" ? "Full Name (English) *" : "பெயர் (ஆங்கிலம்) *"}
                  value={form.nameEn} onChange={set("nameEn")} required placeholder="Dr. Anand Krishnamurthy" />
                <Input label="பெயர் (தமிழ்)"
                  value={form.nameTa} onChange={set("nameTa")} className="font-tamil" placeholder="டாக்டர் ஆனந்த்" />
              </FormRow>

              <FormRow>
                <Input label="TNMC Reg No *" value={form.tnmcRegNo} onChange={set("tnmcRegNo")}
                  required placeholder="TNMC-XXXXX" />
                <Input label={lang === "en" ? "Qualification *" : "தகுதி *"}
                  value={form.qualification} onChange={set("qualification")} required placeholder="MBBS, MD (Gen. Medicine)" />
              </FormRow>

              <FormRow>
                <Select label={lang === "en" ? "Specialization *" : "நிபுணத்துவம் *"} value={form.specialization} onChange={set("specialization")}>
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Input label={lang === "en" ? "Years of Experience" : "அனுபவம்"}
                  value={form.experience} onChange={set("experience")} placeholder="e.g. 12 years" />
              </FormRow>

              <FormRow>
                <Input label={lang === "en" ? "Consultation Fee (₹) *" : "ஆலோசனை கட்டணம் (₹) *"}
                  type="number" value={form.consultationFee} onChange={set("consultationFee")} required min="0" placeholder="500" />
                <Select label={lang === "en" ? "Initial Status" : "தொடக்க நிலை"} value={form.status} onChange={set("status")}>
                  <option value="active">{lang === "en" ? "Active" : "செயலில்"}</option>
                  <option value="on-leave">{lang === "en" ? "On Leave" : "விடுப்பில்"}</option>
                </Select>
              </FormRow>
            </div>
          )}

          {/* Contact */}
          {activeSection === "contact" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
              <h2 className="text-sm font-bold text-slate-700 pb-2 border-b border-slate-100">
                {lang === "en" ? "Contact Details" : "தொடர்பு விவரங்கள்"}
              </h2>
              <FormRow>
                <Input label={lang === "en" ? "Mobile Number" : "கைபேசி எண்"}
                  value={form.phone} onChange={set("phone")} type="tel" placeholder="9XXXXXXXXX" />
                <Input label={lang === "en" ? "Email Address" : "மின்னஞ்சல்"}
                  value={form.email} onChange={set("email")} type="email" placeholder="doctor@clinic.in" />
              </FormRow>
            </div>
          )}

          {/* Timings */}
          {activeSection === "timings" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-700">{lang === "en" ? "Consultation Timings" : "நேர அட்டவணை"}</h2>
                <Button type="button" size="sm" variant="secondary" icon={Plus} onClick={addTimingRow}>
                  {lang === "en" ? "Add Slot" : "நேரம் சேர்"}
                </Button>
              </div>

              <p className="text-xs text-slate-400">
                {lang === "en" ? "Add one or more consultation time slots with available days" : "கிடைக்கும் நாட்களுடன் ஒன்று அல்லது அதிகமான நேர இடங்களை சேர்க்கவும்"}
              </p>

              {timings.map((row, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input label={lang === "en" ? `Slot ${i + 1} — Time Range` : `இடம் ${i + 1} — நேர வரம்பு`}
                        value={row.slot} onChange={(e) => setSlot(i, e.target.value)}
                        placeholder="09:00–12:00" />
                    </div>
                    {timings.length > 1 && (
                      <button type="button" onClick={() => removeTimingRow(i)}
                        className="mt-5 p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      {lang === "en" ? "Available Days" : "கிடைக்கும் நாட்கள்"}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {DAYS.map((day) => (
                        <button key={day} type="button" onClick={() => toggleDay(i, day)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${row.days.includes(day) ? "text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                          style={row.days.includes(day) ? { background: "var(--seg-primary)" } : {}}>
                          {day}
                        </button>
                      ))}
                    </div>
                    {row.days.length === 0 && (
                      <p className="text-xs text-slate-400 mt-1">{lang === "en" ? "Select at least one day" : "குறைந்தது ஒரு நாளை தேர்வு செய்யவும்"}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mobile section nav */}
          <div className="flex gap-2 flex-wrap md:hidden">
            {SECTIONS.map((s) => (
              <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeSection === s.id ? "text-white" : "bg-white border border-slate-200 text-slate-600"}`}
                style={activeSection === s.id ? { background: "var(--seg-primary)" } : {}}>
                {lang === "en" ? s.en : s.ta}
              </button>
            ))}
          </div>

          {form.nameEn && (
            <p className="text-xs text-emerald-600 font-semibold text-center pb-2">✓ {form.nameEn}</p>
          )}
        </div>
      </form>
    </div>
  );
}
