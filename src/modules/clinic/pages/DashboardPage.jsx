import { Link, useNavigate } from "react-router-dom";
import { 
  CalendarPlus, UserPlus, ReceiptText, Clock, CheckCircle2, 
  Users, Stethoscope, TrendingUp, ClipboardCheck, PlusCircle,
  ArrowRight, Calendar, Activity, CreditCard, ChevronRight
} from "lucide-react";
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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return lang === "en" ? "Good Morning" : "காலை வணக்கம்";
    if (hour < 17) return lang === "en" ? "Good Afternoon" : "மதிய வணக்கம்";
    return lang === "en" ? "Good Evening" : "மாலை வணக்கம்";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{greeting()}</p>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "en" ? "Dashboard" : "டாஷ்போர்டு"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(new Date())}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" icon={UserPlus} onClick={() => navigate("/clinic/patients/new")}>
            {lang === "en" ? "New Patient" : "நோயாளி சேர்"}
          </Button>
          <Button size="sm" icon={CalendarPlus} onClick={() => navigate("/clinic/appointments/new")}>
            {lang === "en" ? "Book Appointment" : "சந்திப்பு பதிவு"}
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={lang === "en" ? "Today's OPD" : "இன்றைய OPD"}
          value={todayAppts.length || appointments.length}
          icon={Users}
          trend={`${completedCount} ${lang === "en" ? "completed" : "முடிந்தது"}`}
        />
        <StatCard
          label={lang === "en" ? "Queue Waiting" : "காத்திருக்கும் நோயாளி"}
          value={pendingCount}
          icon={Clock}
          trend={inProgress.length > 0 
            ? `${inProgress.length} ${lang === "en" ? "in progress" : "நடைபெறுகிறது"}`
            : (lang === "en" ? "Queue clear" : "வரிசை காலி")
          }
        />
        <StatCard
          label={lang === "en" ? "Today's Revenue" : "இன்றைய வருவாய்"}
          value={formatINR(todayRevenue)}
          icon={TrendingUp}
          trend={`${todayBillCount} ${lang === "en" ? "bills" : "பில்கள்"}`}
        />
        <StatCard
          label={lang === "en" ? "Active Doctors" : "செயலில் உள்ள மருத்துவர்"}
          value={activeDoctorCount}
          icon={Stethoscope}
          trend={`${lang === "en" ? "of" : ""} ${doctors.length} ${lang === "en" ? "total" : "மொத்தம்"}`}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Queue - Spans 2 columns */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--seg-bg)" }}
              >
                <Calendar size={18} style={{ color: "var(--seg-primary)" }} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  {lang === "en" ? "Today's Queue" : "இன்றைய வரிசை"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {appointments.length} {lang === "en" ? "appointments" : "சந்திப்புகள்"}
                </p>
              </div>
            </div>
            <Link 
              to="/clinic/appointments" 
              className="flex items-center gap-1 text-xs font-semibold hover:underline transition-colors"
              style={{ color: "var(--seg-primary)" }}
            >
              {lang === "en" ? "View all" : "அனைத்தும்"}
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {appointments.slice(0, 6).map((appt, index) => (
              <div 
                key={appt.id} 
                className="flex items-center gap-4 px-5 py-3 hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/clinic/consultation/${appt.id}`)}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ background: "var(--seg-bg)", color: "var(--seg-primary)" }}
                >
                  {appt.token}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {appt.patient?.nameEn}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {appt.complaint}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{appt.time}</p>
                  <Badge label={appt.consultStatus} color={appt.consultStatus} size="xs" />
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Calendar size={20} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {lang === "en" ? "No appointments today" : "இன்று சந்திப்புகள் இல்லை"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bills */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--seg-bg)" }}
              >
                <CreditCard size={18} style={{ color: "var(--seg-primary)" }} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  {lang === "en" ? "Recent Bills" : "சமீபத்திய பில்கள்"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {bills.length} {lang === "en" ? "total" : "மொத்தம்"}
                </p>
              </div>
            </div>
            <Link 
              to="/clinic/history" 
              className="flex items-center gap-1 text-xs font-semibold hover:underline transition-colors"
              style={{ color: "var(--seg-primary)" }}
            >
              {lang === "en" ? "View all" : "அனைத்தும்"}
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentBills.map((bill, index) => (
              <div 
                key={bill.id} 
                className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <ReceiptText size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-muted-foreground">{bill.billNo}</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {bill.patient?.nameEn}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: "var(--seg-primary)" }}>
                    {formatINR(bill.grandTotal)}
                  </p>
                  <Badge label={bill.paymentStatus} color={bill.paymentStatus} size="xs" />
                </div>
              </div>
            ))}
            {bills.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <ReceiptText size={20} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {lang === "en" ? "No bills yet" : "பில்கள் இல்லை"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Create Section */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--seg-bg)" }}
          >
            <PlusCircle size={18} style={{ color: "var(--seg-primary)" }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              {lang === "en" ? "Quick Actions" : "விரைவு செயல்கள்"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {lang === "en" ? "Common tasks at your fingertips" : "பொதுவான பணிகள்"}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { 
              icon: UserPlus, 
              label: lang === "en" ? "New Patient" : "புதிய நோயாளி", 
              sub: lang === "en" ? "Register patient" : "நோயாளி பதிவு", 
              path: "/clinic/patients/new", 
              color: "#0d9488" 
            },
            { 
              icon: CalendarPlus, 
              label: lang === "en" ? "Book Appointment" : "சந்திப்பு பதிவு", 
              sub: lang === "en" ? "Schedule appointment" : "சந்திப்பு திட்டம்", 
              path: "/clinic/appointments/new", 
              color: "#2563eb" 
            },
            { 
              icon: ClipboardCheck, 
              label: lang === "en" ? "New Consultation" : "புதிய ஆலோசனை", 
              sub: lang === "en" ? "Record a visit" : "வருகை பதிவு", 
              path: "/clinic/consultation", 
              color: "#7c3aed" 
            },
            { 
              icon: Stethoscope, 
              label: lang === "en" ? "Add Doctor" : "மருத்துவர் சேர்", 
              sub: lang === "en" ? "Register new doctor" : "மருத்துவர் பதிவு", 
              path: "/clinic/doctors/new", 
              color: "#d97706" 
            },
          ].map(({ icon: Icon, label, sub, path, color }) => (
            <button 
              key={path} 
              onClick={() => navigate(path)}
              className="group flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border hover:border-primary/50 hover:shadow-lg transition-all text-center bg-card card-hover"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${color}15` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border px-5 py-4 flex items-center gap-4 card-hover">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "var(--seg-bg)" }}
          >
            <Users size={20} style={{ color: "var(--seg-primary)" }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{patients.length}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "en" ? "Total Patients" : "மொத்த நோயாளிகள்"}
            </p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border px-5 py-4 flex items-center gap-4 card-hover">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "var(--seg-bg)" }}
          >
            <Stethoscope size={20} style={{ color: "var(--seg-primary)" }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{doctors.length}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "en" ? "Total Doctors" : "மொத்த மருத்துவர்கள்"}
            </p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border px-5 py-4 flex items-center gap-4 card-hover">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "var(--seg-bg)" }}
          >
            <CheckCircle2 size={20} style={{ color: "var(--seg-primary)" }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{bills.length}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "en" ? "Total Bills" : "மொத்த பில்கள்"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
