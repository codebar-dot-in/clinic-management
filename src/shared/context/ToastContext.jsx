import { createContext, useContext, useState, useCallback, useRef } from "react";
import { genId } from "../utils/id.js";

/** @typedef {{ id: string, message: string, type: 'success'|'error'|'info'|'warning' }} Toast */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toast = useCallback(
    (message, type = "success", duration = 3000) => {
      const id = genId();
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const success = useCallback((msg) => toast(msg, "success"), [toast]);
  const error   = useCallback((msg) => toast(msg, "error", 4500), [toast]);
  const info    = useCallback((msg) => toast(msg, "info"), [toast]);
  const warning = useCallback((msg) => toast(msg, "warning", 4000), [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, warning, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};
