import { NavLink, useNavigate } from "react-router-dom";
import {
  ReceiptText, Stethoscope, CalendarDays, ClipboardList, FileText,
  Package, Leaf, Archive, LayoutGrid, ChevronRight,
  LayoutDashboard, Users, History, ClipboardCheck,
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
  const theme = segment?.theme ?? { primary: "#0d7a6e", bg: "#e6f5f3", gradient: "linear-gradient(135deg,#0d7a6e,#1a9e8f)" };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-60 bg-slate-900 flex flex-col
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:z-auto md:flex md:shrink-0
        `}
      >
        {/* Logo area */}
        <div
          className="h-14 flex items-center px-5 shrink-0"
          style={{ background: theme.gradient }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{segment?.icon ?? "🏥"}</span>
            <div>
              <div className="text-white font-black text-base tracking-tight leading-none">MediOS</div>
              <div className="text-white/60 text-xs leading-none mt-0.5">
                {lang === "ta" ? segment?.labelTa : segment?.labelEn}
              </div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">
            {lang === "ta" ? "பிரிவுகள்" : "Module"}
          </div>

          {segment?.nav.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? ReceiptText;
            const label = lang === "ta" ? item.labelTa : item.labelEn;
            return (
              <NavLink
                key={item.path}
                to={`/${segment.id}/${item.path}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`
                }
                style={({ isActive }) =>
                  isActive ? { background: theme.primary } : {}
                }
              >
                <Icon size={16} />
                <span>{label}</span>
                <ChevronRight size={12} className="ml-auto opacity-50" />
              </NavLink>
            );
          })}
        </nav>

        {/* Change segment */}
        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={() => { navigate("/"); onClose(); }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <LayoutGrid size={16} />
            <span>{t.changeSegment}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
