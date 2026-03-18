import { useState } from "react";
import { UserPlus, Search, ReceiptText, MessageSquare, Printer } from "lucide-react";
import { StatCard } from "../../../shared/components/ui/StatCard.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useFacility } from "../../../shared/context/FacilityContext.jsx";
import { useClinic } from "../context/ClinicContext.jsx";
import { formatINR } from "../../../shared/utils/currency.js";
import { formatDate } from "../../../shared/utils/date.js";
import { generateClinicReceipt, printReceipt } from "../../../shared/utils/receipt.js";
import { clinicReceiptMessage, sendWhatsApp } from "../../../shared/utils/whatsapp.js";
import { AddPatientModal } from "../components/AddPatientModal.jsx";
import { BillModal } from "../components/BillModal.jsx";

export function OPDBillingPage() {
  const { t, lang } = useI18n();
  const { facility } = useFacility();
  const { bills, appointments, updateBill, todayRevenue, pendingCount, completedCount, totalOPD } = useClinic();

  const [search, setSearch]               = useState("");
  const [showAddPatient, setAddPatient]   = useState(false);
  const [billTarget, setBillTarget]       = useState(null); // { patient, appointmentId }
  const [filterStatus, setFilterStatus]   = useState("all");

  const filteredBills = bills.filter((b) => {
    const q = search.toLowerCase();
    const matchQ = b.patient?.nameEn?.toLowerCase().includes(q) ||
                   b.billNo?.toLowerCase().includes(q) ||
                   b.patient?.phone?.includes(q);
    const matchS = filterStatus === "all" || b.paymentStatus === filterStatus;
    return matchQ && matchS;
  });

  const openBillFor = (appt) => setBillTarget({ patient: appt.patient, appointmentId: appt.id });

  const handleMarkPaid = (billId) => updateBill(billId, { paymentStatus: "paid" });

  const handlePrint = (bill) => {
    printReceipt(generateClinicReceipt({ bill, patient: bill.patient, facility }));
  };

  const handleWhatsApp = (bill) => {
    const msg = clinicReceiptMessage({ bill, patient: bill.patient, facility, lang });
    sendWhatsApp(bill.patient?.phone, msg);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.todayOPD}       value={totalOPD}                icon={ReceiptText}  accentClass="border-l-teal-600" />
        <StatCard label={t.todayRevenue}   value={formatINR(todayRevenue)} icon={null}         accentClass="border-l-emerald-500" />
        <StatCard label={t.pendingPatients} value={pendingCount}            icon={null}         accentClass="border-l-amber-500" />
        <StatCard label={t.completedToday} value={completedCount}          icon={null}         accentClass="border-l-blue-500" />
      </div>

      {/* Quick bill from today's queue */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-sm">{t.opdQueue} — {t.today}</h2>
          <Button size="sm" icon={UserPlus} onClick={() => setAddPatient(true)}>{t.addPatient}</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                {[t.token, t.patientName, t.complaint, t.consultStatus, t.actions].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-bold" style={{ color: "var(--seg-primary)" }}>{appt.token}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{appt.patient?.nameEn}</div>
                    <div className="text-xs text-slate-400">{appt.time} · {appt.doctor}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-48 truncate">{appt.complaint}</td>
                  <td className="px-4 py-3"><Badge label={t[appt.consultStatus] ?? appt.consultStatus} color={appt.consultStatus} /></td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="secondary" icon={ReceiptText} onClick={() => openBillFor(appt)}>
                      {t.createBill}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && (
            <EmptyState icon="📋" title={t.noAppointments} />
          )}
        </div>
      </div>

      {/* Bills list */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 flex-wrap">
          <h2 className="font-bold text-slate-800 text-sm">{t.bills}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPatient}
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[--seg-primary] w-44"
              />
            </div>
            <select
              value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
            >
              <option value="all">{t.all}</option>
              <option value="paid">{t.paid}</option>
              <option value="pending">{t.pending}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                {[t.billNo, t.patientName, t.doctorName, t.grandTotal, t.paymentMode, t.paymentStatus, t.actions].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "var(--seg-primary)" }}>{bill.billNo}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{bill.patient?.nameEn}</div>
                    <div className="text-xs text-slate-400">{bill.patient?.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{bill.doctor}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: "var(--seg-primary)" }}>{formatINR(bill.grandTotal)}</td>
                  <td className="px-4 py-3"><Badge label={bill.paymentMode?.toUpperCase()} color="info" /></td>
                  <td className="px-4 py-3"><Badge label={t[bill.paymentStatus] ?? bill.paymentStatus} color={bill.paymentStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {bill.paymentStatus === "pending" && (
                        <Button size="sm" variant="success" onClick={() => handleMarkPaid(bill.id)}>{t.markPaid}</Button>
                      )}
                      <button onClick={() => handlePrint(bill)} title={t.printReceipt} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                        <Printer size={14} />
                      </button>
                      <button onClick={() => handleWhatsApp(bill)} title={t.sendWhatsApp} className="p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600">
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBills.length === 0 && <EmptyState icon="🧾" title={t.noData} />}
        </div>
      </div>

      {/* Modals */}
      <AddPatientModal open={showAddPatient} onClose={() => setAddPatient(false)} />
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
