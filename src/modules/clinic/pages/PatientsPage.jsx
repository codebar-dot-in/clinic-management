import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Search, Eye, CalendarPlus, Edit2, Trash2 } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import { Modal, ModalFooter } from "../../../shared/components/ui/Modal.jsx";
import { Input, Select, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useClinic } from "../context/ClinicContext.jsx";
import { getAge } from "../../../shared/utils/date.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const DEFAULT_FORM = {
  nameEn: "", nameTa: "", phone: "", gender: "M", dob: "",
  bloodGroup: "", abhaNumber: "", drugAllergies: "", chronicConditions: "",
};

export function PatientsPage() {
  const { t, lang } = useI18n();
  const { success } = useToast();
  const navigate    = useNavigate();
  const { patients, addPatient, deletePatient } = useClinic();

  const handleDelete = (pt) => {
    if (!window.confirm(lang === "en" ? `Delete patient ${pt.nameEn}? This cannot be undone.` : `${pt.nameEn} நோயாளியை நீக்கவா? இதை மீட்க முடியாது.`)) return;
    deletePatient(pt.id);
  };

  const [search, setSearch]       = useState("");
  const [genderF, setGenderF]     = useState("all");
  const [condF, setCondF]         = useState("all");
  const [abhaF, setAbhaF]         = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(DEFAULT_FORM);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchQ = !q || p.nameEn.toLowerCase().includes(q) || p.nameTa.includes(q)
      || p.phone.includes(q) || p.uhid.toLowerCase().includes(q);
    if (!matchQ) return false;
    if (genderF !== "all" && p.gender !== genderF) return false;
    if (condF === "chronic" && p.chronicConditions.length === 0) return false;
    if (abhaF === "abha" && !p.abhaNumber) return false;
    return true;
  });

  const handleSave = (e) => {
    e.preventDefault();
    addPatient({
      ...form,
      drugAllergies:     form.drugAllergies.split(",").map((s) => s.trim()).filter(Boolean),
      chronicConditions: form.chronicConditions.split(",").map((s) => s.trim()).filter(Boolean),
    });
    success(lang === "en" ? "Patient registered" : "நோயாளி பதிவு செய்யப்பட்டார்");
    setForm(DEFAULT_FORM);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-800">
            {lang === "en" ? "Patients" : "நோயாளிகள்"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{patients.length} {lang === "en" ? "registered" : "பதிவு செய்யப்பட்டவர்கள்"}</p>
        </div>
        <Button icon={UserPlus} onClick={() => navigate("/clinic/patients/new")}>
          {lang === "en" ? "Add Patient" : "நோயாளி சேர்"}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "en" ? "Name, phone, UHID…" : "பெயர், தொலைபேசி, UHID…"}
            className="border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary] w-52"
          />
        </div>
        {/* Gender */}
        {[["all", lang === "en" ? "All" : "அனைத்தும்"], ["M", lang === "en" ? "Male" : "ஆண்"], ["F", lang === "en" ? "Female" : "பெண்"]].map(([v, l]) => (
          <button key={v} onClick={() => setGenderF(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${genderF === v ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            style={genderF === v ? { background: "var(--seg-primary)" } : {}}>
            {l}
          </button>
        ))}
        <button onClick={() => setCondF(condF === "chronic" ? "all" : "chronic")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${condF === "chronic" ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          style={condF === "chronic" ? { background: "var(--seg-primary)" } : {}}>
          {lang === "en" ? "Chronic" : "நாட்பட்ட நோய்"}
        </button>
        <button onClick={() => setAbhaF(abhaF === "abha" ? "all" : "abha")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${abhaF === "abha" ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          style={abhaF === "abha" ? { background: "var(--seg-primary)" } : {}}>
          ABHA
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                {["UHID", lang === "en" ? "Patient" : "நோயாளி", lang === "en" ? "Age / Gender" : "வயது / பாலினம்",
                  lang === "en" ? "Phone" : "தொலைபேசி", lang === "en" ? "Blood" : "இரத்த வகை",
                  lang === "en" ? "Conditions" : "நோய்கள்", "ABHA",
                  lang === "en" ? "Actions" : "செயல்கள்"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((pt) => (
                <tr key={pt.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{pt.uhid}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{pt.nameEn}</p>
                    {pt.nameTa && <p className="text-xs font-tamil text-slate-400">{pt.nameTa}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {pt.dob ? getAge(pt.dob) + " yr" : "—"} / {pt.gender === "M" ? (lang === "en" ? "Male" : "ஆண்") : (lang === "en" ? "Female" : "பெண்")}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{pt.phone}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{pt.bloodGroup || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {pt.chronicConditions.slice(0, 2).map((c) => (
                        <Badge key={c} label={c} color="warning" />
                      ))}
                      {pt.chronicConditions.length > 2 && (
                        <span className="text-xs text-slate-400">+{pt.chronicConditions.length - 2}</span>
                      )}
                      {pt.chronicConditions.length === 0 && <span className="text-xs text-slate-300">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {pt.abhaNumber
                      ? <Badge label="ABHA ✓" color="success" />
                      : <span className="text-xs text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => navigate(`/clinic/patients/${pt.id}`)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition" title={lang === "en" ? "View" : "பார்"}>
                        <Eye size={14} />
                      </button>
                      <button onClick={() => navigate(`/clinic/patients/${pt.id}/edit`)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition" title={lang === "en" ? "Edit" : "திருத்து"}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => navigate(`/clinic/appointments/new?patientId=${pt.id}`)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition" title={lang === "en" ? "Book Appointment" : "சந்திப்பு"}>
                        <CalendarPlus size={14} />
                      </button>
                      <button onClick={() => handleDelete(pt)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition" title={lang === "en" ? "Delete" : "நீக்கு"}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState icon="👤" title={t.noData} description={lang === "en" ? "No patients found" : "நோயாளிகள் கிடைக்கவில்லை"} />}
        </div>
      </div>

      {/* Add Patient Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={lang === "en" ? "Register New Patient" : "புதிய நோயாளி பதிவு"} size="lg">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <FormSection title={lang === "en" ? "Personal Details" : "தனிப்பட்ட விவரங்கள்"}>
            <FormRow>
              <Input label={lang === "en" ? "Full Name (English) *" : "முழு பெயர் (ஆங்கிலம்) *"} value={form.nameEn} onChange={set("nameEn")} required />
              <Input label={lang === "en" ? "பெயர் (தமிழ்)" : "பெயர் (தமிழ்)"} value={form.nameTa} onChange={set("nameTa")} className="font-tamil" placeholder="உ.ம்: அர்ஜுன் குமார்" />
            </FormRow>
            <FormRow>
              <Input label={lang === "en" ? "Phone *" : "தொலைபேசி *"} value={form.phone} onChange={set("phone")} type="tel" required />
              <Select label={lang === "en" ? "Gender *" : "பாலினம் *"} value={form.gender} onChange={set("gender")}>
                <option value="M">{lang === "en" ? "Male" : "ஆண்"}</option>
                <option value="F">{lang === "en" ? "Female" : "பெண்"}</option>
                <option value="O">{lang === "en" ? "Other" : "மற்றவை"}</option>
              </Select>
            </FormRow>
            <FormRow>
              <Input label={lang === "en" ? "Date of Birth" : "பிறந்த தேதி"} type="date" value={form.dob} onChange={set("dob")} />
              <Select label={lang === "en" ? "Blood Group" : "இரத்த வகை"} value={form.bloodGroup} onChange={set("bloodGroup")}>
                <option value="">— {lang === "en" ? "Select" : "தேர்வு"} —</option>
                {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </Select>
            </FormRow>
            <Input label={lang === "en" ? "ABHA Number" : "ABHA எண்"} value={form.abhaNumber} onChange={set("abhaNumber")} placeholder="14-XXXX-XXXX-XXXX" />
          </FormSection>

          <FormSection title={lang === "en" ? "Medical History" : "மருத்துவ வரலாறு"}>
            <Input
              label={lang === "en" ? "Drug Allergies (comma separated)" : "மருந்து ஒவ்வாமை (கோமா பிரித்து)"}
              value={form.drugAllergies} onChange={set("drugAllergies")}
              placeholder={lang === "en" ? "e.g. Penicillin, Aspirin" : "உ.ம்: பெனிசிலின், ஆஸ்பிரின்"}
            />
            <Input
              label={lang === "en" ? "Chronic Conditions (comma separated)" : "நாட்பட்ட நோய்கள் (கோமா பிரித்து)"}
              value={form.chronicConditions} onChange={set("chronicConditions")}
              placeholder={lang === "en" ? "e.g. Diabetes, Hypertension" : "உ.ம்: நீரிழிவு, இரத்த அழுத்தம்"}
            />
          </FormSection>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>{t.cancel}</Button>
            <Button type="submit">{lang === "en" ? "Register Patient" : "பதிவு செய்"}</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
