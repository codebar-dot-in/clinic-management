import { useState, useMemo } from "react";
import { Printer, MessageCircle, CheckCircle } from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { StatCard } from "../../../shared/components/ui/StatCard.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useToast } from "../../../shared/context/ToastContext.jsx";
import { useClinic } from "../context/ClinicContext.jsx";
import { formatINR } from "../../../shared/utils/currency.js";
import { formatDate } from "../../../shared/utils/date.js";
import { printReceipt, generateClinicReceipt } from "../../../shared/utils/receipt.js";
import { sendWhatsApp, clinicReceiptMessage } from "../../../shared/utils/whatsapp.js";
import { TrendingUp, ReceiptText, Clock, CreditCard } from "lucide-react";

const MOCK_FACILITY = { nameEn: "Clinic", nameTa: "கிளினிக்" };

export function BillingHistoryPage() {
  const { lang }     = useI18n();
  const { success }  = useToast();
  const { bills, updateBill } = useClinic();

  const [search, setSearch]     = useState("");
  const [statusF, setStatusF]   = useState("all");
  const [modeF, setModeF]       = useState("all");
  const [doctorF, setDoctorF]   = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [sortKey, setSortKey]   = useState("date");
  const [sortDir, setSortDir]   = useState("desc");

  const uniqueDoctors = [...new Set(bills.map((b) => b.doctor).filter(Boolean))];

  const filtered = useMemo(() => {
    let res = bills.filter((b) => {
      const q = search.toLowerCase();
      const matchQ = !q || b.patient?.nameEn?.toLowerCase().includes(q) || b.billNo.toLowerCase().includes(q);
      if (!matchQ) return false;
      if (statusF !== "all" && b.paymentStatus !== statusF) return false;
      if (modeF !== "all" && b.paymentMode !== modeF) return false;
      if (doctorF !== "all" && b.doctor !== doctorF) return false;
      if (dateFrom && b.createdAt < dateFrom) return false;
      if (dateTo && b.createdAt > dateTo + "T23:59:59") return false;
      return true;
    });

    res = [...res].sort((a, b) => {
      let av, bv;
      if (sortKey === "date")   { av = a.createdAt; bv = b.createdAt; }
      else                      { av = a.grandTotal; bv = b.grandTotal; }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return res;
  }, [bills, search, statusF, modeF, doctorF, dateFrom, dateTo, sortKey, sortDir]);

  const totalRevenue = filtered.filter((b) => b.paymentStatus === "paid").reduce((s, b) => s + b.grandTotal, 0);
  const totalPending = filtered.filter((b) => b.paymentStatus === "pending").reduce((s, b) => s + b.grandTotal, 0);
  const totalGst     = filtered.reduce((s, b) => s + (b.totalGst ?? 0), 0);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const handlePrint = (bill) => printReceipt(generateClinicReceipt(bill, MOCK_FACILITY));

  const handleWhatsApp = (bill) => {
    sendWhatsApp(bill.patient?.phone, clinicReceiptMessage(bill, MOCK_FACILITY));
  };

  const markPaid = (bill) => {
    updateBill(bill.id, { paymentStatus: "paid" });
    success(lang === "en" ? "Marked as paid" : "பணம் செலுத்தியதாக குறிக்கப்பட்டது");
  };

  const SortTh = ({ k, children }) => (
    <th className="text-left px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-600 transition"
      onClick={() => toggleSort(k)}>
      {children} {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <h1 className="text-base font-bold text-slate-800">
        {lang === "en" ? "Billing History" : "பில் வரலாறு"}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={lang === "en" ? "Total Collected" : "மொத்த வசூல்"} value={formatINR(totalRevenue)} icon={TrendingUp} />
        <StatCard label={lang === "en" ? "Pending"         : "நிலுவை"       } value={formatINR(totalPending)} icon={Clock} />
        <StatCard label={lang === "en" ? "Total GST"       : "மொத்த GST"    } value={formatINR(totalGst)}     icon={CreditCard} />
        <StatCard label={lang === "en" ? "Bills"           : "பில்கள்"      } value={filtered.length}          icon={ReceiptText} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === "en" ? "Patient name / Bill no…" : "நோயாளி / பில் எண்…"}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary] w-48" />

        <select value={statusF} onChange={(e) => setStatusF(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]">
          <option value="all">{lang === "en" ? "All Status" : "அனைத்து நிலை"}</option>
          <option value="paid">{lang === "en" ? "Paid" : "செலுத்தப்பட்டது"}</option>
          <option value="pending">{lang === "en" ? "Pending" : "நிலுவை"}</option>
        </select>

        <select value={modeF} onChange={(e) => setModeF(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]">
          <option value="all">{lang === "en" ? "All Modes" : "அனைத்து முறை"}</option>
          {["cash", "upi", "card", "insurance"].map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
        </select>

        <select value={doctorF} onChange={(e) => setDoctorF(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]">
          <option value="all">{lang === "en" ? "All Doctors" : "அனைத்து மருத்துவர்"}</option>
          {uniqueDoctors.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>{lang === "en" ? "From" : "இருந்து"}</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]" />
          <span>{lang === "en" ? "To" : "வரை"}</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[--seg-primary]" />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-red-400 hover:text-red-600 text-xs">✕</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                <th className="text-left px-4 py-2.5 font-semibold">{lang === "en" ? "Bill No" : "பில் எண்"}</th>
                <SortTh k="date">{lang === "en" ? "Date" : "தேதி"}</SortTh>
                <th className="text-left px-4 py-2.5 font-semibold">{lang === "en" ? "Patient" : "நோயாளி"}</th>
                <th className="text-left px-4 py-2.5 font-semibold">{lang === "en" ? "Doctor" : "மருத்துவர்"}</th>
                <th className="text-left px-4 py-2.5 font-semibold">{lang === "en" ? "Items" : "பொருட்கள்"}</th>
                <th className="text-left px-4 py-2.5 font-semibold">GST</th>
                <SortTh k="amount">{lang === "en" ? "Total" : "மொத்தம்"}</SortTh>
                <th className="text-left px-4 py-2.5 font-semibold">{lang === "en" ? "Mode" : "முறை"}</th>
                <th className="text-left px-4 py-2.5 font-semibold">{lang === "en" ? "Status" : "நிலை"}</th>
                <th className="text-left px-4 py-2.5 font-semibold">{lang === "en" ? "Actions" : "செயல்கள்"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((bill) => (
                <tr key={bill.id} className={`hover:bg-slate-50 transition ${bill.paymentStatus === "pending" ? "bg-amber-50/30" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{bill.billNo}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(new Date(bill.createdAt))}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800 text-sm">{bill.patient?.nameEn}</p>
                    <p className="text-xs text-slate-400">{bill.patient?.uhid}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{bill.doctor || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{bill.items?.length ?? 0}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatINR(bill.totalGst ?? 0)}</td>
                  <td className="px-4 py-3 font-bold text-sm" style={{ color: "var(--seg-primary)" }}>{formatINR(bill.grandTotal)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 uppercase">{bill.paymentMode}</td>
                  <td className="px-4 py-3"><Badge label={bill.paymentStatus} color={bill.paymentStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => handlePrint(bill)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 transition" title="Print">
                        <Printer size={13} />
                      </button>
                      <button onClick={() => handleWhatsApp(bill)} className="p-1.5 rounded hover:bg-emerald-50 text-emerald-500 transition" title="WhatsApp">
                        <MessageCircle size={13} />
                      </button>
                      {bill.paymentStatus === "pending" && (
                        <button onClick={() => markPaid(bill)} className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition" title={lang === "en" ? "Mark Paid" : "செலுத்தியதாக குறி"}>
                          <CheckCircle size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200 text-xs font-bold text-slate-500">
                  <td colSpan={6} className="px-4 py-2.5 uppercase tracking-wide">{lang === "en" ? "Filtered Total" : "வடிகட்டிய மொத்தம்"}</td>
                  <td className="px-4 py-2.5 font-black text-sm" style={{ color: "var(--seg-primary)" }}>{formatINR(totalRevenue)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
          {filtered.length === 0 && <EmptyState icon="🧾" title={lang === "en" ? "No bills found" : "பில்கள் கிடைக்கவில்லை"} />}
        </div>
      </div>
    </div>
  );
}
