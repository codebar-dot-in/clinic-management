/**
 * Modern form inputs with theme support.
 */

const FIELD_BASE = `
  w-full rounded-xl border border-border bg-card 
  px-4 py-2.5 text-sm text-foreground 
  placeholder:text-muted-foreground 
  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
  transition-all duration-200
  disabled:opacity-50 disabled:bg-muted disabled:cursor-not-allowed
`;

export function Input({ 
  label, 
  error, 
  hint,
  icon: Icon,
  iconRight: IconRight,
  className = "", 
  ...props 
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon 
            size={16} 
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
          />
        )}
        <input 
          className={`
            ${FIELD_BASE} 
            ${Icon ? "pl-10" : ""} 
            ${IconRight ? "pr-10" : ""}
            ${error ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""} 
            ${className}
          `} 
          {...props} 
        />
        {IconRight && (
          <IconRight 
            size={16} 
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
          />
        )}
      </div>
      {hint && !error && <span className="text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

export function Textarea({ 
  label, 
  error, 
  hint,
  className = "", 
  rows = 3, 
  ...props 
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          ${FIELD_BASE} 
          resize-y min-h-[80px]
          ${error ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""} 
          ${className}
        `}
        {...props}
      />
      {hint && !error && <span className="text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

export function Select({ 
  label, 
  error, 
  hint,
  children, 
  className = "", 
  ...props 
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </label>
      )}
      <select 
        className={`
          ${FIELD_BASE} 
          cursor-pointer appearance-none
          bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22 viewBox%3d%220 0 24 24%22 fill%3d%22none%22 stroke%3d%22%2364748b%22 stroke-width%3d%222%22 stroke-linecap%3d%22round%22 stroke-linejoin%3d%22round%22%3e%3cpolyline points%3d%226 9 12 15 18 9%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')]
          bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10
          ${error ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""} 
          ${className}
        `} 
        {...props}
      >
        {children}
      </select>
      {hint && !error && <span className="text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

export function Checkbox({ label, hint, className = "", ...props }) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
      <input 
        type="checkbox" 
        className="
          mt-0.5 w-4 h-4 rounded border-border text-primary 
          focus:ring-2 focus:ring-primary/20 focus:ring-offset-0
          cursor-pointer transition-colors
        "
        {...props} 
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-foreground">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </label>
  );
}

export function FormRow({ children, cols = 2, className = "" }) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };
  
  return (
    <div className={`grid ${gridCols[cols] || gridCols[2]} gap-4 ${className}`}>
      {children}
    </div>
  );
}

export function FormSection({ title, description, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {(title || description) && (
        <div className="pb-2 border-b border-border">
          {title && (
            <h3 className="text-sm font-semibold text-foreground">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function FormGroup({ label, required, children, className = "" }) {
  return (
    <fieldset className={`flex flex-col gap-3 ${className}`}>
      {label && (
        <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </legend>
      )}
      {children}
    </fieldset>
  );
}
