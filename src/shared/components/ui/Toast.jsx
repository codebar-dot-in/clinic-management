/**
 * Toast notifications — top-right stack.
 */
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToast } from "../../context/ToastContext.jsx";

const CONFIG = {
  success: { icon: CheckCircle, cls: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  error:   { icon: XCircle,     cls: "bg-red-50 border-red-200 text-red-800" },
  info:    { icon: Info,        cls: "bg-blue-50 border-blue-200 text-blue-800" },
  warning: { icon: AlertTriangle, cls: "bg-amber-50 border-amber-200 text-amber-800" },
};

function ToastItem({ id, message, type }) {
  const { dismiss } = useToast();
  const { icon: Icon, cls } = CONFIG[type] ?? CONFIG.info;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium min-w-64 max-w-sm ${cls}`}
      role="alert"
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={() => dismiss(id)} className="shrink-0 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastStack() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto animate-in slide-in-from-right-4 duration-200">
          <ToastItem {...t} />
        </div>
      ))}
    </div>
  );
}
