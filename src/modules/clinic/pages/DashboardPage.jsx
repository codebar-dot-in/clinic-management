import { Link, useNavigate } from "react-router-dom";
import { CalendarPlus, UserPlus, ReceiptText, Clock, CheckCircle2, Users, Stethoscope, TrendingUp, ClipboardCheck, PlusCircle } from "lucide-react";
import { StatCard } from "../../../shared/components/ui/StatCard.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { useI18n } from "../../../shared/context/I18nContext.jsx";
import { useClinic } from "../context/ClinicContext.jsx";
import { formatINR } from "../../../shared/utils/currency.js";
import { formatDate } from "../../../shared/utils/date.js";

export function DashboardPage() {
  const { lang } = useI18n();
  const navigate  = useNavigate();
  const {
    patients, appointments, bills, doctors,
    todayRevenue, pendingCount, completedCount,
    activeDoctorCount, todayBillCount,
  } = useClinic();

  const todayPrefix  = new Date().toISOString().split("T")[0];
  const todayAppts   = appointments.filter((a) => a.date?.startsWith(todayPrefix));
  const inProgress   = appointments.filter((a) => a.consultStatus === "inProgress");
  const recentBills  = [...bills].slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-800">
            {lang === "en" ? "Dashboard" : "டாஷ்போர்டு"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{formatDate(new Date())}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" icon={UserPlus} onClick={() => navigate("/clinic/patients")}>
            {lang === "en" ? "New Patient" : "நோயாளி சேர்"}
          </Button>
          <Button size="sm" icon={CalendarPlus} onClick={() => navigate("/clinic/appointments")}>
            {lang === "en" ? "Book Appointment" : "சந்திப்பு பதிவு"}
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={lang === "en" ? "Today's OPD" : "இன்றைய OPD"}
          value={todayAppts.length || appointments.length}
          icon={Users}
          trend={`${completedCount} completed`}
        />
        <StatCard
          label={lang === "en" ? "Queue Waiting" : "காத்திருக்கும் நோயாளி"}
          value={pendingCount}
          icon={Clock}
          trend={inProgress.length > 0 ? `${inProgress.length} in progress` : "Queue clear"}
        />
        <StatCard
          label={lang === "en" ? "Today's Revenue" : "இன்றைய வருவாய்"}
          value={formatINR(todayRevenue)}
          icon={TrendingUp}
          trend={`${todayBillCount} bills`}
        />
        <StatCard
          label={lang === "en" ? "Active Doctors" : "செயலில் உள்ள மருத்துவர்"}
          value={activeDoctorCount}
          icon={Stethoscope}
          trend={`of ${doctors.length} total`}
        />
      </div>

      {/* Today's Queue + Recent Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Today's queue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-700">
              {lang === "en" ? "Today's Queue" : "இன்றைய வரிசை"}
            </h2>
            <Link to="/clinic/appointments" className="text-xs font-semibold hover:underline" style={{ color: "var(--seg-primary)" }}>
              {lang === "en" ? "View all →" : "அனைத்தும் →"}
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {appointments.slice(0, 8).map((appt) => (
              <div key={appt.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-xs font-bold w-14 shrink-0" style={{ color: "var(--seg-primary)" }}>{appt.token}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{appt.patient?.nameEn}</p>
                  <p className="text-xs text-slate-400 truncate">{appt.complaint}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{appt.time}</span>
                <Badge label={appt.consultStatus} color={appt.consultStatus} />
              </div>
            ))}
            {appointments.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">
                {lang === "en" ? "No appointments today" : "இன்று சந்திப்புகள் இல்லை"}
              </p>
            )}
          </div>
        </div>

        {/* Recent bills */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-700">
              {lang === "en" ? "Recent Bills" : "சமீபத்திய பில்கள்"}
            </h2>
            <Link to="/clinic/history" className="text-xs font-semibold hover:underline" style={{ color: "var(--seg-primary)" }}>
              {lang === "en" ? "View all →" : "அனைத்தும் →"}
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentBills.map((bill) => (
              <div key={bill.id} className="flex items-center gap-3 px-4 py-2.5">
                <ReceiptText size={14} className="text-slate-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-slate-500">{bill.billNo}</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{bill.patient?.nameEn}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: "var(--seg-primary)" }}>{formatINR(bill.grandTotal)}</p>
                  <Badge label={bill.paymentStatus} color={bill.paymentStatus} />
                </div>
              </div>
            ))}
            {bills.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">
                {lang === "en" ? "No bills yet" : "பில்கள் இல்லை"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Create */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <PlusCircle size={15} style={{ color: "var(--seg-primary)" }} />
          {lang === "en" ? "Quick Create" : "விரைவு உருவாக்கம்"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: UserPlus,       label: lang === "en" ? "New Patient"      : "புதிய நோயாளி",     sub: lang === "en" ? "Register patient"       : "நோயாளி பதிவு",    path: "/clinic/patients/new",       color: "#0d7a6e" },
            { icon: CalendarPlus,   label: lang === "en" ? "Book Appointment" : "சந்திப்பு பதிவு",  sub: lang === "en" ? "Schedule appointment"   : "சந்திப்பு திட்டம்", path: "/clinic/appointments/new",   color: "#2563eb" },
            { icon: ClipboardCheck, label: lang === "en" ? "New Consultation" : "புதிய ஆலோசனை",   sub: lang === "en" ? "Record a visit"         : "வருகை பதிவு",     path: "/clinic/consultation",       color: "#7c3aed" },
            { icon: Stethoscope,    label: lang === "en" ? "Add Doctor"       : "மருத்துவர் சேர்",  sub: lang === "en" ? "Register new doctor"    : "மருத்துவர் பதிவு", path: "/clinic/doctors/new",        color: "#b86a10" },
          ].map(({ icon: Icon, label, sub, path, color }) => (
            <button key={path} onClick={() => navigate(path)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-100 hover:border-[--seg-primary] hover:shadow-sm transition text-center group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition"
                style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick stats — Patients + Doctors summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--seg-bg)" }}>
            <Users size={18} style={{ color: "var(--seg-primary)" }} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{patients.length}</p>
            <p className="text-xs text-slate-400">{lang === "en" ? "Total Patients" : "மொத்த நோயாளிகள்"}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--seg-bg)" }}>
            <Stethoscope size={18} style={{ color: "var(--seg-primary)" }} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{doctors.length}</p>
            <p className="text-xs text-slate-400">{lang === "en" ? "Total Doctors" : "மொத்த மருத்துவர்கள்"}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--seg-bg)" }}>
            <CheckCircle2 size={18} style={{ color: "var(--seg-primary)" }} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{bills.length}</p>
            <p className="text-xs text-slate-400">{lang === "en" ? "Total Bills" : "மொத்த பில்கள்"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
