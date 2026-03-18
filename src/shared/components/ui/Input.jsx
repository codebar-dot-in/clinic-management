/**
 * Shared form inputs.
 */

const FIELD_BASE = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[--seg-primary] focus:border-transparent transition disabled:opacity-50 disabled:bg-slate-50";

export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>}
      <input className={`${FIELD_BASE} ${error ? "border-red-400 focus:ring-red-400" : ""} ${className}`} {...props} />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, className = "", rows = 3, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>}
      <textarea
        rows={rows}
        className={`${FIELD_BASE} resize-y ${error ? "border-red-400 focus:ring-red-400" : ""} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>}
      <select className={`${FIELD_BASE} cursor-pointer ${error ? "border-red-400" : ""} ${className}`} {...props}>
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function FormRow({ children, className = "" }) {
  return <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>{children}</div>;
}

export function FormSection({ title, children }) {
  return (
    <div className="flex flex-col gap-4">
      {title && (
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-100">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
