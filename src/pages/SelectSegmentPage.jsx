import { useNavigate } from "react-router-dom";
import { Moon, Sun, Languages, ArrowRight, Activity, Shield, Clock } from "lucide-react";
import { SEGMENTS } from "../shared/constants/segments.js";
import { useI18n } from "../shared/context/I18nContext.jsx";
import { useFacility } from "../shared/context/FacilityContext.jsx";
import { useTheme } from "../shared/context/ThemeContext.jsx";

export function SelectSegmentPage() {
  const navigate   = useNavigate();
  const { lang, toggleLang } = useI18n();
  const { loadDemoFacility } = useFacility();
  const { theme, toggleTheme } = useTheme();

  const handleSelect = (seg) => {
    loadDemoFacility(seg.id);
    navigate(`/${seg.id}`);
  };

  const SEGMENT_COLORS = {
    clinic:   { primary: "#0d9488", gradient: "linear-gradient(135deg, #0d9488, #14b8a6)" },
    lab:      { primary: "#2563eb", gradient: "linear-gradient(135deg, #2563eb, #3b82f6)" },
    pharmacy: { primary: "#d97706", gradient: "linear-gradient(135deg, #d97706, #f59e0b)" },
    ayush:    { primary: "#7c3aed", gradient: "linear-gradient(135deg, #7c3aed, #8b5cf6)" },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #0d9488, #14b8a6)" }}
          >
            M
          </div>
          <div>
            <span className="font-bold text-foreground text-lg tracking-tight">MediOS</span>
            <p className="text-xs text-muted-foreground leading-none">
              {lang === "en" ? "Healthcare Platform" : "சுகாதார தளம்"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Languages size={14} />
            {lang === "en" ? "தமிழ்" : "English"}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
            <Activity size={12} />
            {lang === "en" ? "Clinic Management System" : "கிளினிக் மேலாண்மை அமைப்பு"}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            {lang === "en" 
              ? "Select Your Healthcare Module" 
              : "உங்கள் சுகாதார பிரிவை தேர்வு செய்யுங்கள்"
            }
          </h1>
          
          <p className="text-muted-foreground text-base max-w-lg mx-auto text-pretty">
            {lang === "en"
              ? "Choose the healthcare segment to continue. Each module has its own billing, reports, and specialized workflows."
              : "தொடர உங்கள் சுகாதார பிரிவை தேர்ந்தெடுக்கவும். ஒவ்வொரு பிரிவும் தனித்தனியான பில்லிங், அறிக்கைகளை கொண்டுள்ளது."}
          </p>
        </div>

        {/* Segment Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
          {SEGMENTS.map((seg, index) => {
            const colors = SEGMENT_COLORS[seg.id];
            return (
              <button
                key={seg.id}
                onClick={() => handleSelect(seg)}
                className="group relative flex flex-col items-center gap-4 rounded-2xl border-2 border-border p-6 bg-card hover:border-primary/50 hover:shadow-xl transition-all duration-300 text-center cursor-pointer card-hover animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Hover gradient background */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"
                  style={{ background: colors.gradient }}
                />
                
                {/* Icon */}
                <div
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
                  style={{ 
                    background: colors.gradient,
                    boxShadow: `0 8px 32px ${colors.primary}30`
                  }}
                >
                  <span className="drop-shadow-sm">{seg.icon}</span>
                </div>
                
                {/* Content */}
                <div className="relative">
                  <div className="font-bold text-foreground text-base mb-1">
                    {lang === "en" ? seg.labelEn : seg.labelTa}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang === "en" ? seg.descEn : seg.descTa}
                  </p>
                </div>
                
                {/* CTA */}
                <div
                  className="relative mt-auto flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-300 group-hover:gap-3"
                  style={{ 
                    color: colors.primary, 
                    background: `${colors.primary}10`
                  }}
                >
                  {lang === "en" ? "Open Module" : "திற"}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Features */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-success" />
            <span>{lang === "en" ? "Secure & Private" : "பாதுகாப்பான"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <span>{lang === "en" ? "Real-time Updates" : "நேரலை புதுப்பிப்புகள்"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-warning" />
            <span>{lang === "en" ? "Analytics Dashboard" : "பகுப்பாய்வு டாஷ்போர்டு"}</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">
          MediOS v1.0 · {lang === "en" ? "Tamil Nadu Healthcare Platform" : "தமிழ்நாடு சுகாதார தளம்"}
        </p>
      </footer>
    </div>
  );
}
