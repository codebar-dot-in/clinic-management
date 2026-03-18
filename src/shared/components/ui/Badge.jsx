/**
 * Badge — status indicators and tags.
 */

const COLORS = {
  // Payment status
  paid:      "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending:   "bg-red-100 text-red-800 border-red-200",
  partial:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  waived:    "bg-slate-100 text-slate-600 border-slate-200",
  // Consult status
  done:      "bg-emerald-100 text-emerald-800 border-emerald-200",
  inProgress:"bg-blue-100 text-blue-800 border-blue-200",
  waiting:   "bg-amber-100 text-amber-800 border-amber-200",
  // Lab status
  requested: "bg-slate-100 text-slate-600 border-slate-200",
  collected: "bg-blue-100 text-blue-800 border-blue-200",
  processing:"bg-purple-100 text-purple-800 border-purple-200",
  ready:     "bg-amber-100 text-amber-800 border-amber-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  // Schedule type
  H:         "bg-red-100 text-red-700 border-red-200",
  H1:        "bg-red-200 text-red-900 border-red-300",
  OTC:       "bg-slate-100 text-slate-600 border-slate-200",
  // Generic
  success:   "bg-emerald-100 text-emerald-800 border-emerald-200",
  error:     "bg-red-100 text-red-800 border-red-200",
  warning:   "bg-amber-100 text-amber-800 border-amber-200",
  info:      "bg-blue-100 text-blue-800 border-blue-200",
  default:   "bg-slate-100 text-slate-600 border-slate-200",
};

export function Badge({ label, color = "default", className = "" }) {
  const cls = COLORS[color] ?? COLORS.default;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls} ${className}`}
    >
      {label}
    </span>
  );
}
