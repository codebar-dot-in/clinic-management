import { NavLink, useNavigate } from "react-router-dom";
import {
  ReceiptText, Stethoscope, CalendarDays, ClipboardList, FileText,
  Package, Leaf, Archive, LayoutGrid, ChevronRight, X,
  LayoutDashboard, Users, History, ClipboardCheck, Activity,
} from "lucide-react";
import { useI18n } from "../../context/I18nContext.jsx";
import { useFacility } from "../../context/FacilityContext.jsx";
import { getSegment } from "../../constants/segments.js";

const ICON_MAP = {
  ReceiptText, Stethoscope, CalendarDays, ClipboardList, FileText,
  Package, Leaf, Archive, LayoutDashboard, Users, History, ClipboardCheck,
};

export function Sidebar({ open, onClose }) {
  const { t, lang } = useI18n();
  const { facility } = useFacility();
  const navigate = useNavigate();

  const segment = facility?.segment ? getSegment(facility.segment) : null;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-sidebar flex flex-col
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:z-auto md:flex md:shrink-0
          border-r border-border/10
        `}
      >
        {/* Logo area with gradient */}
        <div className="h-16 flex items-center justify-between px-5 shrink-0 border-b border-sidebar-muted/20">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg transition-transform hover:scale-105"
              style={{ background: "var(--seg-gradient, linear-gradient(135deg, #0d9488, #14b8a6))" }}
            >
              <span className="text-white font-bold">M</span>
            </div>
            <div>
              <div className="text-sidebar-foreground font-bold text-lg tracking-tight leading-none">
                MediOS
              </div>
              <div className="text-sidebar-foreground/50 text-xs leading-none mt-1">
                {lang === "ta" ? segment?.labelTa : segment?.labelEn}
              </div>
            </div>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          <div className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest px-3 mb-3">
            {lang === "ta" ? "வழிசெலுத்தல்" : "Navigation"}
          </div>

          {segment?.nav.map((item, index) => {
            const Icon = ICON_MAP[item.icon] ?? ReceiptText;
            const label = lang === "ta" ? item.labelTa : item.labelEn;
            return (
              <NavLink
                key={item.path}
                to={`/${segment.id}/${item.path}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-white shadow-lg"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  }`
                }
                style={({ isActive }) =>
                  isActive 
                    ? { background: "var(--seg-gradient, linear-gradient(135deg, #0d9488, #14b8a6))" } 
                    : {}
                }
              >
                <Icon size={18} className="shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                <ChevronRight 
                  size={14} 
                  className="opacity-0 group-hover:opacity-50 transition-opacity -mr-1" 
                />
              </NavLink>
            );
          })}
        </nav>

        {/* Quick stats */}
        <div className="px-4 py-4 border-t border-sidebar-muted/20">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-accent/50 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--seg-bg)" }}>
              <Activity size={14} style={{ color: "var(--seg-primary)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground/80">
                {lang === "ta" ? "செயலில்" : "Active Now"}
              </p>
              <p className="text-[10px] text-sidebar-foreground/40">
                {lang === "ta" ? "அனைத்தும் இயல்பு" : "All systems normal"}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>

          {/* Change segment button */}
          <button
            onClick={() => { navigate("/"); onClose(); }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
          >
            <LayoutGrid size={18} />
            <span className="flex-1 text-left">{t.changeSegment}</span>
            <ChevronRight size={14} className="opacity-50" />
          </button>
        </div>
      </aside>
    </>
  );
}
