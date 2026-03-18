import { useState } from "react";
import { CheckCircle, Save } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { Textarea } from "../../../shared/components/ui/Input.jsx";
import { BillModal } from "../components/BillModal.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useClinic } from "../context/ClinicContext.jsx";
import { getAge } from "../../../shared/utils/date.js";

export function DoctorViewPage() {
  const { t } = useI18n();
  const { success } = useToast();
  const { appointments, updateAppointment } = useClinic();
  const [selectedId, setSelectedId] = useState(() => {
    const inProg = appointments.find((a) => a.consultStatus === "inProgress");
    return inProg?.id ?? appointments[0]?.id ?? null;
  });
  const [notes, setNotes]         = useState({});
  const [billTarget, setBillTarget] = useState(null);

  const selected = appointments.find((a) => a.id === selectedId);
  const consultLabel = { done: t.done, inProgress: t.inProgress, waiting: t.waiting };

  const saveNotes = (id) => {
    updateAppointment(id, { notes: notes[id] ?? "" });
    success(t.notesSaved);
  };

  const markDone = (id) => updateAppointment(id, { consultStatus: "done" });
  const markInProgress = (id) => updateAppointment(id, { consultStatus: "inProgress" });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] divide-y md:divide-y-0 md:divide-x divide-slate-100 min-h-[600px]">

        {/* ── Appointment queue ── */}
        <div className="flex flex-col">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t.appointments} ({appointments.length})
          </div>
          <div className="overflow-y-auto flex-1">
            {appointments.length === 0 && (
              <p className="p-6 text-sm text-slate-400">{t.noAppointments}</p>
            )}
            {appointments.map((appt) => {
              const isSelected = appt.id === selectedId;
              return (
                <button
                  key={appt.id}
                  onClick={() => setSelectedId(appt.id)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 transition-all ${
                    isSelected ? "bg-[--seg-bg] border-l-2" : "hover:bg-slate-50 border-l-2 border-l-transparent"
                  }`}
                  style={isSelected ? { borderLeftColor: "var(--seg-primary)" } : {}}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold" style={{ color: "var(--seg-primary)" }}>{appt.token}</span>
                      <span className="font-semibold text-slate-800 text-sm ml-2">{appt.patient?.nameEn}</span>
                    </div>
                    <Badge label={consultLabel[appt.consultStatus] ?? appt.consultStatus} color={appt.consultStatus} />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{appt.time} · {appt.complaint}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Patient detail pane ── */}
        <div className="p-5 flex flex-col gap-4">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <span className="text-5xl mb-3">🩺</span>
              <p className="font-semibold text-slate-600">{t.noPatientSelected}</p>
              <p className="text-sm text-slate-400 mt-1">{t.selectPatient}</p>
            </div>
          ) : (
            <>
              {/* Patient info card */}
              <div className="rounded-xl p-4 border" style={{ background: "var(--seg-bg)", borderColor: "var(--seg-border)" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-base font-bold text-slate-800">{selected.patient?.nameEn}</div>
                    {selected.patient?.nameTa && (
                      <div className="text-sm text-slate-500 font-tamil">{selected.patient.nameTa}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">
                      {t.age}: {getAge(selected.patient?.dob) ?? "—"} &nbsp;|&nbsp;
                      {t.phone}: {selected.patient?.phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black" style={{ color: "var(--seg-primary)" }}>{selected.token}</div>
                    <div className="text-xs text-slate-400">{selected.time}</div>
                    <Badge label={t[selected.consultStatus]} color={selected.consultStatus} className="mt-1" />
                  </div>
                </div>
                {/* Chronic conditions */}
                {selected.patient?.chronicConditions?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selected.patient.chronicConditions.map((c) => (
                      <Badge key={c} label={c} color="warning" />
                    ))}
                  </div>
                )}
                {/* Drug allergies warning */}
                {selected.patient?.drugAllergies?.length > 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold">
                    ⚠ Drug Allergies: {selected.patient.drugAllergies.join(", ")}
                  </div>
                )}
                {/* Chief complaint */}
                <div className="mt-3 p-2 bg-white rounded-lg border border-white/60 text-sm">
                  <span className="text-xs font-semibold text-slate-400">{t.complaint}: </span>
                  {selected.complaint}
                </div>
              </div>

              {/* Diagnosis notes */}
              <Textarea
                label={t.diagnosisNotes}
                rows={5}
                value={notes[selected.id] ?? selected.notes ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [selected.id]: e.target.value }))}
                placeholder={t.diagnosisPlaceholder}
              />

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" icon={Save} onClick={() => saveNotes(selected.id)}>
                  {t.saveNotes}
                </Button>
                {selected.consultStatus === "waiting" && (
                  <Button variant="secondary" onClick={() => markInProgress(selected.id)}>
                    ▶ Start Consult
                  </Button>
                )}
                <Button
                  disabled={selected.consultStatus === "done"}
                  icon={selected.consultStatus === "done" ? CheckCircle : null}
                  onClick={() => markDone(selected.id)}
                >
                  {selected.consultStatus === "done" ? `✓ ${t.done}` : t.markDone}
                </Button>
                <Button variant="secondary" onClick={() => setBillTarget({ patient: selected.patient, appointmentId: selected.id })}>
                  🧾 {t.createBill}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {billTarget && (
        <BillModal
          open={!!billTarget}
          onClose={() => setBillTarget(null)}
          patient={billTarget.patient}
          appointmentId={billTarget.appointmentId}
        />
      )}
    </div>
  );
}
