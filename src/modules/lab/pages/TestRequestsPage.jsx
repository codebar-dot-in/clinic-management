import { useState } from "react";
import { Plus, Trash2, FlaskConical } from "lucide-react";
import { StatCard } from "../../../shared/components/ui/StatCard.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import { Modal, ModalFooter } from "../../../shared/components/ui/Modal.jsx";
import { Input, Select, FormRow, FormSection } from "../../../shared/components/ui/Input.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useFacility } from "../../../shared/context/FacilityContext.jsx";
import { useLab } from "../context/LabContext.jsx";
import { formatDate } from "../../../shared/utils/date.js";
import { formatINR } from "../../../shared/utils/currency.js";
import { genId } from "../../../shared/utils/id.js";

const COMMON_TESTS = [
  { testName: "CBC (Complete Blood Count)",       normalRange: "—",       unit: "",       price: 350,  gstSlab: 18 },
  { testName: "HbA1c",                            normalRange: "< 5.7",   unit: "%",      price: 450,  gstSlab: 18 },
  { testName: "Fasting Blood Sugar",              normalRange: "70–99",   unit: "mg/dL",  price: 120,  gstSlab: 18 },
  { testName: "Lipid Profile",                    normalRange: "< 200",   unit: "mg/dL",  price: 680,  gstSlab: 18 },
  { testName: "LFT (Liver Function)",             normalRange: "—",       unit: "",       price: 850,  gstSlab: 18 },
  { testName: "KFT (Kidney Function)",            normalRange: "—",       unit: "",       price: 750,  gstSlab: 18 },
  { testName: "Thyroid Profile (T3,T4,TSH)",      normalRange: "—",       unit: "",       price: 750,  gstSlab: 18 },
  { testName: "Urine Routine",                    normalRange: "—",       unit: "",       price: 150,  gstSlab: 18 },
  { testName: "Serum Creatinine",                 normalRange: "0.7–1.3", unit: "mg/dL",  price: 200,  gstSlab: 18 },
  { testName: "Vitamin D3",                       normalRange: "30–100",  unit: "ng/mL",  price: 900,  gstSlab: 18 },
];

const EMPTY_TEST = () => ({ id: genId(), testName: "", normalRange: "", unit: "", price: 0, gstSlab: 18 });

