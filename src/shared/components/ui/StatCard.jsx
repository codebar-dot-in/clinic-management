/**
 * StatCard — Modern dashboard metric card with theme support.
 */
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  subtext,
  variant = "default",
  className = ""
}) {
  const getTrendIcon = () => {
    if (typeof trendValue === "number") {
      if (trendValue > 0) return TrendingUp;
      if (trendValue < 0) return TrendingDown;
    }
    return null;
  };

  const TrendIcon = getTrendIcon();

  return (
    <div 
      className={`
        relative overflow-hidden
        bg-card rounded-2xl p-5 
        border border-border
        shadow-sm hover:shadow-md
        transition-all duration-300
        group card-hover
        ${className}
      `}
    >
      {/* Background gradient accent */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-110"
        style={{ background: "var(--seg-gradient, linear-gradient(135deg, var(--primary), var(--chart-2)))" }}
      />

      <div className="relative flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          {Icon && (
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: "var(--seg-bg, var(--muted))" }}
            >
              <Icon size={18} style={{ color: "var(--seg-primary, var(--primary))" }} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground tracking-tight">
            {value}
          </span>
        </div>

        {/* Trend or subtext */}
        {(trend || trendValue !== undefined) && (
          <div className="flex items-center gap-2">
            {TrendIcon && (
              <div className={`
                flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                ${trendValue > 0 
                  ? "bg-success/10 text-success" 
                  : trendValue < 0 
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground"
                }
              `}>
                <TrendIcon size={12} />
                {Math.abs(trendValue)}%
              </div>
            )}
            <span className="text-xs text-muted-foreground">{trend}</span>
          </div>
        )}

        {subtext && !trend && (
          <span className="text-xs text-muted-foreground">{subtext}</span>
        )}
      </div>
    </div>
  );
}

/**
 * MiniStatCard — Compact stat display
 */
export function MiniStatCard({ label, value, icon: Icon, className = "" }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl bg-muted/50 ${className}`}>
      {Icon && (
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--seg-bg, var(--muted))" }}
        >
          <Icon size={14} style={{ color: "var(--seg-primary, var(--primary))" }} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-lg font-bold text-foreground truncate">{value}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">{label}</p>
      </div>
    </div>
  );
}
