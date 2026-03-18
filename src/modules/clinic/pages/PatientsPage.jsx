import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Search, Eye, CalendarPlus, Edit2, Trash2, Filter, X, Users } from "lucide-react";
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
    if (!window.confirm(lang === "en" 
      ? `Delete patient ${pt.nameEn}? This cannot be undone.` 
      : `${pt.nameEn} நோயாளியை நீக்கவா? இதை மீட்க முடியாது.`
    )) return;
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

  const activeFilters = [genderF !== "all", condF === "chronic", abhaF === "abha"].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "en" ? "Patients" : "நோயாளிகள்"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {patients.length} {lang === "en" ? "registered patients" : "பதிவு செய்யப்பட்டவர்கள்"}
          </p>
        </div>
        <Button icon={UserPlus} onClick={() => navigate("/clinic/patients/new")}>
          {lang === "en" ? "Add Patient" : "நோயாளி சேர்"}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-card rounded-xl border border-border">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "en" ? "Search by name, phone, UHID..." : "பெயர், தொலைபேசி, UHID தேடுங்கள்..."}
            className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        
        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {[
              ["all", lang === "en" ? "All" : "அனைத்தும்"], 
              ["M", lang === "en" ? "Male" : "ஆண்"], 
              ["F", lang === "en" ? "Female" : "பெண்"]
            ].map(([v, l]) => (
              <button 
                key={v} 
                onClick={() => setGenderF(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  genderF === v 
                    ? "text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                }`}
                style={genderF === v ? { background: "var(--seg-gradient)" } : {}}
              >
                {l}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setCondF(condF === "chronic" ? "all" : "chronic")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              condF === "chronic" 
                ? "text-white border-transparent shadow-sm" 
                : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            style={condF === "chronic" ? { background: "var(--seg-gradient)" } : {}}
          >
            {lang === "en" ? "Chronic" : "நாட்பட்ட நோய்"}
          </button>
          
          <button 
            onClick={() => setAbhaF(abhaF === "abha" ? "all" : "abha")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              abhaF === "abha" 
                ? "text-white border-transparent shadow-sm" 
                : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            style={abhaF === "abha" ? { background: "var(--seg-gradient)" } : {}}
          >
            ABHA
          </button>

          {activeFilters > 0 && (
            <button
              onClick={() => { setGenderF("all"); setCondF("all"); setAbhaF("all"); }}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={12} />
              {lang === "en" ? "Clear" : "அழி"}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                {[
                  "UHID", 
                  lang === "en" ? "Patient" : "நோயாளி", 
                  lang === "en" ? "Age / Gender" : "வயது / பாலினம்",
                  lang === "en" ? "Phone" : "தொலைபேசி", 
                  lang === "en" ? "Blood" : "இரத்த வகை",
                  lang === "en" ? "Conditions" : "நோய்கள்", 
                  "ABHA",
                  lang === "en" ? "Actions" : "செயல்கள்"
                ].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((pt, index) => (
                <tr 
                  key={pt.id} 
                  className="hover:bg-muted/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {pt.uhid}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: "var(--seg-bg)", color: "var(--seg-primary)" }}
                      >
                        {pt.nameEn.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{pt.nameEn}</p>
                        {pt.nameTa && <p className="text-xs font-tamil text-muted-foreground">{pt.nameTa}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {pt.dob ? getAge(pt.dob) + " yr" : "—"} / {
                      pt.gender === "M" 
                        ? (lang === "en" ? "Male" : "ஆண்") 
                        : (lang === "en" ? "Female" : "பெண்")
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{pt.phone}</td>
                  <td className="px-4 py-3">
                    {pt.bloodGroup 
                      ? <Badge label={pt.bloodGroup} color="info" size="xs" />
                      : <span className="text-xs text-muted-foreground">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {pt.chronicConditions.slice(0, 2).map((c) => (
                        <Badge key={c} label={c} color="warning" size="xs" />
                      ))}
                      {pt.chronicConditions.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{pt.chronicConditions.length - 2}</span>
                      )}
                      {pt.chronicConditions.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {pt.abhaNumber
                      ? <Badge label="ABHA" color="success" size="xs" dot />
                      : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => navigate(`/clinic/patients/${pt.id}`)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" 
                        title={lang === "en" ? "View" : "பார்"}
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => navigate(`/clinic/patients/${pt.id}/edit`)}
                        className="p-2 rounded-lg hover:bg-chart-2/10 text-chart-2 transition-colors" 
                        title={lang === "en" ? "Edit" : "திருத்து"}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => navigate(`/clinic/appointments/new?patientId=${pt.id}`)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" 
                        title={lang === "en" ? "Book Appointment" : "சந்திப்பு"}
                      >
                        <CalendarPlus size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(pt)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" 
                        title={lang === "en" ? "Delete" : "நீக்கு"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <EmptyState 
              icon={<Users size={24} className="text-muted-foreground" />}
              title={t.noData} 
              description={lang === "en" ? "No patients found matching your criteria" : "தேடல் அளவுகோல்களுக்கு பொருந்தும் நோயாளிகள் கிடைக்கவில்லை"} 
            />
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      <Modal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        title={lang === "en" ? "Register New Patient" : "புதிய நோயாளி பதிவு"} 
        description={lang === "en" ? "Fill in the patient details below" : "கீழே நோயாளி விவரங்களை நிரப்பவும்"}
        size="lg"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <FormSection 
            title={lang === "en" ? "Personal Details" : "தனிப்பட்ட விவரங்கள்"}
            description={lang === "en" ? "Basic information about the patient" : "நோயாளியின் அடிப்படை தகவல்கள்"}
          >
            <FormRow>
              <Input 
                label={lang === "en" ? "Full Name (English) *" : "முழு பெயர் (ஆங்கிலம்) *"} 
                value={form.nameEn} 
                onChange={set("nameEn")} 
                required 
              />
              <Input 
                label={lang === "en" ? "பெயர் (தமிழ்)" : "பெயர் (தமிழ்)"} 
                value={form.nameTa} 
                onChange={set("nameTa")} 
                className="font-tamil" 
                placeholder="உ.ம்: அர்ஜுன் குமார்" 
              />
            </FormRow>
            <FormRow>
              <Input 
                label={lang === "en" ? "Phone *" : "தொலைபேசி *"} 
                value={form.phone} 
                onChange={set("phone")} 
                type="tel" 
                required 
              />
              <Select 
                label={lang === "en" ? "Gender *" : "பாலினம் *"} 
                value={form.gender} 
                onChange={set("gender")}
              >
                <option value="M">{lang === "en" ? "Male" : "ஆண்"}</option>
                <option value="F">{lang === "en" ? "Female" : "பெண்"}</option>
                <option value="O">{lang === "en" ? "Other" : "மற்றவை"}</option>
              </Select>
            </FormRow>
            <FormRow>
              <Input 
                label={lang === "en" ? "Date of Birth" : "பிறந்த தேதி"} 
                type="date" 
                value={form.dob} 
                onChange={set("dob")} 
              />
              <Select 
                label={lang === "en" ? "Blood Group" : "இரத்த வகை"} 
                value={form.bloodGroup} 
                onChange={set("bloodGroup")}
              >
                <option value="">— {lang === "en" ? "Select" : "தேர்வு"} —</option>
                {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </Select>
            </FormRow>
            <Input 
              label={lang === "en" ? "ABHA Number" : "ABHA எண்"} 
              value={form.abhaNumber} 
              onChange={set("abhaNumber")} 
              placeholder="14-XXXX-XXXX-XXXX" 
              hint={lang === "en" ? "Ayushman Bharat Health Account ID" : "ஆயுஷ்மான் பாரத் சுகாதார கணக்கு அடையாளம்"}
            />
          </FormSection>

          <FormSection 
            title={lang === "en" ? "Medical History" : "மருத்துவ வரலாறு"}
            description={lang === "en" ? "Known allergies and conditions" : "அறியப்பட்ட ஒவ்வாமைகள் மற்றும் நோய்கள்"}
          >
            <Input
              label={lang === "en" ? "Drug Allergies" : "மருந்து ஒவ்வாமை"}
              value={form.drugAllergies} 
              onChange={set("drugAllergies")}
              placeholder={lang === "en" ? "e.g. Penicillin, Aspirin (comma separated)" : "உ.ம்: பெனிசிலின், ஆஸ்பிரின் (கோமா பிரித்து)"}
            />
            <Input
              label={lang === "en" ? "Chronic Conditions" : "நாட்பட்ட நோய்கள்"}
              value={form.chronicConditions} 
              onChange={set("chronicConditions")}
              placeholder={lang === "en" ? "e.g. Diabetes, Hypertension (comma separated)" : "உ.ம்: நீரிழிவு, இரத்த அழுத்தம் (கோமா பிரித்து)"}
            />
          </FormSection>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              {t.cancel}
            </Button>
            <Button type="submit">
              {lang === "en" ? "Register Patient" : "பதிவு செய்"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
