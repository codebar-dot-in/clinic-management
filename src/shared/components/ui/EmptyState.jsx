/**
 * EmptyState — Modern empty state display with theme support.
 */
import { Inbox } from "lucide-react";

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  size = "md",
  className = ""
}) {
  const SIZES = {
    sm: {
      wrapper: "py-8 px-4",
      iconSize: "text-3xl",
      iconWrapper: "w-12 h-12",
      title: "text-sm",
      description: "text-xs max-w-xs",
    },
    md: {
      wrapper: "py-16 px-4",
      iconSize: "text-4xl",
      iconWrapper: "w-16 h-16",
      title: "text-base",
      description: "text-sm max-w-sm",
    },
    lg: {
      wrapper: "py-24 px-6",
      iconSize: "text-5xl",
      iconWrapper: "w-20 h-20",
      title: "text-lg",
      description: "text-base max-w-md",
    },
  };

  const sizeConfig = SIZES[size] ?? SIZES.md;

  return (
    <div className={`
      flex flex-col items-center justify-center text-center
      ${sizeConfig.wrapper}
      ${className}
    `}>
      {/* Icon container */}
      <div 
        className={`
          ${sizeConfig.iconWrapper}
          rounded-2xl flex items-center justify-center mb-4
          bg-muted border border-border
        `}
      >
        {typeof icon === "string" ? (
          <span className={sizeConfig.iconSize}>{icon}</span>
        ) : icon ? (
          icon
        ) : (
          <Inbox size={size === "sm" ? 20 : size === "lg" ? 32 : 24} className="text-muted-foreground" />
        )}
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-foreground mb-1 ${sizeConfig.title}`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`text-muted-foreground ${sizeConfig.description}`}>
          {description}
        </p>
      )}

      {/* Action button */}
      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}

/**
 * LoadingState — Skeleton loading placeholder
 */
export function LoadingState({ rows = 3, className = "" }) {
  return (
    <div className={`flex flex-col gap-4 p-4 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded-lg w-3/4" />
            <div className="h-3 bg-muted rounded-lg w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
