/**
 * StatCard — dashboard metric card.
 */
import { TrendingUp } from "lucide-react";

export function StatCard({ label, value, icon: Icon, accentClass = "border-l-teal-600", trend, subtext }) {
  return (
    <div className={`bg-white rounded-xl p-5 border-l-4 ${accentClass} shadow-sm flex flex-col gap-1 min-w-0`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={18} className="text-slate-300" />}
      </div>
      <span className="text-2xl font-bold text-slate-800 truncate">{value}</span>
      {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
      {trend !== undefined && (
        <span className={`text-xs font-medium flex items-center gap-1 ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          <TrendingUp size={11} />
          {Math.abs(trend)}% vs yesterday
        </span>
      )}
    </div>
  );
}
