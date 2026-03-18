import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Edit2, Phone, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { Modal, ModalFooter } from "../../../shared/components/ui/Modal.jsx";
import { Input, Select, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useClinic, SPECIALIZATIONS } from "../context/ClinicContext.jsx";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BLANK_DOCTOR = {
  nameEn: "", nameTa: "", tnmcRegNo: "", qualification: "",
  specialization: SPECIALIZATIONS[0], consultationFee: "",
  phone: "", status: "active",
};

const BLANK_TIMING = { slot: "", days: [] };

export function DoctorsPage() {
  const navigate     = useNavigate();
  const { lang }     = useI18n();
  const { success }  = useToast();
  const { doctors, appointments, addDoctor, updateDoctor, deleteDoctor } = useClinic();

  const handleDelete = (doc) => {
    if (!window.confirm(lang === "en" ? `Delete Dr. ${doc.nameEn}? This cannot be undone.` : `மருத்துவர் ${doc.nameEn} நீக்கவா? இதை மீட்க முடியாது.`)) return;
    deleteDoctor(doc.id);
  };

  const [showModal, setShowModal] = useState(false);
  const [editDoc, setEditDoc]     = useState(null); // null = add mode
  const [form, setForm]           = useState(BLANK_DOCTOR);
  const [timings, setTimings]     = useState([{ ...BLANK_TIMING }]);
  const [search, setSearch]       = useState("");

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const openAdd = () => {
    setEditDoc(null);
    setForm(BLANK_DOCTOR);
    setTimings([{ ...BLANK_TIMING }]);
    setShowModal(true);
  };

  const openEdit = (doc) => {
    setEditDoc(doc);
    setForm({
      nameEn: doc.nameEn, nameTa: doc.nameTa, tnmcRegNo: doc.tnmcRegNo,
      qualification: doc.qualification, specialization: doc.specialization,
      consultationFee: String(doc.consultationFee), phone: doc.phone ?? "", status: doc.status,
    });
    setTimings(doc.timings?.length > 0 ? doc.timings.map((t) => ({ ...t, days: [...t.days] })) : [{ ...BLANK_TIMING }]);
    setShowModal(true);
  };

  const addTimingRow  = () => setTimings((t) => [...t, { ...BLANK_TIMING }]);
  const removeTimingRow = (i) => setTimings((t) => t.filter((_, idx) => idx !== i));

  const toggleDay = (rowIdx, day) => {
    setTimings((rows) => rows.map((row, i) => {
      if (i !== rowIdx) return row;
      const days = row.days.includes(day) ? row.days.filter((d) => d !== day) : [...row.days, day];
      return { ...row, days };
    }));
  };

  const setSlot = (rowIdx, val) => {
    setTimings((rows) => rows.map((row, i) => i === rowIdx ? { ...row, slot: val } : row));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const data = { ...form, consultationFee: Number(form.consultationFee), timings };
    if (editDoc) {
      updateDoctor(editDoc.id, data);
      success(lang === "en" ? "Doctor updated" : "மருத்துவர் புதுப்பிக்கப்பட்டார்");
    } else {
      addDoctor(data);
      success(lang === "en" ? "Doctor added" : "மருத்துவர் சேர்க்கப்பட்டார்");
    }
    setShowModal(false);
  };

  const toggleStatus = (doc) => {
    const next = doc.status === "active" ? "on-leave" : "active";
    updateDoctor(doc.id, { status: next });
    success(lang === "en" ? `Dr. ${doc.nameEn.split(" ")[1] ?? ""} marked ${next}` : `நிலை மாற்றப்பட்டது`);
  };

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    return !q || d.nameEn.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.tnmcRegNo.toLowerCase().includes(q);
  });

  const todayApptsByDoc = (docId) => appointments.filter((a) => a.doctorId === docId).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-800">
            {lang === "en" ? "Doctors" : "மருத்துவர்கள்"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {doctors.filter((d) => d.status === "active").length} {lang === "en" ? "active" : "செயலில்"} · {doctors.length} {lang === "en" ? "total" : "மொத்தம்"}
          </p>
        </div>
        <Button icon={UserPlus} onClick={() => navigate("/clinic/doctors/new")}>
          {lang === "en" ? "Add Doctor" : "மருத்துவர் சேர்"}
        </Button>
      </div>

      {/* Search */}
      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder={lang === "en" ? "Search by name, specialization, TNMC…" : "பெயர், நிபுணத்துவம் தேடு…"}
        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary] w-72 max-w-full" />

      {/* Doctor cards */}
      {filtered.length === 0 ? (
        <EmptyState icon="👨‍⚕️" title={lang === "en" ? "No doctors found" : "மருத்துவர்கள் இல்லை"} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div key={doc.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden transition cursor-pointer hover:shadow-md ${doc.status === "on-leave" ? "border-amber-200 opacity-80" : "border-slate-100"}`}
              onClick={() => navigate(`/clinic/doctors/${doc.id}`)}>
              {/* Card header */}
              <div className="px-5 py-4 flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white shrink-0"
                  style={{ background: doc.status === "on-leave" ? "#b86a10" : "var(--seg-primary)" }}>
                  {doc.nameEn.split(" ")[1]?.charAt(0) ?? "D"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{doc.nameEn}</p>
                  {doc.nameTa && <p className="text-xs font-tamil text-slate-400 truncate">{doc.nameTa}</p>}
                  <p className="text-xs text-slate-400 mt-0.5">{doc.qualification}</p>
                </div>
                <Badge label={doc.status === "active" ? (lang === "en" ? "Active" : "செயலில்") : (lang === "en" ? "On Leave" : "விடுப்பில்")}
                  color={doc.status === "active" ? "success" : "warning"} />
              </div>

              {/* Details */}
              <div className="px-5 pb-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{lang === "en" ? "Specialization" : "நிபுணத்துவம்"}</span>
                  <span className="font-semibold text-slate-700">{doc.specialization}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">TNMC Reg</span>
                  <span className="font-mono text-slate-600">{doc.tnmcRegNo}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{lang === "en" ? "Consult Fee" : "கட்டணம்"}</span>
                  <span className="font-bold" style={{ color: "var(--seg-primary)" }}>₹{doc.consultationFee}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{lang === "en" ? "Appointments" : "சந்திப்புகள்"}</span>
                  <span className="font-semibold text-slate-700">{todayApptsByDoc(doc.id)}</span>
                </div>

                {/* Timing chips */}
                {doc.timings?.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs text-slate-400 mb-1">{lang === "en" ? "Timings" : "நேரங்கள்"}</p>
                    <div className="flex flex-wrap gap-1">
                      {doc.timings.map((t, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full border border-slate-200 text-slate-600 bg-slate-50">
                          {t.slot} · {t.days.join(",")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card footer actions */}
              <div className="border-t border-slate-100 px-4 py-2.5 flex gap-2 items-center">
                {doc.phone && (
                  <a href={`tel:${doc.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition">
                    <Phone size={11} /> {doc.phone}
                  </a>
                )}
                <div className="ml-auto flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); toggleStatus(doc); }}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 transition" title={lang === "en" ? "Toggle status" : "நிலை மாற்று"}>
                    {doc.status === "active" ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/clinic/doctors/${doc.id}`); }}
                    className="p-1.5 rounded hover:bg-blue-50 text-blue-500 transition" title={lang === "en" ? "Edit" : "திருத்து"}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                    className="p-1.5 rounded hover:bg-red-50 text-red-400 transition" title={lang === "en" ? "Delete" : "நீக்கு"}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editDoc ? (lang === "en" ? "Edit Doctor" : "மருத்துவர் திருத்து") : (lang === "en" ? "Add Doctor" : "மருத்துவர் சேர்")}
        size="lg">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <FormSection title={lang === "en" ? "Doctor Details" : "மருத்துவர் விவரங்கள்"}>
            <FormRow>
              <Input label={lang === "en" ? "Full Name (English) *" : "பெயர் (ஆங்கிலம்) *"} value={form.nameEn} onChange={set("nameEn")} required placeholder="Dr. Anand Krishnamurthy" />
              <Input label={lang === "en" ? "பெயர் (தமிழ்)" : "பெயர் (தமிழ்)"} value={form.nameTa} onChange={set("nameTa")} className="font-tamil" placeholder="டாக்டர் ஆனந்த்" />
            </FormRow>
            <FormRow>
              <Input label="TNMC Reg No *" value={form.tnmcRegNo} onChange={set("tnmcRegNo")} required placeholder="TNMC-XXXXX" />
              <Input label={lang === "en" ? "Qualification *" : "தகுதி *"} value={form.qualification} onChange={set("qualification")} required placeholder="MBBS, MD" />
            </FormRow>
            <FormRow>
              <Select label={lang === "en" ? "Specialization *" : "நிபுணத்துவம் *"} value={form.specialization} onChange={set("specialization")}>
                {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Input label={lang === "en" ? "Consultation Fee (₹) *" : "கட்டணம் (₹) *"} type="number" value={form.consultationFee} onChange={set("consultationFee")} required min="0" />
            </FormRow>
            <FormRow>
              <Input label={lang === "en" ? "Phone" : "தொலைபேசி"} value={form.phone} onChange={set("phone")} type="tel" />
              <Select label={lang === "en" ? "Status" : "நிலை"} value={form.status} onChange={set("status")}>
                <option value="active">{lang === "en" ? "Active" : "செயலில்"}</option>
                <option value="on-leave">{lang === "en" ? "On Leave" : "விடுப்பில்"}</option>
              </Select>
            </FormRow>
          </FormSection>

          <FormSection title={lang === "en" ? "Consultation Timings" : "நேர அட்டவணை"}>
            <div className="flex flex-col gap-3">
              {timings.map((row, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      label={lang === "en" ? "Slot" : "நேரம்"}
                      value={row.slot}
                      onChange={(e) => setSlot(i, e.target.value)}
                      placeholder="09:00–12:00"
                    />
                    {timings.length > 1 && (
                      <button type="button" onClick={() => removeTimingRow(i)}
                        className="mt-5 text-xs text-red-400 hover:text-red-600 shrink-0">✕</button>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">{lang === "en" ? "Days" : "நாட்கள்"}</p>
                    <div className="flex flex-wrap gap-1">
                      {DAYS.map((day) => (
                        <button key={day} type="button" onClick={() => toggleDay(i, day)}
                          className={`px-2 py-0.5 rounded text-xs font-semibold transition ${row.days.includes(day) ? "text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                          style={row.days.includes(day) ? { background: "var(--seg-primary)" } : {}}>
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addTimingRow}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-[--seg-primary] hover:text-[--seg-primary] transition w-fit">
                + {lang === "en" ? "Add Slot" : "நேரம் சேர்"}
              </button>
            </div>
          </FormSection>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              {lang === "en" ? "Cancel" : "ரத்து"}
            </Button>
            <Button type="submit">
              {editDoc ? (lang === "en" ? "Update Doctor" : "புதுப்பி") : (lang === "en" ? "Add Doctor" : "சேர்")}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
