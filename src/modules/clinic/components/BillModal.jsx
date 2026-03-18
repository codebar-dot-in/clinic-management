/**
 * BillModal — create OPD bill with multi-item GST calculation.
 * Generates receipt + sends via WhatsApp on submit.
 */
import { useState, useMemo } from "react";
import { Plus, Trash2, Receipt } from "lucide-react";
import { Modal, ModalFooter } from "../../../shared/components/ui/Modal.jsx";
import { Input, Select, Textarea, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useFacility } from "../../../shared/context/FacilityContext.jsx";
import { useClinic } from "../context/ClinicContext.jsx";
import { calcBillTotals, GST_SLABS } from "../../../shared/utils/gst.js";
import { formatINR } from "../../../shared/utils/currency.js";
import { generateClinicReceipt, printReceipt } from "../../../shared/utils/receipt.js";
import { clinicReceiptMessage, sendWhatsApp } from "../../../shared/utils/whatsapp.js";
import { genId } from "../../../shared/utils/id.js";

const EMPTY_ITEM = () => ({ id: genId(), name: "", qty: 1, unitPrice: 0, gstSlab: 0 });

export function BillModal({ open, onClose, patient, appointmentId }) {
  const { t, lang } = useI18n();
  const { success, error } = useToast();
  const { facility, incrementBillCounter } = useFacility();
  const { createBill, updateAppointment } = useClinic();

  const [items, setItems]           = useState([{ ...EMPTY_ITEM(), name: "Consultation Fee", unitPrice: 500 }]);
  const [doctor, setDoctor]         = useState(facility?.doctors?.[0] ?? "");
  const [paymentMode, setPayMode]   = useState("cash");
  const [paymentStatus, setPayStat] = useState("paid");
  const [nextVisit, setNextVisit]   = useState("");
  const [notes, setNotes]           = useState("");
  const [lastBill, setLastBill]     = useState(null);

  const totals = useMemo(() => calcBillTotals(items), [items]);

  const updateItem = (id, field, value) =>
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const addItem = () => setItems((prev) => [...prev, EMPTY_ITEM()]);

  const handleSubmit = () => {
    if (!patient) { error("No patient selected."); return; }
    if (items.some((i) => !i.name.trim())) { error("All items must have a name."); return; }

    const counter = incrementBillCounter();
    const bill = createBill({ patient, doctor, items, paymentMode, paymentStatus, notes, nextVisit: nextVisit || null }, counter);
    setLastBill(bill);
    if (appointmentId) updateAppointment(appointmentId, { consultStatus: "done" });
    success(t.billCreated);
  };

  const handlePrint = () => {
    if (!lastBill) return;
    printReceipt(generateClinicReceipt({ bill: lastBill, patient, facility }));
  };

  const handleWhatsApp = () => {
    if (!lastBill || !patient?.phone) return;
    const msg = clinicReceiptMessage({ bill: lastBill, patient, facility, lang });
    sendWhatsApp(patient.phone, msg);
  };

  const handleClose = () => {
    setItems([{ ...EMPTY_ITEM(), name: "Consultation Fee", unitPrice: 500 }]);
    setLastBill(null);
    setNextVisit("");
    setNotes("");
    onClose();
  };

  // ── Post-bill view ──
  if (lastBill) {
    return (
      <Modal open={open} onClose={handleClose} title={t.billCreated} size="md">
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <Receipt size={32} className="text-emerald-600" />
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-slate-800">{lastBill.billNo}</div>
            <div className="text-3xl font-black mt-2" style={{ color: "var(--seg-primary)" }}>
              {formatINR(lastBill.grandTotal)}
            </div>
            <Badge label={lastBill.paymentStatus} color={lastBill.paymentStatus} className="mt-2" />
          </div>

          <div className="w-full grid grid-cols-2 gap-3">
            <Button variant="secondary" icon={Receipt} onClick={handlePrint}>{t.printReceipt}</Button>
            <Button icon={null} onClick={handleWhatsApp} className="bg-[#25D366] hover:brightness-90 text-white">
              📲 {t.sendWhatsApp}
            </Button>
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={handleClose}>{t.close}</Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title={`${t.createBill} — ${patient?.nameEn ?? ""}`} size="lg">
      <div className="flex flex-col gap-5">
        {/* Patient info strip */}
        {patient && (
          <div className="rounded-lg p-3 flex items-center gap-3 text-sm" style={{ background: "var(--seg-bg)", border: "1px solid var(--seg-border)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "var(--seg-primary)" }}>
              {patient.nameEn[0]}
            </div>
            <div>
              <span className="font-semibold text-slate-800">{patient.nameEn}</span>
              {patient.nameTa && <span className="text-slate-400 ml-2 font-tamil text-xs">{patient.nameTa}</span>}
              <div className="text-xs text-slate-400">{patient.uhid} · {patient.phone}</div>
            </div>
            {patient.drugAllergies?.length > 0 && (
              <Badge label={`⚠ ${patient.drugAllergies.join(", ")}`} color="warning" className="ml-auto" />
            )}
          </div>
        )}

        <FormSection title="Bill Details">
          <FormRow>
            {facility?.doctors?.length > 0 ? (
              <Select label={t.doctorName} value={doctor} onChange={(e) => setDoctor(e.target.value)}>
                {facility.doctors.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            ) : (
              <Input label={t.doctorName} value={doctor} onChange={(e) => setDoctor(e.target.value)} />
            )}
            <Input label={t.nextVisit} type="date" value={nextVisit} onChange={(e) => setNextVisit(e.target.value)} />
          </FormRow>
        </FormSection>

        {/* Bill items */}
        <FormSection title="Services & Charges">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Service</th>
                  <th className="text-right pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide w-16">Qty</th>
                  <th className="text-right pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide w-24">Price (₹)</th>
                  <th className="text-right pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide w-20">GST %</th>
                  <th className="text-right pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide w-24">Total</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => {
                  const lineTotal = item.unitPrice * item.qty * (1 + item.gstSlab / 100);
                  return (
                    <tr key={item.id}>
                      <td className="py-2 pr-2">
                        <input
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                          placeholder="Service name"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="number" min="1"
                          className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[--seg-primary]"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="number" min="0"
                          className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[--seg-primary]"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <select
                          className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]"
                          value={item.gstSlab}
                          onChange={(e) => updateItem(item.id, "gstSlab", Number(e.target.value))}
                        >
                          {GST_SLABS.map((s) => <option key={s} value={s}>{s}%</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-2 text-right font-semibold text-slate-700">
                        {formatINR(Math.round(lineTotal * 100) / 100)}
                      </td>
                      <td className="py-2">
                        <button onClick={() => removeItem(item.id)} className="p-1 text-slate-300 hover:text-red-400 transition">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Button variant="ghost" size="sm" icon={Plus} onClick={addItem}>{t.addBillItem}</Button>

          {/* Totals */}
          <div className="rounded-lg p-3 space-y-1.5 mt-1" style={{ background: "var(--seg-bg)" }}>
            <div className="flex justify-between text-sm text-slate-500">
              <span>{t.subtotal}</span><span>{formatINR(totals.subtotal)}</span>
            </div>
            {totals.totalGst > 0 && (
              <div className="flex justify-between text-sm text-slate-500">
                <span>{t.totalGst}</span><span>{formatINR(totals.totalGst)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2 mt-1" style={{ color: "var(--seg-primary)" }}>
              <span>{t.grandTotal}</span><span>{formatINR(totals.grandTotal)}</span>
            </div>
          </div>
        </FormSection>

        <FormSection title="Payment">
          <FormRow>
            <Select label={t.paymentMode} value={paymentMode} onChange={(e) => setPayMode(e.target.value)}>
              <option value="cash">{t.cash}</option>
              <option value="upi">{t.upi}</option>
              <option value="card">{t.card}</option>
              <option value="insurance">{t.insurance}</option>
            </Select>
            <Select label={t.paymentStatus} value={paymentStatus} onChange={(e) => setPayStat(e.target.value)}>
              <option value="paid">{t.paid}</option>
              <option value="pending">{t.pending}</option>
              <option value="partial">{t.partial}</option>
              <option value="waived">{t.waived}</option>
            </Select>
          </FormRow>
          <Input label={t.notes} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" />
        </FormSection>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>{t.cancel}</Button>
        <Button onClick={handleSubmit}>{t.createBill} — {formatINR(totals.grandTotal)}</Button>
      </ModalFooter>
    </Modal>
  );
}
