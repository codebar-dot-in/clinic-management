/**
 * Badge — Modern status indicators and tags with theme support.
 */

const COLORS = {
  // Payment status
  paid:      "bg-success/10 text-success border-success/20 dark:bg-success/20",
  pending:   "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20",
  partial:   "bg-warning/10 text-warning border-warning/20 dark:bg-warning/20",
  waived:    "bg-muted text-muted-foreground border-border",
  
  // Consult status
  done:      "bg-success/10 text-success border-success/20 dark:bg-success/20",
  inProgress:"bg-chart-2/10 text-chart-2 border-chart-2/20 dark:bg-chart-2/20",
  waiting:   "bg-warning/10 text-warning border-warning/20 dark:bg-warning/20",
  
  // Lab status
  requested: "bg-muted text-muted-foreground border-border",
  collected: "bg-chart-2/10 text-chart-2 border-chart-2/20 dark:bg-chart-2/20",
  processing:"bg-chart-4/10 text-chart-4 border-chart-4/20 dark:bg-chart-4/20",
  ready:     "bg-warning/10 text-warning border-warning/20 dark:bg-warning/20",
  delivered: "bg-success/10 text-success border-success/20 dark:bg-success/20",
  
  // Schedule type
  H:         "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20",
  H1:        "bg-destructive/15 text-destructive border-destructive/25 dark:bg-destructive/25",
  OTC:       "bg-muted text-muted-foreground border-border",
  
  // Generic
  success:   "bg-success/10 text-success border-success/20 dark:bg-success/20",
  error:     "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20",
  warning:   "bg-warning/10 text-warning border-warning/20 dark:bg-warning/20",
  info:      "bg-chart-2/10 text-chart-2 border-chart-2/20 dark:bg-chart-2/20",
  primary:   "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20",
  default:   "bg-muted text-muted-foreground border-border",
};

const SIZES = {
  xs: "px-1.5 py-0.5 text-[10px]",
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function Badge({ 
  label, 
  color = "default", 
  size = "sm",
  dot = false,
  icon: Icon,
  className = "" 
}) {
  const cls = COLORS[color] ?? COLORS.default;
  const sizeCls = SIZES[size] ?? SIZES.sm;
  
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold border 
        transition-colors duration-200
        ${cls} 
        ${sizeCls}
        ${className}
      `}
    >
      {dot && (
        <span 
          className={`w-1.5 h-1.5 rounded-full ${
            color === "success" || color === "done" || color === "paid" || color === "delivered"
              ? "bg-success"
              : color === "error" || color === "pending" || color === "H" || color === "H1"
                ? "bg-destructive"
                : color === "warning" || color === "waiting" || color === "partial" || color === "ready"
                  ? "bg-warning"
                  : color === "info" || color === "inProgress" || color === "collected"
                    ? "bg-chart-2"
                    : color === "processing"
                      ? "bg-chart-4"
                      : "bg-muted-foreground"
          }`}
        />
      )}
      {Icon && <Icon size={size === "xs" ? 10 : size === "lg" ? 14 : 12} />}
      {label}
    </span>
  );
}

/**
 * StatusBadge — Badge with pulsing dot indicator
 */
export function StatusBadge({ status, label, className = "" }) {
  const statusConfig = {
    active:   { color: "success", dotColor: "bg-success" },
    inactive: { color: "default", dotColor: "bg-muted-foreground" },
    pending:  { color: "warning", dotColor: "bg-warning" },
    error:    { color: "error", dotColor: "bg-destructive" },
  };

  const config = statusConfig[status] ?? statusConfig.inactive;

  return (
    <Badge 
      label={label || status} 
      color={config.color} 
      dot 
      className={className}
    />
  );
}
