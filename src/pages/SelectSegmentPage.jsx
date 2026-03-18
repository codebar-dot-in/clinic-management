import { useNavigate } from "react-router-dom";
import { SEGMENTS } from "../shared/constants/segments.js";
import { useI18n } from "../shared/context/I18nContext.jsx";
import { useFacility } from "../shared/context/FacilityContext.jsx";

export function SelectSegmentPage() {
  const navigate   = useNavigate();
  const { lang, toggleLang } = useI18n();
  const { loadDemoFacility } = useFacility();

  const handleSelect = (seg) => {
    loadDemoFacility(seg.id);
    navigate(`/${seg.id}`);
  };

  const THEME_VARS = {
    clinic:   { primary: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" },
    lab:      { primary: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
    pharmacy: { primary: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    ayush:    { primary: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow">M</div>
          <div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">MediOS</span>
            <p className="text-xs text-slate-400 leading-none">Healthcare Platform</p>
          </div>
        </div>
        <button
          onClick={toggleLang}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          {lang === "en" ? "தமிழ்" : "English"}
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {lang === "en" ? "Select Your Module" : "உங்கள் பிரிவை தேர்வு செய்யுங்கள்"}
          </h1>
          <p className="text-slate-500 text-sm max-w-md">
            {lang === "en"
              ? "Choose the healthcare segment to continue. Each module has its own billing, reports, and workflows."
              : "தொடர உங்கள் சுகாதார பிரிவை தேர்ந்தெடுக்கவும். ஒவ்வொரு பிரிவும் தனித்தனியான பில்லிங், அறிக்கைகளை கொண்டுள்ளது."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl">
          {SEGMENTS.map((seg) => {
            const theme = THEME_VARS[seg.id];
            return (
              <button
                key={seg.id}
                onClick={() => handleSelect(seg)}
                className="group flex flex-col items-center gap-4 rounded-2xl border-2 p-7 bg-white hover:shadow-lg transition-all duration-200 text-left cursor-pointer"
                style={{ borderColor: theme.border }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.backgroundColor = theme.bg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110"
                  style={{ backgroundColor: theme.bg, border: `2px solid ${theme.border}` }}
                >
                  {seg.icon}
                </div>
                <div className="text-center">
                  <div className="font-bold text-slate-800 text-sm mb-1">
                    {lang === "en" ? seg.labelEn : seg.labelTa}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === "en" ? seg.descEn : seg.descTa}
                  </p>
                </div>
                <div
                  className="mt-auto text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
                  style={{ color: theme.primary, backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}
                >
                  {lang === "en" ? "Open →" : "திற →"}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 mt-4">
          MediOS v1.0 · {lang === "en" ? "Tamil Nadu Healthcare Platform" : "தமிழ்நாடு சுகாதார தளம்"}
        </p>
      </main>
    </div>
  );
}
