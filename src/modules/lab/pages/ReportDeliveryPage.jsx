import { useState } from "react";
import { MessageSquare, Printer, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import { Modal, ModalFooter } from "../../../shared/components/ui/Modal.jsx";
import { Input } from "../../../shared/components/ui/Input.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useFacility } from "../../../shared/context/FacilityContext.jsx";
import { useLab } from "../context/LabContext.jsx";
import { formatINR } from "../../../shared/utils/currency.js";
import { generateLabReport, printReceipt } from "../../../shared/utils/receipt.js";
import { labReportMessage, sendWhatsApp } from "../../../shared/utils/whatsapp.js";

export function ReportDeliveryPage() {
  const { t, lang } = useI18n();
  const { success, error } = useToast();
  const { facility } = useFacility();
  const { requests, advanceStatus, updateTestResult } = useLab();

  const [selectedReq, setSelectedReq] = useState(null);
  const [editMode, setEditMode]        = useState(false);
  const [localResults, setLocalResults] = useState({});

  const readyRequests = requests.filter((r) => r.status === "ready" || r.status === "delivered");

  const openEntry = (req) => {
    setSelectedReq(req);
    setLocalResults({});
    setEditMode(req.status === "ready");
  };

  const setResult = (testId, field, value) => {
    setLocalResults((prev) => ({
      ...prev,
      [testId]: { ...(prev[testId] ?? {}), [field]: value },
    }));
  };

  const saveResults = () => {
    if (!selectedReq) return;
    Object.entries(localResults).forEach(([testId, updates]) => {
      updateTestResult(selectedReq.id, testId, updates);
    });
    success("Results saved.");
    setEditMode(false);
  };

  const handlePrint = (req) => {
    const merged = { ...req, tests: req.tests.map((t) => ({ ...t, ...(localResults[t.id] ?? {}) })) };
    printReceipt(generateLabReport({ request: merged, patient: req.patient, facility }));
  };

  const handleWhatsApp = (req) => {
    if (!req.patient?.phone) { error("No phone number for patient."); return; }
    const msg = labReportMessage({ request: req, patient: req.patient, facility, lang });
    sendWhatsApp(req.patient.phone, msg);
    if (req.status === "ready") advanceStatus(req.id);
    success(t.reportSent);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-base font-bold text-slate-800">{t.reportDelivery}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ready reports list */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-slate-700">
            {t.reportReady} ({readyRequests.length})
          </div>
          <div className="divide-y divide-slate-50 overflow-y-auto max-h-[500px]">
            {readyRequests.length === 0 && <EmptyState icon="📊" title="No reports ready yet." />}
            {readyRequests.map((req) => {
              const hasAbnormal = req.tests.some((t) => t.isAbnormal);
              return (
                <button
                  key={req.id}
                  onClick={() => openEntry(req)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${selectedReq?.id === req.id ? "bg-[--seg-bg]" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold" style={{ color: "var(--seg-primary)" }}>{req.reqNo}</span>
                      <span className="font-semibold text-slate-800 text-sm ml-2">{req.patient?.nameEn}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasAbnormal && <AlertTriangle size={14} className="text-red-500" />}
                      <Badge label={t[req.status] ?? req.status} color={req.status} />
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{req.tests?.map((t) => t.testName).join(", ")}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report detail + actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {!selectedReq ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <span className="text-4xl mb-3">📊</span>
              <p className="text-slate-400 text-sm">Select a report to view and send</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{selectedReq.patient?.nameEn}</div>
                  <div className="text-xs text-slate-400">{selectedReq.reqNo} · {selectedReq.referringDoctor}</div>
                </div>
                <Badge label={t[selectedReq.status] ?? selectedReq.status} color={selectedReq.status} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase">
                      <th className="text-left px-4 py-2.5">Test</th>
                      <th className="text-center px-4 py-2.5">Result</th>
                      <th className="text-center px-4 py-2.5">Normal</th>
                      <th className="text-center px-4 py-2.5">Status</th>
                      <th className="text-right px-4 py-2.5">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedReq.tests?.map((test) => {
                      const local = localResults[test.id] ?? {};
                      const result = local.resultValue !== undefined ? local.resultValue : test.resultValue;
                      const isAbnormal = local.isAbnormal !== undefined ? local.isAbnormal : test.isAbnormal;
                      return (
                        <tr key={test.id}>
                          <td className="px-4 py-3 font-medium text-slate-700">{test.testName}</td>
                          <td className="px-4 py-3 text-center">
                            {editMode ? (
                              <input
                                value={result ?? ""}
                                onChange={(e) => setResult(test.id, "resultValue", e.target.value)}
                                className="w-20 border border-slate-200 rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-[--seg-primary]"
                                placeholder="value"
                              />
                            ) : (
                              <span className={result ? (isAbnormal ? "text-red-600 font-bold" : "text-emerald-600 font-semibold") : "text-slate-400"}>
                                {result ?? "—"} {test.unit}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-slate-400">{test.normalRange}</td>
                          <td className="px-4 py-3 text-center">
                            {editMode ? (
                              <input
                                type="checkbox" checked={isAbnormal}
                                onChange={(e) => setResult(test.id, "isAbnormal", e.target.checked)}
                                className="w-4 h-4 cursor-pointer"
                              />
                            ) : (
                              isAbnormal ? <span className="text-red-500 text-xs font-bold">{t.abnormalFlag}</span>
                                         : <span className="text-emerald-500 text-xs">✓ Normal</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-slate-500">{formatINR(test.price ?? 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedReq.bill && (
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between text-sm font-bold">
                  <span>{t.grandTotal}</span>
                  <span style={{ color: "var(--seg-primary)" }}>{formatINR(selectedReq.bill.grandTotal)}</span>
                </div>
              )}

              <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap gap-2">
                {editMode ? (
                  <>
                    <Button variant="ghost" onClick={() => setEditMode(false)}>{t.cancel}</Button>
                    <Button icon={CheckCircle} onClick={saveResults}>Save Results</Button>
                  </>
                ) : (
                  <>
                    {selectedReq.status === "ready" && (
                      <Button variant="secondary" onClick={() => setEditMode(true)}>{t.enterResults}</Button>
                    )}
                    <Button variant="secondary" icon={Printer} onClick={() => handlePrint(selectedReq)}>{t.printReceipt}</Button>
                    <button
                      onClick={() => handleWhatsApp(selectedReq)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:brightness-90"
                      style={{ background: "#25D366" }}
                    >
                      <MessageSquare size={15} /> 📲 {t.sendWhatsApp}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* All requests table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-slate-700">All Requests</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase">
                {[t.reqNo, t.patientName, t.referringDoctor, "Tests", t.status, t.grandTotal, t.actions].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "var(--seg-primary)" }}>{req.reqNo}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{req.patient?.nameEn}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{req.referringDoctor}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{req.tests?.length} test(s)</td>
                  <td className="px-4 py-3"><Badge label={t[req.status] ?? req.status} color={req.status} /></td>
                  <td className="px-4 py-3 font-bold" style={{ color: "var(--seg-primary)" }}>
                    {req.bill ? formatINR(req.bill.grandTotal) : "—"}
                  </td>
                  <td className="px-4 py-3 flex gap-1">
                    <button onClick={() => openEntry(req)} className="text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
