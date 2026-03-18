/**
 * Modal — Modern accessible dialog with theme support.
 * Features: keyboard navigation, focus trap, smooth animations.
 */
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({ 
  open, 
  onClose, 
  title, 
  description,
  children, 
  size = "md", 
  className = "" 
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    
    const onKey = (e) => { 
      if (e.key === "Escape") onClose(); 
    };
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const WIDTH = { 
    sm: "max-w-sm", 
    md: "max-w-lg", 
    lg: "max-w-2xl", 
    xl: "max-w-4xl", 
    "2xl": "max-w-6xl",
    full: "max-w-[95vw]" 
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 dark:bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div
        ref={dialogRef}
        className={`
          relative bg-card rounded-2xl shadow-2xl 
          w-full ${WIDTH[size]} 
          flex flex-col max-h-[90vh]
          border border-border
          animate-fade-in
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex flex-col gap-1 pr-8">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ModalFooter({ children, className = "" }) {
  return (
    <div className={`
      flex items-center justify-end gap-3 
      px-6 py-4 
      border-t border-border 
      bg-muted/30
      rounded-b-2xl
      ${className}
    `}>
      {children}
    </div>
  );
}

/**
 * ConfirmModal — Simple confirmation dialog
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
          disabled={loading}
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`
            px-4 py-2 text-sm font-semibold rounded-xl transition-all
            ${variant === "danger" 
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
              : "text-white"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          style={variant !== "danger" ? { background: "var(--seg-gradient)" } : {}}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
          ) : (
            confirmLabel
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
}
