import { Menu, Languages } from "lucide-react";
import { useI18n } from "../../context/I18nContext.jsx";
import { useFacility } from "../../context/FacilityContext.jsx";
import { formatFullDate } from "../../utils/date.js";
import { SEGMENT_THEME } from "../../constants/tokens.js";

export function Header({ onMenuClick }) {
  const { t, lang, toggleLang } = useI18n();
  const { facility } = useFacility();

  const theme = facility?.segment ? SEGMENT_THEME[facility.segment] : SEGMENT_THEME.clinic;

  return (
    <header
      className="h-14 flex items-center justify-between px-4 md:px-6 shadow-sm shrink-0 z-20"
      style={{ background: theme.gradient, color: "#fff" }}
    >
      {/* Left: hamburger + branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col leading-tight">
          <span className="font-bold text-sm tracking-wide">
            {facility?.name ?? t.appName}
          </span>
          <span className="text-xs opacity-70 hidden sm:block">
            {formatFullDate(new Date())}
          </span>
        </div>
      </div>

      {/* Right: lang toggle */}
      <button
        onClick={toggleLang}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/20 transition"
      >
        <Languages size={14} />
        {t.langToggle}
      </button>
    </header>
  );
}
