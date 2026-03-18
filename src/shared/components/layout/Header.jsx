import { Menu, Languages, Moon, Sun, Bell, Search, User } from "lucide-react";
import { useI18n } from "../../context/I18nContext.jsx";
import { useFacility } from "../../context/FacilityContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { formatFullDate } from "../../utils/date.js";
import { useState } from "react";

export function Header({ onMenuClick }) {
  const { t, lang, toggleLang } = useI18n();
  const { facility } = useFacility();
  const { theme, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-card border-b border-border shrink-0 z-20 transition-colors duration-300">
      {/* Left section: hamburger + branding */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col leading-tight">
          <span className="font-bold text-foreground text-base tracking-tight">
            {facility?.name ?? t.appName}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:block">
            {formatFullDate(new Date())}
          </span>
        </div>
      </div>

      {/* Center: Search (hidden on mobile) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={lang === "en" ? "Search patients, appointments..." : "நோயாளிகள், சந்திப்புகளை தேடுங்கள்..."}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-muted-foreground bg-background border border-border rounded">
            <span className="text-xs">Cmd</span> K
          </kbd>
        </div>
      </div>

      {/* Right section: actions */}
      <div className="flex items-center gap-2">
        {/* Mobile search toggle */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="md:hidden p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
        >
          <Languages size={14} />
          {t.langToggle}
        </button>

        {/* User avatar */}
        <button 
          className="ml-1 w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold text-sm transition-transform hover:scale-105"
          style={{ background: "var(--seg-gradient, linear-gradient(135deg, #0d9488, #14b8a6))" }}
          aria-label="User profile"
        >
          <User size={16} />
        </button>
      </div>

      {/* Mobile search bar (expandable) */}
      {showSearch && (
        <div className="absolute top-16 left-0 right-0 p-4 bg-card border-b border-border md:hidden animate-fade-in">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={lang === "en" ? "Search..." : "தேடுங்கள்..."}
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
