/**
 * Button — Modern UI button with variants and sizes.
 * Supports theme-aware styling with segment colors.
 */

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background";

const SIZES = {
  xs: "px-2.5 py-1.5 text-xs",
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
  xl: "px-6 py-3.5 text-base",
};

const VARIANTS = {
  primary: `
    text-white shadow-lg shadow-primary/25
    hover:shadow-primary/40 hover:brightness-110
    focus:ring-primary
  `,
  secondary: `
    bg-secondary text-foreground border border-border
    hover:bg-secondary/80
    focus:ring-primary
  `,
  ghost: `
    bg-transparent text-muted-foreground
    hover:bg-muted hover:text-foreground
    focus:ring-muted-foreground
  `,
  outline: `
    bg-transparent border-2 
    hover:bg-muted
    focus:ring-primary
  `,
  danger: `
    bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25
    hover:bg-destructive/90
    focus:ring-destructive
  `,
  success: `
    bg-success text-success-foreground shadow-lg shadow-success/25
    hover:bg-success/90
    focus:ring-success
  `,
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  ...props
}) {
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  
  return (
    <button
      className={`
        ${BASE} 
        ${SIZES[size]} 
        ${VARIANTS[variant]} 
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      style={
        isPrimary 
          ? { background: "var(--seg-gradient, linear-gradient(135deg, var(--primary), var(--primary)))" }
          : isOutline 
            ? { borderColor: "var(--seg-primary, var(--primary))", color: "var(--seg-primary, var(--primary))" }
            : {}
      }
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === "xs" ? 12 : size === "sm" ? 14 : size === "lg" || size === "xl" ? 18 : 16} />
      ) : null}
      {children}
      {!loading && IconRight && (
        <IconRight size={size === "xs" ? 12 : size === "sm" ? 14 : size === "lg" || size === "xl" ? 18 : 16} />
      )}
    </button>
  );
}

/**
 * IconButton — Compact icon-only button
 */
export function IconButton({
  icon: Icon,
  size = "md",
  variant = "ghost",
  className = "",
  label,
  ...props
}) {
  const ICON_SIZES = {
    xs: "w-7 h-7",
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  };

  const ICON_ICON_SIZES = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  };

  return (
    <button
      className={`
        ${ICON_SIZES[size]}
        inline-flex items-center justify-center rounded-xl
        transition-all duration-200
        ${variant === "ghost" 
          ? "text-muted-foreground hover:text-foreground hover:bg-muted" 
          : variant === "primary"
            ? "text-white"
            : "text-foreground bg-secondary hover:bg-secondary/80"
        }
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={variant === "primary" ? { background: "var(--seg-gradient)" } : {}}
      aria-label={label}
      {...props}
    >
      <Icon size={ICON_ICON_SIZES[size]} />
    </button>
  );
}
