import { useState } from "react";
import { Plus, Trash2, Leaf, MessageSquare, Printer } from "lucide-react";
import { StatCard } from "../../../shared/components/ui/StatCard.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { Modal, ModalFooter } from "../../../shared/components/ui/Modal.jsx";
import { Input, Select, Textarea, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useFacility } from "../../../shared/context/FacilityContext.jsx";
import { useAyush } from "../context/AyushContext.jsx";
import { formatINR } from "../../../shared/utils/currency.js";
import { formatDate } from "../../../shared/utils/date.js";
import { generateAyushReceipt, printReceipt } from "../../../shared/utils/receipt.js";
import { ayushReceiptMessage, sendWhatsApp } from "../../../shared/utils/whatsapp.js";
import { genId } from "../../../shared/utils/id.js";

const PRAKRUTHI_OPTIONS = ["வாதம்", "பித்தம்", "கபம்", "வாத-பித்தம்", "பித்த-கபம்", "வாத-கபம்"];

const EMPTY_KASHAYAM = () => ({ id: genId(), name: "", dosage: "", duration: "" });
const EMPTY_PROCEDURE = () => ({ id: genId(), name: "", price: 0 });

export function TreatmentPage() {
  const { t, lang } = useI18n();
  const { success, error } = useToast();
  const { facility, incrementBillCounter } = useFacility();
  const { visits, patients, createVisit, todayRevenue } = useAyush();

  const [showModal, setShowModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  // form state
  const [patientSearch, setPSearch] = useState("");
  const [selectedPt, setSelectedPt] = useState(null);
  const [practitioner, setPractitioner] = useState(facility?.practitioners?.[0] ?? "");
  const [prakruthi, setPrakruthi] = useState("");
  const [diagnosisTa, setDiagnosisTa] = useState("");
  const [diagnosisEn, setDiagnosisEn] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [kashayamRx, setKashayamRx] = useState([EMPTY_KASHAYAM()]);
  const [procedures, setProcedures] = useState([EMPTY_PROCEDURE()]);
  const [nextVisit, setNextVisit] = useState("");
  const [payMode, setPayMode] = useState("cash");
  const [consultFee, setConsultFee] = useState(300);

  const filteredPts = patients.filter((p) =>
    p.nameEn.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone.includes(patientSearch)
  );

  const updateKashayam = (id, field, val) =>
    setKashayamRx((prev) => prev.map((k) => k.id === id ? { ...k, [field]: val } : k));
  const removeKashayam = (id) => setKashayamRx((prev) => prev.filter((k) => k.id !== id));

  const updateProc = (id, field, val) =>
    setProcedures((prev) => prev.map((p) => p.id === id ? { ...p, [field]: val } : p));
  const removeProc = (id) => setProcedures((prev) => prev.filter((p) => p.id !== id));

  const total = Number(consultFee) + procedures.reduce((s, p) => s + Number(p.price || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPt) { error("Select a patient."); return; }

    const counter = incrementBillCounter();
    const items = [
      { name: "Consultation (Nadi Pariksha)", qty: 1, unitPrice: Number(consultFee), gstSlab: 0 },
      ...procedures.filter((p) => p.name).map((p) => ({ name: p.name, qty: 1, unitPrice: Number(p.price), gstSlab: 0 })),
    ];

    createVisit({
      patient: selectedPt, practitioner, prakruthi, diagnosisTa, diagnosisEn,
      treatmentPlan, kashayamRx: kashayamRx.filter((k) => k.name),
      procedures: procedures.filter((p) => p.name),
      items, paymentMode: payMode, nextVisit: nextVisit || null,
    }, counter);

    success("Treatment recorded.");
    setShowModal(false);
    setSelectedPt(null); setPSearch(""); setDiagnosisTa(""); setDiagnosisEn("");
    setTreatmentPlan(""); setKashayamRx([EMPTY_KASHAYAM()]); setProcedures([EMPTY_PROCEDURE()]);
    setNextVisit(""); setConsultFee(300);
  };

  const handlePrint = (visit) => {
    printReceipt(generateAyushReceipt({ visit, patient: visit.patient, facility }));
  };

  const handleWhatsApp = (visit) => {
    if (!visit.patient?.phone) { error("No phone."); return; }
    const msg = ayushReceiptMessage({ visit, patient: visit.patient, facility, lang });
    sendWhatsApp(visit.patient.phone, msg);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label={t.treatments}   value={visits.length}          icon={Leaf} accentClass="border-l-purple-600" />
        <StatCard label={t.todayRevenue} value={formatINR(todayRevenue)} icon={null} accentClass="border-l-emerald-500" />
        <StatCard label={t.totalPatients} value={patients.length}        icon={null} accentClass="border-l-blue-500" />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-slate-800">{t.treatments}</h1>
        <Button icon={Plus} onClick={() => setShowModal(true)}>{t.newTreatment}</Button>
      </div>

      {/* Visits list + detail pane */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t.treatments} ({visits.length})
          </div>
          <div className="divide-y divide-slate-50 overflow-y-auto max-h-[560px]">
            {visits.length === 0 && <EmptyState icon="🌿" title={t.noData} />}
            {visits.map((visit) => (
              <button key={visit.id} onClick={() => setSelectedVisit(visit)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${selectedVisit?.id === visit.id ? "bg-[--seg-bg]" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold" style={{ color: "var(--seg-primary)" }}>{visit.visitNo}</span>
                    <span className="font-semibold text-slate-800 text-sm ml-2">{visit.patient?.nameEn}</span>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(visit.createdAt)}</span>
                </div>
                {visit.patient?.nameTa && (
                  <div className="text-xs font-tamil text-slate-400 mt-0.5">{visit.patient.nameTa}</div>
                )}
                <div className="text-xs text-slate-400 mt-1 truncate">{visit.diagnosisEn || visit.diagnosisTa}</div>
                {visit.bill && (
                  <div className="text-xs font-semibold mt-1" style={{ color: "var(--seg-primary)" }}>
                    {formatINR(visit.bill.grandTotal)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {!selectedVisit ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <span className="text-4xl mb-3">🌿</span>
              <p className="text-slate-400 text-sm">Select a treatment to view details</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-800">{selectedVisit.patient?.nameEn}</div>
                  <div className="text-sm font-tamil text-slate-500">{selectedVisit.patient?.nameTa}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{selectedVisit.visitNo} · {selectedVisit.practitioner}</div>
                </div>
                {selectedVisit.prakruthi && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: "var(--seg-bg)", color: "var(--seg-primary)" }}>
                    {selectedVisit.prakruthi}
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col gap-4">
                {/* Diagnosis */}
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{t.diagnosisTa}</div>
                  <div className="font-tamil text-sm text-slate-800 p-3 rounded-lg" style={{ background: "var(--seg-bg)" }}>
                    {selectedVisit.diagnosisTa || "—"}
                  </div>
                </div>
                {selectedVisit.diagnosisEn && (
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{t.diagnosisEn}</div>
                    <div className="text-sm text-slate-600">{selectedVisit.diagnosisEn}</div>
                  </div>
                )}

                {/* Kashayam prescription */}
                {selectedVisit.kashayamRx?.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{t.kashayamRx}</div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-400 border-b border-slate-100">
                          <th className="text-left pb-1">Kashayam / கஷாயம்</th>
                          <th className="text-left pb-1">Dosage</th>
                          <th className="text-left pb-1">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedVisit.kashayamRx.map((k) => (
                          <tr key={k.id}>
                            <td className="py-1.5 font-tamil font-semibold text-slate-800">{k.name}</td>
                            <td className="py-1.5 text-slate-500 text-xs">{k.dosage}</td>
                            <td className="py-1.5 text-slate-500 text-xs">{k.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Bill */}
                {selectedVisit.bill && (
                  <div className="rounded-lg p-3 flex justify-between items-center" style={{ background: "var(--seg-bg)" }}>
                    <span className="text-sm font-semibold text-slate-600">{t.grandTotal}</span>
                    <span className="text-base font-black" style={{ color: "var(--seg-primary)" }}>
                      {formatINR(selectedVisit.bill.grandTotal)}
                      <span className="text-xs font-normal text-slate-400 ml-2">(GST exempt)</span>
                    </span>
                  </div>
                )}

                {selectedVisit.nextVisit && (
                  <div className="text-sm font-semibold" style={{ color: "var(--seg-primary)" }}>
                    📅 {t.nextVisit}: {formatDate(selectedVisit.nextVisit)}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="secondary" icon={Printer} onClick={() => handlePrint(selectedVisit)}>
                    {t.printReceipt}
                  </Button>
                  <button
                    onClick={() => handleWhatsApp(selectedVisit)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:brightness-90 transition"
                    style={{ background: "#25D366" }}
                  >
                    <MessageSquare size={15} /> 📲 {t.sendWhatsApp}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New treatment modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={t.newTreatment} size="lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FormSection title="Patient">
            <input value={patientSearch} onChange={(e) => setPSearch(e.target.value)} placeholder={t.searchPatient}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]" />
            {patientSearch && (
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-36 overflow-y-auto">
                {filteredPts.slice(0, 5).map((pt) => (
                  <button key={pt.id} type="button" onClick={() => { setSelectedPt(pt); setPSearch(""); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0">
                    <span className="font-semibold">{pt.nameEn}</span>
                    <span className="font-tamil text-slate-400 ml-2 text-xs">{pt.nameTa}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedPt && <div className="text-sm font-semibold text-emerald-600">✓ {selectedPt.nameEn} ({selectedPt.nameTa})</div>}
          </FormSection>

          <FormSection title="Consultation">
            <FormRow>
              {facility?.practitioners?.length > 0 ? (
                <Select label={t.practitioner} value={practitioner} onChange={(e) => setPractitioner(e.target.value)}>
                  {facility.practitioners.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              ) : (
                <Input label={t.practitioner} value={practitioner} onChange={(e) => setPractitioner(e.target.value)} />
              )}
              <Select label={t.prakruthi} value={prakruthi} onChange={(e) => setPrakruthi(e.target.value)}>
                <option value="">— Select —</option>
                {PRAKRUTHI_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </FormRow>
            <Textarea label={`${t.diagnosisTa} (Tamil) *`} value={diagnosisTa} onChange={(e) => setDiagnosisTa(e.target.value)}
              placeholder="நோயறிதல் இங்கே உள்ளிடவும்…" rows={2} className="font-tamil" />
            <Textarea label={t.diagnosisEn + " (English)"} value={diagnosisEn} onChange={(e) => setDiagnosisEn(e.target.value)}
              placeholder="Diagnosis in English…" rows={2} />
            <Textarea label={t.treatmentPlan} value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="Treatment plan, lifestyle advice…" rows={2} />
          </FormSection>

          {/* Kashayam prescription */}
          <FormSection title={t.kashayamRx + " / கஷாயம்"}>
            {kashayamRx.map((k) => (
              <div key={k.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                <Input label="Kashayam / கஷாயம்" value={k.name} onChange={(e) => updateKashayam(k.id, "name", e.target.value)}
                  placeholder="நிலவேம்பு கஷாயம்" className="font-tamil" />
                <Input label="Dosage" value={k.dosage} onChange={(e) => updateKashayam(k.id, "dosage", e.target.value)} placeholder="50ml × 2 daily" />
                <Input label="Duration" value={k.duration} onChange={(e) => updateKashayam(k.id, "duration", e.target.value)} placeholder="7 days" />
                <button type="button" onClick={() => removeKashayam(k.id)} className="p-2 text-slate-300 hover:text-red-400 mb-1"><Trash2 size={14} /></button>
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" icon={Plus} onClick={() => setKashayamRx((p) => [...p, EMPTY_KASHAYAM()])}>
              {t.addKashayam}
            </Button>
          </FormSection>

          {/* Procedures + billing */}
          <FormSection title={t.procedures + " & Billing"}>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase">
              <span>{t.consultFee}</span>
            </div>
            <Input type="number" value={consultFee} onChange={(e) => setConsultFee(Number(e.target.value))} />

            {procedures.map((proc) => (
              <div key={proc.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
                <Input label={t.procedureName} value={proc.name} onChange={(e) => updateProc(proc.id, "name", e.target.value)}
                  placeholder="தைலம் தேய்ப்பு / Panchakarma" />
                <Input label={t.amount} type="number" value={proc.price} onChange={(e) => updateProc(proc.id, "price", Number(e.target.value))}
                  className="w-24" />
                <button type="button" onClick={() => removeProc(proc.id)} className="p-2 text-slate-300 hover:text-red-400 mb-1"><Trash2 size={14} /></button>
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" icon={Plus} onClick={() => setProcedures((p) => [...p, EMPTY_PROCEDURE()])}>
              {t.addProcedure}
            </Button>

            <div className="rounded-lg p-3 flex justify-between items-center" style={{ background: "var(--seg-bg)" }}>
              <span className="text-sm font-semibold text-slate-600">{t.grandTotal} <span className="text-xs font-normal text-slate-400">(GST exempt)</span></span>
              <span className="text-base font-black" style={{ color: "var(--seg-primary)" }}>{formatINR(total)}</span>
            </div>

            <FormRow>
              <Input label={t.nextVisit} type="date" value={nextVisit} onChange={(e) => setNextVisit(e.target.value)} />
              <Select label={t.paymentMode} value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                <option value="cash">{t.cash}</option>
                <option value="upi">{t.upi}</option>
              </Select>
            </FormRow>
          </FormSection>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>{t.cancel}</Button>
            <Button type="submit">{t.newTreatment} — {formatINR(total)}</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
