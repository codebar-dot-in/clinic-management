import { useState } from "react";
import { CalendarPlus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal, ModalFooter } from "../../../shared/components/ui/Modal.jsx";
import { Input, Select, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useFacility } from "../../../shared/context/FacilityContext.jsx";
import { useClinic } from "../context/ClinicContext.jsx";
import { formatDate } from "../../../shared/utils/date.js";

const DEFAULT_FORM = { patientId: "", patientName: "", phone: "", time: "", doctor: "", complaint: "", type: "booked" };

export function AppointmentsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { facility } = useFacility();
  const { appointments, patients, addAppointment, updateAppointment, deleteAppointment } = useClinic();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(DEFAULT_FORM);
  const [patientSearch, setPS]    = useState("");

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const filteredPts = patients.filter((p) =>
    p.nameEn.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone.includes(patientSearch)
  );

  const selectPatient = (pt) => {
    setForm((f) => ({ ...f, patientId: pt.id, patientName: pt.nameEn, phone: pt.phone }));
    setPS("");
  };

  const handleBook = (e) => {
    e.preventDefault();
    if (!form.patientName || !form.time) { error("Patient and time are required."); return; }

    const patient = patients.find((p) => p.id === form.patientId) ?? {
      id: null, nameEn: form.patientName, nameTa: "", phone: form.phone,
    };
    addAppointment({ patient, time: form.time, doctor: form.doctor, complaint: form.complaint, type: form.type });
    success(t.appointmentBooked);
    setForm(DEFAULT_FORM);
    setShowModal(false);
  };

  const statusGroups = {
    waiting:    appointments.filter((a) => a.consultStatus === "waiting"),
    inProgress: appointments.filter((a) => a.consultStatus === "inProgress"),
    done:       appointments.filter((a) => a.consultStatus === "done"),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">{t.appointments} — {formatDate(new Date())}</h1>
        <Button icon={CalendarPlus} onClick={() => navigate("/clinic/appointments/new")}>{t.bookAppointment}</Button>
      </div>

      {/* Kanban-style column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(statusGroups).map(([status, appts]) => (
          <div key={status} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Badge label={t[status] ?? status} color={status} />
                <span className="text-xs text-slate-400 font-semibold">{appts.length}</span>
              </div>
            </div>
            <div className="p-3 flex flex-col gap-2 min-h-40">
              {appts.length === 0 && (
                <p className="text-sm text-slate-300 text-center py-6">{t.noData}</p>
              )}
              {appts.map((appt) => (
                <div key={appt.id} className="rounded-lg border border-slate-100 p-3 hover:border-[--seg-primary] transition cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold" style={{ color: "var(--seg-primary)" }}>{appt.token}</span>
                      <span className="text-sm font-semibold text-slate-800 ml-2">{appt.patient?.nameEn}</span>
                    </div>
                    <span className="text-xs text-slate-400">{appt.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 truncate">{appt.complaint}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{appt.doctor}</p>
                  {/* Delete */}
                  <button
                    onClick={() => { if (window.confirm(t.confirmDelete ?? "Delete this appointment?")) deleteAppointment(appt.id); }}
                    className="mt-2 w-full text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded py-0.5 transition flex items-center justify-center gap-1"
                  >
                    <Trash2 size={11} /> {t.delete ?? "Delete"}
                  </button>
                  {/* Inline status change */}
                  {status === "waiting" && (
                    <button
                      onClick={() => updateAppointment(appt.id, { consultStatus: "inProgress" })}
                      className="mt-2 text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition w-full"
                    >
                      ▶ {t.inProgress}
                    </button>
                  )}
                  {status === "inProgress" && (
                    <div className="mt-2 flex gap-1">
                      <button
                        onClick={() => navigate(`/clinic/consultation?appointmentId=${appt.id}&patientId=${appt.patientId}&doctorId=${appt.doctorId ?? ""}`)}
                        className="flex-1 text-xs font-semibold px-2 py-1 rounded text-white transition"
                        style={{ background: "var(--seg-primary)" }}
                      >
                        🩺 Start
                      </button>
                      <button
                        onClick={() => updateAppointment(appt.id, { consultStatus: "done" })}
                        className="flex-1 text-xs font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                      >
                        ✓ {t.markDone}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Book appointment modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={t.bookAppointment} size="md">
        <form onSubmit={handleBook} className="flex flex-col gap-4">
          <FormSection title="Patient">
            <input
              value={patientSearch}
              onChange={(e) => setPS(e.target.value)}
              placeholder={t.searchPatient}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]"
            />
            {patientSearch && (
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                {filteredPts.slice(0, 6).map((pt) => (
                  <button
                    key={pt.id} type="button"
                    onClick={() => selectPatient(pt)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0"
                  >
                    <span className="font-semibold">{pt.nameEn}</span>
                    <span className="text-slate-400 ml-2 text-xs">{pt.phone}</span>
                  </button>
                ))}
                {filteredPts.length === 0 && <p className="px-3 py-2 text-sm text-slate-400">No match — enter name below.</p>}
              </div>
            )}
            {form.patientName && (
              <div className="text-sm font-semibold text-emerald-600">✓ {form.patientName} selected</div>
            )}
            <FormRow>
              <Input label={t.patientName + " *"} value={form.patientName} onChange={set("patientName")} required />
              <Input label={t.phone} value={form.phone} onChange={set("phone")} type="tel" />
            </FormRow>
          </FormSection>

          <FormSection title="Appointment Details">
            <FormRow>
              <Input label={t.appointmentTime + " *"} type="time" value={form.time} onChange={set("time")} required />
              {facility?.doctors?.length > 0 ? (
                <Select label={t.doctorName} value={form.doctor} onChange={set("doctor")}>
                  <option value="">— Select —</option>
                  {facility.doctors.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
              ) : (
                <Input label={t.doctorName} value={form.doctor} onChange={set("doctor")} />
              )}
            </FormRow>
            <FormRow>
              <Input label={t.complaint} value={form.complaint} onChange={set("complaint")} placeholder="Chief complaint…" />
              <Select label={t.appointmentType ?? "Type"} value={form.type} onChange={set("type")}>
                <option value="booked">{t.booked}</option>
                <option value="walkIn">{t.walkIn}</option>
              </Select>
            </FormRow>
          </FormSection>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>{t.cancel}</Button>
            <Button type="submit">{t.bookAppointment}</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
