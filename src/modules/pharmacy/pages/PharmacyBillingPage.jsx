import { useState, useMemo } from "react";
import { Plus, Trash2, AlertTriangle, MessageSquare, Printer, Search } from "lucide-react";
import { StatCard } from "../../../shared/components/ui/StatCard.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { Modal, ModalFooter } from "../../../shared/components/ui/Modal.jsx";
import { Input, Select, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useFacility } from "../../../shared/context/FacilityContext.jsx";
import { usePharmacy } from "../context/PharmacyContext.jsx";
import { formatINR } from "../../../shared/utils/currency.js";
import { calcBillTotals, GST_SLABS } from "../../../shared/utils/gst.js";
import { generatePharmacyReceipt, printReceipt } from "../../../shared/utils/receipt.js";
import { pharmacyReceiptMessage, sendWhatsApp } from "../../../shared/utils/whatsapp.js";
import { genId } from "../../../shared/utils/id.js";

const EMPTY_ITEM = () => ({
  id: genId(), inventoryId: null, name: "", qty: 1, unitPrice: 0,
  gstSlab: 5, batchNo: "", expiry: "", scheduleType: "OTC", rxDoctorReg: "",
});

export function PharmacyBillingPage() {
  const { t, lang } = useI18n();
  const { success, error } = useToast();
  const { facility, incrementBillCounter } = useFacility();
  const { inventory, bills, createBill, todayRevenue, lowStockCount } = usePharmacy();

  const [showModal, setShowModal] = useState(false);
  const [items, setItems]         = useState([EMPTY_ITEM()]);
  const [patient, setPatient]     = useState({ nameEn: "", nameTa: "", phone: "" });
  const [rxDoctorReg, setRxReg]   = useState("");
  const [payMode, setPayMode]     = useState("cash");
  const [lastBill, setLastBill]   = useState(null);
  const [drugSearch, setDrugSearch] = useState("");
  const [searchForIdx, setSearchForIdx] = useState(null);

  const hasScheduleH  = items.some((i) => i.scheduleType === "H");
  const hasScheduleH1 = items.some((i) => i.scheduleType === "H1");
  const requiresRx    = hasScheduleH || hasScheduleH1;

  const totals = useMemo(() => calcBillTotals(items), [items]);

  const updateItem = (id, field, val) => setItems((p) => p.map((i) => i.id === id ? { ...i, [field]: val } : i));
  const removeItem = (id) => setItems((p) => p.filter((i) => i.id !== id));

  const selectInventoryDrug = (drug, idx) => {
    setItems((prev) => prev.map((item, i) => i === idx ? {
      ...item, inventoryId: drug.id, name: drug.drugName,
      unitPrice: drug.sellingPrice, gstSlab: drug.gstSlab,
      batchNo: drug.batchNo, expiry: drug.expiry, scheduleType: drug.scheduleType,
    } : item));
    setDrugSearch(""); setSearchForIdx(null);
  };

  const filteredDrugs = drugSearch
    ? inventory.filter((d) => d.drugName.toLowerCase().includes(drugSearch.toLowerCase()))
    : [];

  const handleSubmit = () => {
    if (!patient.nameEn.trim()) { error("Patient name required."); return; }
    if (items.some((i) => !i.name.trim())) { error("All items must have a drug name."); return; }
    if (requiresRx && !rxDoctorReg.trim()) {
      error("Schedule H/H1 drugs require prescribing doctor registration number."); return;
    }

    const counter = incrementBillCounter();
    const pt = { id: genId(), ...patient, uhid: `PH-${String(counter).padStart(4, "0")}` };
    const bill = createBill({ patient: pt, items, rxDoctorReg, paymentMode: payMode }, counter);
    setLastBill({ bill, patient: pt });
    success(t.billCreated);
  };

  const handlePrint = () => {
    if (!lastBill) return;
    printReceipt(generatePharmacyReceipt({ bill: lastBill.bill, patient: lastBill.patient, facility }));
  };

  const handleWhatsApp = () => {
    if (!lastBill?.patient?.phone) { error("No phone number."); return; }
    const msg = pharmacyReceiptMessage({ bill: lastBill.bill, patient: lastBill.patient, facility, lang });
    sendWhatsApp(lastBill.patient.phone, msg);
  };

  const closeModal = () => {
    setShowModal(false); setItems([EMPTY_ITEM()]); setPatient({ nameEn: "", nameTa: "", phone: "" });
    setRxReg(""); setLastBill(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.bills}        value={bills.length}              accentClass="border-l-amber-600" />
        <StatCard label={t.todayRevenue} value={formatINR(todayRevenue)}   accentClass="border-l-emerald-500" />
        <StatCard label={t.lowStockItems} value={lowStockCount}             accentClass="border-l-red-500" />
        <StatCard label="Schedule H Bills" value={bills.filter((b) => b.rxDoctorReg).length} accentClass="border-l-purple-500" />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-slate-800">{t.drugBilling}</h1>
        <Button icon={Plus} onClick={() => setShowModal(true)}>New Medicine Bill</Button>
      </div>

      {/* Bills table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                {[t.billNo, t.patientName, "Items", t.paymentMode, t.grandTotal, t.actions].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "var(--seg-primary)" }}>{bill.billNo}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{bill.patient?.nameEn}</div>
                    <div className="text-xs text-slate-400">{bill.patient?.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-slate-500">{bill.items?.length} item(s)</div>
                    {bill.rxDoctorReg && <Badge label="Schedule H" color="H" className="mt-0.5" />}
                  </td>
                  <td className="px-4 py-3"><Badge label={bill.paymentMode?.toUpperCase()} color="info" /></td>
                  <td className="px-4 py-3 font-bold" style={{ color: "var(--seg-primary)" }}>{formatINR(bill.grandTotal)}</td>
                  <td className="px-4 py-3 flex gap-1">
                    <button onClick={() => printReceipt(generatePharmacyReceipt({ bill, patient: bill.patient, facility }))}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><Printer size={14} /></button>
                    <button onClick={() => { const msg = pharmacyReceiptMessage({ bill, patient: bill.patient, facility, lang }); sendWhatsApp(bill.patient?.phone, msg); }}
                      className="p-1.5 rounded hover:bg-green-50 text-slate-400 hover:text-green-600"><MessageSquare size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bills.length === 0 && <EmptyState icon="💊" title={t.noData} />}
        </div>
      </div>

      {/* New bill modal */}
      <Modal open={showModal} onClose={closeModal} title="New Medicine Bill" size="xl">
        {lastBill ? (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-3xl">💊</div>
            <div className="text-center">
              <div className="text-xl font-bold text-slate-800">{lastBill.bill.billNo}</div>
              <div className="text-3xl font-black mt-2" style={{ color: "var(--seg-primary)" }}>{formatINR(lastBill.bill.grandTotal)}</div>
            </div>
            <div className="w-full grid grid-cols-2 gap-3">
              <Button variant="secondary" icon={Printer} onClick={handlePrint}>{t.printReceipt}</Button>
              <button onClick={handleWhatsApp} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#25D366" }}>
                📲 {t.sendWhatsApp}
              </button>
            </div>
            <ModalFooter><Button variant="ghost" onClick={closeModal}>{t.close}</Button></ModalFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Schedule H/H1 warning */}
            {hasScheduleH1 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{t.schedH1Warning}</span>
              </div>
            )}
            {hasScheduleH && !hasScheduleH1 && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{t.schedHWarning}</span>
              </div>
            )}

            <FormSection title="Patient">
              <FormRow>
                <Input label={t.patientName + " *"} value={patient.nameEn} onChange={(e) => setPatient((p) => ({ ...p, nameEn: e.target.value }))} required />
                <Input label={t.phone} value={patient.phone} onChange={(e) => setPatient((p) => ({ ...p, phone: e.target.value }))} type="tel" />
              </FormRow>
              {requiresRx && (
                <Input
                  label={t.rxDoctorReg + " * (Schedule H required)"}
                  value={rxDoctorReg} onChange={(e) => setRxReg(e.target.value)}
                  placeholder="e.g. TN-MED-12345"
                  error={requiresRx && !rxDoctorReg ? "Required for Schedule H drugs" : ""}
                />
              )}
            </FormSection>

            <FormSection title="Drug Items">
              {/* Drug search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={drugSearch}
                  onChange={(e) => { setDrugSearch(e.target.value); setSearchForIdx(items.length - 1); }}
                  placeholder="Search inventory to add drug…"
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]"
                />
                {filteredDrugs.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    {filteredDrugs.map((drug, di) => (
                      <button key={drug.id} type="button"
                        onClick={() => selectInventoryDrug(drug, searchForIdx ?? 0)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0">
                        <span className="font-semibold">{drug.drugName}</span>
                        <span className="ml-2 text-xs text-slate-400">Stock: {drug.stock} · {formatINR(drug.sellingPrice)} · {drug.scheduleType}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase">
                      <th className="text-left pb-2">Drug</th>
                      <th className="text-right pb-2 w-12">Qty</th>
                      <th className="text-right pb-2 w-20">Price</th>
                      <th className="text-center pb-2 w-16">GST%</th>
                      <th className="text-center pb-2 w-16">Schedule</th>
                      <th className="text-right pb-2 w-20">Total</th>
                      <th className="w-6" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-1.5 pr-1">
                          <input value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)}
                            placeholder="Drug name" className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[--seg-primary]" />
                          {item.batchNo && <span className="text-slate-400 text-[10px]">Batch: {item.batchNo} · Exp: {item.expiry}</span>}
                        </td>
                        <td className="py-1.5 pr-1">
                          <input type="number" min="1" value={item.qty} onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))}
                            className="w-12 border border-slate-200 rounded px-1 py-1 text-xs text-right focus:outline-none" />
                        </td>
                        <td className="py-1.5 pr-1">
                          <input type="number" min="0" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                            className="w-20 border border-slate-200 rounded px-1 py-1 text-xs text-right focus:outline-none" />
                        </td>
                        <td className="py-1.5 pr-1 text-center">
                          <select value={item.gstSlab} onChange={(e) => updateItem(item.id, "gstSlab", Number(e.target.value))}
                            className="border border-slate-200 rounded px-1 py-1 text-xs focus:outline-none">
                            {GST_SLABS.map((s) => <option key={s} value={s}>{s}%</option>)}
                          </select>
                        </td>
                        <td className="py-1.5 pr-1 text-center">
                          <select value={item.scheduleType} onChange={(e) => updateItem(item.id, "scheduleType", e.target.value)}
                            className="border border-slate-200 rounded px-1 py-1 text-xs focus:outline-none">
                            <option value="OTC">OTC</option>
                            <option value="H">Sched H</option>
                            <option value="H1">Sched H1</option>
                          </select>
                        </td>
                        <td className="py-1.5 pr-1 text-right font-semibold">
                          {formatINR(Math.round(item.unitPrice * item.qty * (1 + item.gstSlab / 100) * 100) / 100)}
                        </td>
                        <td className="py-1.5">
                          <button onClick={() => removeItem(item.id)} className="p-0.5 text-slate-300 hover:text-red-400"><Trash2 size={12} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button variant="ghost" size="sm" icon={Plus} onClick={() => setItems((p) => [...p, EMPTY_ITEM()])}>Add Drug</Button>

              <div className="rounded-lg p-3 space-y-1" style={{ background: "var(--seg-bg)" }}>
                <div className="flex justify-between text-sm text-slate-500"><span>{t.subtotal}</span><span>{formatINR(totals.subtotal)}</span></div>
                <div className="flex justify-between text-sm text-slate-500"><span>GST (multiple slabs)</span><span>{formatINR(totals.totalGst)}</span></div>
                <div className="flex justify-between text-base font-bold border-t pt-2 mt-1" style={{ color: "var(--seg-primary)" }}>
                  <span>{t.grandTotal}</span><span>{formatINR(totals.grandTotal)}</span>
                </div>
              </div>
            </FormSection>

            <FormSection title="Payment">
              <Select label={t.paymentMode} value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                <option value="cash">{t.cash}</option>
                <option value="upi">{t.upi}</option>
                <option value="card">{t.card}</option>
              </Select>
            </FormSection>

            <ModalFooter>
              <Button variant="ghost" onClick={closeModal}>{t.cancel}</Button>
              <Button onClick={handleSubmit}>{t.createBill} — {formatINR(totals.grandTotal)}</Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}
