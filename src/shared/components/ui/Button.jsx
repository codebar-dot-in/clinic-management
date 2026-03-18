/**
 * Button — primary UI primitive.
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * size: 'sm' | 'md' | 'lg'
 */

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1";

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

const VARIANTS = {
  primary:   "bg-[--seg-primary] text-white hover:brightness-90 focus:ring-[--seg-primary]",
  secondary: "bg-[--seg-bg] text-[--seg-primary] border border-[--seg-border] hover:brightness-95 focus:ring-[--seg-primary]",
  ghost:     "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400",
  danger:    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  success:   "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  icon: Icon,
  ...props
}) {
  return (
    <button
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />
      ) : null}
      {children}
    </button>
  );
}
