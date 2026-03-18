/**
 * Toast notifications — Modern top-right stack with theme support.
 */
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToast } from "../../context/ToastContext.jsx";

const CONFIG = {
  success: { 
    icon: CheckCircle, 
    cls: "bg-success/10 dark:bg-success/20 border-success/20 text-success",
    iconCls: "text-success"
  },
  error: { 
    icon: XCircle, 
    cls: "bg-destructive/10 dark:bg-destructive/20 border-destructive/20 text-destructive",
    iconCls: "text-destructive"
  },
  info: { 
    icon: Info, 
    cls: "bg-chart-2/10 dark:bg-chart-2/20 border-chart-2/20 text-chart-2",
    iconCls: "text-chart-2"
  },
  warning: { 
    icon: AlertTriangle, 
    cls: "bg-warning/10 dark:bg-warning/20 border-warning/20 text-warning",
    iconCls: "text-warning"
  },
};

function ToastItem({ id, message, type, title }) {
  const { dismiss } = useToast();
  const { icon: Icon, cls, iconCls } = CONFIG[type] ?? CONFIG.info;

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3.5 
        rounded-xl border 
        bg-card backdrop-blur-lg
        shadow-lg shadow-black/5 dark:shadow-black/20
        text-sm font-medium 
        min-w-72 max-w-md
        ${cls}
      `}
      role="alert"
    >
      <div className={`mt-0.5 shrink-0 ${iconCls}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-foreground text-sm mb-0.5">{title}</p>
        )}
        <p className="text-foreground/80">{message}</p>
      </div>
      <button 
        onClick={() => dismiss(id)} 
        className="shrink-0 p-1 rounded-lg hover:bg-muted opacity-60 hover:opacity-100 transition-all"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastStack() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t, index) => (
        <div 
          key={t.id} 
          className="pointer-events-auto animate-slide-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ToastItem {...t} />
        </div>
      ))}
    </div>
  );
}
