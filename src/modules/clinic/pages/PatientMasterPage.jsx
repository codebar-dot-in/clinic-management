/**
 * PatientMasterPage — comprehensive patient registration / edit.
 * Route: /clinic/patients/new  (create)
 *        /clinic/patients/:patientId/edit  (edit)
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User, MapPin, Phone, Shield, HeartPulse } from "lucide-react";
import { Input, Select, Textarea, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useClinic, BLOOD_GROUPS, TN_DISTRICTS } from "../context/ClinicContext.jsx";

const SECTIONS = [
  { id: "personal",   icon: User,      en: "Personal Details",     ta: "தனிப்பட்ட விவரங்கள்" },
  { id: "address",    icon: MapPin,    en: "Address",              ta: "முகவரி" },
  { id: "emergency",  icon: Phone,     en: "Emergency Contact",    ta: "அவசர தொடர்பு" },
  { id: "medical",    icon: HeartPulse,en: "Medical History",      ta: "மருத்துவ வரலாறு" },
  { id: "insurance",  icon: Shield,    en: "Insurance / Scheme",   ta: "காப்பீடு / திட்டம்" },
];

const RELATIONS = ["Spouse", "Father", "Mother", "Son", "Daughter", "Sibling", "Friend", "Other"];

function buildFormFromPatient(pt) {
  return {
    nameEn: pt.nameEn ?? "", nameTa: pt.nameTa ?? "",
    phone: pt.phone ?? "", altPhone: pt.altPhone ?? "",
    gender: pt.gender ?? "M", dob: pt.dob ?? "",
    bloodGroup: pt.bloodGroup ?? "", abhaNumber: pt.abhaNumber ?? "",
    rationCard: pt.rationCard ?? "",
    // address
    doorNo: pt.address?.doorNo ?? "", street: pt.address?.street ?? "",
    area: pt.address?.area ?? "", city: pt.address?.city ?? "Chennai",
    district: pt.address?.district ?? "Chennai", pincode: pt.address?.pincode ?? "",
    // emergency
    ecName: pt.emergencyContact?.name ?? "", ecRelation: pt.emergencyContact?.relation ?? "",
    ecPhone: pt.emergencyContact?.phone ?? "",
    // medical
    drugAllergies:     (pt.drugAllergies     ?? []).join(", "),
    foodAllergies:     (pt.foodAllergies     ?? []).join(", "),
    chronicConditions: (pt.chronicConditions ?? []).join(", "),
    surgicalHistory:   pt.surgicalHistory   ?? "",
    familyHistory:     pt.familyHistory     ?? "",
    // insurance
    insProvider: pt.insurance?.provider ?? "", insPolicyNo: pt.insurance?.policyNo ?? "",
    insValidUntil: pt.insurance?.validUntil ?? "",
  };
}

const BLANK_FORM = buildFormFromPatient({});

export function PatientMasterPage() {
  const { patientId } = useParams();
  const navigate      = useNavigate();
  const { lang }      = useI18n();
  const { success, error } = useToast();
  const { patients, addPatient, updatePatient } = useClinic();

  const isEdit    = !!patientId;
  const existing  = isEdit ? patients.find((p) => p.id === patientId) : null;

  const [activeSection, setActiveSection] = useState("personal");
  const [form, setForm] = useState(isEdit && existing ? buildFormFromPatient(existing) : BLANK_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && existing) setForm(buildFormFromPatient(existing));
  }, [patientId]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.nameEn.trim()) { error(lang === "en" ? "Patient name is required" : "நோயாளி பெயர் தேவை"); return; }
    if (!form.phone.trim())  { error(lang === "en" ? "Phone number is required" : "தொலைபேசி எண் தேவை"); return; }
    setSaving(true);
    try {
      if (isEdit) {
        const structured = {
          nameEn: form.nameEn, nameTa: form.nameTa,
          phone: form.phone, altPhone: form.altPhone,
          gender: form.gender, dob: form.dob,
          bloodGroup: form.bloodGroup, abhaNumber: form.abhaNumber,
          rationCard: form.rationCard,
          drugAllergies: form.drugAllergies,
          foodAllergies: form.foodAllergies,
          chronicConditions: form.chronicConditions,
          surgicalHistory: form.surgicalHistory,
          familyHistory: form.familyHistory,
          address: { doorNo: form.doorNo, street: form.street, area: form.area, city: form.city, district: form.district, pincode: form.pincode, state: "Tamil Nadu" },
          emergencyContact: { name: form.ecName, relation: form.ecRelation, phone: form.ecPhone },
          insurance: { provider: form.insProvider, policyNo: form.insPolicyNo, validUntil: form.insValidUntil },
        };
        updatePatient(patientId, structured);
        success(lang === "en" ? "Patient updated" : "நோயாளி புதுப்பிக்கப்பட்டார்");
        navigate(`/clinic/patients/${patientId}`);
      } else {
        const pt = addPatient(form);
        success(lang === "en" ? `Patient registered — ${pt.uhid}` : `நோயாளி பதிவு — ${pt.uhid}`);
        navigate(`/clinic/patients/${pt.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const SectionNav = () => (
    <nav className="flex flex-col gap-1">
      {SECTIONS.map((s) => {
        const Icon = s.icon;
        const active = activeSection === s.id;
        return (
          <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left ${active ? "text-white" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
            style={active ? { background: "var(--seg-primary)" } : {}}>
            <Icon size={15} />
            <span>{lang === "en" ? s.en : s.ta}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(isEdit ? `/clinic/patients/${patientId}` : "/clinic/patients")}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-slate-800">
            {isEdit
              ? (lang === "en" ? `Edit Patient — ${existing?.nameEn ?? ""}` : `நோயாளி திருத்து`)
              : (lang === "en" ? "Register New Patient" : "புதிய நோயாளி பதிவு")}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === "en" ? "Fill all sections for a complete patient record" : "முழுமையான பதிவிற்கு அனைத்து பகுதிகளையும் நிரப்பவும்"}
          </p>
        </div>
        {isEdit && existing && (
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">{existing.uhid}</span>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate(isEdit ? `/clinic/patients/${patientId}` : "/clinic/patients")}>
            {lang === "en" ? "Cancel" : "ரத்து"}
          </Button>
          <Button type="submit" form="patient-form" icon={Save} loading={saving}>
            {isEdit ? (lang === "en" ? "Update Patient" : "புதுப்பி") : (lang === "en" ? "Register Patient" : "பதிவு செய்")}
          </Button>
        </div>
      </div>

      <form id="patient-form" onSubmit={handleSave}>
        <div className="flex gap-6">
          {/* Section nav — sidebar */}
          <div className="w-48 shrink-0 hidden md:block">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 sticky top-4">
              <SectionNav />
            </div>
          </div>

          {/* Form content */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Personal Details */}
            {activeSection === "personal" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User size={16} style={{ color: "var(--seg-primary)" }} />
                  <h2 className="text-sm font-bold text-slate-700">{lang === "en" ? "Personal Details" : "தனிப்பட்ட விவரங்கள்"}</h2>
                </div>
                <FormRow>
                  <Input label={lang === "en" ? "Full Name (English) *" : "முழு பெயர் (ஆங்கிலம்) *"}
                    value={form.nameEn} onChange={set("nameEn")} required placeholder="e.g. Arjun Kumar" />
                  <Input label={lang === "en" ? "பெயர் (தமிழ்)" : "பெயர் (தமிழ்)"}
                    value={form.nameTa} onChange={set("nameTa")} className="font-tamil" placeholder="உ.ம்: அர்ஜுன் குமார்" />
                </FormRow>
                <FormRow>
                  <Input label={lang === "en" ? "Mobile Number *" : "கைபேசி எண் *"}
                    value={form.phone} onChange={set("phone")} type="tel" required placeholder="9XXXXXXXXX" />
                  <Input label={lang === "en" ? "Alternate Phone" : "மாற்று தொலைபேசி"}
                    value={form.altPhone} onChange={set("altPhone")} type="tel" placeholder="Optional" />
                </FormRow>
                <FormRow>
                  <Select label={lang === "en" ? "Gender *" : "பாலினம் *"} value={form.gender} onChange={set("gender")}>
                    <option value="M">{lang === "en" ? "Male / ஆண்" : "ஆண்"}</option>
                    <option value="F">{lang === "en" ? "Female / பெண்" : "பெண்"}</option>
                    <option value="O">{lang === "en" ? "Other / மற்றவை" : "மற்றவை"}</option>
                  </Select>
                  <Input label={lang === "en" ? "Date of Birth" : "பிறந்த தேதி"}
                    type="date" value={form.dob} onChange={set("dob")} />
                </FormRow>
                <FormRow>
                  <Select label={lang === "en" ? "Blood Group" : "இரத்த வகை"} value={form.bloodGroup} onChange={set("bloodGroup")}>
                    <option value="">— {lang === "en" ? "Select" : "தேர்வு"} —</option>
                    {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </Select>
                  <Input label="ABHA Number" value={form.abhaNumber} onChange={set("abhaNumber")} placeholder="14-XXXX-XXXX-XXXX" />
                </FormRow>
                <Input label={lang === "en" ? "Ration Card Number" : "ரேஷன் கார்டு எண்"}
                  value={form.rationCard} onChange={set("rationCard")} placeholder="TN-XXXX-XXXXXX" />
              </div>
            )}

            {/* Address */}
            {activeSection === "address" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <MapPin size={16} style={{ color: "var(--seg-primary)" }} />
                  <h2 className="text-sm font-bold text-slate-700">{lang === "en" ? "Address Details" : "முகவரி விவரங்கள்"}</h2>
                </div>
                <FormRow>
                  <Input label={lang === "en" ? "Door / Flat No" : "வீட்டு எண்"} value={form.doorNo} onChange={set("doorNo")} placeholder="12A" />
                  <Input label={lang === "en" ? "Street / Road" : "தெரு / சாலை"} value={form.street} onChange={set("street")} placeholder="Gandhi Road" />
                </FormRow>
                <FormRow>
                  <Input label={lang === "en" ? "Area / Locality" : "பகுதி"} value={form.area} onChange={set("area")} placeholder="Adyar" />
                  <Input label={lang === "en" ? "City" : "நகரம்"} value={form.city} onChange={set("city")} placeholder="Chennai" />
                </FormRow>
                <FormRow>
                  <Select label={lang === "en" ? "District" : "மாவட்டம்"} value={form.district} onChange={set("district")}>
                    {TN_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </Select>
                  <Input label={lang === "en" ? "Pincode" : "அஞ்சல் குறியீடு"} value={form.pincode} onChange={set("pincode")} placeholder="600020" maxLength={6} />
                </FormRow>
                <Input label={lang === "en" ? "State" : "மாநிலம்"} value="Tamil Nadu" disabled />
              </div>
            )}

            {/* Emergency Contact */}
            {activeSection === "emergency" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Phone size={16} style={{ color: "var(--seg-primary)" }} />
                  <h2 className="text-sm font-bold text-slate-700">{lang === "en" ? "Emergency Contact" : "அவசர தொடர்பு"}</h2>
                </div>
                <p className="text-xs text-slate-400">
                  {lang === "en" ? "Person to contact in case of emergency" : "அவசர நிலையில் தொடர்பு கொள்ள வேண்டியவர்"}
                </p>
                <FormRow>
                  <Input label={lang === "en" ? "Contact Name" : "தொடர்பு பெயர்"} value={form.ecName} onChange={set("ecName")} placeholder="Full name" />
                  <Select label={lang === "en" ? "Relation" : "உறவு"} value={form.ecRelation} onChange={set("ecRelation")}>
                    <option value="">— {lang === "en" ? "Select" : "தேர்வு"} —</option>
                    {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </FormRow>
                <Input label={lang === "en" ? "Contact Phone *" : "தொலைபேசி *"} value={form.ecPhone} onChange={set("ecPhone")} type="tel" placeholder="9XXXXXXXXX" />
              </div>
            )}

            {/* Medical History */}
            {activeSection === "medical" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <HeartPulse size={16} style={{ color: "var(--seg-primary)" }} />
                  <h2 className="text-sm font-bold text-slate-700">{lang === "en" ? "Medical History" : "மருத்துவ வரலாறு"}</h2>
                </div>

                {/* Allergy alerts */}
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <p className="text-xs font-bold text-red-600 mb-3">⚠ {lang === "en" ? "Allergy Information" : "ஒவ்வாமை தகவல்"}</p>
                  <div className="flex flex-col gap-3">
                    <Input
                      label={lang === "en" ? "Drug Allergies (comma separated)" : "மருந்து ஒவ்வாமை (கோமா பிரித்து)"}
                      value={form.drugAllergies} onChange={set("drugAllergies")}
                      placeholder={lang === "en" ? "e.g. Penicillin, Aspirin, Sulfa" : "உ.ம்: பெனிசிலின், ஆஸ்பிரின்"}
                    />
                    <Input
                      label={lang === "en" ? "Food Allergies (comma separated)" : "உணவு ஒவ்வாமை (கோமா பிரித்து)"}
                      value={form.foodAllergies} onChange={set("foodAllergies")}
                      placeholder={lang === "en" ? "e.g. Nuts, Shellfish" : "உ.ம்: கடலை, மீன்"}
                    />
                  </div>
                </div>

                <Input
                  label={lang === "en" ? "Chronic Conditions (comma separated)" : "நாட்பட்ட நோய்கள் (கோமா பிரித்து)"}
                  value={form.chronicConditions} onChange={set("chronicConditions")}
                  placeholder={lang === "en" ? "e.g. Diabetes, Hypertension, Asthma" : "உ.ம்: நீரிழிவு, இரத்த அழுத்தம்"}
                />

                <Textarea
                  label={lang === "en" ? "Past Surgical / Procedure History" : "கடந்த கால அறுவை சிகிச்சை வரலாறு"}
                  value={form.surgicalHistory} onChange={set("surgicalHistory")} rows={3}
                  placeholder={lang === "en" ? "e.g. Appendectomy - 2018, CABG - 2022" : "உ.ம்: குடலிறக்கம் அறுவை - 2018"}
                />

                <Textarea
                  label={lang === "en" ? "Family Medical History" : "குடும்ப மருத்துவ வரலாறு"}
                  value={form.familyHistory} onChange={set("familyHistory")} rows={3}
                  placeholder={lang === "en" ? "e.g. Father — Diabetes, Mother — Hypertension" : "உ.ம்: தந்தை — நீரிழிவு, தாய் — இரத்த அழுத்தம்"}
                />
              </div>
            )}

            {/* Insurance */}
            {activeSection === "insurance" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Shield size={16} style={{ color: "var(--seg-primary)" }} />
                  <h2 className="text-sm font-bold text-slate-700">{lang === "en" ? "Insurance / Govt. Scheme" : "காப்பீடு / அரசு திட்டம்"}</h2>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                  {lang === "en"
                    ? "Tamil Nadu govt schemes: Chief Minister's Comprehensive Health Insurance (CMCHIS), Pradhan Mantri Jan Arogya Yojana (PM-JAY)"
                    : "தமிழ்நாடு திட்டங்கள்: முதல்வரின் விரிவான சுகாதார காப்பீடு (CMCHIS), PM-JAY"}
                </div>
                <FormRow>
                  <Input label={lang === "en" ? "Insurance Provider" : "காப்பீட்டு நிறுவனம்"}
                    value={form.insProvider} onChange={set("insProvider")}
                    placeholder="e.g. Star Health, CMCHIS, PM-JAY" />
                  <Input label={lang === "en" ? "Policy / Card Number" : "பாலிசி / கார்டு எண்"}
                    value={form.insPolicyNo} onChange={set("insPolicyNo")} placeholder="XXXXXXXX" />
                </FormRow>
                <Input label={lang === "en" ? "Valid Until" : "செல்லுபடியாகும் வரை"}
                  type="date" value={form.insValidUntil} onChange={set("insValidUntil")} />
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

            {/* Section nav hint */}
            <p className="text-xs text-slate-400 text-center pb-2">
              {lang === "en" ? "Use the section nav to fill all details, then click Register / Update above." : "அனைத்து விவரங்களையும் நிரப்பி மேலே உள்ள பதிவு / புதுப்பி பட்டனை கிளிக் செய்யவும்."}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
