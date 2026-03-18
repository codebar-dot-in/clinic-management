import { createContext, useContext, useState, useCallback } from "react";
import { en } from "../i18n/en.js";
import { ta } from "../i18n/ta.js";
import { storage } from "../utils/storage.js";

const TRANSLATIONS = { en, ta };

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => storage.get("lang", "en"));

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "ta" : "en";
      storage.set("lang", next);
      return next;
    });
  }, []);

  const t = TRANSLATIONS[lang];

  return (
    <I18nContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/** @returns {{ lang: 'en'|'ta', toggleLang: () => void, t: typeof en }} */
export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
};