export function TestRequestsPage() {
  const { t } = useI18n();
  const { success, error } = useToast();
  const { facility, incrementBillCounter } = useFacility();
  const { requests, patients, createRequest, advanceStatus, pendingCount, readyCount } = useLab();

  const [showModal, setShowModal]     = useState(false);
  const [patientSearch, setPSearch]   = useState("");
  const [selectedPt, setSelectedPt]   = useState(null);
  const [refDoctor, setRefDoc]        = useState("");
  const [tests, setTests]             = useState([{ ...EMPTY_TEST() }]);
  const [payMode, setPayMode]         = useState("cash");

  const filteredPts = patients.filter((p) =>
    p.nameEn.toLowerCase().includes(patientSearch.toLowerCase()) || p.phone.includes(patientSearch)
  );

  const addTest = () => setTests((p) => [...p, EMPTY_TEST()]);
  const removeTest = (id) => setTests((p) => p.filter((t) => t.id !== id));
  const updateTest = (id, field, val) => setTests((p) => p.map((t) => t.id === id ? { ...t, [field]: val } : t));
  const addCommon = (ct) => setTests((p) => [...p, { id: genId(), ...ct, resultValue: null, isAbnormal: false }]);

  const total = tests.reduce((s, t) => s + Number(t.price || 0) * 1.18, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPt) { error("Select a patient first."); return; }
    if (tests.some((t) => !t.testName)) { error("All tests must have a name."); return; }

    const counter = incrementBillCounter();
    const bill = {
      billNo: `LAB-${new Date().getFullYear()}-${String(counter).padStart(4, "0")}`,
      grandTotal: Math.round(total * 100) / 100,
      subtotal: tests.reduce((s, t) => s + Number(t.price || 0), 0),
      totalGst: Math.round((total - tests.reduce((s, t) => s + Number(t.price || 0), 0)) * 100) / 100,
      paymentMode: payMode, paymentStatus: "paid",
    };
    createRequest({ patient: selectedPt, referringDoctor: refDoctor, tests, bill }, counter);
    success("Test request created.");
    setShowModal(false);
    setSelectedPt(null); setPSearch(""); setTests([EMPTY_TEST()]); setRefDoc("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.testRequests} value={requests.length} icon={FlaskConical} accentClass="border-l-blue-600" />
        <StatCard label="Pending"        value={pendingCount}     icon={null}          accentClass="border-l-amber-500" />
        <StatCard label={t.reportReady} value={readyCount}        icon={null}          accentClass="border-l-purple-500" />
        <StatCard label={t.reportDelivered} value={requests.filter((r) => r.status === "delivered").length} icon={null} accentClass="border-l-emerald-500" />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-slate-800">{t.testRequests}</h1>
        <Button icon={Plus} onClick={() => setShowModal(true)}>New Request</Button>
      </div>

      {/* Requests list */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                {[t.reqNo, t.patientName, "Tests", t.referringDoctor, t.status, t.grandTotal, t.actions].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "var(--seg-primary)" }}>{req.reqNo}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{req.patient?.nameEn}</div>
                    <div className="text-xs text-slate-400">{req.patient?.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-slate-500">{req.tests?.length} test{req.tests?.length !== 1 ? "s" : ""}</div>
                    <div className="text-xs text-slate-400 truncate max-w-36">{req.tests?.map((t) => t.testName).join(", ")}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{req.referringDoctor}</td>
                  <td className="px-4 py-3"><Badge label={t[req.status] ?? req.status} color={req.status} /></td>
                  <td className="px-4 py-3 font-bold" style={{ color: "var(--seg-primary)" }}>
                    {req.bill ? formatINR(req.bill.grandTotal) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {req.status !== "delivered" && (
                      <Button size="sm" variant="secondary" onClick={() => advanceStatus(req.id)}>
                        ▶ Next
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {requests.length === 0 && <EmptyState icon="🔬" title={t.noData} />}
        </div>
      </div>

      {/* New request modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Test Request" size="lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FormSection title="Patient">
            <input
              value={patientSearch} onChange={(e) => setPSearch(e.target.value)}
              placeholder={t.searchPatient}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]"
            />
            {patientSearch && (
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-36 overflow-y-auto">
                {filteredPts.slice(0, 5).map((pt) => (
                  <button key={pt.id} type="button" onClick={() => { setSelectedPt(pt); setPSearch(""); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0">
                    <span className="font-semibold">{pt.nameEn}</span>
                    <span className="text-slate-400 ml-2 text-xs">{pt.phone}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedPt && <div className="text-sm font-semibold text-emerald-600">✓ {selectedPt.nameEn} selected</div>}
            <Input label={t.referringDoctor} value={refDoctor} onChange={(e) => setRefDoc(e.target.value)} placeholder="Dr. Name (Specialty)" />
          </FormSection>

          <FormSection title="Quick Add Common Tests">
            <div className="flex flex-wrap gap-2">
              {COMMON_TESTS.slice(0, 6).map((ct) => (
                <button key={ct.testName} type="button" onClick={() => addCommon(ct)}
                  className="text-xs px-2 py-1 rounded-full border border-slate-200 hover:border-[--seg-primary] hover:text-[--seg-primary] transition">
                  + {ct.testName}
                </button>
              ))}
            </div>
          </FormSection>

          <FormSection title={t.tests}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase border-b border-slate-100">
                    <th className="text-left pb-2">Test Name</th>
                    <th className="text-right pb-2 w-24">Price (₹)</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tests.map((test) => (
                    <tr key={test.id}>
                      <td className="py-1.5 pr-2">
                        <input value={test.testName} onChange={(e) => updateTest(test.id, "testName", e.target.value)}
                          placeholder="Test name" className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]" />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input type="number" value={test.price} onChange={(e) => updateTest(test.id, "price", Number(e.target.value))}
                          className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[--seg-primary]" />
                      </td>
                      <td className="py-1.5">
                        <button type="button" onClick={() => removeTest(test.id)} className="p-1 text-slate-300 hover:text-red-400">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button type="button" variant="ghost" size="sm" icon={Plus} onClick={addTest}>{t.addTest}</Button>
            <div className="text-sm font-bold text-right" style={{ color: "var(--seg-primary)" }}>
              Total (incl. 18% GST): {formatINR(Math.round(total * 100) / 100)}
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
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>{t.cancel}</Button>
            <Button type="submit">Create Request</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
